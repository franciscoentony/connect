import { NextResponse } from "next/server";
import { listarCampanhas, criarCampanha } from "@/models/campanha.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson } from "@/lib/requisicao.js";

export async function GET(request) {
  try {
    const params = request.nextUrl.searchParams;
    const limite = Math.min(Math.max(parseInt(params.get("limite")) || 20, 1), 50);
    const pagina = Math.max(parseInt(params.get("pagina")) || 1, 1);

    let idOng = null;
    if (params.get("minhas") === "true") {
      idOng = (await exigirUsuario("ong")).id_usuario;
    }
    return NextResponse.json(await listarCampanhas({ idOng, limite, pagina }));
  } catch (error) {
    return responderErro(error);
  }
}

export async function POST(request) {
  try {
    const sessao = await exigirUsuario("ong");
    const campanha = await criarCampanha(sessao.id_usuario, await lerJson(request));
    return NextResponse.json(campanha, { status: 201 });
  } catch (error) {
    return responderErro(error);
  }
}