import { NextResponse } from 'next/server';
import { criarUsuario, ErroDeNegocio} from '@/models/usuarios';
import { query } from 'infra/database';

export async function POST(request) {
  let body;
  try{
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 })
  }

  try {
    const usuario = await criarUsuario(body);
    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    if (error instanceof ErroDeNegocio) {
      return NextResponse.json({ erro: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ erro: "erro interno"}, { status: 500 });
  }
}

export async function GET() {
  const result = await query(`SELECT * FROM usuario`);

  return NextResponse.json({
    usuarios: result.rows
  });
}