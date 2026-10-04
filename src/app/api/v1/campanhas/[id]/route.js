import { NextResponse } from "next/server";
import { obterCampanhaVisivel, atualizarCampanha } from "@/models/campanha.js";
import { exigirUsuario, lerSessao } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerId } from "@/lib/requisicao.js";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const idCampanha = lerId(id);
    const sessao = await lerSessao(); // pode ser null: a rota é pública
    const campanha = await obterCampanhaVisivel(idCampanha, sessao);
    return NextResponse.json(campanha);
  } catch (error) {
    return responderErro(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const idCampanha = lerId(id);
    const sessao = await exigirUsuario("ong");
    const dados = await lerJson(request);
    const campanha = await atualizarCampanha(
      idCampanha,
      sessao.id_usuario,
      dados,
    );
    return NextResponse.json(campanha);
  } catch (error) {
    return responderErro(error);
  }
}
