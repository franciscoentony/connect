import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ErroDeNegocio } from "@/lib/erros.js";

// Como funciona o login:
// 1. Depois de conferir a senha, criamos um "token" (JWT) com o id e o tipo
//    do usuário, assinado com o JWT_SECRET do .env.
// 2. O token vai para o navegador num cookie chamado "sessao".
// 3. A cada requisição, lemos o cookie e conferimos a assinatura. Se alguém
//    alterar o token, a assinatura não bate e a sessão é recusada.

const NOME_COOKIE = "sessao";
const SETE_DIAS_EM_SEGUNDOS = 60 * 60 * 24 * 7;

function chaveSecreta() {
  const segredo = process.env.JWT_SECRET;
  if (!segredo || segredo.length < 32) {
    throw new Error(
      "JWT_SECRET está ausente ou curto demais (mínimo 32 caracteres)",
    );
  }
  return new TextEncoder().encode(segredo);
}

export async function iniciarSessao(usuario) {
  // Cada linha encadeada adiciona uma informação ao token:
  const token = await new SignJWT({ tipo: usuario.tipo }) // dado extra: o tipo
    .setProtectedHeader({ alg: "HS256" }) // algoritmo de assinatura
    .setSubject(String(usuario.id_usuario)) // "dono" do token: o id
    .setIssuedAt() // quando foi criado
    .setExpirationTime(`${SETE_DIAS_EM_SEGUNDOS}s`) // quando expira
    .sign(chaveSecreta()); // assina

  const cookiesDaResposta = await cookies();
  cookiesDaResposta.set(NOME_COOKIE, token, {
    httpOnly: true, // o JavaScript do navegador não consegue ler o cookie
    sameSite: "lax", // não é enviado em requisições vindas de outros sites
    secure: process.env.NODE_ENV === "production", // só HTTPS em produção
    path: "/",
    maxAge: SETE_DIAS_EM_SEGUNDOS,
  });
}

export async function encerrarSessao() {
  const cookiesDaResposta = await cookies();
  cookiesDaResposta.delete(NOME_COOKIE);
}

// Devolve { id_usuario, tipo } de quem está logado, ou null.
export async function lerSessao() {
  const cookiesDaRequisicao = await cookies();
  const cookie = cookiesDaRequisicao.get(NOME_COOKIE);
  if (!cookie) {
    return null;
  }

  const chave = chaveSecreta();
  try {
    const { payload } = await jwtVerify(cookie.value, chave, {
      algorithms: ["HS256"],
    });
    return { id_usuario: payload.sub, tipo: payload.tipo };
  } catch {
    return null; // token inválido ou expirado
  }
}

// Use nas rotas que exigem login:
//   const sessao = await exigirUsuario();      // qualquer usuário logado
//   const sessao = await exigirUsuario("ong"); // só ONG (401 se não logado, 403 se for doador)
//
// Para uma ONG, sessao.id_usuario também é o id da ONG (a tabela ong usa
// id_usuario como chave primária).
export async function exigirUsuario(tipoExigido) {
  const sessao = await lerSessao();
  if (!sessao) {
    throw new ErroDeNegocio("não autenticado", 401);
  }
  if (tipoExigido && sessao.tipo !== tipoExigido) {
    throw new ErroDeNegocio("sem permissão", 403);
  }
  return sessao;
}
