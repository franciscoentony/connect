import { NextResponse } from "next/server";
import { atualizarPerfil } from "@/models/usuarios.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerJson } from "@/lib/requisicao.js";

// Altera o perfil do usuário logado: nome (todos) e, para ONG, também
// descrição, site e contato. Os campos não enviados continuam iguais.
// Para ler o perfil, use GET /api/v1/sessao.
export async function PATCH(request) {
  try {
    const sessao = await exigirUsuario();
    const dados = await lerJson(request);
    const usuario = await atualizarPerfil(sessao, dados);
    return NextResponse.json(usuario);
  } catch (error) {
    return responderErro(error);
  }
}
