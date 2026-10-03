/**
 * @swagger
 * /api/v1/saudacoes:
 *   get:
 *     summary: Retorna uma mensagem de saudação
 *     description: Endpoint simples para verificar o funcionamento das saudações.
 *     responses:
 *       200:
 *         description: Sucesso ao retornar a saudação.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Olá! Seja bem-vindo à nossa API."
 */

import { NextResponse } from "next/server";
import { query } from "infra/database.js";

export async function GET() {
  const result = await query("SELECT NOW()");
  return NextResponse.json({
    msg: "Fala dev!",
    hora_atual: result.rows[0].now,
  });
}
