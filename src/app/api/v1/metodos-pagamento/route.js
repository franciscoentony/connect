import { NextResponse } from "next/server";
import { listarMetodos } from "@/models/doacao.js";
import { responderErro } from "@/lib/erros.js";

export async function GET() {
  try {
    const metodos = await listarMetodos();
    return NextResponse.json(metodos);
  } catch (error) {
    return responderErro(error);
  }
}
