import bcrypt from "bcryptjs";
import pool, { query } from "infra/database.js";
import { ErroDeNegocio } from "@/lib/erros.js";
import { urlDaFotoDoPerfil, urlDaFotoDaOng } from "@/lib/imagem.js";

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

// Dados do usuário logado: login (tabela usuario) + perfil (tabela ong ou doador).
export async function buscarUsuarioPorId(id) {
  const result = await query(
    "SELECT id_usuario, email, tipo, criado_em FROM usuario WHERE id_usuario = $1",
    [id],
  );
  if (result.rows.length === 0) {
    return null;
  }
  const usuario = result.rows[0];

  if (usuario.tipo === "ong") {
    const perfil = await query(
      "SELECT nome, cnpj, descricao, site, contato FROM ong WHERE id_usuario = $1",
      [id],
    );
    usuario.nome = perfil.rows[0].nome;
    usuario.cnpj = perfil.rows[0].cnpj;
    usuario.descricao = perfil.rows[0].descricao;
    usuario.site = perfil.rows[0].site;
    usuario.contato = perfil.rows[0].contato;
  } else {
    const perfil = await query(
      "SELECT nome FROM doador WHERE id_usuario = $1",
      [id],
    );
    usuario.nome = perfil.rows[0].nome;
  }

  // Foto de perfil: só a data da última troca, para montar a URL (sem os bytes).
  const foto = await query(
    "SELECT atualizado_em FROM foto_usuario WHERE id_usuario = $1",
    [id],
  );
  usuario.foto_url = null;
  if (foto.rows.length > 0) {
    usuario.foto_url = urlDaFotoDoPerfil(foto.rows[0].atualizado_em);
  }

  return usuario;
}

// ---------- perfil ----------

// O que pode ser alterado:
// - doador: nome;
// - ONG: nome, descrição, site e contato.
// Os campos não enviados continuam iguais.
// E-mail e CNPJ identificam a conta; mudá-los exige outra verificação.
export async function atualizarPerfil(sessao, dados) {
  const veioNome = dados?.nome !== undefined;

  if (sessao.tipo === "doador") {
    if (!veioNome) {
      throw new ErroDeNegocio("Nenhum campo para atualizar");
    }
    const nome = validarNome(dados.nome);
    await query("UPDATE doador SET nome = $1 WHERE id_usuario = $2", [
      nome,
      sessao.id_usuario,
    ]);
    return buscarUsuarioPorId(sessao.id_usuario);
  }

  const veioDescricao = dados?.descricao !== undefined;
  const veioSite = dados?.site !== undefined;
  const veioContato = dados?.contato !== undefined;
  if (!veioNome && !veioDescricao && !veioSite && !veioContato) {
    throw new ErroDeNegocio("Nenhum campo para atualizar");
  }

  // Começa com os valores atuais e troca só o que foi enviado.
  const atual = await buscarUsuarioPorId(sessao.id_usuario);
  let nome = atual.nome;
  let descricao = atual.descricao;
  let site = atual.site;
  let contato = atual.contato;

  if (veioNome) {
    nome = validarNome(dados.nome);
  }
  if (veioDescricao) {
    descricao = validarTextoOpcional(dados.descricao, 500, "descrição");
  }
  if (veioSite) {
    site = validarSite(dados.site);
  }
  if (veioContato) {
    contato = validarTextoOpcional(dados.contato, 150, "contato");
  }

  await query(
    `UPDATE ong SET nome = $1, descricao = $2, site = $3, contato = $4
     WHERE id_usuario = $5`,
    [nome, descricao, site, contato, sessao.id_usuario],
  );
  return buscarUsuarioPorId(sessao.id_usuario);
}

// Página pública de uma ONG: só dados que qualquer pessoa pode ver.
// (O CNPJ é público na Receita Federal e ajuda o doador a confiar na ONG.)
export async function buscarOngPublica(id) {
  const result = await query(
    `SELECT ong.id_usuario AS id_ong, ong.nome, ong.cnpj, ong.descricao,
            ong.site, ong.contato, usuario.criado_em,
            foto_usuario.atualizado_em AS foto_atualizada_em
     FROM ong
     JOIN usuario ON usuario.id_usuario = ong.id_usuario
     LEFT JOIN foto_usuario ON foto_usuario.id_usuario = ong.id_usuario
     WHERE ong.id_usuario = $1`,
    [id],
  );
  if (result.rows.length === 0) {
    throw new ErroDeNegocio("ONG não encontrada", 404);
  }

  // LEFT JOIN: a ONG aparece mesmo sem foto (aí foto_atualizada_em é NULL).
  const { foto_atualizada_em, ...ong } = result.rows[0];
  ong.foto_url = null;
  if (foto_atualizada_em) {
    ong.foto_url = urlDaFotoDaOng(ong.id_ong, foto_atualizada_em);
  }
  return ong;
}

// ---------- cadastro ----------

function normalizarEmail(email) {
  return String(email ?? "")
    .trim()
    .toLowerCase();
}

function validarNome(valor) {
  const nome = String(valor ?? "").trim();
  if (nome.length < 2 || nome.length > 150) {
    throw new ErroDeNegocio("nome deve ter entre 2 e 150 caracteres");
  }
  return nome;
}

// Texto opcional: vazio vira null (apaga o que estava salvo).
function validarTextoOpcional(valor, maximo, nomeDoCampo) {
  const texto = String(valor ?? "").trim();
  if (texto === "") {
    return null;
  }
  if (texto.length > maximo) {
    throw new ErroDeNegocio(
      `${nomeDoCampo} deve ter no máximo ${maximo} caracteres`,
    );
  }
  return texto;
}

// Aceita "amigos.org.br" ou "https://amigos.org.br" (sem "https://", ele é
// adicionado). Só aceita endereços http/https: o site vira um link na página
// pública, e um link "javascript:..." executaria código de quem clicasse.
function validarSite(valor) {
  let texto = String(valor ?? "").trim();
  if (texto === "") {
    return null;
  }
  if (!/^https?:\/\//i.test(texto)) {
    texto = `https://${texto}`;
  }

  let endereco;
  try {
    endereco = new URL(texto); // lança erro se não for um endereço válido
  } catch {
    throw new ErroDeNegocio("site inválido");
  }
  const ehHttp =
    endereco.protocol === "http:" || endereco.protocol === "https:";
  // "amigos.org.br" tem ponto; "amigos" sozinho não é um site
  if (!ehHttp || !endereco.hostname.includes(".") || texto.length > 255) {
    throw new ErroDeNegocio("site inválido");
  }
  return texto;
}

function validar(dados) {
  const tipo = dados?.tipo;
  const email = normalizarEmail(dados?.email);
  const senha = String(dados?.senha ?? "");

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
  const nome = validarNome(dados?.nome);

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
