import { NextResponse } from "next/server";
import { listarCampanhas, criarCampanha } from "@/models/campanha.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerId, lerPaginacao } from "@/lib/requisicao.js";

// GET /campanhas              -> campanhas ativas de todas as ONGs (público)
// GET /campanhas?ong=5        -> campanhas ativas da ONG 5 (público)
// GET /campanhas?minhas=true  -> todas as campanhas da ONG logada, até rascunhos
export async function GET(request) {
  try {
    const params = request.nextUrl.searchParams;
    const paginacao = lerPaginacao(request);

    let filtro = {};
    if (params.get("minhas") === "true") {
      const sessao = await exigirUsuario("ong");
      filtro = { idOng: sessao.id_usuario, todosOsStatus: true };
    } else if (params.get("ong")) {
      filtro = { idOng: lerId(params.get("ong")) };
    }

    const campanhas = await listarCampanhas(filtro, paginacao);
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
