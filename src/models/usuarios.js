import bcrypt from "bcryptjs";
import { query } from "infra/database.js";
import { responderErro, ErroDeNegocio } from '@/lib/erros.js';

const TIPOS = ["ong", "doador"];

function validar(dados) {
  const tipo = dados?.tipo;
  const email = String(dados?.email ?? "").trim().toLowerCase();
  const senha = String(dados?.senha ?? "");
  const nome = String(dados?.nome ?? "").trim();

  if (!TIPOS.includes(tipo)) {
    throw new ErroDeNegocio("tipo deve ser 'ong' ou 'doador'");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ErroDeNegocio("e-mail inválido");
  }
  // o bcrypt só considera os primeiros 72 bytes da senha
  if (senha.length < 8 || senha.length > 72) {
    throw new ErroDeNegocio("a senha deve ter entre 8 e 72 caracteres");
  }
  if (nome.length < 2 || nome.length > 150) {
    throw new ErroDeNegocio("nome deve ter entre 2 e 150 caracteres");
  }

  let cnpj = null;
  if (tipo === "ong") {
    cnpj = String(dados?.cnpj ?? "").replace(/\D/g, "");
    if (cnpj.length !== 14) {
      throw new ErroDeNegocio("CNPJ deve ter 14 dígitos");
    }
  }

  return { tipo, email, senha, nome, cnpj };
}

export async function criarUsuario(dados) {
  const { tipo, email, senha, nome, cnpj } = validar(dados);
  const senhaHash = await bcrypt.hash(senha, 12);

  // Um único comando SQL: ou cria usuario + perfil, ou não cria nada.
  const inserirPerfil =
    tipo === "ong"
      ? "INSERT INTO ong (id_usuario, nome, cnpj) SELECT id_usuario, $4::text, $5::text FROM novo_usuario"
      : "INSERT INTO doador (id_usuario, nome) SELECT id_usuario, $4::text FROM novo_usuario";

  const values =
    tipo === "ong"
      ? [email, senhaHash, tipo, nome, cnpj]
      : [email, senhaHash, tipo, nome];

  const text = `
    WITH novo_usuario AS (
      INSERT INTO usuario (email, senha_hash, tipo)
      VALUES ($1, $2, $3)
      RETURNING id_usuario, email, tipo, criado_em
    ),
    perfil AS (
      ${inserirPerfil}
    )
    SELECT id_usuario, email, tipo, criado_em FROM novo_usuario
  `;

  try {
    const result = await query({ text, values });
    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      // violação de UNIQUE
      if (error.constraint === "ong_cnpj_key") {
        throw new ErroDeNegocio("CNPJ já cadastrado", 409);
      }
      throw new ErroDeNegocio("e-mail já cadastrado", 409);
    }
    throw error;
  }
}