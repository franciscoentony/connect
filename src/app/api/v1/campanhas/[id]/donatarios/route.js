import { NextResponse } from "next/server";
import {
  listarDonatariosDaCampanha,
  vincularDonatario,
} from "@/models/donatario.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerId, lerPaginacao } from "@/lib/requisicao.js";

export async function GET(request, { params }) {
  try {
    const id = lerId((await params).id);
    const sessao = await exigirUsuario("ong");
    const lista = await listarDonatariosDaCampanha(
      id,
      sessao.id_usuario,
      lerPaginacao(request),
    );
    return NextResponse.json(lista);
  } catch (error) {
    return responderErro(error);
  }
}

export async function POST(request, { params }) {
  try {
    const id = lerId((await params).id);
    const sessao = await exigirUsuario("ong");
    const donatario = await vincularDonatario(
      id,
      sessao.id_usuario,
      await lerJson(request),
    );
    return NextResponse.json(donatario, { status: 201 });
  } catch (error) {
    return responderErro(error);
  }
}
