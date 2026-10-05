import {
  api,
  aguardarServidor,
  limparDadosDeTeste,
  novaOng,
  novoDoador,
} from "../../../orchestrator.js";

let ong, doador;

beforeAll(async () => {
  await aguardarServidor();
  ong = await novaOng();
  doador = await novoDoador();
});
afterAll(limparDadosDeTeste);

const alterarPerfil = (cookie, corpo) =>
  api("/api/v1/perfil", { metodo: "PATCH", cookie, corpo });

describe("PATCH /api/v1/perfil", () => {
  test("sem login retorna 401", async () => {
    const r = await alterarPerfil(undefined, { nome: "Novo nome" });

    expect(r.status).toBe(401);
  });

  test("doador altera o próprio nome", async () => {
    const r = await alterarPerfil(doador.cookie, { nome: "  Maria Souza  " });

    expect(r.status).toBe(200);
    expect(r.corpo.nome).toBe("Maria Souza");

    const sessao = await api("/api/v1/sessao", { cookie: doador.cookie });
    expect(sessao.corpo.nome).toBe("Maria Souza");
  });

  test("ONG altera o próprio nome, e o CNPJ continua o mesmo", async () => {
    const antes = await api("/api/v1/sessao", { cookie: ong.cookie });

    const r = await alterarPerfil(ong.cookie, {
      nome: "Amigos do Bem",
      cnpj: "00000000000000",
    });

    expect(r.status).toBe(200);
    expect(r.corpo.nome).toBe("Amigos do Bem");
    expect(r.corpo.cnpj).toBe(antes.corpo.cnpj);
  });

  test.each([
    ["sem nome", {}],
    ["nome curto demais", { nome: "x" }],
    ["nome longo demais", { nome: "a".repeat(151) }],
  ])("rejeita %s com 400", async (_descricao, corpo) => {
    const r = await alterarPerfil(doador.cookie, corpo);

    expect(r.status).toBe(400);
  });
});
