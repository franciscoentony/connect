import { NextResponse } from "next/server";
import { criarDoacao, listarDoacoesDaCampanha } from "@/models/doacao.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerId, lerPaginacao } from "@/lib/requisicao.js";

export async function POST(request, { params }) {
  try {
    const id = lerId((await params).id);
    const sessao = await exigirUsuario("doador");
    const doacao = await criarDoacao(sessao.id_usuario, id, await lerJson(request));
    return NextResponse.json(doacao, { status: 201 });
  } catch (error) {
    return responderErro(error);
  }
}

export async function GET(request, { params }) {
  try {
    const id = lerId((await params).id);
    const sessao = await exigirUsuario("ong");
    const doacoes = await listarDoacoesDaCampanha(id, sessao.id_usuario, lerPaginacao(request));
    return NextResponse.json(doacoes);
  } catch (error) {
    return responderErro(error);
  }
}