import { NextResponse } from "next/server";
import { ErroDeNegocio } from "@/lib/erros";

// Ajudantes para receber e devolver fotos (perfil e campanhas).
//
// Como o frontend envia uma foto:
//   const formulario = new FormData();
//   formulario.append("foto", arquivo); // arquivo vem do <input type="file">
//   fetch("/api/v1/perfil/foto", { method: "PUT", body: formulario });

export const TAMANHO_MAXIMO = 2 * 1024 * 1024; // 2 MB

// Os primeiros bytes de cada formato de imagem (a "assinatura" do arquivo).
// Conferimos os bytes em vez de confiar no nome ou no tipo que o navegador
// diz: assim ninguém consegue enviar um HTML ou um script disfarçado de foto.
function descobrirTipo(bytes) {
  const ehJpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (ehJpg) return "image/jpeg";

  const ehPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 && // P
    bytes[2] === 0x4e && // N
    bytes[3] === 0x47; // G
  if (ehPng) return "image/png";

  // WEBP: "RIFF" + 4 bytes de tamanho + "WEBP"
  const texto = bytes.subarray(0, 12).toString("latin1");
  if (texto.startsWith("RIFF") && texto.endsWith("WEBP")) return "image/webp";

  return null;
}

// Lê o campo "foto" de um formulário (multipart/form-data).
// Devolve { conteudo, tipo } ou lança 400/413.
export async function lerFoto(request) {
  // Recusa logo pelo tamanho declarado, antes de ler o arquivo inteiro.
  // (+ 10 KB de folga para o resto do formulário)
  const tamanhoDeclarado = Number(request.headers.get("content-length"));
  if (tamanhoDeclarado > TAMANHO_MAXIMO + 10 * 1024) {
    throw new ErroDeNegocio("a foto deve ter no máximo 2 MB", 413);
  }

  let formulario;
  try {
    formulario = await request.formData();
  } catch {
    throw new ErroDeNegocio("envie a foto como formulário, no campo 'foto'");
  }

  const arquivo = formulario.get("foto");
  // Um campo de texto chega como string; um arquivo chega como File.
  if (!arquivo || typeof arquivo === "string") {
    throw new ErroDeNegocio("envie a foto como formulário, no campo 'foto'");
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    throw new ErroDeNegocio("a foto deve ter no máximo 2 MB", 413);
  }

  const conteudo = Buffer.from(await arquivo.arrayBuffer());
  const tipo = descobrirTipo(conteudo);
  if (!tipo) {
    throw new ErroDeNegocio("a foto deve ser JPG, PNG ou WEBP");
  }
  return { conteudo, tipo };
}

// Responde com os bytes da imagem (em vez de JSON).
export function responderFoto(foto) {
  return new NextResponse(foto.conteudo, {
    headers: {
      "Content-Type": foto.tipo,
      // não deixa o navegador "adivinhar" outro tipo de arquivo
      "X-Content-Type-Options": "nosniff",
      // o navegador guarda a imagem por 1 dia. Quem mostra a foto usa uma URL
      // com ?v=... que muda quando a foto muda, então não fica foto velha.
      "Cache-Control": "private, max-age=86400",
    },
  });
}

// ---------- URLs das fotos ----------
// O frontend usa estas URLs direto no <img src="...">.

// Foto de perfil de quem está logado. O "?v=" muda quando a foto muda, para o
// navegador não mostrar a foto antiga guardada no cache.
export function urlDaFotoDoPerfil(atualizadoEm) {
  return `/api/v1/perfil/foto?v=${new Date(atualizadoEm).getTime()}`;
}

// Foto de perfil de uma ONG, para as páginas públicas.
export function urlDaFotoDaOng(idOng, atualizadoEm) {
  return `/api/v1/ongs/${idOng}/foto?v=${new Date(atualizadoEm).getTime()}`;
}

// Foto de campanha. Ela nunca muda (para trocar, apaga e envia outra),
// então não precisa de "?v=".
export function urlDaFotoDaCampanha(idCampanha, idFoto) {
  return `/api/v1/campanhas/${idCampanha}/fotos/${idFoto}`;
}
