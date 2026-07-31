import type { FastifyInstance, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import {
  AccountSchema,
  CategorySchema,
  CreateProductSchema,
  NeighborhoodSchema,
  ProductSchema,
  RegisterAccountSchema,
  ReviewSellerSchema,
  SellerApplicationSchema,
  SellerProfileSchema,
  UpdateAccountSchema,
  UpdateProductSchema,
  UpsertSellerProfileSchema,
  type Account,
  type CreateProduct,
  type RegisterAccount,
  type ReviewSeller,
  type UpdateAccount,
  type UpdateProduct,
  type UpsertSellerProfile,
} from "@ta-passando/contracts";
import {
  AuthenticationError,
  authenticateRequest,
  requireAnyRole,
  type AccessTokenVerifier,
} from "../../auth/authorization";
import {
  ResourceNotFoundError,
  type PilotRepository,
} from "./repository";

type PilotRoutesOptions = {
  repository: PilotRepository;
  tokenVerifier: AccessTokenVerifier;
};

const Tags = {
  identity: ["identity"],
  catalog: ["catalog"],
  seller: ["seller"],
  admin: ["admin"],
};

export async function registerPilotRoutes(
  app: FastifyInstance,
  { repository, tokenVerifier }: PilotRoutesOptions,
) {
  const getIdentity = (request: FastifyRequest) =>
    authenticateRequest(request, tokenVerifier);

  const getAccount = async (request: FastifyRequest): Promise<Account> => {
    const identity = await getIdentity(request);
    const account = await repository.findAccountBySubject(identity.subject);
    if (!account) {
      const error = new ResourceNotFoundError(
        "Conta ainda não cadastrada. Conclua o cadastro antes de continuar.",
      );
      Object.defineProperty(error, "code", { value: "ACCOUNT_NOT_REGISTERED" });
      throw error;
    }
    if (account.status === "suspended" || account.status === "deleted") {
      throw new AuthenticationError("Conta indisponível.");
    }
    return account;
  };

  app.get(
    "/v1/neighborhoods",
    {
      schema: {
        tags: Tags.catalog,
        response: { 200: Type.Array(NeighborhoodSchema) },
      },
    },
    () => repository.listNeighborhoods(),
  );

  app.get(
    "/v1/categories",
    {
      schema: {
        tags: Tags.catalog,
        response: { 200: Type.Array(CategorySchema) },
      },
    },
    () => repository.listCategories(),
  );

  app.post<{ Body: RegisterAccount }>(
    "/v1/auth/register",
    {
      schema: {
        tags: Tags.identity,
        body: RegisterAccountSchema,
        response: { 200: AccountSchema },
      },
    },
    async (request) => {
      const identity = await getIdentity(request);
      return repository.registerAccount(identity, request.body);
    },
  );

  app.get(
    "/v1/auth/me",
    {
      schema: {
        tags: Tags.identity,
        response: { 200: AccountSchema },
      },
    },
    getAccount,
  );

  app.patch<{ Body: UpdateAccount }>(
    "/v1/customers/me",
    {
      schema: {
        tags: Tags.identity,
        body: UpdateAccountSchema,
        response: { 200: AccountSchema },
      },
    },
    async (request) => {
      const account = await getAccount(request);
      return repository.updateAccount(account.id, request.body);
    },
  );

  app.get(
    "/v1/sellers/me",
    {
      schema: {
        tags: Tags.seller,
        response: { 200: SellerProfileSchema },
      },
    },
    async (request) => {
      const account = await getAccount(request);
      const profile = await repository.getSellerProfile(account.id);
      if (!profile) throw new ResourceNotFoundError("Cadastro de vendedor não encontrado.");
      return profile;
    },
  );

  app.put<{ Body: UpsertSellerProfile }>(
    "/v1/sellers/me",
    {
      schema: {
        tags: Tags.seller,
        body: UpsertSellerProfileSchema,
        response: { 200: SellerProfileSchema },
      },
    },
    async (request) => {
      const account = await getAccount(request);
      requireAnyRole(account.role, ["customer", "seller"]);
      return repository.upsertSellerProfile(account.id, request.body);
    },
  );

  app.get(
    "/v1/sellers/me/products",
    {
      schema: {
        tags: Tags.seller,
        response: { 200: Type.Array(ProductSchema) },
      },
    },
    async (request) => {
      const account = await getAccount(request);
      return repository.listSellerProducts(account.id);
    },
  );

  app.post<{ Body: CreateProduct }>(
    "/v1/sellers/me/products",
    {
      schema: {
        tags: Tags.seller,
        body: CreateProductSchema,
        response: { 201: ProductSchema },
      },
    },
    async (request, reply) => {
      const account = await getAccount(request);
      const seller = await repository.getSellerProfile(account.id);
      if (!seller) throw new ResourceNotFoundError("Cadastre o perfil de vendedor primeiro.");
      const product = await repository.createSellerProduct(account.id, request.body);
      return reply.status(201).send(product);
    },
  );

  app.patch<{ Params: { productId: string }; Body: UpdateProduct }>(
    "/v1/sellers/me/products/:productId",
    {
      schema: {
        tags: Tags.seller,
        params: Type.Object({ productId: Type.String({ format: "uuid" }) }),
        body: UpdateProductSchema,
        response: { 200: ProductSchema },
      },
    },
    async (request) => {
      const account = await getAccount(request);
      return repository.updateSellerProduct(
        account.id,
        request.params.productId,
        request.body,
      );
    },
  );

  app.delete<{ Params: { productId: string } }>(
    "/v1/sellers/me/products/:productId",
    {
      schema: {
        tags: Tags.seller,
        params: Type.Object({ productId: Type.String({ format: "uuid" }) }),
        response: { 204: Type.Null() },
      },
    },
    async (request, reply) => {
      const account = await getAccount(request);
      const removed = await repository.deleteSellerProduct(
        account.id,
        request.params.productId,
      );
      if (!removed) throw new ResourceNotFoundError("Produto não encontrado.");
      return reply.status(204).send();
    },
  );

  app.get(
    "/v1/admin/seller-applications",
    {
      schema: {
        tags: Tags.admin,
        response: { 200: Type.Array(SellerApplicationSchema) },
      },
    },
    async (request) => {
      const account = await getAccount(request);
      requireAnyRole(account.role, ["admin"]);
      return repository.listSellerApplications();
    },
  );

  app.patch<{ Params: { sellerId: string }; Body: ReviewSeller }>(
    "/v1/admin/seller-applications/:sellerId",
    {
      schema: {
        tags: Tags.admin,
        params: Type.Object({ sellerId: Type.String({ format: "uuid" }) }),
        body: ReviewSellerSchema,
        response: { 200: SellerProfileSchema },
      },
    },
    async (request) => {
      const account = await getAccount(request);
      requireAnyRole(account.role, ["admin"]);
      return repository.reviewSeller(
        account.id,
        request.params.sellerId,
        request.body,
      );
    },
  );
}
