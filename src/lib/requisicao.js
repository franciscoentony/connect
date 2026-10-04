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