import { Type, type Static } from "@sinclair/typebox";

export const UserRoleSchema = Type.Union([
  Type.Literal("customer"),
  Type.Literal("seller"),
  Type.Literal("admin"),
]);

export type UserRole = Static<typeof UserRoleSchema>;

export const RequestStatusSchema = Type.Union([
  Type.Literal("pending"),
  Type.Literal("accepted"),
  Type.Literal("on_the_way"),
  Type.Literal("arrived"),
  Type.Literal("completed"),
  Type.Literal("declined"),
  Type.Literal("expired"),
  Type.Literal("cancelled"),
]);

export type RequestStatus = Static<typeof RequestStatusSchema>;

export const RouteStatusSchema = Type.Union([
  Type.Literal("active"),
  Type.Literal("paused"),
  Type.Literal("stopped"),
]);

export type RouteStatus = Static<typeof RouteStatusSchema>;

export const CoordinateSchema = Type.Object({
  latitude: Type.Number({ minimum: -90, maximum: 90 }),
  longitude: Type.Number({ minimum: -180, maximum: 180 }),
  accuracyMeters: Type.Number({ minimum: 0, maximum: 5000 }),
  capturedAt: Type.String({ format: "date-time" }),
});

export type Coordinate = Static<typeof CoordinateSchema>;

export const CreateServiceRequestSchema = Type.Object({
  sellerId: Type.String({ format: "uuid" }),
  productId: Type.Optional(Type.String({ format: "uuid" })),
  requestedItem: Type.String({ minLength: 2, maxLength: 120 }),
  quantity: Type.String({ minLength: 1, maxLength: 60 }),
  waitUntil: Type.String({ format: "date-time" }),
  meetingReference: Type.String({ minLength: 2, maxLength: 160 }),
});

export type CreateServiceRequest = Static<typeof CreateServiceRequestSchema>;

export const ErrorEnvelopeSchema = Type.Object({
  error: Type.Object({
    code: Type.String(),
    message: Type.String(),
    requestId: Type.Optional(Type.String()),
  }),
});

export type ErrorEnvelope = Static<typeof ErrorEnvelopeSchema>;

export const HealthResponseSchema = Type.Object({
  status: Type.Literal("ok"),
  service: Type.Literal("ta-passando-api"),
  version: Type.String(),
  timestamp: Type.String({ format: "date-time" }),
});

export type HealthResponse = Static<typeof HealthResponseSchema>;

export const PilotNeighborhoods = [
  "Recreio da Borda do Campo",
  "Parque Miami",
  "Vila Luzita",
] as const;

export const PilotCategories = [
  "ovos",
  "paes",
  "hortifruti",
  "queijos",
  "limpeza",
  "tapetes-redes",
  "churros",
  "sorvetes-picoles",
] as const;

