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

describe("PATCH /api/v1/perfil (descrição, site e contato da ONG)", () => {
  test("ONG salva descrição, site e contato, e eles ficam públicos", async () => {
    const r = await alterarPerfil(ong.cookie, {
      descricao: "  Levamos alimento a quem precisa.  ",
      site: "amigos.org.br",
      contato: "(84) 99999-0000",
    });

    expect(r.status).toBe(200);
    expect(r.corpo.descricao).toBe("Levamos alimento a quem precisa.");
    expect(r.corpo.site).toBe("https://amigos.org.br"); // ganhou https://
    expect(r.corpo.contato).toBe("(84) 99999-0000");

    const publica = await api(`/api/v1/ongs/${ong.id}`);
    expect(publica.corpo.descricao).toBe("Levamos alimento a quem precisa.");
    expect(publica.corpo.site).toBe("https://amigos.org.br");
    expect(publica.corpo.contato).toBe("(84) 99999-0000");
  });

  test("campos não enviados continuam iguais", async () => {
    await alterarPerfil(ong.cookie, { site: "https://antes.org" });

    const r = await alterarPerfil(ong.cookie, { contato: "ong@teste.org" });

    expect(r.status).toBe(200);
    expect(r.corpo.site).toBe("https://antes.org");
  });

  test("texto vazio apaga o campo", async () => {
    await alterarPerfil(ong.cookie, { descricao: "algo" });

    const r = await alterarPerfil(ong.cookie, { descricao: "" });

    expect(r.status).toBe(200);
    expect(r.corpo.descricao).toBeNull();
  });

  test.each([
    ["link javascript:", { site: "javascript:alert(1)" }],
    ["protocolo que não é http", { site: "ftp://amigos.org" }],
    ["site sem ponto", { site: "amigos" }],
    ["descrição longa demais", { descricao: "a".repeat(501) }],
    ["contato longo demais", { contato: "a".repeat(151) }],
  ])("rejeita %s com 400", async (_descricao, corpo) => {
    const r = await alterarPerfil(ong.cookie, corpo);

    expect(r.status).toBe(400);
  });

  test("doador não tem esses campos (400 se mandar só eles)", async () => {
    const r = await alterarPerfil(doador.cookie, { site: "amigos.org" });

    expect(r.status).toBe(400);
  });
});
