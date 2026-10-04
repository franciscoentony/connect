import { NextResponse } from 'next/server';
import { criarUsuario} from '@/models/usuarios.js';
import { ErroDeNegocio, responderErro } from '@/lib/erros.js';
import { query } from 'infra/database.js';
import { lerJson } from '@/lib/requisicao.js'

export async function POST(request) {
  try {
    const body = await lerJson(request);
    const usuario = await criarUsuario(body);
    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    return responderErro(error);
  }
}

export async function GET() {
  const result = await query(`SELECT * FROM usuario`);

  return NextResponse.json({
    usuarios: result.rows
  });
}