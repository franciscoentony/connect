/**
 * @swagger
 * /api/v1/status:
 *   get:
 *     summary: Verifica o status do servidor
 *     description: Retorna o estado atual da aplicação e do banco de dados.
 *     responses:
 *       200:
 *         description: O servidor está online e saudável.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fully_operational"
 *                 uptime:
 *                   type: number
 *                   example: 1243.5
 */

import { NextResponse } from "next/server";
import { query } from "infra/database.js";
export async function GET() {
  const [postgresVersionResult, dataBaseStateResult, maxConnectionsResult] =
    await query(
      "SHOW server_version; SELECT pid, query, state FROM pg_stat_activity; SHOW max_connections",
    );

  const databaseVersionValue = postgresVersionResult.rows[0].server_version;
  const maxConnectionValue = maxConnectionsResult.rows[0].max_connections;

  const updated_at = new Date().toISOString();

  return NextResponse.json({
    status: 200,
    updated_at: updated_at,
    dependencies: {
      database: {
        status: dataBaseStateResult.rows[2].state,
        sgbd: "PostgreSQL",
        version: parseFloat(databaseVersionValue),
        max_connections: parseInt(maxConnectionValue),
      },
    },
  });
}
