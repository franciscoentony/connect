import bcrypt from "bcryptjs";
import pool, { query } from "infra/database.js";
import { ErroDeNegocio } from "@/lib/erros.js";

// Quanto maior, mais lento (e mais difícil de quebrar) é o hash da senha.
const CUSTO_DO_HASH = 12;

// Hash de uma senha qualquer, usado no login quando o e-mail não existe.
// Assim o login demora o mesmo tempo com e-mail existente ou não, e ninguém
// consegue descobrir quais e-mails estão cadastrados medindo o tempo.
const HASH_FALSO = bcrypt.hashSync(
  "senha-falsa-para-igualar-tempo",
  CUSTO_DO_HASH,
);

// Código de erro do Postgres para "valor repetido numa coluna UNIQUE".
const ERRO_VALOR_DUPLICADO = "23505";

// ---------- login ----------

export async function autenticar(dados) {
  const email = normalizarEmail(dados?.email);
  const senha = String(dados?.senha ?? "");

  const result = await query(
    "SELECT id_usuario, email, tipo, senha_hash FROM usuario WHERE email = $1",
    [email],
  );
  const usuario = result.rows[0];

  // Comparamos a senha mesmo quando o usuário não existe (veja HASH_FALSO).
  const hashParaComparar = usuario ? usuario.senha_hash : HASH_FALSO;
  const senhaCorreta = await bcrypt.compare(senha, hashParaComparar);

  if (!usuario || !senhaCorreta) {
    throw new ErroDeNegocio("e-mail ou senha incorretos", 401);
  }

  return {
    id_usuario: usuario.id_usuario,
    email: usuario.email,
    tipo: usuario.tipo,
  };
}

export async function buscarUsuarioPorId(id) {
  const result = await query(
    "SELECT id_usuario, email, tipo, criado_em FROM usuario WHERE id_usuario = $1",
    [id],
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
}

// ---------- cadastro ----------

function normalizarEmail(email) {
  return String(email ?? "")
    .trim()
    .toLowerCase();
}

function validar(dados) {
  const tipo = dados?.tipo;
  const email = normalizarEmail(dados?.email);
  const senha = String(dados?.senha ?? "");
  const nome = String(dados?.nome ?? "").trim();

  if (tipo !== "ong" && tipo !== "doador") {
    throw new ErroDeNegocio("tipo deve ser 'ong' ou 'doador'");
  }

  // Formato "algo@algo.algo", sem espaços.
  const formatoDeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formatoDeEmail.test(email)) {
    throw new ErroDeNegocio("e-mail inválido");
  }

  // O bcrypt só considera os primeiros 72 caracteres da senha.
  if (senha.length < 8 || senha.length > 72) {
    throw new ErroDeNegocio("a senha deve ter entre 8 e 72 caracteres");
  }
  if (nome.length < 2 || nome.length > 150) {
    throw new ErroDeNegocio("nome deve ter entre 2 e 150 caracteres");
  }

  let cnpj = null;
  if (tipo === "ong") {
    // Remove pontos, barra e traço: "12.345.678/0001-90" vira "12345678000190".
    cnpj = String(dados?.cnpj ?? "").replace(/\D/g, "");
    if (cnpj.length !== 14) {
      throw new ErroDeNegocio("CNPJ deve ter 14 dígitos");
    }
  }

  return { tipo, email, senha, nome, cnpj };
}

// Cria o usuário (e-mail, senha, tipo) e o perfil dele (tabela ong ou doador).
export async function criarUsuario(dados) {
  const { tipo, email, senha, nome, cnpj } = validar(dados);
  const senhaHash = await bcrypt.hash(senha, CUSTO_DO_HASH);

  // São dois INSERTs que precisam acontecer juntos: se o segundo falhar
  // (ex.: CNPJ repetido), o primeiro também deve ser desfeito.
  // Para isso usamos uma transação: BEGIN ... COMMIT, ou ROLLBACK se der erro.
  // A transação precisa de uma conexão só dela, que pegamos do pool.
  const conexao = await pool.connect();
  try {
    await conexao.query("BEGIN");

    const result = await conexao.query(
      `INSERT INTO usuario (email, senha_hash, tipo)
       VALUES ($1, $2, $3)
       RETURNING id_usuario, email, tipo, criado_em`,
      [email, senhaHash, tipo],
    );
    const usuario = result.rows[0];

    if (tipo === "ong") {
      await conexao.query(
        "INSERT INTO ong (id_usuario, nome, cnpj) VALUES ($1, $2, $3)",
        [usuario.id_usuario, nome, cnpj],
      );
    } else {
      await conexao.query(
        "INSERT INTO doador (id_usuario, nome) VALUES ($1, $2)",
        [usuario.id_usuario, nome],
      );
    }

    await conexao.query("COMMIT");
    return usuario;
  } catch (error) {
    await conexao.query("ROLLBACK");

    if (error.code === ERRO_VALOR_DUPLICADO) {
      if (error.constraint === "ong_cnpj_key") {
        throw new ErroDeNegocio("CNPJ já cadastrado", 409);
      }
      throw new ErroDeNegocio("e-mail já cadastrado", 409);
    }
    throw error;
  } finally {
    // Sempre devolve a conexão ao pool, dando certo ou errado.
    conexao.release();
  }
}
