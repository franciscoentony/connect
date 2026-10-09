import pg from "pg";

// O Pool mantém algumas conexões abertas com o banco e as reaproveita,
// em vez de abrir uma conexão nova a cada consulta.
//
// Em desenvolvimento, o Next recarrega este arquivo a cada alteração no
// código. Para não criar um Pool novo (e mais conexões) a cada recarga,
// guardamos o Pool em globalThis, que sobrevive às recargas.
if (!globalThis.pgPool) {
  globalThis.pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // no máximo 10 conexões ao mesmo tempo
    idleTimeoutMillis: 30000, // fecha conexões paradas há 30s
  });
}

const pool = globalThis.pgPool;

// Uso: const result = await query("SELECT ... WHERE id = $1", [id]);
// O $1 é trocado pelo primeiro valor da lista, $2 pelo segundo, etc.
// Nunca monte o SQL concatenando valores do usuário: isso abre brecha
// para SQL injection.
export async function query(text, values) {
  return pool.query(text, values);
}

export default pool;
