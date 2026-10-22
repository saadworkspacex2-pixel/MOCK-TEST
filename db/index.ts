import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPostgresqlListenerAttached?: boolean;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
  });

if (!globalForDb.__arenaNextJsPostgresqlListenerAttached) {
  pool.on("error", (err) => {
    console.error("PostgreSQL idle client notice:", err.message);
  });
  globalForDb.__arenaNextJsPostgresqlListenerAttached = true;
}

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
