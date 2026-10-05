import {
  api,
  aguardarServidor,
  limparDadosDeTeste,
  emailUnico,
  cnpjUnico,
  SENHA,
} from "../../../orchestrator.js";

beforeAll(aguardarServidor);
afterAll(limparDadosDeTeste);

const cadastrar = (corpo) => api("/api/v1/usuarios", { metodo: "POST", corpo });

const dadosDoador = (extra = {}) => ({
  tipo: "doador",
  nome: "Maria Souza",
  email: emailUnico(),
  senha: SENHA,
  ...extra,
});

const dadosOng = (extra = {}) => ({
  tipo: "ong",
  nome: "Amigos do Bem",
  email: emailUnico(),
  senha: SENHA,
  cnpj: cnpjUnico(),
  ...extra,
});

const mascarar = (c) =>
  `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`;

describe("POST /api/v1/usuarios", () => {
  test("cadastra um doador e não devolve nada da senha", async () => {
    const r = await cadastrar(dadosDoador());

    expect(r.status).toBe(201);
    expect(r.corpo.tipo).toBe("doador");
    expect(r.corpo.id_usuario).toBeDefined();
    expect(r.corpo).not.toHaveProperty("senha");
    expect(r.corpo).not.toHaveProperty("senha_hash");
  });

  test("cadastra uma ONG aceitando CNPJ com máscara", async () => {
    const r = await cadastrar(dadosOng({ cnpj: mascarar(cnpjUnico()) }));

    expect(r.status).toBe(201);
    expect(r.corpo.tipo).toBe("ong");
  });

  test("e-mail repetido retorna 409, mesmo com outra caixa de letras", async () => {
    const dados = dadosDoador();
    expect((await cadastrar(dados)).status).toBe(201);

    const r = await cadastrar({ ...dados, email: dados.email.toUpperCase() });

    expect(r.status).toBe(409);
    expect(r.corpo.erro).toMatch(/e-mail/i);
  });

  test("CNPJ repetido retorna 409, mesmo com máscara diferente", async () => {
    const cnpj = cnpjUnico();
    expect((await cadastrar(dadosOng({ cnpj }))).status).toBe(201);

    const r = await cadastrar(dadosOng({ cnpj: mascarar(cnpj) }));

    expect(r.status).toBe(409);
    expect(r.corpo.erro).toMatch(/CNPJ/i);
  });

  test("se o perfil falha, o usuário também não é criado (atomicidade)", async () => {
    const cnpj = cnpjUnico();
    await cadastrar(dadosOng({ cnpj }));

    // este cadastro falha por CNPJ duplicado...
    const email = emailUnico();
    const falha = await cadastrar(dadosOng({ email, cnpj }));
    expect(falha.status).toBe(409);

    // ...e o e-mail dele não pode ter sido "gasto"
    const retry = await cadastrar(dadosOng({ email, cnpj: cnpjUnico() }));
    expect(retry.status).toBe(201);
  });

  test.each([
    ["tipo inválido", () => dadosDoador({ tipo: "admin" })],
    ["e-mail inválido", () => dadosDoador({ email: "nao-e-um-email" })],
    ["senha curta demais", () => dadosDoador({ senha: "123" })],
    ["senha longa demais", () => dadosDoador({ senha: "a".repeat(73) })],
    ["nome vazio", () => dadosDoador({ nome: "  " })],
    ["ONG sem CNPJ", () => dadosOng({ cnpj: undefined })],
    ["CNPJ com tamanho errado", () => dadosOng({ cnpj: "123" })],
  ])("rejeita %s com 400", async (_descricao, montarDados) => {
    const r = await cadastrar(montarDados());

    expect(r.status).toBe(400);
    expect(r.corpo.erro).toBeDefined();
  });

  test("corpo que não é JSON retorna 400", async () => {
    const r = await api("/api/v1/usuarios", {
      metodo: "POST",
      corpoBruto: "{isso nao e json",
    });

    expect(r.status).toBe(400);
  });
});

describe("GET /api/v1/usuarios", () => {
  test("não existe: a lista de usuários não pode ser pública", async () => {
    const r = await api("/api/v1/usuarios");

    expect(r.status).toBe(405);
  });
});
