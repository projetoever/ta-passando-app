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
import type { ApiConfig } from "./config";

type CreateAppOptions = {
  config: ApiConfig;
  logger?: boolean;
};

export async function createApp({ config, logger = true }: CreateAppOptions) {
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
        title: "Tá Passando API",
        description: "Contrato público da versão 0.1.0-pilot.",
        version: "0.1.0",
      },
      servers: [{ url: "/", description: "Ambiente atual" }],
      tags: [
        { name: "system", description: "Saúde e capacidades da plataforma" },
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
            product: Type.Literal("Tá Passando"),
            stage: Type.Literal("foundation"),
            dataMode: Type.Literal("simulated"),
            gpsEnabled: Type.Literal(false),
            neighborhoods: Type.Array(Type.String()),
            categories: Type.Array(Type.String()),
            modules: Type.Array(
              Type.Object({
                id: Type.String(),
                status: Type.Union([
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
      product: "Tá Passando" as const,
      stage: "foundation" as const,
      dataMode: "simulated" as const,
      gpsEnabled: false as const,
      neighborhoods: [...PilotNeighborhoods],
      categories: [...PilotCategories],
      modules: [
        { id: "identity", status: "foundation" as const },
        { id: "catalog", status: "planned" as const },
        { id: "routes", status: "foundation" as const },
        { id: "requests", status: "foundation" as const },
        { id: "notifications", status: "planned" as const },
        { id: "moderation", status: "planned" as const },
      ],
    }),
  );

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
