import { afterEach, describe, expect, it } from "vitest";
import type {
  Account,
  Category,
  CreateProduct,
  Neighborhood,
  Product,
  ReviewSeller,
  SellerApplication,
  SellerProfile,
  UpdateAccount,
  UpdateProduct,
  UpsertSellerProfile,
} from "@ta-passando/contracts";
import { createApp } from "../src/app";
import { AuthenticationError, type AccessTokenVerifier } from "../src/auth/authorization";
import type { ApiConfig } from "../src/config";
import type {
  PilotRepository,
  RegisterAccountInput,
} from "../src/modules/pilot/repository";

const neighborhood: Neighborhood = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Recreio da Borda do Campo",
  city: "Santo André",
  stateCode: "SP",
  pilotCore: 1,
};

const category: Category = {
  id: "22222222-2222-4222-8222-222222222222",
  slug: "ovos",
  name: "Ovos",
};

const customerId = "33333333-3333-4333-8333-333333333333";
const adminId = "44444444-4444-4444-8444-444444444444";
const now = "2026-07-31T12:00:00.000Z";

const config: ApiConfig = {
  environment: "test",
  host: "127.0.0.1",
  port: 3001,
  logLevel: "silent",
  corsOrigins: ["http://localhost:3000"],
  positionTtlSeconds: 180,
  publicPositionGridMeters: 250,
};

const verifier: AccessTokenVerifier = {
  async verify(token) {
    if (token === "customer-token") {
      return {
        subject: "customer-subject",
        provider: "test",
        email: "morador@example.com",
      };
    }
    if (token === "admin-token") {
      return {
        subject: "admin-subject",
        provider: "test",
        email: "admin@example.com",
      };
    }
    throw new AuthenticationError("Token inválido.");
  },
};

class MemoryRepository implements PilotRepository {
  private accounts = new Map<string, Account>([
    [
      "admin-subject",
      {
        id: adminId,
        role: "admin",
        displayName: "Admin do piloto",
        email: "admin@example.com",
        phoneNumber: null,
        status: "active",
        neighborhood,
        createdAt: now,
        updatedAt: now,
      },
    ],
  ]);
  private subjectsById = new Map<string, string>([[adminId, "admin-subject"]]);
  private sellers = new Map<string, SellerProfile>();
  private products = new Map<string, Product[]>();

  async listNeighborhoods() { return [neighborhood]; }
  async listCategories() { return [category]; }

  async registerAccount(
    identity: Awaited<ReturnType<AccessTokenVerifier["verify"]>>,
    input: RegisterAccountInput,
  ) {
    const existing = this.accounts.get(identity.subject);
    const account: Account = {
      id: existing?.id ?? customerId,
      role: existing?.role ?? "customer",
      displayName: input.displayName,
      email: identity.email ?? null,
      phoneNumber: identity.phoneNumber ?? null,
      status: "active",
      neighborhood: input.neighborhoodId ? neighborhood : null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.accounts.set(identity.subject, account);
    this.subjectsById.set(account.id, identity.subject);
    return account;
  }

  async findAccountBySubject(subject: string) {
    return this.accounts.get(subject) ?? null;
  }

  async updateAccount(userId: string, input: UpdateAccount) {
    const subject = this.subjectsById.get(userId);
    const account = subject ? this.accounts.get(subject) : undefined;
    if (!subject || !account) throw new Error("Conta não encontrada");
    const updated: Account = {
      ...account,
      displayName: input.displayName ?? account.displayName,
      neighborhood: input.neighborhoodId ? neighborhood : account.neighborhood,
      updatedAt: now,
    };
    this.accounts.set(subject, updated);
    return updated;
  }

  async getSellerProfile(userId: string) {
    return this.sellers.get(userId) ?? null;
  }

  async upsertSellerProfile(userId: string, input: UpsertSellerProfile) {
    const profile: SellerProfile = {
      userId,
      publicName: input.publicName,
      description: input.description ?? null,
      verificationStatus: "pending",
      primaryCategory: category,
      neighborhood,
      contactPhone: input.contactPhone,
      paymentMethods: input.paymentMethods,
      reviewNote: null,
      createdAt: now,
      updatedAt: now,
    };
    this.sellers.set(userId, profile);
    return profile;
  }

  async listSellerProducts(userId: string) {
    return this.products.get(userId) ?? [];
  }

  async createSellerProduct(userId: string, input: CreateProduct) {
    const product: Product = {
      id: "55555555-5555-4555-8555-555555555555",
      sellerId: userId,
      category,
      name: input.name,
      description: input.description ?? null,
      priceCents: input.priceCents ?? null,
      unit: input.unit,
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    this.products.set(userId, [...(this.products.get(userId) ?? []), product]);
    return product;
  }

  async updateSellerProduct(
    userId: string,
    productId: string,
    input: UpdateProduct,
  ) {
    const current = (this.products.get(userId) ?? []).find((item) => item.id === productId);
    if (!current) throw new Error("Produto não encontrado");
    const updated: Product = {
      ...current,
      name: input.name ?? current.name,
      description: input.description === undefined ? current.description : input.description,
      priceCents: input.priceCents === undefined ? current.priceCents : input.priceCents,
      unit: input.unit ?? current.unit,
      active: input.active ?? current.active,
      updatedAt: now,
    };
    this.products.set(
      userId,
      (this.products.get(userId) ?? []).map((item) =>
        item.id === productId ? updated : item,
      ),
    );
    return updated;
  }

  async deleteSellerProduct(userId: string, productId: string) {
    const current = this.products.get(userId) ?? [];
    this.products.set(userId, current.filter((item) => item.id !== productId));
    return current.some((item) => item.id === productId);
  }

  async listSellerApplications(): Promise<SellerApplication[]> {
    return [...this.sellers.values()]
      .filter((seller) => seller.verificationStatus === "pending")
      .map((seller) => ({
        ...seller,
        ownerName: "João da Silva",
        ownerEmail: "morador@example.com",
      }));
  }

  async reviewSeller(adminUserId: string, sellerId: string, review: ReviewSeller) {
    expect(adminUserId).toBe(adminId);
    const seller = this.sellers.get(sellerId);
    if (!seller) throw new Error("Cadastro não encontrado");
    const updated: SellerProfile = {
      ...seller,
      verificationStatus: review.status,
      reviewNote: review.note ?? null,
      updatedAt: now,
    };
    this.sellers.set(sellerId, updated);

    const subject = this.subjectsById.get(sellerId);
    const account = subject ? this.accounts.get(subject) : undefined;
    if (subject && account) {
      this.accounts.set(subject, {
        ...account,
        role: review.status === "approved" ? "seller" : "customer",
      });
    }
    return updated;
  }
}

const apps: Awaited<ReturnType<typeof createApp>>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

async function setup() {
  const app = await createApp({
    config,
    logger: false,
    repository: new MemoryRepository(),
    tokenVerifier: verifier,
  });
  apps.push(app);
  return app;
}

describe("identity and persistent catalog routes", () => {
  it("requires a valid identity before registration", async () => {
    const app = await setup();
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { displayName: "João da Silva" },
    });
    expect(response.statusCode).toBe(401);
  });

  it("registers a customer and returns the persisted account", async () => {
    const app = await setup();
    const registration = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      headers: { authorization: "Bearer customer-token" },
      payload: { displayName: "João da Silva", neighborhoodId: neighborhood.id },
    });
    expect(registration.statusCode).toBe(200);
    expect(registration.json()).toMatchObject({
      role: "customer",
      displayName: "João da Silva",
      neighborhood: { name: "Recreio da Borda do Campo" },
    });

    const me = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: "Bearer customer-token" },
    });
    expect(me.statusCode).toBe(200);
    expect(me.json().id).toBe(customerId);
  });

  it("creates a seller application and a catalog item", async () => {
    const app = await setup();
    await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      headers: { authorization: "Bearer customer-token" },
      payload: { displayName: "João da Silva", neighborhoodId: neighborhood.id },
    });
    const seller = await app.inject({
      method: "PUT",
      url: "/v1/sellers/me",
      headers: { authorization: "Bearer customer-token" },
      payload: {
        publicName: "Ovos do João",
        description: "Ovos frescos no bairro.",
        primaryCategoryId: category.id,
        neighborhoodId: neighborhood.id,
        contactPhone: "+5511999999999",
        paymentMethods: ["Pix", "Dinheiro"],
      },
    });
    expect(seller.statusCode).toBe(200);
    expect(seller.json().verificationStatus).toBe("pending");

    const product = await app.inject({
      method: "POST",
      url: "/v1/sellers/me/products",
      headers: { authorization: "Bearer customer-token" },
      payload: {
        categoryId: category.id,
        name: "Bandeja com 30 ovos",
        priceCents: 2500,
        unit: "bandeja",
      },
    });
    expect(product.statusCode).toBe(201);
    expect(product.json()).toMatchObject({ name: "Bandeja com 30 ovos", priceCents: 2500 });
  });

  it("allows only administrators to approve a seller", async () => {
    const app = await setup();
    await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      headers: { authorization: "Bearer customer-token" },
      payload: { displayName: "João da Silva" },
    });
    await app.inject({
      method: "PUT",
      url: "/v1/sellers/me",
      headers: { authorization: "Bearer customer-token" },
      payload: {
        publicName: "Ovos do João",
        primaryCategoryId: category.id,
        neighborhoodId: neighborhood.id,
        contactPhone: "+5511999999999",
        paymentMethods: ["Pix"],
      },
    });

    const denied = await app.inject({
      method: "GET",
      url: "/v1/admin/seller-applications",
      headers: { authorization: "Bearer customer-token" },
    });
    expect(denied.statusCode).toBe(403);

    const approved = await app.inject({
      method: "PATCH",
      url: `/v1/admin/seller-applications/${customerId}`,
      headers: { authorization: "Bearer admin-token" },
      payload: { status: "approved", note: "Validado para o piloto." },
    });
    expect(approved.statusCode).toBe(200);
    expect(approved.json()).toMatchObject({ verificationStatus: "approved" });
  });
});
