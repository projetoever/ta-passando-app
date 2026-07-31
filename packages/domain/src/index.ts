import type { Coordinate, RequestStatus } from "@ta-passando/contracts";

const allowedTransitions: Record<RequestStatus, readonly RequestStatus[]> = {
  pending: ["accepted", "declined", "expired", "cancelled"],
  accepted: ["on_the_way", "cancelled"],
  on_the_way: ["arrived", "cancelled"],
  arrived: ["completed", "cancelled"],
  completed: [],
  declined: [],
  expired: [],
  cancelled: [],
};

export function canTransitionRequest(
  current: RequestStatus,
  next: RequestStatus,
): boolean {
  return allowedTransitions[current].includes(next);
}

export function assertRequestTransition(
  current: RequestStatus,
  next: RequestStatus,
): void {
  if (!canTransitionRequest(current, next)) {
    throw new Error(`Invalid request transition: ${current} -> ${next}`);
  }
}

export function isFreshPosition(
  coordinate: Coordinate,
  now: Date,
  ttlSeconds: number,
): boolean {
  const capturedAt = new Date(coordinate.capturedAt).getTime();
  return Number.isFinite(capturedAt) && now.getTime() - capturedAt <= ttlSeconds * 1000;
}

export function roundPublicCoordinate(
  coordinate: Pick<Coordinate, "latitude" | "longitude">,
  decimals = 3,
): Pick<Coordinate, "latitude" | "longitude"> {
  const factor = 10 ** decimals;
  return {
    latitude: Math.round(coordinate.latitude * factor) / factor,
    longitude: Math.round(coordinate.longitude * factor) / factor,
  };
}

