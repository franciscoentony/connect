import { NextResponse } from "next/server";
import { buscarOngPublica } from "@/models/usuarios.js";
import { responderErro } from "@/lib/erros.js";
import { lerId } from "@/lib/requisicao.js";

// Página pública da ONG. As campanhas dela ficam em GET /api/v1/campanhas?ong={id}.
export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const idOng = lerId(id);
    const ong = await buscarOngPublica(idOng);
    return NextResponse.json(ong);
  } catch (error) {
    return responderErro(error);
  }
}
