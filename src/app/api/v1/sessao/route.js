import { NextResponse } from "next/server";
import { autenticar, buscarUsuarioPorId } from "@/models/usuarios.js";
import { iniciarSessao, encerrarSessao, exigirUsuario } from "@/lib/sessao.js";
import { responderErro, ErroDeNegocio } from "@/lib/erros.js";
import { lerJson } from "@/lib/requisicao.js";

// login
export async function POST(request) {
  try {
    const usuario = await autenticar(await lerJson(request));
    await iniciarSessao(usuario);
    return NextResponse.json(usuario);
  } catch (error) {
    return responderErro(error);
  }
}

// quem sou eu
export async function GET() {
  try {
    const sessao = await exigirUsuario();
    const usuario = await buscarUsuarioPorId(sessao.id_usuario)
    if (!usuario) throw new ErroDeNegocio("não autenticado", 401);
    return NextResponse.json(usuario);
  } catch (error) {
    return responderErro(error);
  }
}

// logout
export async function DELETE() {
  await encerrarSessao();
  return new NextResponse(null, { status: 204 });
}

// ========= COMO USAR NA PRÓXIMA VEZ =========

// const sessao = await exigirUsuario("ong"); // 401 se não logado, 403 se não for ONG

// ========= sessao.id_usuario já é o id_ong, porque ong.id_usuario é a chave primária =========

