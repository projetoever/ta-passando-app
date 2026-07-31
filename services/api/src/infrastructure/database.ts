import postgres, { type Sql } from "postgres";

export type Database = Sql<Record<string, never>>;

export function connectDatabase(databaseUrl: string): Database {
  return postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
}

