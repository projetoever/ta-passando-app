import { Type, type Static } from "@sinclair/typebox";

export const UserRoleSchema = Type.Union([
  Type.Literal("customer"),
  Type.Literal("seller"),
  Type.Literal("admin"),
]);

export type UserRole = Static<typeof UserRoleSchema>;

export const AccountStatusSchema = Type.Union([
  Type.Literal("pending"),
  Type.Literal("active"),
  Type.Literal("suspended"),
  Type.Literal("deleted"),
]);

export type AccountStatus = Static<typeof AccountStatusSchema>;

export const SellerVerificationStatusSchema = Type.Union([
  Type.Literal("pending"),
  Type.Literal("approved"),
  Type.Literal("rejected"),
  Type.Literal("suspended"),
]);

export type SellerVerificationStatus = Static<typeof SellerVerificationStatusSchema>;

export const NeighborhoodSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
  city: Type.String(),
  stateCode: Type.String({ minLength: 2, maxLength: 2 }),
  pilotCore: Type.Union([Type.Integer(), Type.Null()]),
});

export type Neighborhood = Static<typeof NeighborhoodSchema>;

export const CategorySchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  slug: Type.String(),
  name: Type.String(),
});

export type Category = Static<typeof CategorySchema>;

export const AccountSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  role: UserRoleSchema,
  displayName: Type.String(),
  email: Type.Union([Type.String({ format: "email" }), Type.Null()]),
  phoneNumber: Type.Union([Type.String(), Type.Null()]),
  status: AccountStatusSchema,
  neighborhood: Type.Union([NeighborhoodSchema, Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export type Account = Static<typeof AccountSchema>;

export const RegisterAccountSchema = Type.Object({
  displayName: Type.String({ minLength: 2, maxLength: 100 }),
  neighborhoodId: Type.Optional(Type.String({ format: "uuid" })),
});

export type RegisterAccount = Static<typeof RegisterAccountSchema>;

export const UpdateAccountSchema = Type.Partial(RegisterAccountSchema, {
  minProperties: 1,
});

export type UpdateAccount = Static<typeof UpdateAccountSchema>;

export const SellerProfileSchema = Type.Object({
  userId: Type.String({ format: "uuid" }),
  publicName: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  verificationStatus: SellerVerificationStatusSchema,
  primaryCategory: CategorySchema,
  neighborhood: NeighborhoodSchema,
  contactPhone: Type.String(),
  paymentMethods: Type.Array(Type.String()),
  reviewNote: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export type SellerProfile = Static<typeof SellerProfileSchema>;

export const UpsertSellerProfileSchema = Type.Object({
  publicName: Type.String({ minLength: 2, maxLength: 100 }),
  description: Type.Optional(Type.String({ maxLength: 500 })),
  primaryCategoryId: Type.String({ format: "uuid" }),
  neighborhoodId: Type.String({ format: "uuid" }),
  contactPhone: Type.String({ minLength: 8, maxLength: 30 }),
  paymentMethods: Type.Array(Type.String({ minLength: 2, maxLength: 30 }), {
    minItems: 1,
    maxItems: 5,
    uniqueItems: true,
  }),
});

export type UpsertSellerProfile = Static<typeof UpsertSellerProfileSchema>;

export const ProductSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  sellerId: Type.String({ format: "uuid" }),
  category: CategorySchema,
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  priceCents: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
  unit: Type.String(),
  active: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export type Product = Static<typeof ProductSchema>;

export const CreateProductSchema = Type.Object({
  categoryId: Type.String({ format: "uuid" }),
  name: Type.String({ minLength: 2, maxLength: 120 }),
  description: Type.Optional(Type.String({ maxLength: 500 })),
  priceCents: Type.Optional(Type.Integer({ minimum: 0 })),
  unit: Type.String({ minLength: 1, maxLength: 40 }),
});

export type CreateProduct = Static<typeof CreateProductSchema>;

export const UpdateProductSchema = Type.Partial(
  Type.Object({
    categoryId: Type.String({ format: "uuid" }),
    name: Type.String({ minLength: 2, maxLength: 120 }),
    description: Type.Union([Type.String({ maxLength: 500 }), Type.Null()]),
    priceCents: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    unit: Type.String({ minLength: 1, maxLength: 40 }),
    active: Type.Boolean(),
  }),
  { minProperties: 1 },
);

export type UpdateProduct = Static<typeof UpdateProductSchema>;

export const SellerApplicationSchema = Type.Intersect([
  SellerProfileSchema,
  Type.Object({
    ownerName: Type.String(),
    ownerEmail: Type.Union([Type.String({ format: "email" }), Type.Null()]),
  }),
]);

export type SellerApplication = Static<typeof SellerApplicationSchema>;

export const ReviewSellerSchema = Type.Object({
  status: Type.Union([Type.Literal("approved"), Type.Literal("rejected")]),
  note: Type.Optional(Type.String({ maxLength: 500 })),
});

export type ReviewSeller = Static<typeof ReviewSellerSchema>;

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
