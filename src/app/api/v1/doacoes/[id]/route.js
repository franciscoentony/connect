import { NextResponse } from "next/server";
import { obterDoacaoVisivel, atualizarStatus } from "@/models/doacao.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerId } from "@/lib/requisicao.js";

export async function GET(_request, { params }) {
  try {
    const id = lerId((await params).id);
    const sessao = await exigirUsuario();
    return NextResponse.json(await obterDoacaoVisivel(id, sessao));
  } catch (error) {
    return responderErro(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const id = lerId((await params).id);
    const sessao = await exigirUsuario();
    const { status } = await lerJson(request);
    return NextResponse.json(await atualizarStatus(id, sessao, status));
  } catch (error) {
    return responderErro(error);
  }
}
