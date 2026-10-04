import { NextResponse } from "next/server";
import { obterDoacaoVisivel, atualizarStatus } from "@/models/doacao.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerId } from "@/lib/requisicao.js";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const idDoacao = lerId(id);
    const sessao = await exigirUsuario();
    const doacao = await obterDoacaoVisivel(idDoacao, sessao);
    return NextResponse.json(doacao);
  } catch (error) {
    return responderErro(error);
  }
}

// confirmar ou cancelar: { "status": "confirmada" } ou { "status": "cancelada" }
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const idDoacao = lerId(id);
    const sessao = await exigirUsuario();
    const dados = await lerJson(request);
    const doacao = await atualizarStatus(idDoacao, sessao, dados.status);
    return NextResponse.json(doacao);
  } catch (error) {
    return responderErro(error);
  }
}
