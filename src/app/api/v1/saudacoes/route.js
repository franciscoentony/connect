import { NextResponse } from "next/server";
import { query } from "infra/database.js";

export async function GET() {
  const result = await query("SELECT NOW()");
  return NextResponse.json({
    msg: "Fala dev!",
    hora_atual: result.rows[0].now,
  });
}
