import { query } from "infra/database.js";
import { ErroDeNegocio } from "@/lib/erros.js";
import { ehIdValido, respostaPaginada } from "@/lib/requisicao.js";
import {
  buscarCampanha,
  obterCampanhaDaOng,
  campanhaTerminou,
} from "@/models/campanha.js";

// Código de erro do Postgres para "chave estrangeira aponta para algo que
// não existe" (ex.: id_metodo de um método de pagamento inexistente).
const ERRO_CHAVE_ESTRANGEIRA = "23503";

// SELECT usado por todas as buscas de doação.
// Junta dados de outras tabelas para a resposta ficar completa:
// - doador: o nome de quem doou;
// - campanha: o título e a ONG dona;
// - metodo_pagamento: o nome do método. É LEFT JOIN porque doação de
//   item não tem método; com JOIN comum, essas doações sumiriam do resultado.
const SELECT_DOACAO = `
  SELECT doacao.id_doacao, doacao.id_doador, doador.nome AS doador_nome,
         doacao.id_campanha, campanha.titulo AS campanha_titulo, campanha.id_ong,
         doacao.id_metodo, metodo_pagamento.nome AS metodo_nome,
         doacao.tipo, doacao.valor, doacao.descricao, doacao.data, doacao.status
  FROM doacao
  JOIN doador ON doador.id_usuario = doacao.id_doador
  JOIN campanha ON campanha.id_campanha = doacao.id_campanha
  LEFT JOIN metodo_pagamento ON metodo_pagamento.id_metodo = doacao.id_metodo
`;

// ---------- validação ----------

// Doação em dinheiro precisa de valor e método de pagamento.
// Doação de item precisa de uma descrição (ex.: "10 kg de arroz").
function validar(dados) {
  const tipo = dados?.tipo;

  if (tipo === "dinheiro") {
    const valor = String(dados?.valor ?? "");
    // Aceita "50", "50.5" ou "50.25". Recusa mais de 2 casas decimais
    // em vez de arredondar sem avisar.
    const formatoDeValor = /^\d{1,10}(\.\d{1,2})?$/;
    if (!formatoDeValor.test(valor) || Number(valor) <= 0) {
      throw new ErroDeNegocio(
        "valor deve ser positivo, com até 2 casas decimais",
      );
    }

    const idMetodo = String(dados?.id_metodo ?? "");
    if (!ehIdValido(idMetodo)) {
      throw new ErroDeNegocio(
        "id_metodo é obrigatório para doação em dinheiro",
      );
    }

    return { tipo, valor, idMetodo, descricao: null };
  }

  if (tipo === "item") {
    const descricao = String(dados?.descricao ?? "").trim();
    if (descricao.length < 3 || descricao.length > 255) {
      throw new ErroDeNegocio(
        "descrição do item deve ter entre 3 e 255 caracteres",
      );
    }
    return { tipo, valor: null, idMetodo: null, descricao };
  }

  throw new ErroDeNegocio("tipo deve ser 'dinheiro' ou 'item'");
}

// ---------- leitura ----------

export async function listarMetodos() {
  const result = await query(
    "SELECT id_metodo, nome, tipo FROM metodo_pagamento ORDER BY nome",
  );
  return result.rows;
}

export async function buscarDoacao(id) {
  const result = await query(`${SELECT_DOACAO} WHERE doacao.id_doacao = $1`, [
    id,
  ]);
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
}

// Só o doador que doou e a ONG dona da campanha podem ver a doação.
// Para os outros, finge que não existe (404).
export async function obterDoacaoVisivel(id, sessao) {
  const doacao = await buscarDoacao(id);
  if (!doacao) {
    throw new ErroDeNegocio("doação não encontrada", 404);
  }

  const ehODoador = sessao.id_usuario === doacao.id_doador;
  const ehAOng = sessao.id_usuario === doacao.id_ong;
  if (!ehODoador && !ehAOng) {
    throw new ErroDeNegocio("doação não encontrada", 404);
  }
  return doacao;
}

export async function listarDoacoesDoDoador(idDoador, { limite, pagina }) {
  const contagem = await query(
    "SELECT COUNT(*) AS total FROM doacao WHERE id_doador = $1",
    [idDoador],
  );
  const total = Number(contagem.rows[0].total);

  const result = await query(
    `${SELECT_DOACAO}
     WHERE doacao.id_doador = $1
     ORDER BY doacao.data DESC, doacao.id_doacao DESC
     LIMIT $2 OFFSET $3`,
    [idDoador, limite, (pagina - 1) * limite],
  );
  return respostaPaginada(result.rows, total, { limite, pagina });
}

// ---------- página "Minhas doações" do doador ----------

// Doações do doador que ainda esperam a ONG confirmar (as mais novas primeiro).
// Sem paginação: são poucas por vez, e o doador precisa ver todas.
export async function listarPendentesDoDoador(idDoador) {
  const result = await query(
    `${SELECT_DOACAO}
     WHERE doacao.id_doador = $1 AND doacao.status = 'pendente'
     ORDER BY doacao.data DESC, doacao.id_doacao DESC
     LIMIT 50`,
    [idDoador],
  );
  return result.rows;
}

// Histórico do doador: doações já resolvidas (confirmadas ou canceladas).
export async function listarHistoricoDoDoador(idDoador, { limite, pagina }) {
  const contagem = await query(
    `SELECT COUNT(*) AS total FROM doacao
     WHERE id_doador = $1 AND status <> 'pendente'`,
    [idDoador],
  );
  const total = Number(contagem.rows[0].total);

  const result = await query(
    `${SELECT_DOACAO}
     WHERE doacao.id_doador = $1 AND doacao.status <> 'pendente'
     ORDER BY doacao.data DESC, doacao.id_doacao DESC
     LIMIT $2 OFFSET $3`,
    [idDoador, limite, (pagina - 1) * limite],
  );
  return respostaPaginada(result.rows, total, { limite, pagina });
}

// Números do topo de "Minhas doações":
// - quanto o doador já doou em dinheiro com confirmação da ONG;
// - quantas doações foram confirmadas e quantas esperam a ONG.
// O FILTER conta/soma só as linhas que passam na condição.
export async function resumoDoDoador(idDoador) {
  const result = await query(
    `SELECT
       COALESCE(SUM(valor) FILTER (
         WHERE status = 'confirmada' AND tipo = 'dinheiro'
       ), 0) AS confirmado_em_dinheiro,
       COUNT(*) FILTER (WHERE status = 'confirmada') AS confirmadas,
       COUNT(*) FILTER (WHERE status = 'pendente') AS pendentes
     FROM doacao
     WHERE id_doador = $1`,
    [idDoador],
  );
  const linha = result.rows[0];
  return {
    confirmadoEmDinheiro: Number(linha.confirmado_em_dinheiro),
    confirmadas: Number(linha.confirmadas),
    pendentes: Number(linha.pendentes),
  };
}

export async function listarDoacoesDaCampanha(
  idCampanha,
  idOng,
  { limite, pagina },
) {
  await obterCampanhaDaOng(idCampanha, idOng); // 404 ou 403 se não for da ONG

  const contagem = await query(
    "SELECT COUNT(*) AS total FROM doacao WHERE id_campanha = $1",
    [idCampanha],
  );
  const total = Number(contagem.rows[0].total);

  const result = await query(
    `${SELECT_DOACAO}
     WHERE doacao.id_campanha = $1
     ORDER BY doacao.data DESC, doacao.id_doacao DESC
     LIMIT $2 OFFSET $3`,
    [idCampanha, limite, (pagina - 1) * limite],
  );
  return respostaPaginada(result.rows, total, { limite, pagina });
}

// Doações que esperam a ONG confirmar, de todas as campanhas dela.
// As mais antigas vêm primeiro: quem doou há mais tempo espera há mais tempo.
// Usado no dashboard ("Precisa da sua atenção").
export async function listarDoacoesPendentesDaOng(idOng, limite) {
  const result = await query(
    `${SELECT_DOACAO}
     WHERE campanha.id_ong = $1 AND doacao.status = 'pendente'
     ORDER BY doacao.data ASC, doacao.id_doacao ASC
     LIMIT $2`,
    [idOng, limite],
  );
  return result.rows;
}

// Quantas doações da campanha a ONG já confirmou (dinheiro ou item).
// Mostrado na página pública como sinal de confiança.
export async function contarDoacoesConfirmadas(idCampanha) {
  const result = await query(
    `SELECT COUNT(*) AS total FROM doacao
     WHERE id_campanha = $1 AND status = 'confirmada'`,
    [idCampanha],
  );
  return Number(result.rows[0].total);
}

// ---------- escrita ----------

export async function criarDoacao(idDoador, idCampanha, dados) {
  const { tipo, valor, idMetodo, descricao } = validar(dados);

  const campanha = await buscarCampanha(idCampanha);
  if (!campanha) {
    throw new ErroDeNegocio("campanha não encontrada", 404);
  }
  if (campanha.status !== "ativa") {
    throw new ErroDeNegocio("a campanha não está recebendo doações", 409);
  }
  if (campanhaTerminou(campanha)) {
    throw new ErroDeNegocio("o prazo desta campanha já terminou", 409);
  }

  try {
    const result = await query(
      `INSERT INTO doacao (id_doador, id_campanha, id_metodo, tipo, valor, descricao)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id_doacao`,
      [idDoador, idCampanha, idMetodo, tipo, valor, descricao],
    );
    return buscarDoacao(result.rows[0].id_doacao);
  } catch (error) {
    if (
      error.code === ERRO_CHAVE_ESTRANGEIRA &&
      error.constraint === "doacao_id_metodo_fkey"
    ) {
      throw new ErroDeNegocio("método de pagamento inválido");
    }
    throw error;
  }
}

// Doações nascem "pendente" e podem virar "confirmada" ou "cancelada":
// - a ONG dona pode confirmar ou cancelar;
// - o doador só pode cancelar.
export async function atualizarStatus(id, sessao, novoStatus) {
  const doacao = await obterDoacaoVisivel(id, sessao);

  if (novoStatus !== "confirmada" && novoStatus !== "cancelada") {
    throw new ErroDeNegocio("status deve ser 'confirmada' ou 'cancelada'");
  }
  if (sessao.tipo === "doador" && novoStatus === "confirmada") {
    throw new ErroDeNegocio("sem permissão para este status", 403);
  }
  if (doacao.status !== "pendente") {
    throw new ErroDeNegocio(
      `doação ${doacao.status} não pode ser alterada`,
      409,
    );
  }

  // O "AND status = 'pendente'" evita que duas requisições ao mesmo tempo
  // mudem a mesma doação: só a primeira encontra a doação pendente.
  const result = await query(
    `UPDATE doacao SET status = $1
     WHERE id_doacao = $2 AND status = 'pendente'`,
    [novoStatus, id],
  );
  if (result.rowCount === 0) {
    throw new ErroDeNegocio("a doação foi alterada, tente novamente", 409);
  }
  return buscarDoacao(id);
}

// ---------- página pública da ONG ----------

// Quantas pessoas diferentes já tiveram doação CONFIRMADA em alguma
// campanha da ONG. O DISTINCT conta cada doador uma vez só, mesmo que ele
// tenha doado várias vezes.
export async function contarContribuidoresDaOng(idOng) {
  const result = await query(
    `SELECT COUNT(DISTINCT doacao.id_doador) AS total
     FROM doacao
     JOIN campanha ON campanha.id_campanha = doacao.id_campanha
     WHERE campanha.id_ong = $1 AND doacao.status = 'confirmada'`,
    [idOng],
  );
  return Number(result.rows[0].total);
}
