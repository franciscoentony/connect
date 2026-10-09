import { NextResponse } from "next/server";
import { obterCampanhaVisivel } from "@/models/campanha.js";
import {
  listarFotosDaCampanha,
  adicionarFotoNaCampanha,
} from "@/models/foto.js";
import { exigirUsuario, lerSessao } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerId } from "@/lib/requisicao.js";
import { lerFoto } from "@/lib/imagem.js";

// Galeria da campanha. A primeira foto da lista é a capa.
export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const idCampanha = lerId(id);

    // Só lista as fotos se a pessoa puder ver a campanha (lança 404 se não puder).
    const sessao = await lerSessao();
    await obterCampanhaVisivel(idCampanha, sessao);

    const fotos = await listarFotosDaCampanha(idCampanha);
    return NextResponse.json(fotos);
  } catch (error) {
    return responderErro(error);
  }
}

// Adiciona uma foto. Corpo: formulário (multipart) com o campo "foto".
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const idCampanha = lerId(id);
    const sessao = await exigirUsuario("ong");
    const foto = await lerFoto(request);
    const nova = await adicionarFotoNaCampanha(
      idCampanha,
      sessao.id_usuario,
      foto,
    );
    return NextResponse.json(nova, { status: 201 });
  } catch (error) {
    return responderErro(error);
  }
}
