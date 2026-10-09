import { NextResponse } from "next/server";
import { verificarToken } from "@/lib/sessao";

const TELAS_DE_AUTENTICACAO = ["/entrar", "/criar-conta"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("sessao")?.value;
  const sessao = token ? await verificarToken(token) : null;

  if (pathname.startsWith("/dashboard")) {
    if (!sessao) {
      return NextResponse.redirect(new URL("/entrar", request.url));
    }
    if (sessao.tipo !== "ong") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (sessao && TELAS_DE_AUTENTICACAO.includes(pathname)) {
    const destino = sessao.tipo === "ong" ? "/dashboard" : "/";
    return NextResponse.redirect(new URL(destino, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/entrar", "/criar-conta", "/dashboard/:path*"],
};
