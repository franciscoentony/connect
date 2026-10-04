import { query } from "infra/database.js";
import { ErroDeNegocio } from "@/lib/erros.js";
import { obterCampanhaDaOng } from "@/models/campanha.js";

const COLUNAS = "id_donatario, nome, contato, criado_em";

// ---------- validação ----------

function validarNome(valor) {
  const nome = String(valor ?? "").trim();
  if (nome.length < 2 || nome.length > 150) {
    throw new ErroDeNegocio("nome deve ter entre 2 e 150 caracteres");
  }
  return nome;
}

function validarContato(valor) {
  if (valor === null || valor === undefined) return null;
  const contato = String(valor).trim();
  if (contato === "") return null;
  if (contato.length > 150) {
    throw new ErroDeNegocio("contato deve ter até 150 caracteres");
  }
  return contato;
}

// ---------- donatários ----------

export async function criarDonatario(idOng, dados) {
  const nome = validarNome(dados?.nome);
  const contato = validarContato(dados?.contato);
  const result = await query({
    text: `INSERT INTO donatario (id_ong, nome, contato)
           VALUES ($1, $2, $3) RETURNING ${COLUNAS}`,
    values: [idOng, nome, contato],
  });
  return result.rows[0];
}

export async function listarDonatarios(idOng, { limite, pagina }) {
  const result = await query({
    text: `SELECT ${COLUNAS} FROM donatario
           WHERE id_ong = $1
           ORDER BY nome, id_donatario
           LIMIT $2 OFFSET $3`,
    values: [idOng, limite, (pagina - 1) * limite],
  });
  return result.rows;
}

// Donatário não é público: para quem não é a ONG dona, ele "não existe" (404).
export async function obterDonatarioDaOng(id, idOng) {
  const result = await query({
    text: `SELECT ${COLUNAS} FROM donatario
           WHERE id_donatario = $1 AND id_ong = $2`,
    values: [id, idOng],
  });
  if (result.rowCount === 0) {
    throw new ErroDeNegocio("donatário não encontrado", 404);
  }
  return result.rows[0];
}

export async function atualizarDonatario(id, idOng, dados) {
  const sets = [];
  const values = [];
  const add = (coluna, valor) => {
    values.push(valor);
    sets.push(`${coluna} = $${values.length}`);
  };

  if (dados?.nome !== undefined) add("nome", validarNome(dados.nome));
  if (dados?.contato !== undefined) add("contato", validarContato(dados.contato));
  if (sets.length === 0) throw new ErroDeNegocio("nenhum campo para atualizar");

  values.push(id, idOng);
  const result = await query({
    text: `UPDATE donatario SET ${sets.join(", ")}
           WHERE id_donatario = $${values.length - 1} AND id_ong = $${values.length}
           RETURNING ${COLUNAS}`,
    values,
  });
  if (result.rowCount === 0) {
    throw new ErroDeNegocio("donatário não encontrado", 404);
  }
  return result.rows[0];
}

// Só apaga se não estiver vinculado a nenhuma campanha (checagem atômica).
export async function removerDonatario(id, idOng) {
  const result = await query({
    text: `DELETE FROM donatario d
           WHERE d.id_donatario = $1 AND d.id_ong = $2
             AND NOT EXISTS (
               SELECT 1 FROM campanha_donatario cd
               WHERE cd.id_donatario = d.id_donatario
             )
           RETURNING d.id_donatario`,
    values: [id, idOng],
  });
  if (result.rowCount === 0) {
    await obterDonatarioDaOng(id, idOng); // lança 404 se não existir/não for dele
    throw new ErroDeNegocio("donatário vinculado a campanhas; desvincule antes", 409);
  }
}

// ---------- vínculo campanha <-> donatário ----------

export async function listarDonatariosDaCampanha(idCampanha, idOng, { limite, pagina }) {
  await obterCampanhaDaOng(idCampanha, idOng);
  const result = await query({
    text: `SELECT d.id_donatario, d.nome, d.contato, d.criado_em
           FROM campanha_donatario cd
           JOIN donatario d ON d.id_donatario = cd.id_donatario
           WHERE cd.id_campanha = $1
           ORDER BY d.nome, d.id_donatario
           LIMIT $2 OFFSET $3`,
    values: [idCampanha, limite, (pagina - 1) * limite],
  });
  return result.rows;
}

export async function vincularDonatario(idCampanha, idOng, dados) {
  const idDonatario = String(dados?.id_donatario ?? "");
  if (!/^\d{1,18}$/.test(idDonatario)) {
    throw new ErroDeNegocio("id_donatario é obrigatório");
  }

  let result;
  try {
    // Uma única instrução: campanha e donatário precisam ser da mesma ONG,
    // e a campanha não pode estar encerrada/cancelada.
    result = await query({
      text: `
        INSERT INTO campanha_donatario (id_campanha, id_donatario)
        SELECT c.id_campanha, d.id_donatario
        FROM campanha c, donatario d
        WHERE c.id_campanha = $1 AND c.id_ong = $3
          AND c.status IN ('rascunho', 'ativa')
          AND d.id_donatario = $2 AND d.id_ong = $3
        RETURNING id_donatario`,
      values: [idCampanha, idDonatario, idOng],
    });
  } catch (error) {
    if (error.code === "23505") {
      throw new ErroDeNegocio("donatário já vinculado a esta campanha", 409);
    }
    throw error;
  }

  if (result.rowCount === 0) {
    // diagnostica o motivo para devolver o erro certo
    const campanha = await obterCampanhaDaOng(idCampanha, idOng); // 404 ou 403
    if (["encerrada", "cancelada"].includes(campanha.status)) {
      throw new ErroDeNegocio(`campanha ${campanha.status} não aceita novos vínculos`, 409);
    }
    throw new ErroDeNegocio("donatário não encontrado", 404);
  }
  return obterDonatarioDaOng(idDonatario, idOng);
}

export async function desvincularDonatario(idCampanha, idDonatario, idOng) {
  const campanha = await obterCampanhaDaOng(idCampanha, idOng);
  if (["encerrada", "cancelada"].includes(campanha.status)) {
    throw new ErroDeNegocio(`campanha ${campanha.status} não pode ser alterada`, 409);
  }
  const result = await query({
    text: `DELETE FROM campanha_donatario
           WHERE id_campanha = $1 AND id_donatario = $2
           RETURNING id_donatario`,
    values: [idCampanha, idDonatario],
  });
  if (result.rowCount === 0) {
    throw new ErroDeNegocio("vínculo não encontrado", 404);
  }
}