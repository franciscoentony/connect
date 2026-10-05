import { query } from "infra/database.js";
import { ErroDeNegocio } from "@/lib/erros.js";

// Para qual status cada status pode mudar.
// Ex.: uma campanha "rascunho" pode virar "ativa" ou "cancelada".
// "encerrada" e "cancelada" são finais: não mudam mais.
const PROXIMOS_STATUS = {
  rascunho: ["ativa", "cancelada"],
  ativa: ["encerrada", "cancelada"],
  encerrada: [],
  cancelada: [],
};

export function campanhaFinalizada(campanha) {
  return campanha.status === "encerrada" || campanha.status === "cancelada";
}

// SELECT usado por todas as buscas de campanha.
// Além das colunas da campanha, traz:
// - o nome da ONG (JOIN com a tabela ong);
// - "arrecadado": a soma das doações em dinheiro já confirmadas.
//   O COALESCE troca o resultado por 0 quando ainda não há doações
//   (sem ele, a soma de nenhuma linha seria NULL).
const SELECT_CAMPANHA = `
  SELECT campanha.id_campanha, campanha.id_ong, ong.nome AS ong_nome,
         campanha.titulo, campanha.meta, campanha.status, campanha.criado_em,
         COALESCE((
           SELECT SUM(doacao.valor) FROM doacao
           WHERE doacao.id_campanha = campanha.id_campanha
             AND doacao.status = 'confirmada'
             AND doacao.tipo = 'dinheiro'
         ), 0) AS arrecadado
  FROM campanha
  JOIN ong ON ong.id_usuario = campanha.id_ong
`;

// ---------- validação ----------

function validarTitulo(valor) {
  const titulo = String(valor ?? "").trim();
  if (titulo.length < 3 || titulo.length > 150) {
    throw new ErroDeNegocio("título deve ter entre 3 e 150 caracteres");
  }
  return titulo;
}

// A meta é opcional: vazia vira null (campanha sem meta).
function validarMeta(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  const meta = Number(valor);
  // Number.isFinite recusa NaN ("abc") e Infinity.
  // 9999999999.99 é o maior valor que cabe na coluna NUMERIC(12,2).
  if (!Number.isFinite(meta) || meta <= 0 || meta > 9999999999.99) {
    throw new ErroDeNegocio("meta deve ser um número positivo");
  }
  return meta.toFixed(2); // sempre com 2 casas: 1000 vira "1000.00"
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

// ---------- leitura ----------

export async function buscarCampanha(id) {
  const result = await query(
    `${SELECT_CAMPANHA} WHERE campanha.id_campanha = $1`,
    [id],
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
}

// Sem idOng: lista as campanhas ativas (visão pública).
// Com idOng: lista todas as campanhas daquela ONG, de qualquer status.
export async function listarCampanhas({ idOng, limite, pagina }) {
  const pular = (pagina - 1) * limite;

  if (idOng) {
    const result = await query(
      `${SELECT_CAMPANHA}
       WHERE campanha.id_ong = $1
       ORDER BY campanha.criado_em DESC, campanha.id_campanha DESC
       LIMIT $2 OFFSET $3`,
      [idOng, limite, pular],
    );
    return result.rows;
  }

  const result = await query(
    `${SELECT_CAMPANHA}
     WHERE campanha.status = 'ativa'
     ORDER BY campanha.criado_em DESC, campanha.id_campanha DESC
     LIMIT $1 OFFSET $2`,
    [limite, pular],
  );
  return result.rows;
}

// Busca uma campanha respeitando quem pode vê-la:
// - ativa e encerrada: qualquer pessoa;
// - rascunho e cancelada: só a ONG dona. Para os outros, finge que não
//   existe (404), para não revelar que ela existe.
export async function obterCampanhaVisivel(id, sessao) {
  const campanha = await buscarCampanha(id);
  if (!campanha) {
    throw new ErroDeNegocio("campanha não encontrada", 404);
  }

  const ehPublica =
    campanha.status === "ativa" || campanha.status === "encerrada";
  const ehDaOngLogada = sessao && sessao.id_usuario === campanha.id_ong;
  if (!ehPublica && !ehDaOngLogada) {
    throw new ErroDeNegocio("campanha não encontrada", 404);
  }
  return campanha;
}

// Busca uma campanha que a ONG logada quer alterar.
// 404 se não existe; 403 se existe mas é de outra ONG.
export async function obterCampanhaDaOng(id, idOng) {
  const campanha = await buscarCampanha(id);
  if (!campanha) {
    throw new ErroDeNegocio("campanha não encontrada", 404);
  }
  if (campanha.id_ong !== idOng) {
    throw new ErroDeNegocio("sem permissão", 403);
  }
  return campanha;
}

// ---------- escrita ----------

export async function criarCampanha(idOng, dados) {
  const titulo = validarTitulo(dados?.titulo);
  const meta = validarMeta(dados?.meta);

  // O status não vem do cliente: o banco usa o padrão, "rascunho".
  const result = await query(
    `INSERT INTO campanha (id_ong, titulo, meta)
     VALUES ($1, $2, $3)
     RETURNING id_campanha`,
    [idOng, titulo, meta],
  );
  return buscarCampanha(result.rows[0].id_campanha);
}

// Altera título, meta e/ou status. Os campos não enviados continuam iguais.
export async function atualizarCampanha(id, idOng, dados) {
  const atual = await obterCampanhaDaOng(id, idOng);

  if (campanhaFinalizada(atual)) {
    throw new ErroDeNegocio(
      `campanha ${atual.status} não pode ser alterada`,
      409,
    );
  }

  const veioTitulo = dados?.titulo !== undefined;
  const veioMeta = dados?.meta !== undefined;
  const veioStatus = dados?.status !== undefined;

  if (!veioTitulo && !veioMeta && !veioStatus) {
    throw new ErroDeNegocio("Nenhum campo para atualizar");
  }

  // Começa com os valores atuais e troca só o que foi enviado.
  let titulo = atual.titulo;
  let meta = atual.meta;
  let status = atual.status;

  if (veioTitulo) {
    titulo = validarTitulo(dados.titulo);
  }
  if (veioMeta) {
    meta = validarMeta(dados.meta);
  }
  if (veioStatus) {
    if (!PROXIMOS_STATUS[atual.status].includes(dados.status)) {
      throw new ErroDeNegocio(
        `não é possível passar de '${atual.status}' para '${dados.status}'`,
        409,
      );
    }
    status = dados.status;
  }

  // O "AND status = $5" só atualiza se o status ainda for o que lemos acima.
  // Se outra requisição mudou o status nesse meio-tempo, nenhuma linha é
  // atualizada e avisamos o cliente para tentar de novo.
  const result = await query(
    `UPDATE campanha SET titulo = $1, meta = $2, status = $3
     WHERE id_campanha = $4 AND status = $5`,
    [titulo, meta, status, id, atual.status],
  );
  if (result.rowCount === 0) {
    throw new ErroDeNegocio("a campanha foi alterada, tente novamente", 409);
  }
  return buscarCampanha(id);
}

// ---------- locais de entrega ----------

export async function listarLocais(idCampanha) {
  const result = await query(
    `SELECT id_local, endereco, cidade FROM local_entrega
     WHERE id_campanha = $1
     ORDER BY id_local`,
    [idCampanha],
  );
  return result.rows;
}

export async function criarLocal(idCampanha, idOng, dados) {
  const { endereco, cidade } = validarLocal(dados);

  const campanha = await obterCampanhaDaOng(idCampanha, idOng);
  if (campanhaFinalizada(campanha)) {
    throw new ErroDeNegocio(
      `campanha ${campanha.status} não aceita novos locais`,
      409,
    );
  }

  const result = await query(
    `INSERT INTO local_entrega (id_campanha, endereco, cidade)
     VALUES ($1, $2, $3)
     RETURNING id_local, endereco, cidade`,
    [idCampanha, endereco, cidade],
  );
  return result.rows[0];
}

export async function removerLocal(idCampanha, idLocal, idOng) {
  await obterCampanhaDaOng(idCampanha, idOng);

  const result = await query(
    "DELETE FROM local_entrega WHERE id_local = $1 AND id_campanha = $2",
    [idLocal, idCampanha],
  );
  if (result.rowCount === 0) {
    throw new ErroDeNegocio("local não encontrado", 404);
  }
}
