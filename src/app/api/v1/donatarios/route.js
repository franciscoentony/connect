import { NextResponse } from "next/server";
import { criarDonatario, listarDonatarios } from "@/models/donatario.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerPaginacao } from "@/lib/requisicao.js";

// donatários da ONG logada
export async function GET(request) {
  try {
    const sessao = await exigirUsuario("ong");
    const paginacao = lerPaginacao(request);
    const donatarios = await listarDonatarios(sessao.id_usuario, paginacao);
    return NextResponse.json(donatarios);
  } catch (error) {
    return responderErro(error);
  }
}

export async function POST(request) {
  try {
    const sessao = await exigirUsuario("ong");
    const dados = await lerJson(request);
    const donatario = await criarDonatario(sessao.id_usuario, dados);
    return NextResponse.json(donatario, { status: 201 });
  } catch (error) {
    return responderErro(error);
  }
}
