import { NextResponse } from "next/server";
import { listarDoacoesDoDoador } from "@/models/doacao.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerPaginacao } from "@/lib/requisicao.js";

export async function GET(request) {
  try {
    const sessao = await exigirUsuario("doador");
    return NextResponse.json(
      await listarDoacoesDoDoador(sessao.id_usuario, lerPaginacao(request)),
    );
  } catch (error) {
    return responderErro(error);
  }
}