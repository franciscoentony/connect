import { NextResponse } from "next/server";
import { criarDoacao, listarDoacoesDaCampanha } from "@/models/doacao.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerId, lerPaginacao } from "@/lib/requisicao.js";

// doador faz uma doação para a campanha
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const idCampanha = lerId(id);
    const sessao = await exigirUsuario("doador");
    const dados = await lerJson(request);
    const doacao = await criarDoacao(sessao.id_usuario, idCampanha, dados);
    return NextResponse.json(doacao, { status: 201 });
  } catch (error) {
    return responderErro(error);
  }
}

// ONG dona lista as doações recebidas pela campanha
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const idCampanha = lerId(id);
    const sessao = await exigirUsuario("ong");
    const paginacao = lerPaginacao(request);
    const doacoes = await listarDoacoesDaCampanha(
      idCampanha,
      sessao.id_usuario,
      paginacao,
    );
    return NextResponse.json(doacoes);
  } catch (error) {
    return responderErro(error);
  }
}
