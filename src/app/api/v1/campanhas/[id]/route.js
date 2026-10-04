import { NextResponse } from "next/server";
import { obterCampanhaVisivel, atualizarCampanha } from "@/models/campanha.js";
import { exigirUsuario, lerSessao } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerId } from "@/lib/requisicao.js";

export async function GET(_request, { params }) {
  try {
    const id = lerId((await params).id);
    const campanha = await obterCampanhaVisivel(id, await lerSessao());
    return NextResponse.json(campanha);
  } catch (error) {
    return responderErro(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const id = lerId((await params).id);
    const sessao = await exigirUsuario("ong");
    const campanha = await atualizarCampanha(
      id,
      sessao.id_usuario,
      await lerJson(request),
    );
    return NextResponse.json(campanha);
  } catch (error) {
    return responderErro(error);
  }
}
