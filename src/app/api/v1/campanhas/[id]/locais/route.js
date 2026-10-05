import { NextResponse } from "next/server";
import {
  obterCampanhaVisivel,
  listarLocais,
  criarLocal,
} from "@/models/campanha.js";
import { exigirUsuario, lerSessao } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerId } from "@/lib/requisicao.js";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const idCampanha = lerId(id);

    // Só lista os locais se a pessoa puder ver a campanha (lança 404 se não puder).
    const sessao = await lerSessao();
    await obterCampanhaVisivel(idCampanha, sessao);

    const locais = await listarLocais(idCampanha);
    return NextResponse.json(locais);
  } catch (error) {
    return responderErro(error);
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const idCampanha = lerId(id);
    const sessao = await exigirUsuario("ong");
    const dados = await lerJson(request);
    const local = await criarLocal(idCampanha, sessao.id_usuario, dados);
    return NextResponse.json(local, { status: 201 });
  } catch (error) {
    return responderErro(error);
  }
}
