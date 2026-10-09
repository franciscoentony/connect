import { Client } from "pg";
import { randomInt, randomUUID } from "node:crypto";

export const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";
export const SENHA = "senha-segura-123";

// Todo usuário criado nos testes usa este domínio. É ele que permite apagar
// só os dados de teste, sem encostar nos dados reais do banco de desenvolvimento.
const DOMINIO = "teste.connect";

export const emailUnico = () => `${randomUUID()}@${DOMINIO}`;
export const cnpjUnico = () =>
  Array.from({ length: 14 }, () => randomInt(10)).join("");

export async function aguardarServidor() {
  for (let tentativa = 0; tentativa < 60; tentativa++) {
    try {
      await fetch(`${BASE}/api/v1/status`);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error(
    "O servidor não respondeu em 60s. Rode `npm run dev` antes dos testes.",
  );
}

export async function api(
  caminho,
  { metodo = "GET", corpo, corpoBruto, cookie } = {},
) {
  const temCorpo = corpo !== undefined || corpoBruto !== undefined;
  const resposta = await fetch(`${BASE}${caminho}`, {
    method: metodo,
    headers: {
      ...(temCorpo && { "Content-Type": "application/json" }),
      ...(cookie && { Cookie: cookie }),
    },
    body:
      corpoBruto ?? (corpo !== undefined ? JSON.stringify(corpo) : undefined),
  });

  const texto = await resposta.text();
  let json = null;
  try {
    json = texto ? JSON.parse(texto) : null;
  } catch {
    // resposta que não é JSON: mantém null
  }
  return { status: resposta.status, corpo: json, headers: resposta.headers };
}

// Uma imagem PNG de 1x1 pixel, para os testes de foto.
export const PNG_PEQUENO = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

// Envia um arquivo como formulário (multipart), no campo "foto".
// O Content-Type do formulário é montado pelo próprio fetch.
export async function enviarFoto(
  caminho,
  { metodo = "POST", cookie, bytes = PNG_PEQUENO, tipo = "image/png" } = {},
) {
  const formulario = new FormData();
  formulario.append("foto", new Blob([bytes], { type: tipo }), "foto.png");

  const resposta = await fetch(`${BASE}${caminho}`, {
    method: metodo,
    headers: cookie ? { Cookie: cookie } : {},
    body: formulario,
  });
  const texto = await resposta.text();
  let json = null;
  try {
    json = texto ? JSON.parse(texto) : null;
  } catch {
    // resposta que não é JSON: mantém null
  }
  return { status: resposta.status, corpo: json };
}

// Baixa uma imagem e devolve o status, o tipo e os bytes.
export async function baixar(caminho, { cookie } = {}) {
  const resposta = await fetch(`${BASE}${caminho}`, {
    headers: cookie ? { Cookie: cookie } : {},
  });
  return {
    status: resposta.status,
    tipo: resposta.headers.get("content-type"),
    bytes: Buffer.from(await resposta.arrayBuffer()),
  };
}

// ---------- fábricas de dados ----------

async function cadastrar(corpo) {
  const r = await api("/api/v1/usuarios", { metodo: "POST", corpo });
  if (r.status !== 201) {
    throw new Error(
      `falha ao cadastrar: ${r.status} ${JSON.stringify(r.corpo)}`,
    );
  }
  return r.corpo;
}

export async function logar(email, senha = SENHA) {
  const r = await api("/api/v1/sessao", {
    metodo: "POST",
    corpo: { email, senha },
  });
  if (r.status !== 200) {
    throw new Error(`falha no login: ${r.status} ${JSON.stringify(r.corpo)}`);
  }
  // "sessao=<token>; Path=/; HttpOnly; ..." -> só o par nome=valor
  return r.headers.getSetCookie()[0].split(";")[0];
}

export async function novaOng() {
  const email = emailUnico();
  const usuario = await cadastrar({
    tipo: "ong",
    nome: "ONG de Teste",
    email,
    senha: SENHA,
    cnpj: cnpjUnico(),
  });
  return { id: usuario.id_usuario, email, cookie: await logar(email) };
}

export async function novoDoador() {
  const email = emailUnico();
  const usuario = await cadastrar({
    tipo: "doador",
    nome: "Doador de Teste",
    email,
    senha: SENHA,
  });
  return { id: usuario.id_usuario, email, cookie: await logar(email) };
}

export async function criarCampanha(cookie, dados = {}) {
  const r = await api("/api/v1/campanhas", {
    metodo: "POST",
    cookie,
    corpo: {
      titulo: "Campanha de teste",
      meta: 1000,
      // sem descrição a campanha não pode ser publicada
      descricao: "Campanha criada pelos testes automatizados do Connect.",
      ...dados,
    },
  });
  if (r.status !== 201) {
    throw new Error(
      `falha ao criar campanha: ${r.status} ${JSON.stringify(r.corpo)}`,
    );
  }
  return r.corpo;
}

export async function mudarStatusCampanha(cookie, id, status) {
  const r = await api(`/api/v1/campanhas/${id}`, {
    metodo: "PATCH",
    cookie,
    corpo: { status },
  });
  if (r.status !== 200) {
    throw new Error(
      `falha ao mudar status: ${r.status} ${JSON.stringify(r.corpo)}`,
    );
  }
  return r.corpo;
}

export async function criarCampanhaAtiva(cookie, dados) {
  const campanha = await criarCampanha(cookie, dados);
  return mudarStatusCampanha(cookie, campanha.id_campanha, "ativa");
}

export async function criarDonatario(cookie, dados = {}) {
  const r = await api("/api/v1/donatarios", {
    metodo: "POST",
    cookie,
    corpo: { nome: "Família de Teste", contato: "(84) 99999-0000", ...dados },
  });
  if (r.status !== 201) {
    throw new Error(
      `falha ao criar donatário: ${r.status} ${JSON.stringify(r.corpo)}`,
    );
  }
  return r.corpo;
}

// Coloca o fim da campanha no passado (ontem), direto no banco.
// A API não deixa escolher uma data passada, mas o tempo passa: é assim que
// testamos uma campanha cujo prazo acabou.
export async function terminarPrazoNoBanco(idCampanha) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      "UPDATE campanha SET termina_em = CURRENT_DATE - 1 WHERE id_campanha = $1",
      [idCampanha],
    );
  } finally {
    await client.end();
  }
}

// ---------- limpeza ----------

// Apaga somente o que pertence a usuários de teste (e-mail @teste.connect),
// na ordem que as chaves estrangeiras exigem.
export async function limparDadosDeTeste() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL não está definida; não é possível limpar os dados de teste.",
    );
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const teste = `(SELECT id_usuario FROM usuario WHERE email LIKE '%@${DOMINIO}')`;
    await client.query("BEGIN");
    await client.query(`
      DELETE FROM doacao
      WHERE id_doador IN ${teste}
         OR id_campanha IN (SELECT id_campanha FROM campanha WHERE id_ong IN ${teste})`);
    await client.query(`DELETE FROM donatario WHERE id_ong IN ${teste}`);
    await client.query(`DELETE FROM campanha WHERE id_ong IN ${teste}`);
    await client.query(`DELETE FROM usuario WHERE email LIKE '%@${DOMINIO}'`);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}
