import { NextResponse } from "next/server";
import { listarCampanhas, criarCampanha } from "@/models/campanha.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerPaginacao } from "@/lib/requisicao.js";

// GET /campanhas            -> campanhas ativas (público)
// GET /campanhas?minhas=true -> todas as campanhas da ONG logada
export async function GET(request) {
  try {
    const { limite, pagina } = lerPaginacao(request);

    let idOng = null;
    if (request.nextUrl.searchParams.get("minhas") === "true") {
      const sessao = await exigirUsuario("ong");
      idOng = sessao.id_usuario;
    }

    const campanhas = await listarCampanhas({ idOng, limite, pagina });
    return NextResponse.json(campanhas);
  } catch (error) {
    return responderErro(error);
  }
}

export async function POST(request) {
  try {
    const sessao = await exigirUsuario("ong");
    const dados = await lerJson(request);
    const campanha = await criarCampanha(sessao.id_usuario, dados);
    return NextResponse.json(campanha, { status: 201 });
  } catch (error) {
    return responderErro(error);
  }
}
