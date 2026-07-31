import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import type { ApiConfig } from "../src/config";

const config: ApiConfig = {
  environment: "test",
  host: "127.0.0.1",
  port: 3001,
  logLevel: "silent",
  corsOrigins: ["http://localhost:3000"],
  positionTtlSeconds: 180,
  publicPositionGridMeters: 250,
};

const apps: Awaited<ReturnType<typeof createApp>>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("API foundation", () => {
  it("reports health without a database dependency", async () => {
    const app = await createApp({ config, logger: false });
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ok",
      service: "ta-passando-api",
      version: "0.1.0",
    });
  });

  it("keeps real GPS disabled while identity and catalog become ready", async () => {
    const app = await createApp({ config, logger: false });
    apps.push(app);
    const response = await app.inject({ method: "GET", url: "/v1/meta" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      stage: "identity-catalog",
      dataMode: "simulated",
      gpsEnabled: false,
    });
  });
});
