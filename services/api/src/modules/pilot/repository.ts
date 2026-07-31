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
import type { AuthPrincipal } from "../../auth/authorization";
import type { Database } from "../../infrastructure/database";

export type RegisterAccountInput = {
  displayName: string;
  neighborhoodId?: string;
};

export interface PilotRepository {
  listNeighborhoods(): Promise<Neighborhood[]>;
  listCategories(): Promise<Category[]>;
  registerAccount(identity: AuthPrincipal, input: RegisterAccountInput): Promise<Account>;
  findAccountBySubject(subject: string): Promise<Account | null>;
  updateAccount(userId: string, input: UpdateAccount): Promise<Account>;
  getSellerProfile(userId: string): Promise<SellerProfile | null>;
  upsertSellerProfile(userId: string, input: UpsertSellerProfile): Promise<SellerProfile>;
  listSellerProducts(userId: string): Promise<Product[]>;
  createSellerProduct(userId: string, input: CreateProduct): Promise<Product>;
  updateSellerProduct(userId: string, productId: string, input: UpdateProduct): Promise<Product>;
  deleteSellerProduct(userId: string, productId: string): Promise<boolean>;
  listSellerApplications(): Promise<SellerApplication[]>;
  reviewSeller(
    adminId: string,
    sellerId: string,
    review: ReviewSeller,
  ): Promise<SellerProfile>;
}

export class ResourceNotFoundError extends Error {
  readonly statusCode = 404;
  readonly code = "RESOURCE_NOT_FOUND";
}

export class PersistenceUnavailableError extends Error {
  readonly statusCode = 503;
  readonly code = "PERSISTENCE_UNAVAILABLE";
}

type AccountRow = {
  id: string;
  role: Account["role"];
  display_name: string;
  email: string | null;
  phone_number: string | null;
  status: Account["status"];
  neighborhood_id: string | null;
  neighborhood_name: string | null;
  city_name: string | null;
  state_code: string | null;
  pilot_core: number | null;
  created_at: Date;
  updated_at: Date;
};

type SellerRow = {
  user_id: string;
  public_name: string;
  description: string | null;
  verification_status: SellerProfile["verificationStatus"];
  category_id: string;
  category_slug: string;
  category_name: string;
  neighborhood_id: string;
  neighborhood_name: string;
  city_name: string;
  state_code: string;
  pilot_core: number | null;
  contact_phone: string;
  payment_methods: string[];
  review_note: string | null;
  created_at: Date;
  updated_at: Date;
  owner_name: string;
  owner_email: string | null;
};

type ProductRow = {
  id: string;
  seller_id: string;
  category_id: string;
  category_slug: string;
  category_name: string;
  name: string;
  description: string | null;
  price_cents: number | null;
  unit: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
};

function mapNeighborhood(row: {
  neighborhood_id: string;
  neighborhood_name: string;
  city_name: string;
  state_code: string;
  pilot_core: number | null;
}): Neighborhood {
  return {
    id: row.neighborhood_id,
    name: row.neighborhood_name,
    city: row.city_name,
    stateCode: row.state_code,
    pilotCore: row.pilot_core,
  };
}

function mapAccount(row: AccountRow): Account {
  const neighborhood =
    row.neighborhood_id && row.neighborhood_name && row.city_name && row.state_code
      ? mapNeighborhood({
          neighborhood_id: row.neighborhood_id,
          neighborhood_name: row.neighborhood_name,
          city_name: row.city_name,
          state_code: row.state_code,
          pilot_core: row.pilot_core,
        })
      : null;

  return {
    id: row.id,
    role: row.role,
    displayName: row.display_name,
    email: row.email,
    phoneNumber: row.phone_number,
    status: row.status,
    neighborhood,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function mapSeller(row: SellerRow): SellerProfile {
  return {
    userId: row.user_id,
    publicName: row.public_name,
    description: row.description,
    verificationStatus: row.verification_status,
    primaryCategory: {
      id: row.category_id,
      slug: row.category_slug,
      name: row.category_name,
    },
    neighborhood: mapNeighborhood(row),
    contactPhone: row.contact_phone,
    paymentMethods: row.payment_methods,
    reviewNote: row.review_note,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sellerId: row.seller_id,
    category: {
      id: row.category_id,
      slug: row.category_slug,
      name: row.category_name,
    },
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    unit: row.unit,
    active: row.active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const accountSelect = `
  SELECT u.id, u.role, u.display_name, u.email, u.phone_number, u.status,
         u.neighborhood_id, n.name AS neighborhood_name, c.name AS city_name,
         c.state_code, n.pilot_core, u.created_at, u.updated_at
  FROM users u
  LEFT JOIN neighborhoods n ON n.id = u.neighborhood_id
  LEFT JOIN cities c ON c.id = n.city_id
`;

const sellerSelect = `
  SELECT sp.user_id, sp.public_name, sp.description, sp.verification_status,
         cat.id AS category_id, cat.slug AS category_slug, cat.name AS category_name,
         n.id AS neighborhood_id, n.name AS neighborhood_name, c.name AS city_name,
         c.state_code, n.pilot_core, sp.contact_phone, sp.payment_methods,
         sp.review_note, sp.created_at, sp.updated_at,
         owner.display_name AS owner_name, owner.email AS owner_email
  FROM seller_profiles sp
  JOIN users owner ON owner.id = sp.user_id
  JOIN categories cat ON cat.id = sp.primary_category_id
  JOIN neighborhoods n ON n.id = sp.neighborhood_id
  JOIN cities c ON c.id = n.city_id
`;

const productSelect = `
  SELECT p.id, p.seller_id, cat.id AS category_id, cat.slug AS category_slug,
         cat.name AS category_name, p.name, p.description, p.price_cents, p.unit,
         p.active, p.created_at, p.updated_at
  FROM products p
  JOIN categories cat ON cat.id = p.category_id
`;

export class PostgresPilotRepository implements PilotRepository {
  constructor(private readonly sql: Database) {}

  async listNeighborhoods(): Promise<Neighborhood[]> {
    const rows = await this.sql<
      Array<{
        neighborhood_id: string;
        neighborhood_name: string;
        city_name: string;
        state_code: string;
        pilot_core: number | null;
      }>
    >`
      SELECT n.id AS neighborhood_id, n.name AS neighborhood_name,
             c.name AS city_name, c.state_code, n.pilot_core
      FROM neighborhoods n
      JOIN cities c ON c.id = n.city_id
      WHERE n.active = true AND c.active = true
      ORDER BY n.pilot_core NULLS LAST, n.name
    `;
    return rows.map(mapNeighborhood);
  }

  async listCategories(): Promise<Category[]> {
    const rows = await this.sql<Array<{ id: string; slug: string; name: string }>>`
      SELECT id, slug, name FROM categories WHERE active = true ORDER BY name
    `;
    return rows;
  }

  async registerAccount(
    identity: AuthPrincipal,
    input: RegisterAccountInput,
  ): Promise<Account> {
    const rows = await this.sql<AccountRow[]>`
      INSERT INTO users (
        external_subject, external_provider, role, display_name, email,
        phone_number, neighborhood_id, status
      )
      VALUES (
        ${identity.subject}, ${identity.provider}, 'customer', ${input.displayName},
        ${identity.email ?? null}, ${identity.phoneNumber ?? null},
        ${input.neighborhoodId ?? null}, 'active'
      )
      ON CONFLICT (external_subject) DO UPDATE SET
        external_provider = EXCLUDED.external_provider,
        display_name = EXCLUDED.display_name,
        email = COALESCE(EXCLUDED.email, users.email),
        phone_number = COALESCE(EXCLUDED.phone_number, users.phone_number),
        neighborhood_id = COALESCE(EXCLUDED.neighborhood_id, users.neighborhood_id),
        updated_at = now()
      RETURNING id, role, display_name, email, phone_number, status,
                neighborhood_id, created_at, updated_at,
                NULL::text AS neighborhood_name, NULL::text AS city_name,
                NULL::char(2) AS state_code, NULL::smallint AS pilot_core
    `;
    const account = await this.findAccountById(rows[0].id);
    if (!account) throw new ResourceNotFoundError("Conta não encontrada após cadastro.");
    return account;
  }

  async findAccountBySubject(subject: string): Promise<Account | null> {
    const rows = await this.sql.unsafe<AccountRow[]>(
      `${accountSelect} WHERE u.external_subject = $1 LIMIT 1`,
      [subject],
    );
    return rows[0] ? mapAccount(rows[0]) : null;
  }

  async updateAccount(userId: string, input: UpdateAccount): Promise<Account> {
    const displayName = input.displayName ?? null;
    const neighborhoodId = input.neighborhoodId ?? null;
    const rows = await this.sql<{ id: string }[]>`
      UPDATE users
      SET display_name = COALESCE(${displayName}, display_name),
          neighborhood_id = COALESCE(${neighborhoodId}, neighborhood_id),
          updated_at = now()
      WHERE id = ${userId} AND status <> 'deleted'
      RETURNING id
    `;
    if (!rows[0]) throw new ResourceNotFoundError("Conta não encontrada.");
    const account = await this.findAccountById(rows[0].id);
    if (!account) throw new ResourceNotFoundError("Conta não encontrada.");
    return account;
  }

  async getSellerProfile(userId: string): Promise<SellerProfile | null> {
    const rows = await this.sql.unsafe<SellerRow[]>(
      `${sellerSelect} WHERE sp.user_id = $1 LIMIT 1`,
      [userId],
    );
    return rows[0] ? mapSeller(rows[0]) : null;
  }

  async upsertSellerProfile(
    userId: string,
    input: UpsertSellerProfile,
  ): Promise<SellerProfile> {
    await this.sql`
      INSERT INTO seller_profiles (
        user_id, public_name, description, verification_status,
        primary_category_id, neighborhood_id, contact_phone, payment_methods
      )
      VALUES (
        ${userId}, ${input.publicName}, ${input.description ?? null}, 'pending',
        ${input.primaryCategoryId}, ${input.neighborhoodId}, ${input.contactPhone},
        ${input.paymentMethods}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        public_name = EXCLUDED.public_name,
        description = EXCLUDED.description,
        verification_status = CASE
          WHEN seller_profiles.verification_status = 'suspended' THEN 'suspended'
          ELSE 'pending'
        END,
        primary_category_id = EXCLUDED.primary_category_id,
        neighborhood_id = EXCLUDED.neighborhood_id,
        contact_phone = EXCLUDED.contact_phone,
        payment_methods = EXCLUDED.payment_methods,
        review_note = NULL,
        approved_at = NULL,
        updated_at = now()
    `;
    const profile = await this.getSellerProfile(userId);
    if (!profile) throw new ResourceNotFoundError("Cadastro de vendedor não encontrado.");
    return profile;
  }

  async listSellerProducts(userId: string): Promise<Product[]> {
    const rows = await this.sql.unsafe<ProductRow[]>(
      `${productSelect} WHERE p.seller_id = $1 ORDER BY p.active DESC, p.name`,
      [userId],
    );
    return rows.map(mapProduct);
  }

  async createSellerProduct(userId: string, input: CreateProduct): Promise<Product> {
    const rows = await this.sql<{ id: string }[]>`
      INSERT INTO products (
        seller_id, category_id, name, description, price_cents, unit, active
      )
      VALUES (
        ${userId}, ${input.categoryId}, ${input.name}, ${input.description ?? null},
        ${input.priceCents ?? null}, ${input.unit}, true
      )
      RETURNING id
    `;
    return this.getProduct(userId, rows[0].id);
  }

  async updateSellerProduct(
    userId: string,
    productId: string,
    input: UpdateProduct,
  ): Promise<Product> {
    const rows = await this.sql<{ id: string }[]>`
      UPDATE products
      SET category_id = COALESCE(${input.categoryId ?? null}, category_id),
          name = COALESCE(${input.name ?? null}, name),
          description = CASE
            WHEN ${input.description === undefined} THEN description
            ELSE ${input.description ?? null}
          END,
          price_cents = CASE
            WHEN ${input.priceCents === undefined} THEN price_cents
            ELSE ${input.priceCents ?? null}
          END,
          unit = COALESCE(${input.unit ?? null}, unit),
          active = COALESCE(${input.active ?? null}, active),
          updated_at = now()
      WHERE id = ${productId} AND seller_id = ${userId}
      RETURNING id
    `;
    if (!rows[0]) throw new ResourceNotFoundError("Produto não encontrado.");
    return this.getProduct(userId, rows[0].id);
  }

  async deleteSellerProduct(userId: string, productId: string): Promise<boolean> {
    const rows = await this.sql<{ id: string }[]>`
      DELETE FROM products WHERE id = ${productId} AND seller_id = ${userId}
      RETURNING id
    `;
    return Boolean(rows[0]);
  }

  async listSellerApplications(): Promise<SellerApplication[]> {
    const rows = await this.sql.unsafe<SellerRow[]>(
      `${sellerSelect}
       WHERE sp.verification_status = 'pending'
       ORDER BY sp.updated_at ASC`,
    );
    return rows.map((row) => ({
      ...mapSeller(row),
      ownerName: row.owner_name,
      ownerEmail: row.owner_email,
    }));
  }

  async reviewSeller(
    adminId: string,
    sellerId: string,
    review: ReviewSeller,
  ): Promise<SellerProfile> {
    const updated = await this.sql.begin(async (transaction) => {
      const sellerRows = await transaction<{ user_id: string }[]>`
        UPDATE seller_profiles
        SET verification_status = ${review.status},
            review_note = ${review.note ?? null},
            approved_at = CASE WHEN ${review.status} = 'approved' THEN now() ELSE NULL END,
            updated_at = now()
        WHERE user_id = ${sellerId}
        RETURNING user_id
      `;
      if (!sellerRows[0]) return false;

      await transaction`
        UPDATE users
        SET role = ${review.status === "approved" ? "seller" : "customer"},
            updated_at = now()
        WHERE id = ${sellerId}
      `;
      await transaction`
        INSERT INTO audit_events (
          actor_id, event_type, entity_type, entity_id, metadata
        )
        VALUES (
          ${adminId}, 'seller.reviewed', 'seller_profile', ${sellerId},
          ${transaction.json({ status: review.status, note: review.note ?? null })}
        )
      `;
      return true;
    });

    if (!updated) throw new ResourceNotFoundError("Cadastro de vendedor não encontrado.");
    const profile = await this.getSellerProfile(sellerId);
    if (!profile) throw new ResourceNotFoundError("Cadastro de vendedor não encontrado.");
    return profile;
  }

  private async findAccountById(userId: string): Promise<Account | null> {
    const rows = await this.sql.unsafe<AccountRow[]>(
      `${accountSelect} WHERE u.id = $1 LIMIT 1`,
      [userId],
    );
    return rows[0] ? mapAccount(rows[0]) : null;
  }

  private async getProduct(userId: string, productId: string): Promise<Product> {
    const rows = await this.sql.unsafe<ProductRow[]>(
      `${productSelect} WHERE p.seller_id = $1 AND p.id = $2 LIMIT 1`,
      [userId, productId],
    );
    if (!rows[0]) throw new ResourceNotFoundError("Produto não encontrado.");
    return mapProduct(rows[0]);
  }
}

export class UnavailablePilotRepository implements PilotRepository {
  private unavailable(): never {
    throw new PersistenceUnavailableError(
      "O banco de dados ainda não foi configurado neste ambiente.",
    );
  }

  async listNeighborhoods(): Promise<Neighborhood[]> { return this.unavailable(); }
  async listCategories(): Promise<Category[]> { return this.unavailable(); }
  async registerAccount(): Promise<Account> { return this.unavailable(); }
  async findAccountBySubject(): Promise<Account | null> { return this.unavailable(); }
  async updateAccount(): Promise<Account> { return this.unavailable(); }
  async getSellerProfile(): Promise<SellerProfile | null> { return this.unavailable(); }
  async upsertSellerProfile(): Promise<SellerProfile> { return this.unavailable(); }
  async listSellerProducts(): Promise<Product[]> { return this.unavailable(); }
  async createSellerProduct(): Promise<Product> { return this.unavailable(); }
  async updateSellerProduct(): Promise<Product> { return this.unavailable(); }
  async deleteSellerProduct(): Promise<boolean> { return this.unavailable(); }
  async listSellerApplications(): Promise<SellerApplication[]> { return this.unavailable(); }
  async reviewSeller(): Promise<SellerProfile> { return this.unavailable(); }
}
