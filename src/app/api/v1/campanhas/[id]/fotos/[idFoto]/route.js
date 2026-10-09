import { NextResponse } from "next/server";
import { buscarFotoDaCampanha, removerFotoDaCampanha } from "@/models/foto.js";
import { exigirUsuario, lerSessao } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerId } from "@/lib/requisicao.js";
import { responderFoto } from "@/lib/imagem.js";

// Devolve a imagem (não é JSON). Mesma regra de quem pode ver a campanha.
export async function GET(_request, { params }) {
  try {
    const { id, idFoto } = await params;
    const idCampanha = lerId(id);
    const idDaFoto = lerId(idFoto);
    const sessao = await lerSessao();
    const foto = await buscarFotoDaCampanha(idCampanha, idDaFoto, sessao);
    return responderFoto(foto);
  } catch (error) {
    return responderErro(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const sessao = await exigirUsuario("ong");
    const { id, idFoto } = await params;
    const idCampanha = lerId(id);
    const idDaFoto = lerId(idFoto);
    await removerFotoDaCampanha(idCampanha, idDaFoto, sessao.id_usuario);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return responderErro(error);
  }
}
