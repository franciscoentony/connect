import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ErroDeNegocio } from "@/lib/erros.js";

const NOME_COOKIE = "sessao";
const DURACAO_SEGUNDOS = 60 * 60 * 24 * 7; // 7 Dias

function chave() {
  const segredo = process.env.JWT_SECRET;
  if (!segredo || segredo.length < 32) {
    throw new Error("JWT_TOKEN está ausente ou curto demais");
  }
  return new TextEncoder().encode(segredo);
}

export async function iniciarSessao(usuario) {
  const token = await new SignJWT({ tipo: usuario.tipo })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(usuario.id_usuario))
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SEGUNDOS}s`)
    .sign(chave());

  const jar = await cookies();
  jar.set(NOME_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SEGUNDOS,
  });
}

export async function encerrarSessao() {
  const jar = await cookies();
  jar.delete(NOME_COOKIE);
}

export async function lerSessao() {
  const jar = await cookies();
  const token = jar.get(NOME_COOKIE)?.value;
  if (!token) return null;

  const k = chave();
  try {
    const { payload } = await jwtVerify(token, k, { algorithms: ["HS256"] });
    return { id_usuario: payload.sub, tipo: payload.tipo };
  } catch {
    return null; // token inválido ou expirado
  }
}

// usando rotas protegidas
export async function exigirUsuario(tipo) {
  const sessao = await lerSessao();
  if (!sessao) throw new ErroDeNegocio("não autenticado", 401);
  if (tipo && sessao.tipo !== tipo)
    throw new ErroDeNegocio("sem permissão", 403);
  return sessao;
}
