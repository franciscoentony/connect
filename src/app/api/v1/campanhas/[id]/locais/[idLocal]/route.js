import { NextResponse } from "next/server";
import { removerLocal } from "@/models/campanha.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerId } from "@/lib/requisicao.js";

export async function DELETE(_request, { params }) {
  try {
    const sessao = await exigirUsuario("ong");
    const { id, idLocal } = await params;
    const idCampanha = lerId(id);
    const idDoLocal = lerId(idLocal);
    await removerLocal(idCampanha, idDoLocal, sessao.id_usuario);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return responderErro(error);
  }
}
