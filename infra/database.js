import pg from "pg";
const { Pool } = pg;

const globalForPg = globalThis;

const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export async function query(text, params) {
  return pool.query(text, params);
}

export default pool;
