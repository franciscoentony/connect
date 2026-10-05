import { ErroDeNegocio } from "@/lib/erros";

// Lê o corpo da requisição como JSON.
// Se o cliente mandar algo que não é JSON, responde 400 em vez de 500.
export async function lerJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ErroDeNegocio("JSON inválido");
  }
}

// Diz se o texto é um id válido: só dígitos, de 1 a 18.
// (18 dígitos é o máximo que cabe numa coluna BIGINT do Postgres.)
export function ehIdValido(texto) {
  return /^\d{1,18}$/.test(texto);
}

// Lê o id que vem na URL (ex.: /campanhas/12).
// Um id inválido, como "abc", é tratado como "não existe" (404).
export function lerId(valor) {
  const texto = String(valor ?? "");
  if (!ehIdValido(texto)) {
    throw new ErroDeNegocio("recurso não encontrado", 404);
  }
  return texto;
}

// Lê ?pagina=2&limite=10 da URL.
// Padrão: página 1, 20 itens. O limite fica entre 1 e 50.
export function lerPaginacao(request) {
  const params = request.nextUrl.searchParams;

  let limite = parseInt(params.get("limite"));
  if (!limite) limite = 20; // ausente ou não é número
  if (limite < 1) limite = 1;
  if (limite > 50) limite = 50;

  let pagina = parseInt(params.get("pagina"));
  if (!pagina || pagina < 1) pagina = 1;

  return { limite, pagina };
}
