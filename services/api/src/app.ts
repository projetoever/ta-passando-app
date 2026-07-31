import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyError } from "fastify";
import { Type } from "@sinclair/typebox";
import {
  HealthResponseSchema,
  PilotCategories,
  PilotNeighborhoods,
} from "@ta-passando/contracts";
import type { AccessTokenVerifier } from "./auth/authorization";
import {
  OidcAccessTokenVerifier,
  UnavailableAccessTokenVerifier,
} from "./auth/oidc-verifier";
import type { ApiConfig } from "./config";
import { connectDatabase } from "./infrastructure/database";
import {
  PostgresPilotRepository,
  UnavailablePilotRepository,
  type PilotRepository,
} from "./modules/pilot/repository";
import { registerPilotRoutes } from "./modules/pilot/routes";

type CreateAppOptions = {
  config: ApiConfig;
  logger?: boolean;
  repository?: PilotRepository;
  tokenVerifier?: AccessTokenVerifier;
};

export async function createApp({
  config,
  logger = true,
  repository: injectedRepository,
  tokenVerifier: injectedTokenVerifier,
}: CreateAppOptions) {
  const app = Fastify({
    logger: logger && config.logLevel !== "silent"
      ? {
          level: config.logLevel,
          redact: [
            "req.headers.authorization",
            "req.body.meetingPoint",
            "req.body.latitude",
            "req.body.longitude",
          ],
        }
      : false,
    trustProxy: true,
    requestIdHeader: "x-request-id",
  });

  await app.register(cors, {
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed"), false);
    },
    credentials: true,
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "TE Vi na TV API",
        description: "Contrato público da versão 0.1.0-pilot.",
        version: "0.1.0",
      },
      servers: [{ url: "/", description: "Ambiente atual" }],
      tags: [
        { name: "system", description: "Saúde e capacidades da plataforma" },
        { name: "identity", description: "Conta e perfil do morador" },
        { name: "catalog", description: "Bairros e categorias do piloto" },
        { name: "seller", description: "Cadastro e catálogo do vendedor" },
        { name: "admin", description: "Aprovação e governança" },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: false },
  });

  app.get(
    "/health",
    {
      schema: {
        tags: ["system"],
        response: { 200: HealthResponseSchema },
      },
    },
    async () => ({
      status: "ok" as const,
      service: "ta-passando-api" as const,
      version: "0.1.0",
      timestamp: new Date().toISOString(),
    }),
  );

  app.get(
    "/v1/meta",
    {
      schema: {
        tags: ["system"],
        response: {
          200: Type.Object({
            product: Type.Literal("TE Vi na TV"),
            stage: Type.Literal("identity-catalog"),
            dataMode: Type.Union([
              Type.Literal("simulated"),
              Type.Literal("persistent"),
            ]),
            gpsEnabled: Type.Literal(false),
            neighborhoods: Type.Array(Type.String()),
            categories: Type.Array(Type.String()),
            modules: Type.Array(
              Type.Object({
                id: Type.String(),
                status: Type.Union([
                  Type.Literal("ready"),
                  Type.Literal("foundation"),
                  Type.Literal("planned"),
                ]),
              }),
            ),
          }),
        },
      },
    },
    async () => ({
      product: "TE Vi na TV" as const,
      stage: "identity-catalog" as const,
      dataMode: config.databaseUrl ? "persistent" as const : "simulated" as const,
      gpsEnabled: false as const,
      neighborhoods: [...PilotNeighborhoods],
      categories: [...PilotCategories],
      modules: [
        { id: "identity", status: "ready" as const },
        { id: "catalog", status: "ready" as const },
        { id: "routes", status: "foundation" as const },
        { id: "requests", status: "foundation" as const },
        { id: "notifications", status: "planned" as const },
        { id: "moderation", status: "planned" as const },
      ],
    }),
  );

  let repository = injectedRepository;
  if (!repository && config.databaseUrl) {
    const database = connectDatabase(config.databaseUrl);
    repository = new PostgresPilotRepository(database);
    app.addHook("onClose", async () => {
      await database.end({ timeout: 5 });
    });
  }
  repository ??= new UnavailablePilotRepository();

  let tokenVerifier = injectedTokenVerifier;
  if (
    !tokenVerifier &&
    config.oidcIssuerUrl &&
    config.oidcAudience &&
    config.oidcJwksUrl
  ) {
    tokenVerifier = new OidcAccessTokenVerifier({
      issuer: config.oidcIssuerUrl,
      audience: config.oidcAudience,
      jwksUrl: config.oidcJwksUrl,
    });
  }
  tokenVerifier ??= new UnavailableAccessTokenVerifier();

  await registerPilotRoutes(app, { repository, tokenVerifier });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode =
      "statusCode" in error && typeof error.statusCode === "number"
        ? error.statusCode
        : 500;
    const code =
      "code" in error && typeof error.code === "string"
        ? error.code
        : "INTERNAL_ERROR";

    if (statusCode >= 500) request.log.error(error);

    reply.status(statusCode).send({
      error: {
        code,
        message:
          statusCode >= 500 ? "Não foi possível concluir a operação." : error.message,
        requestId: request.id,
      },
    });
  });

  return app;
}
