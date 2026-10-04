import { query } from "infra/database.js";
import { ErroDeNegocio } from "@/lib/erros.js";
import { buscarCampanha } from "@/models/campanha.js";

const TIPOS = ["dinheiro", "item"];
const NOVOS_STATUS = ["confirmada", "cancelada"];

const SELECT_DOACAO = `
  SELECT d.id_doacao, d.id_doador, dr.nome AS doador_nome,
         d.id_campanha, c.titulo AS campanha_titulo, c.id_ong,
         d.id_metodo, m.nome AS metodo_nome,
         d.tipo, d.valor, d.descricao, d.data, d.status
  FROM doacao d
  JOIN doador dr ON dr.id_usuario = d.id_doador
  JOIN campanha c ON c.id_campanha = d.id_campanha
  LEFT JOIN metodo_pagamento m ON m.id_metodo = d.id_metodo
`;

// ---------- validação ----------

function validar(dados) {
  const tipo = dados?.tipo;
  if (!TIPOS.includes(tipo)) {
    throw new ErroDeNegocio("tipo deve ser 'dinheiro' ou 'item'");
  }

  if (tipo === "dinheiro") {
    const valor = String(dados?.valor ?? "");
    // rejeita mais de 2 casas decimais em vez de arredondar sem avisar
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(valor) || Number(valor) <= 0) {
      throw new ErroDeNegocio(
        "valor deve ser positivo, com até 2 casas decimais",
      );
    }
    const idMetodo = String(dados?.id_metodo ?? "");
    if (!/^\d{1,18}$/.test(idMetodo)) {
      throw new ErroDeNegocio(
        "id_metodo é obrigatório para doação em dinheiro",
      );
    }
    return { tipo, valor, idMetodo, descricao: null };
  }

  const descricao = String(dados?.descricao ?? "").trim();
  if (descricao.length < 3 || descricao.length > 255) {
    throw new ErroDeNegocio(
      "descrição do item deve ter entre 3 e 255 caracteres",
    );
  }
  return { tipo, valor: null, idMetodo: null, descricao };
}

// ---------- leitura ----------

export async function listarMetodos() {
  const result = await query({
    text: "SELECT id_metodo, nome, tipo FROM metodo_pagamento ORDER BY nome",
  });
  return result.rows;
}

export async function buscarDoacao(id) {
  const result = await query({
    text: `${SELECT_DOACAO} WHERE d.id_doacao = $1`,
    values: [id],
  });
  return result.rows[0] ?? null;
}

// Só o doador dono e a ONG dona enxergam; para os outros é 404.
export async function obterDoacaoVisivel(id, sessao) {
  const doacao = await buscarDoacao(id);
  const visivel =
    doacao &&
    (sessao.id_usuario === doacao.id_doador ||
      sessao.id_usuario === doacao.id_ong);
  if (!visivel) throw new ErroDeNegocio("doação não encontrada", 404);
  return doacao;
}

export async function listarDoacoesDoDoador(idDoador, { limite, pagina }) {
  const result = await query({
    text: `${SELECT_DOACAO}
           WHERE d.id_doador = $1
           ORDER BY d.data DESC, d.id_doacao DESC
           LIMIT $2 OFFSET $3`,
    values: [idDoador, limite, (pagina - 1) * limite],
  });
  return result.rows;
}

export async function listarDoacoesDaCampanha(
  idCampanha,
  idOng,
  { limite, pagina },
) {
  const campanha = await buscarCampanha(idCampanha);
  if (!campanha) throw new ErroDeNegocio("campanha não encontrada", 404);
  if (campanha.id_ong !== idOng) throw new ErroDeNegocio("sem permissão", 403);

  const result = await query({
    text: `${SELECT_DOACAO}
           WHERE d.id_campanha = $1
           ORDER BY d.data DESC, d.id_doacao DESC
           LIMIT $2 OFFSET $3`,
    values: [idCampanha, limite, (pagina - 1) * limite],
  });
  return result.rows;
}

// ---------- escrita ----------

export async function criarDoacao(idDoador, idCampanha, dados) {
  const { tipo, valor, idMetodo, descricao } = validar(dados);

  let result;
  try {
    // A checagem "campanha ativa" faz parte do próprio INSERT: não existe
    // brecha entre verificar e gravar. Os casts são necessários porque o
    // Postgres não infere o tipo de parâmetros dentro de um SELECT.
    result = await query({
      text: `
        INSERT INTO doacao (id_doador, id_campanha, id_metodo, tipo, valor, descricao)
        SELECT $1::bigint, c.id_campanha, $3::bigint, $4::tipo_doacao,
               $5::numeric, $6::text
        FROM campanha c
        WHERE c.id_campanha = $2 AND c.status = 'ativa'
        RETURNING id_doacao`,
      values: [idDoador, idCampanha, idMetodo, tipo, valor, descricao],
    });
  } catch (error) {
    if (
      error.code === "23503" &&
      error.constraint === "doacao_id_metodo_fkey"
    ) {
      throw new ErroDeNegocio("método de pagamento inválido");
    }
    throw error;
  }

  if (result.rowCount === 0) {
    const campanha = await buscarCampanha(idCampanha);
    if (!campanha) throw new ErroDeNegocio("campanha não encontrada", 404);
    throw new ErroDeNegocio("a campanha não está recebendo doações", 409);
  }
  return buscarDoacao(result.rows[0].id_doacao);
}

export async function atualizarStatus(id, sessao, novoStatus) {
  const doacao = await obterDoacaoVisivel(id, sessao);

  if (!NOVOS_STATUS.includes(novoStatus)) {
    throw new ErroDeNegocio("status deve ser 'confirmada' ou 'cancelada'");
  }
  // ONG dona confirma ou cancela; doador dono só cancela
  const permitidos = sessao.tipo === "ong" ? NOVOS_STATUS : ["cancelada"];
  if (!permitidos.includes(novoStatus)) {
    throw new ErroDeNegocio("sem permissão para este status", 403);
  }
  if (doacao.status !== "pendente") {
    throw new ErroDeNegocio(
      `doação ${doacao.status} não pode ser alterada`,
      409,
    );
  }

  const result = await query({
    text: `UPDATE doacao SET status = $1
           WHERE id_doacao = $2 AND status = 'pendente'
           RETURNING id_doacao`,
    values: [novoStatus, id],
  });
  if (result.rowCount === 0) {
    throw new ErroDeNegocio("a doação foi alterada, tente novamente", 409);
  }
  return buscarDoacao(id);
}
