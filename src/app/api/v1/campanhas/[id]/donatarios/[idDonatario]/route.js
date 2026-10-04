import { NextResponse } from "next/server";
import { desvincularDonatario } from "@/models/donatario.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerId } from "@/lib/requisicao.js";

export async function DELETE(_request, { params }) {
  try {
    const { id, idDonatario } = await params;
    const sessao = await exigirUsuario("ong");
    await desvincularDonatario(lerId(id), lerId(idDonatario), sessao.id_usuario);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return responderErro(error);
  }
}