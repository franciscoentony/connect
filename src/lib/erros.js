import { NextResponse } from 'next/server';

export class ErroDeNegocio extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);
    this.status = status;
  }
}

export function responderErro(error) {
  if (error instanceof ErroDeNegocio) {
    return NextResponse.json({ erro: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
}