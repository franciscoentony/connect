import { NextResponse } from "next/server";
import {
  obterDonatarioDaOng,
  atualizarDonatario,
  removerDonatario,
} from "@/models/donatario.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerId } from "@/lib/requisicao.js";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const idDonatario = lerId(id);
    const sessao = await exigirUsuario("ong");
    const donatario = await obterDonatarioDaOng(idDonatario, sessao.id_usuario);
    return NextResponse.json(donatario);
  } catch (error) {
    return responderErro(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const idDonatario = lerId(id);
    const sessao = await exigirUsuario("ong");
    const dados = await lerJson(request);
    const donatario = await atualizarDonatario(
      idDonatario,
      sessao.id_usuario,
      dados,
    );
    return NextResponse.json(donatario);
  } catch (error) {
    return responderErro(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const idDonatario = lerId(id);
    const sessao = await exigirUsuario("ong");
    await removerDonatario(idDonatario, sessao.id_usuario);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return responderErro(error);
  }
}
