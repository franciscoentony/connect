import { query } from "infra/database.js";
import { ErroDeNegocio } from "@/lib/erros.js";
import { respostaPaginada } from "@/lib/requisicao.js";
import { urlDaFotoDaCampanha } from "@/lib/imagem.js";

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

// Data de hoje no horário de Brasília, no formato "2026-12-24".
// (O servidor roda em UTC: às 22h de Brasília ele já estaria "amanhã".)
export function hojeNoBrasil() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

// A campanha tem data de término e ela já passou?
// Comparar texto "AAAA-MM-DD" funciona porque a ordem das letras é a das datas.
export function campanhaTerminou(campanha) {
  return Boolean(campanha.termina_em) && campanha.termina_em < hojeNoBrasil();
}

// SELECT usado por todas as buscas de campanha.
// Além das colunas da campanha, traz:
// - o nome da ONG (JOIN com a tabela ong);
// - "arrecadado": a soma das doações em dinheiro já confirmadas.
//   O COALESCE troca o resultado por 0 quando ainda não há doações
//   (sem ele, a soma de nenhuma linha seria NULL);
// - "id_foto_capa": a primeira foto enviada (menor id), ou NULL se não tem.
const SELECT_CAMPANHA = `
  SELECT campanha.id_campanha, campanha.id_ong, ong.nome AS ong_nome,
         campanha.titulo, campanha.descricao, campanha.meta, campanha.status,
         campanha.criado_em,
         to_char(campanha.termina_em, 'YYYY-MM-DD') AS termina_em,
         COALESCE((
           SELECT SUM(doacao.valor) FROM doacao
           WHERE doacao.id_campanha = campanha.id_campanha
             AND doacao.status = 'confirmada'
             AND doacao.tipo = 'dinheiro'
         ), 0) AS arrecadado,
         (
           SELECT MIN(foto_campanha.id_foto) FROM foto_campanha
           WHERE foto_campanha.id_campanha = campanha.id_campanha
         ) AS id_foto_capa
  FROM campanha
  JOIN ong ON ong.id_usuario = campanha.id_ong
`;

// Troca o "id_foto_capa" pela URL pronta para usar no <img src="...">.
// Sem foto, "capa_url" fica null (o frontend mostra um fundo cinza).
function adicionarCapa(linha) {
  const { id_foto_capa, ...campanha } = linha;
  campanha.capa_url = null;
  if (id_foto_capa) {
    campanha.capa_url = urlDaFotoDaCampanha(campanha.id_campanha, id_foto_capa);
  }
  return campanha;
}

// ---------- validação ----------

function validarTitulo(valor) {
  const titulo = String(valor ?? "").trim();
  if (titulo.length < 3 || titulo.length > 150) {
    throw new ErroDeNegocio("título deve ter entre 3 e 150 caracteres");
  }
  return titulo;
}

// Opcional na criação e no rascunho; obrigatória para publicar.
// Vazia vira null.
function validarDescricao(valor) {
  const descricao = String(valor ?? "").trim();
  if (descricao === "") {
    return null;
  }
  if (descricao.length < 20 || descricao.length > 2000) {
    throw new ErroDeNegocio("descrição deve ter entre 20 e 2000 caracteres");
  }
  return descricao;
}

// Último dia para doar, no formato "2026-12-24". Opcional: vazia vira null.
function validarTerminaEm(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  const texto = String(valor);
  const data = new Date(`${texto}T12:00:00Z`);
  // o formato precisa bater e a data precisa existir (recusa "2026-02-31")
  const valida =
    /^\d{4}-\d{2}-\d{2}$/.test(texto) &&
    !Number.isNaN(data.getTime()) &&
    data.toISOString().slice(0, 10) === texto;
  if (!valida) {
    throw new ErroDeNegocio("data de término inválida (use AAAA-MM-DD)");
  }
  if (texto < hojeNoBrasil()) {
    throw new ErroDeNegocio("a data de término não pode estar no passado");
  }
  return texto;
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
  return adicionarCapa(result.rows[0]);
}

// Quais campanhas listar:
// - sem idOng: as ativas de todas as ONGs (vitrine pública);
// - com idOng: as ativas daquela ONG (página pública da ONG);
// - com idOng e todosOsStatus: todas daquela ONG, até rascunhos (painel da ONG).
// Com "busca", só as campanhas com esse texto no título (sem diferenciar
// maiúsculas e minúsculas).
export async function listarCampanhas(
  { idOng, todosOsStatus, busca },
  { limite, pagina },
) {
  let filtro;
  let valores;
  if (idOng && todosOsStatus) {
    filtro = "campanha.id_ong = $1";
    valores = [idOng];
  } else if (idOng) {
    filtro = "campanha.id_ong = $1 AND campanha.status = 'ativa'";
    valores = [idOng];
  } else {
    filtro = "campanha.status = 'ativa'";
    valores = [];
  }

  // ILIKE é o LIKE que ignora maiúsculas; "%" quer dizer "qualquer texto".
  // O texto entra como parâmetro ($n), nunca colado no SQL.
  if (busca) {
    valores.push(`%${busca}%`);
    filtro += ` AND campanha.titulo ILIKE $${valores.length}`;
  }

  // 1ª consulta: quantas campanhas existem no total (para a paginação).
  const contagem = await query(
    `SELECT COUNT(*) AS total FROM campanha WHERE ${filtro}`,
    valores,
  );
  const total = Number(contagem.rows[0].total);

  // 2ª consulta: só as campanhas da página pedida.
  // LIMIT e OFFSET entram depois dos valores do filtro: se o filtro usa $1,
  // eles viram $2 e $3; se o filtro não usa nenhum, viram $1 e $2.
  const posicaoDoLimite = valores.length + 1;
  const posicaoDoOffset = valores.length + 2;
  const pular = (pagina - 1) * limite;

  const result = await query(
    `${SELECT_CAMPANHA}
     WHERE ${filtro}
     ORDER BY campanha.criado_em DESC, campanha.id_campanha DESC
     LIMIT $${posicaoDoLimite} OFFSET $${posicaoDoOffset}`,
    [...valores, limite, pular],
  );

  const campanhas = result.rows.map(adicionarCapa);
  return respostaPaginada(campanhas, total, { limite, pagina });
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
  const descricao = validarDescricao(dados?.descricao);
  const terminaEm = validarTerminaEm(dados?.termina_em);

  // O status não vem do cliente: o banco usa o padrão, "rascunho".
  const result = await query(
    `INSERT INTO campanha (id_ong, titulo, meta, descricao, termina_em)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_campanha`,
    [idOng, titulo, meta, descricao, terminaEm],
  );
  return buscarCampanha(result.rows[0].id_campanha);
}

// Altera título, meta, descrição, término e/ou status.
// Os campos não enviados continuam iguais.
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
  const veioDescricao = dados?.descricao !== undefined;
  const veioTerminaEm = dados?.termina_em !== undefined;

  if (
    !veioTitulo &&
    !veioMeta &&
    !veioStatus &&
    !veioDescricao &&
    !veioTerminaEm
  ) {
    throw new ErroDeNegocio("Nenhum campo para atualizar");
  }

  // Começa com os valores atuais e troca só o que foi enviado.
  let titulo = atual.titulo;
  let meta = atual.meta;
  let status = atual.status;
  let descricao = atual.descricao;
  let terminaEm = atual.termina_em;

  if (veioTitulo) {
    titulo = validarTitulo(dados.titulo);
  }
  if (veioMeta) {
    meta = validarMeta(dados.meta);
  }
  if (veioDescricao) {
    descricao = validarDescricao(dados.descricao);
  }
  if (veioTerminaEm) {
    terminaEm = validarTerminaEm(dados.termina_em);
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

  // O doador precisa saber para que é a doação antes de doar.
  if (status === "ativa" && !descricao) {
    throw new ErroDeNegocio(
      "adicione uma descrição antes de publicar a campanha",
      409,
    );
  }

  // O "AND status = $5" só atualiza se o status ainda for o que lemos acima.
  // Se outra requisição mudou o status nesse meio-tempo, nenhuma linha é
  // atualizada e avisamos o cliente para tentar de novo.
  const result = await query(
    `UPDATE campanha
     SET titulo = $1, meta = $2, status = $3, descricao = $4, termina_em = $5
     WHERE id_campanha = $6 AND status = $7`,
    [titulo, meta, status, descricao, terminaEm, id, atual.status],
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

// ---------- painel da ONG ----------

// Números do topo do painel da ONG (dashboard):
// - quantas campanhas estão ativas;
// - quanto já foi arrecadado (só doações em dinheiro CONFIRMADAS);
// - quantas doações estão esperando a ONG confirmar.
export async function resumoDoPainel(idOng) {
  const ativas = await query(
    "SELECT COUNT(*) AS total FROM campanha WHERE id_ong = $1 AND status = 'ativa'",
    [idOng],
  );

  const arrecadado = await query(
    `SELECT COALESCE(SUM(doacao.valor), 0) AS total
     FROM doacao
     JOIN campanha ON campanha.id_campanha = doacao.id_campanha
     WHERE campanha.id_ong = $1
       AND doacao.status = 'confirmada'
       AND doacao.tipo = 'dinheiro'`,
    [idOng],
  );

  const pendentes = await query(
    `SELECT COUNT(*) AS total
     FROM doacao
     JOIN campanha ON campanha.id_campanha = doacao.id_campanha
     WHERE campanha.id_ong = $1 AND doacao.status = 'pendente'`,
    [idOng],
  );

  return {
    campanhasAtivas: Number(ativas.rows[0].total),
    arrecadado: Number(arrecadado.rows[0].total),
    doacoesPendentes: Number(pendentes.rows[0].total),
  };
}
