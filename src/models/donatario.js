import { query } from "infra/database.js";
import { ErroDeNegocio } from "@/lib/erros.js";
import { ehIdValido } from "@/lib/requisicao.js";
import { obterCampanhaDaOng, campanhaFinalizada } from "@/models/campanha.js";

// Donatário é quem recebe as doações (ex.: uma família atendida pela ONG).
// Cada donatário pertence a uma ONG, e só ela pode vê-lo ou alterá-lo.

// Código de erro do Postgres para "valor repetido numa coluna UNIQUE".
const ERRO_VALOR_DUPLICADO = "23505";

// ---------- validação ----------

function validarNome(valor) {
  const nome = String(valor ?? "").trim();
  if (nome.length < 2 || nome.length > 150) {
    throw new ErroDeNegocio("nome deve ter entre 2 e 150 caracteres");
  }
  return nome;
}

// O contato é opcional: vazio vira null.
function validarContato(valor) {
  const contato = String(valor ?? "").trim();
  if (contato === "") {
    return null;
  }
  if (contato.length > 150) {
    throw new ErroDeNegocio("contato deve ter até 150 caracteres");
  }
  return contato;
}

// ---------- donatários ----------

export async function criarDonatario(idOng, dados) {
  const nome = validarNome(dados?.nome);
  const contato = validarContato(dados?.contato);

  const result = await query(
    `INSERT INTO donatario (id_ong, nome, contato)
     VALUES ($1, $2, $3)
     RETURNING id_donatario, nome, contato, criado_em`,
    [idOng, nome, contato],
  );
  return result.rows[0];
}

export async function listarDonatarios(idOng, { limite, pagina }) {
  const result = await query(
    `SELECT id_donatario, nome, contato, criado_em FROM donatario
     WHERE id_ong = $1
     ORDER BY nome, id_donatario
     LIMIT $2 OFFSET $3`,
    [idOng, limite, (pagina - 1) * limite],
  );
  return result.rows;
}

// Busca um donatário da ONG logada.
// Se não existe ou é de outra ONG, responde 404 nos dois casos, para não
// revelar que o donatário de outra ONG existe.
export async function obterDonatarioDaOng(id, idOng) {
  const result = await query(
    `SELECT id_donatario, nome, contato, criado_em FROM donatario
     WHERE id_donatario = $1 AND id_ong = $2`,
    [id, idOng],
  );
  if (result.rows.length === 0) {
    throw new ErroDeNegocio("donatário não encontrado", 404);
  }
  return result.rows[0];
}

// Altera nome e/ou contato. Os campos não enviados continuam iguais.
export async function atualizarDonatario(id, idOng, dados) {
  const veioNome = dados?.nome !== undefined;
  const veioContato = dados?.contato !== undefined;

  if (!veioNome && !veioContato) {
    throw new ErroDeNegocio("nenhum campo para atualizar");
  }

  const atual = await obterDonatarioDaOng(id, idOng); // 404 se não for da ONG

  // Começa com os valores atuais e troca só o que foi enviado.
  let nome = atual.nome;
  let contato = atual.contato;

  if (veioNome) {
    nome = validarNome(dados.nome);
  }
  if (veioContato) {
    contato = validarContato(dados.contato);
  }

  const result = await query(
    `UPDATE donatario SET nome = $1, contato = $2
     WHERE id_donatario = $3 AND id_ong = $4
     RETURNING id_donatario, nome, contato, criado_em`,
    [nome, contato, id, idOng],
  );
  return result.rows[0];
}

// Só apaga se o donatário não estiver vinculado a nenhuma campanha.
export async function removerDonatario(id, idOng) {
  await obterDonatarioDaOng(id, idOng); // 404 se não for da ONG

  const vinculos = await query(
    "SELECT 1 FROM campanha_donatario WHERE id_donatario = $1",
    [id],
  );
  if (vinculos.rows.length > 0) {
    throw new ErroDeNegocio(
      "donatário vinculado a campanhas; desvincule antes",
      409,
    );
  }

  await query("DELETE FROM donatario WHERE id_donatario = $1", [id]);
}

// ---------- vínculo entre campanha e donatário ----------

export async function listarDonatariosDaCampanha(
  idCampanha,
  idOng,
  { limite, pagina },
) {
  await obterCampanhaDaOng(idCampanha, idOng); // 404 ou 403 se não for da ONG

  const result = await query(
    `SELECT donatario.id_donatario, donatario.nome, donatario.contato, donatario.criado_em
     FROM campanha_donatario
     JOIN donatario ON donatario.id_donatario = campanha_donatario.id_donatario
     WHERE campanha_donatario.id_campanha = $1
     ORDER BY donatario.nome, donatario.id_donatario
     LIMIT $2 OFFSET $3`,
    [idCampanha, limite, (pagina - 1) * limite],
  );
  return result.rows;
}

export async function vincularDonatario(idCampanha, idOng, dados) {
  const idDonatario = String(dados?.id_donatario ?? "");
  if (!ehIdValido(idDonatario)) {
    throw new ErroDeNegocio("id_donatario é obrigatório");
  }

  // A campanha e o donatário precisam ser da ONG logada.
  const campanha = await obterCampanhaDaOng(idCampanha, idOng); // 404 ou 403
  if (campanhaFinalizada(campanha)) {
    throw new ErroDeNegocio(
      `campanha ${campanha.status} não aceita novos vínculos`,
      409,
    );
  }
  const donatario = await obterDonatarioDaOng(idDonatario, idOng); // 404

  try {
    await query(
      "INSERT INTO campanha_donatario (id_campanha, id_donatario) VALUES ($1, $2)",
      [idCampanha, idDonatario],
    );
  } catch (error) {
    // A chave primária é (id_campanha, id_donatario): vincular duas vezes dá erro.
    if (error.code === ERRO_VALOR_DUPLICADO) {
      throw new ErroDeNegocio("donatário já vinculado a esta campanha", 409);
    }
    throw error;
  }

  return donatario;
}

export async function desvincularDonatario(idCampanha, idDonatario, idOng) {
  const campanha = await obterCampanhaDaOng(idCampanha, idOng); // 404 ou 403
  if (campanhaFinalizada(campanha)) {
    throw new ErroDeNegocio(
      `campanha ${campanha.status} não pode ser alterada`,
      409,
    );
  }

  const result = await query(
    "DELETE FROM campanha_donatario WHERE id_campanha = $1 AND id_donatario = $2",
    [idCampanha, idDonatario],
  );
  if (result.rowCount === 0) {
    throw new ErroDeNegocio("vínculo não encontrado", 404);
  }
}
