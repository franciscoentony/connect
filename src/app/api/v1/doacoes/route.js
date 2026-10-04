import { NextResponse } from "next/server";
import { listarDoacoesDoDoador } from "@/models/doacao.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerPaginacao } from "@/lib/requisicao.js";

// "minhas doações": doações feitas pelo doador logado
export async function GET(request) {
  try {
    const sessao = await exigirUsuario("doador");
    const paginacao = lerPaginacao(request);
    const doacoes = await listarDoacoesDoDoador(sessao.id_usuario, paginacao);
    return NextResponse.json(doacoes);
  } catch (error) {
    return responderErro(error);
  }
}
