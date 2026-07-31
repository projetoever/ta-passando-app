ALTER TABLE users
  ADD COLUMN external_provider text NOT NULL DEFAULT 'identity-platform',
  ADD COLUMN email text,
  ADD COLUMN phone_number text,
  ADD COLUMN neighborhood_id uuid REFERENCES neighborhoods(id);

CREATE UNIQUE INDEX users_email_unique_idx
  ON users (lower(email))
  WHERE email IS NOT NULL AND status <> 'deleted';

CREATE INDEX users_neighborhood_idx ON users (neighborhood_id, status);

ALTER TABLE seller_profiles
  ADD COLUMN primary_category_id uuid REFERENCES categories(id),
  ADD COLUMN neighborhood_id uuid REFERENCES neighborhoods(id),
  ADD COLUMN contact_phone text,
  ADD COLUMN payment_methods text[] NOT NULL DEFAULT '{}',
  ADD COLUMN review_note text;

UPDATE seller_profiles
SET primary_category_id = (
      SELECT id FROM categories WHERE active = true ORDER BY name LIMIT 1
    ),
    neighborhood_id = (
      SELECT id FROM neighborhoods WHERE active = true ORDER BY pilot_core, name LIMIT 1
    ),
    contact_phone = 'não informado'
WHERE primary_category_id IS NULL
   OR neighborhood_id IS NULL
   OR contact_phone IS NULL;

ALTER TABLE seller_profiles
  ALTER COLUMN primary_category_id SET NOT NULL,
  ALTER COLUMN neighborhood_id SET NOT NULL,
  ALTER COLUMN contact_phone SET NOT NULL;

CREATE INDEX seller_profiles_review_idx
  ON seller_profiles (verification_status, updated_at);

ALTER TABLE products
  ADD COLUMN unit text NOT NULL DEFAULT 'unidade';

CREATE INDEX products_seller_active_idx
  ON products (seller_id, active, name);
