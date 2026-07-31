import { describe, expect, it } from "vitest";
import {
  canTransitionRequest,
  isFreshPosition,
  roundPublicCoordinate,
} from "../src/index";

describe("request lifecycle", () => {
  it("allows the pilot happy path", () => {
    expect(canTransitionRequest("pending", "accepted")).toBe(true);
    expect(canTransitionRequest("accepted", "on_the_way")).toBe(true);
    expect(canTransitionRequest("on_the_way", "arrived")).toBe(true);
    expect(canTransitionRequest("arrived", "completed")).toBe(true);
  });

  it("blocks reopening a completed request", () => {
    expect(canTransitionRequest("completed", "pending")).toBe(false);
  });
});

describe("location privacy", () => {
  it("rejects a stale public position", () => {
    expect(
      isFreshPosition(
        {
          latitude: -23.72,
          longitude: -46.49,
          accuracyMeters: 12,
          capturedAt: "2026-07-31T12:00:00.000Z",
        },
        new Date("2026-07-31T12:03:01.000Z"),
        180,
      ),
    ).toBe(false);
  });

  it("reduces precision for the public map", () => {
    expect(
      roundPublicCoordinate({ latitude: -23.72191, longitude: -46.49184 }),
    ).toEqual({ latitude: -23.722, longitude: -46.492 });
  });
});

