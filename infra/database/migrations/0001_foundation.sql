CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state_code char(2) NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, state_code)
);

CREATE TABLE neighborhoods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id),
  name text NOT NULL,
  pilot_core smallint,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (city_id, name)
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_subject text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('customer', 'seller', 'admin')),
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE seller_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  public_name text NOT NULL,
  description text,
  verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended')),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES seller_profiles(user_id),
  category_id uuid NOT NULL REFERENCES categories(id),
  name text NOT NULL,
  description text,
  price_cents integer CHECK (price_cents IS NULL OR price_cents >= 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE route_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES seller_profiles(user_id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped')),
  started_at timestamptz NOT NULL DEFAULT now(),
  stopped_at timestamptz,
  stop_reason text,
  CHECK ((status = 'stopped' AND stopped_at IS NOT NULL) OR status <> 'stopped')
);

CREATE UNIQUE INDEX one_active_route_per_seller
  ON route_sessions (seller_id)
  WHERE status IN ('active', 'paused');

CREATE TABLE seller_current_positions (
  seller_id uuid PRIMARY KEY REFERENCES seller_profiles(user_id),
  route_session_id uuid NOT NULL REFERENCES route_sessions(id),
  precise_position geography(Point, 4326) NOT NULL,
  public_position geography(Point, 4326) NOT NULL,
  accuracy_meters numeric(8, 2) NOT NULL CHECK (accuracy_meters >= 0),
  captured_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > captured_at)
);

CREATE INDEX seller_current_positions_public_gix
  ON seller_current_positions USING gist (public_position);

CREATE TABLE service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES users(id),
  seller_id uuid NOT NULL REFERENCES seller_profiles(user_id),
  product_id uuid REFERENCES products(id),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'on_the_way', 'arrived', 'completed', 'declined', 'expired', 'cancelled')),
  requested_item text NOT NULL,
  quantity text NOT NULL,
  wait_until timestamptz NOT NULL,
  meeting_point geography(Point, 4326) NOT NULL,
  meeting_reference text NOT NULL,
  accepted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX service_requests_seller_status_idx
  ON service_requests (seller_id, status, created_at DESC);

CREATE INDEX service_requests_meeting_point_gix
  ON service_requests USING gist (meeting_point);

CREATE TABLE favorites (
  customer_id uuid NOT NULL REFERENCES users(id),
  seller_id uuid NOT NULL REFERENCES seller_profiles(user_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, seller_id)
);

CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES users(id),
  reported_user_id uuid REFERENCES users(id),
  service_request_id uuid REFERENCES service_requests(id),
  category text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES users(id),
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_events_entity_idx
  ON audit_events (entity_type, entity_id, created_at DESC);

INSERT INTO cities (name, state_code)
VALUES ('Santo André', 'SP')
ON CONFLICT (name, state_code) DO NOTHING;

INSERT INTO neighborhoods (city_id, name, pilot_core)
SELECT id, neighborhood.name, neighborhood.pilot_core
FROM cities
CROSS JOIN (
  VALUES
    ('Recreio da Borda do Campo', 1),
    ('Parque Miami', 1),
    ('Vila Luzita', 2)
) AS neighborhood(name, pilot_core)
WHERE cities.name = 'Santo André' AND cities.state_code = 'SP'
ON CONFLICT (city_id, name) DO NOTHING;

INSERT INTO categories (slug, name)
VALUES
  ('ovos', 'Ovos'),
  ('paes', 'Pães'),
  ('hortifruti', 'Hortifruti'),
  ('queijos', 'Queijos'),
  ('limpeza', 'Produtos de limpeza'),
  ('tapetes-redes', 'Tapetes e redes'),
  ('churros', 'Churros'),
  ('sorvetes-picoles', 'Sorvetes e picolés')
ON CONFLICT (slug) DO NOTHING;

