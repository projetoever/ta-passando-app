export type ApiConfig = {
  environment: "development" | "test" | "production";
  host: string;
  port: number;
  logLevel: string;
  databaseUrl?: string;
  oidcIssuerUrl?: string;
  oidcAudience?: string;
  oidcJwksUrl?: string;
  corsOrigins: string[];
  positionTtlSeconds: number;
  publicPositionGridMeters: number;
};

function positiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadConfig(environment = process.env): ApiConfig {
  const nodeEnvironment = environment.NODE_ENV ?? "development";
  const normalizedEnvironment: ApiConfig["environment"] =
    nodeEnvironment === "production" || nodeEnvironment === "test"
      ? nodeEnvironment
      : "development";

  return {
    environment: normalizedEnvironment,
    host: environment.HOST ?? "0.0.0.0",
    port: positiveInteger(environment.PORT, 3001),
    logLevel: environment.LOG_LEVEL ?? "info",
    databaseUrl: environment.DATABASE_URL,
    oidcIssuerUrl: environment.OIDC_ISSUER_URL || undefined,
    oidcAudience: environment.OIDC_AUDIENCE || undefined,
    oidcJwksUrl: environment.OIDC_JWKS_URL || undefined,
    corsOrigins: (environment.CORS_ORIGINS ?? "http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    positionTtlSeconds: positiveInteger(environment.POSITION_TTL_SECONDS, 180),
    publicPositionGridMeters: positiveInteger(
      environment.PUBLIC_POSITION_GRID_METERS,
      250,
    ),
  };
}
