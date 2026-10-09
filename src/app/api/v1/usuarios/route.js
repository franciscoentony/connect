import { NextResponse } from "next/server";
import { criarUsuario } from "@/models/usuarios.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson } from "@/lib/requisicao.js";

// cadastro
export async function POST(request) {
  try {
    const dados = await lerJson(request);
    const usuario = await criarUsuario(dados);
    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    return responderErro(error);
  }
}
