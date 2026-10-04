import { NextResponse } from "next/server";

// Erro "esperado": algo que o usuário fez de errado (dado inválido, sem
// permissão, recurso inexistente...). Carrega o status HTTP da resposta.
//
// Uso: throw new ErroDeNegocio("campanha não encontrada", 404);
// Sem status, vale 400 (Bad Request).
export class ErroDeNegocio extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);
    this.status = status;
  }
}

// Usado no catch de todas as rotas. Transforma o erro numa resposta:
// - ErroDeNegocio: devolve a mensagem e o status dele;
// - qualquer outro erro (bug, banco fora do ar...): registra no terminal e
//   devolve 500 sem detalhes, para não expor informações internas.
export function responderErro(error) {
  if (error instanceof ErroDeNegocio) {
    return NextResponse.json({ erro: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
}
