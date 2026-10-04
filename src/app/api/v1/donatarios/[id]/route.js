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
    const id = lerId((await params).id);
    const sessao = await exigirUsuario("ong");
    return NextResponse.json(await obterDonatarioDaOng(id, sessao.id_usuario));
  } catch (error) {
    return responderErro(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const id = lerId((await params).id);
    const sessao = await exigirUsuario("ong");
    const donatario = await atualizarDonatario(id, sessao.id_usuario, await lerJson(request));
    return NextResponse.json(donatario);
  } catch (error) {
    return responderErro(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const id = lerId((await params).id);
    const sessao = await exigirUsuario("ong");
    await removerDonatario(id, sessao.id_usuario);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return responderErro(error);
  }
}