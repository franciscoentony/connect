import { buscarFotoDaOng } from "@/models/foto.js";
import { responderErro } from "@/lib/erros.js";
import { lerId } from "@/lib/requisicao.js";
import { responderFoto } from "@/lib/imagem.js";

// Foto de perfil pública de uma ONG (devolve a imagem, não JSON).
// A URL pronta vem em "foto_url" no GET /api/v1/ongs/{id}.
export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const idOng = lerId(id);
    const foto = await buscarFotoDaOng(idOng);
    return responderFoto(foto);
  } catch (error) {
    return responderErro(error);
  }
}
