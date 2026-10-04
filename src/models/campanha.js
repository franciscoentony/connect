import { query } from 'infra/database.js';
import { ErroDeNegocio } from '@/lib/erros.js';

const TRANSICOES = {
  rascunho: ["ativa", "cancelada"],
  ativa: ["encerrada", "cancelada"],
  encerrada: [],
  cancelada: [],
};

const SELECT_CAMPANHA = `
  SELECT c.id_campanha, c.id_ong, o.nome AS ong_nome, c.titulo, c.meta,
         c.status, c.criado_em,
         COALESCE((
           SELECT SUM(d.valor) FROM doacao d
           WHERE d.id_campanha = c.id_campanha
             AND d.status = 'confirmada' AND d.tipo = 'dinheiro'
         ), 0) AS arrecadado
  FROM campanha c
  JOIN ong o ON o.id_usuario = c.id_ong
`;

// ========== VALIDAÇÃO ==========

function validarTitulo(valor) {
  const titulo = String(valor ?? "").trim();
  if (titulo.length < 3 || titulo.length > 150) {
    throw new ErroDeNegocio("título deve ter entre 3 e 150 caracteres");
  }
  return titulo;
}

function validarMeta(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  const meta = Number(valor);
  if (!Number.isFinite(meta) || meta <= 0 || meta > 9999999999.99) {
    throw new ErroDeNegocio("meta deve ser um número positivo");
  }
  return meta.toFixed(2);
}

function validarLocal(dados) {
  const endereco = String(dados?.endereco ?? "").trim();
  const cidade = String(dados?.cidade ?? "").trim();
  if (endereco.length < 5 || endereco.length > 255) {
    throw new ErroDeNegocio("endereço deve ter entre 5 e 255 caracteres");
  }
  if (cidade.length < 2 || cidade.length > 100) {
    throw new ErroDeNegocio("cidade deve ter entre 2 e 100 caracteres");
  }
  return { endereco, cidade };
}

// ========== LEITURA ==========

export async function buscarCampanha(id) {
  const result = await query({
    text: `${SELECT_CAMPANHA} WHERE c.id_campanha = $1`,
    values: [id]
  });
  return result.rows[0] ?? null;
}

export async function listarCampanhas({ idOng, limite, pagina }) {
  const filtro = idOng ? "c.id_ong = $1" : "c.status = 'ativa'";
  const values = idOng ? [idOng] : [];
  values.push(limite, (pagina - 1) * limite);

  const result = await query({
    text: `${SELECT_CAMPANHA}
          WHERE ${filtro}
          ORDER BY c.criado_em DESC, c.id_campanha DESC
          LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  });
  return result.rows;
}

// Rascunho e cancelada só aparecem para a ONG dona; para os outros é 404.
export async function obterCampanhaVisivel(id, sessao) {
  const campanha = await buscarCampanha(id);
  const oculta = campanha && ["rascunho", "cancelada"].includes(campanha.status);
  const dona = campanha && sessao?.id_usuario === campanha.id_ong;
  if (!campanha || (oculta && !dona)) {
    throw new ErroDeNegocio("campanha não encontrada", 404);
  }
  return campanha;
}

export async function obterCampanhaDaOng(id, idOng) {
  const campanha = await buscarCampanha(id);
  if (!campanha) throw new ErroDeNegocio("campanha não encontrada", 404);
  if (campanha.id_ong !== idOng) throw new ErroDeNegocio("sem permissão", 403);
  return campanha;
}

// ========== ESCRITA ==========

export async function criarCampanha(idOng, dados) {
  const titulo = validarTitulo(dados?.titulo);
  const meta = validarMeta(dados?.meta);

  // o status nasce sempre como rascunho, o cliente não escolhe
  const result = await query({
    text: `INSERT INTO campanha (id_ong, titulo, meta)
          VALUES ($1, $2, $3)
          RETURNING id_campanha`,
    values: [idOng, titulo, meta],
  });
  return buscarCampanha(result.rows[0].id_campanha);
}

export async function atualizarCampanha(id, idOng, dados) {
  const atual = await obterCampanhaDaOng(id, idOng);

  if(TRANSICOES[atual.status].length === 0) {
    throw new ErroDeNegocio(`campanha ${atual.status} não pode ser alterada`, 409);
  }

  const sets = [];
  const values = [];
  const add = (coluna, valor) => {
    values.push(valor);
    sets.push(`${coluna} = $${values.length}`);
  };

  if (dados?.titulo !== undefined) add("titulo", validarTitulo(dados.titulo));
  if (dados?.meta !== undefined) add("meta", validarMeta(dados.meta));
  if (dados?.status !== undefined) {
    if (!TRANSICOES[atual.status].includes(dados.status)) {
      throw new ErroDeNegocio(
        `não é possível passar de '${atual.status}' para '${dados.status}'`,
        409
      );
    }
    add("status", dados.status)
  }
  if (sets.length === 0) throw new ErroDeNegocio("Nenhum campo para atualizar");

  values.push(id, atual.status);
  const result = await query({
    text: `UPDATE campanha SET ${sets.join(", ")}
          WHERE id_campanha = $${values.length - 1} AND status = $${values.length}
          RETURNING id_campanha`,
    values,
  });
  // o "AND status" protege contra duas requisições mudando o status ao mesmo tempo
  if (result.rowCount === 0) {
    throw new ErroDeNegocio("a campanha foi alterada, tente novamente", 409);
  }
  return buscarCampanha(id);
}

// ========== LOCAIS DE ENTREGA ==========

export async function listarLocais(idCampanha) {
  const result = await query({
    text: `SELECT id_local, endereco, cidade
          FROM local_entrega WHERE id_campanha = $1 ORDER BY id_local`,
    values: [idCampanha],
  });
  return result.rows;
}

export async function criarLocal(idCampanha, idOng, dados) {
  const { endereco, cidade } = validarLocal(dados);
  const campanha = await obterCampanhaDaOng(idCampanha, idOng);
  if (["encerrada", "cancelada"].includes(campanha.status)) {
    throw new ErroDeNegocio(`campanha ${campanha.status} não aceita novos locais`, 409);
  }
  const result = await query({
    text: `INSERT INTO local_entrega (id_campanha, endereco, cidade)
           VALUES ($1, $2, $3)
           RETURNING id_local, endereco, cidade`,
    values: [idCampanha, endereco, cidade],
  });
  return result.rows[0];
}

export async function removerLocal(idCampanha, idLocal, idOng) {
  await obterCampanhaDaOng(idCampanha, idOng);
  const result = await query({
    text: `DELETE FROM local_entrega
           WHERE id_local = $1 AND id_campanha = $2
           RETURNING id_local`,
    values: [idLocal, idCampanha],
  });
  if (result.rowCount === 0) {
    throw new ErroDeNegocio("local não encontrado", 404);
  }
}