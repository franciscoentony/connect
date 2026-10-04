import { ErroDeNegocio } from '@/lib/erros'

export async function lerJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ErroDeNegocio("JSON inválido");
  }
}

export function lerId(valor) {
  const texto = String(valor ?? "");
  if (!/^\d{1,18}$/.test(texto)) {
    throw new ErroDeNegocio("recurso não encontrado", 404);
  }
  return texto;
}

export function lerPaginacao(request) {
  const params = request.nextUrl.searchParams;
  const limite = Math.min(Math.max(parseInt(params.get("limite")) || 20, 1), 50);
  const pagina = Math.max(parseInt(params.get("pagina")) || 1, 1);
  return { limite, pagina };
}