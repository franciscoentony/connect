import { NextResponse } from "next/server";
import { removerLocal } from "@/models/campanha.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerId } from "@/lib/requisicao.js";

export async function DELETE(_request, { params }) {
  try {
    const { id, idLocal } = await params;
    const sessao = await exigirUsuario("ong");
    await removerLocal(lerId(id), lerId(idLocal), sessao.id_usuario);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return responderErro(error);
  }
}