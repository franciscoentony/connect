import { NextResponse } from "next/server";
import { criarDonatario, listarDonatarios } from "@/models/donatario.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerPaginacao } from "@/lib/requisicao.js";

export async function GET(request) {
  try {
    const sessao = await exigirUsuario("ong");
    return NextResponse.json(
      await listarDonatarios(sessao.id_usuario, lerPaginacao(request)),
    );
  } catch (error) {
    return responderErro(error);
  }
}

export async function POST(request) {
  try {
    const sessao = await exigirUsuario("ong");
    const donatario = await criarDonatario(
      sessao.id_usuario,
      await lerJson(request),
    );
    return NextResponse.json(donatario, { status: 201 });
  } catch (error) {
    return responderErro(error);
  }
}
