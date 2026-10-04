import { NextResponse } from "next/server";
import { obterCampanhaVisivel, listarLocais, criarLocal } from "@/models/campanha.js";
import { exigirUsuario, lerSessao } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerId } from "@/lib/requisicao.js";

export async function GET(_request, { params }) {
  try {
    const id = lerId((await params).id);
    await obterCampanhaVisivel(id, await lerSessao()); // mesma regra de visibilidade
    return NextResponse.json(await listarLocais(id));
  } catch (error) {
    return responderErro(error);
  }
}

export async function POST(request, { params }) {
  try {
    const id = lerId((await params).id);
    const sessao = await exigirUsuario("ong");
    const local = await criarLocal(id, sessao.id_usuario, await lerJson(request));
    return NextResponse.json(local, { status: 201 });
  } catch (error) {
    return responderErro(error);
  }
}