import { NextResponse } from "next/server";
import {
  listarDonatariosDaCampanha,
  vincularDonatario,
} from "@/models/donatario.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson, lerId, lerPaginacao } from "@/lib/requisicao.js";

// donatários vinculados à campanha
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const idCampanha = lerId(id);
    const sessao = await exigirUsuario("ong");
    const paginacao = lerPaginacao(request);
    const donatarios = await listarDonatariosDaCampanha(
      idCampanha,
      sessao.id_usuario,
      paginacao,
    );
    return NextResponse.json(donatarios);
  } catch (error) {
    return responderErro(error);
  }
}

// vincula: { "id_donatario": 5 }
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const idCampanha = lerId(id);
    const sessao = await exigirUsuario("ong");
    const dados = await lerJson(request);
    const donatario = await vincularDonatario(
      idCampanha,
      sessao.id_usuario,
      dados,
    );
    return NextResponse.json(donatario, { status: 201 });
  } catch (error) {
    return responderErro(error);
  }
}
