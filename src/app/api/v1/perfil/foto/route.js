import { NextResponse } from "next/server";
import {
  buscarFotoDoPerfil,
  salvarFotoDoPerfil,
  removerFotoDoPerfil,
} from "@/models/foto.js";
import { buscarUsuarioPorId } from "@/models/usuarios.js";
import { exigirUsuario } from "@/lib/sessao.js";
import { responderErro } from "@/lib/erros.js";
import { lerFoto, responderFoto } from "@/lib/imagem.js";

// Foto de perfil do usuário logado (ONG ou doador).
// A URL pronta vem em "foto_url" no GET /api/v1/sessao.

// Devolve a imagem (não é JSON).
export async function GET() {
  try {
    const sessao = await exigirUsuario();
    const foto = await buscarFotoDoPerfil(sessao.id_usuario);
    return responderFoto(foto);
  } catch (error) {
    return responderErro(error);
  }
}

// Envia ou troca a foto. Corpo: formulário (multipart) com o campo "foto".
// Responde com o usuário atualizado (com a nova "foto_url").
export async function PUT(request) {
  try {
    const sessao = await exigirUsuario();
    const foto = await lerFoto(request);
    await salvarFotoDoPerfil(sessao.id_usuario, foto);
    const usuario = await buscarUsuarioPorId(sessao.id_usuario);
    return NextResponse.json(usuario);
  } catch (error) {
    return responderErro(error);
  }
}

export async function DELETE() {
  try {
    const sessao = await exigirUsuario();
    await removerFotoDoPerfil(sessao.id_usuario);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return responderErro(error);
  }
}
