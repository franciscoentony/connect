import { NextResponse } from "next/server";
import { listarMetodos } from "@/models/doacao.js";
import { responderErro } from "@/lib/erros.js";

export async function GET() {
  try {
    return NextResponse.json(await listarMetodos());
  } catch (error) {
    return responderErro(error);
  }
}