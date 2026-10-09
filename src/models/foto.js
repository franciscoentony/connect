import { query } from "infra/database.js";
import { ErroDeNegocio } from "@/lib/erros.js";
import { urlDaFotoDaCampanha } from "@/lib/imagem.js";
import {
  obterCampanhaDaOng,
  obterCampanhaVisivel,
  campanhaFinalizada,
} from "@/models/campanha.js";

// Fotos de perfil (uma por usuário) e fotos de campanha (galeria).
// A validação do arquivo (tamanho e formato) fica em lib/imagem.js.

// Quantas fotos cada campanha pode ter.
export const MAXIMO_DE_FOTOS_POR_CAMPANHA = 8;

// ---------- foto de perfil ----------

// Cria ou troca a foto do usuário.
// "ON CONFLICT" = se o usuário já tem foto, atualiza em vez de dar erro.
export async function salvarFotoDoPerfil(idUsuario, foto) {
  await query(
    `INSERT INTO foto_usuario (id_usuario, conteudo, tipo)
     VALUES ($1, $2, $3)
     ON CONFLICT (id_usuario)
     DO UPDATE SET conteudo = EXCLUDED.conteudo,
                   tipo = EXCLUDED.tipo,
                   atualizado_em = now()`,
    [idUsuario, foto.conteudo, foto.tipo],
  );
}

export async function removerFotoDoPerfil(idUsuario) {
  const result = await query("DELETE FROM foto_usuario WHERE id_usuario = $1", [
    idUsuario,
  ]);
  if (result.rowCount === 0) {
    throw new ErroDeNegocio("foto não encontrada", 404);
  }
}

export async function buscarFotoDoPerfil(idUsuario) {
  const result = await query(
    "SELECT conteudo, tipo FROM foto_usuario WHERE id_usuario = $1",
    [idUsuario],
  );
  if (result.rows.length === 0) {
    throw new ErroDeNegocio("foto não encontrada", 404);
  }
  return result.rows[0];
}

// Foto pública de uma ONG. O JOIN com a tabela ong garante que a foto de um
// doador nunca seja exposta por esta rota.
export async function buscarFotoDaOng(idOng) {
  const result = await query(
    `SELECT foto_usuario.conteudo, foto_usuario.tipo
     FROM foto_usuario
     JOIN ong ON ong.id_usuario = foto_usuario.id_usuario
     WHERE foto_usuario.id_usuario = $1`,
    [idOng],
  );
  if (result.rows.length === 0) {
    throw new ErroDeNegocio("foto não encontrada", 404);
  }
  return result.rows[0];
}

// ---------- fotos da campanha ----------

// Lista as fotos (sem os bytes). A primeira enviada é a capa.
export async function listarFotosDaCampanha(idCampanha) {
  const result = await query(
    `SELECT id_foto, criado_em FROM foto_campanha
     WHERE id_campanha = $1
     ORDER BY id_foto`,
    [idCampanha],
  );
  return result.rows.map((foto) => {
    return {
      id_foto: foto.id_foto,
      url: urlDaFotoDaCampanha(idCampanha, foto.id_foto),
      criado_em: foto.criado_em,
    };
  });
}

export async function adicionarFotoNaCampanha(idCampanha, idOng, foto) {
  const campanha = await obterCampanhaDaOng(idCampanha, idOng);
  if (campanhaFinalizada(campanha)) {
    throw new ErroDeNegocio(
      `campanha ${campanha.status} não aceita novas fotos`,
      409,
    );
  }

  const contagem = await query(
    "SELECT COUNT(*) AS total FROM foto_campanha WHERE id_campanha = $1",
    [idCampanha],
  );
  if (Number(contagem.rows[0].total) >= MAXIMO_DE_FOTOS_POR_CAMPANHA) {
    throw new ErroDeNegocio(
      `a campanha já tem ${MAXIMO_DE_FOTOS_POR_CAMPANHA} fotos; apague uma antes`,
      409,
    );
  }

  const result = await query(
    `INSERT INTO foto_campanha (id_campanha, conteudo, tipo)
     VALUES ($1, $2, $3)
     RETURNING id_foto, criado_em`,
    [idCampanha, foto.conteudo, foto.tipo],
  );
  const nova = result.rows[0];
  return {
    id_foto: nova.id_foto,
    url: urlDaFotoDaCampanha(idCampanha, nova.id_foto),
    criado_em: nova.criado_em,
  };
}

// Devolve a imagem respeitando quem pode ver a campanha
// (rascunho e cancelada: só a ONG dona; veja obterCampanhaVisivel).
export async function buscarFotoDaCampanha(idCampanha, idFoto, sessao) {
  await obterCampanhaVisivel(idCampanha, sessao);

  const result = await query(
    `SELECT conteudo, tipo FROM foto_campanha
     WHERE id_foto = $1 AND id_campanha = $2`,
    [idFoto, idCampanha],
  );
  if (result.rows.length === 0) {
    throw new ErroDeNegocio("foto não encontrada", 404);
  }
  return result.rows[0];
}

export async function removerFotoDaCampanha(idCampanha, idFoto, idOng) {
  await obterCampanhaDaOng(idCampanha, idOng);

  const result = await query(
    "DELETE FROM foto_campanha WHERE id_foto = $1 AND id_campanha = $2",
    [idFoto, idCampanha],
  );
  if (result.rowCount === 0) {
    throw new ErroDeNegocio("foto não encontrada", 404);
  }
}
