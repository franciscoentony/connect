import { NextResponse } from "next/server";
import { desvincularDonatario } from "@/models/donatario.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerId } from "@/lib/requisicao.js";

// desvincula o donatário da campanha
export async function DELETE(_request, { params }) {
  try {
    const sessao = await exigirUsuario("ong");
    const { id, idDonatario } = await params;
    const idCampanha = lerId(id);
    const idDoDonatario = lerId(idDonatario);
    await desvincularDonatario(idCampanha, idDoDonatario, sessao.id_usuario);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return responderErro(error);
  }
}
