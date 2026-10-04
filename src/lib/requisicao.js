import { ErroDeNegocio } from '@/lib/erros'

export async function lerJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ErroDeNegocio("JSON inválido");
  }
}