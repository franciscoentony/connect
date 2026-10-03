import { NextResponse } from 'next/server';
import { getApiDocs } from '@/lib/swagger'; // Ajuste o caminho se seu arquivo swagger.js estiver em outro lugar

export async function GET() {
  try {
    const spec = await getApiDocs();
    return NextResponse.json(spec);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao gerar documentação' }, { status: 500 });
  }
}