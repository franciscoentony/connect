import {
  api,
  aguardarServidor,
  limparDadosDeTeste,
  novaOng,
  novoDoador,
  criarCampanha,
  criarCampanhaAtiva,
  mudarStatusCampanha,
} from "../../../orchestrator.js";

let ong, outraOng, doador;

beforeAll(async () => {
  await aguardarServidor();
  [ong, outraOng, doador] = await Promise.all([
    novaOng(),
    novaOng(),
    novoDoador(),
  ]);
});
afterAll(limparDadosDeTeste);

const patch = (id, cookie, corpo) =>
  api(`/api/v1/campanhas/${id}`, { metodo: "PATCH", cookie, corpo });

describe("POST /api/v1/campanhas", () => {
  test("exige login (401) e perfil de ONG (403)", async () => {
    const corpo = { titulo: "Campanha de teste" };

    const semLogin = await api("/api/v1/campanhas", { metodo: "POST", corpo });
    const comoDoador = await api("/api/v1/campanhas", {
      metodo: "POST",
      cookie: doador.cookie,
      corpo,
    });

    expect(semLogin.status).toBe(401);
    expect(comoDoador.status).toBe(403);
  });

  test("a campanha nasce como rascunho, mesmo que o cliente peça outro status", async () => {
    const r = await api("/api/v1/campanhas", {
      metodo: "POST",
      cookie: ong.cookie,
      corpo: { titulo: "Cestas de Natal", meta: 5000, status: "ativa" },
    });

    expect(r.status).toBe(201);
    expect(r.corpo.status).toBe("rascunho");
    expect(r.corpo.id_ong).toBe(ong.id);
    expect(Number(r.corpo.meta)).toBe(5000);
    expect(Number(r.corpo.arrecadado)).toBe(0);
  });

  test.each([
    ["sem título", { meta: 100 }],
    ["título curto demais", { titulo: "ab" }],
    ["meta negativa", { titulo: "Campanha válida", meta: -5 }],
    ["meta que não é número", { titulo: "Campanha válida", meta: "abc" }],
  ])("rejeita %s com 400", async (_descricao, corpo) => {
    const r = await api("/api/v1/campanhas", {
      metodo: "POST",
      cookie: ong.cookie,
      corpo,
    });

    expect(r.status).toBe(400);
  });
});

describe("visibilidade", () => {
  let rascunho, ativa;

  beforeAll(async () => {
    rascunho = await criarCampanha(ong.cookie, { titulo: "Ainda em rascunho" });
    ativa = await criarCampanhaAtiva(ong.cookie, { titulo: "Já está ativa" });
  });

  test("rascunho é 404 para o público e para outra ONG, mas 200 para a dona", async () => {
    const url = `/api/v1/campanhas/${rascunho.id_campanha}`;

    expect((await api(url)).status).toBe(404);
    expect((await api(url, { cookie: outraOng.cookie })).status).toBe(404);
    expect((await api(url, { cookie: ong.cookie })).status).toBe(200);
  });

  test("a listagem pública mostra só campanhas ativas", async () => {
    const r = await api("/api/v1/campanhas?limite=50");
    const ids = r.corpo.itens.map((c) => c.id_campanha);

    expect(r.status).toBe(200);
    expect(ids).toContain(ativa.id_campanha);
    expect(ids).not.toContain(rascunho.id_campanha);
    expect(r.corpo.itens.every((c) => c.status === "ativa")).toBe(true);
  });

  test("?minhas=true lista só as da ONG logada, inclusive rascunhos", async () => {
    const r = await api("/api/v1/campanhas?minhas=true&limite=50", {
      cookie: ong.cookie,
    });
    const ids = r.corpo.itens.map((c) => c.id_campanha);

    expect(r.status).toBe(200);
    expect(ids).toContain(rascunho.id_campanha);
    expect(r.corpo.itens.every((c) => c.id_ong === ong.id)).toBe(true);
  });

  test("?minhas=true exige ser ONG", async () => {
    expect((await api("/api/v1/campanhas?minhas=true")).status).toBe(401);
    expect(
      (await api("/api/v1/campanhas?minhas=true", { cookie: doador.cookie }))
        .status,
    ).toBe(403);
  });

  test("id inválido ou inexistente retorna 404", async () => {
    expect((await api("/api/v1/campanhas/abc")).status).toBe(404);
    expect((await api("/api/v1/campanhas/999999999")).status).toBe(404);
  });
});

describe("listagem por ONG e paginação", () => {
  let ativaDaOng, rascunhoDaOng, ativaDeOutra;

  beforeAll(async () => {
    ativaDaOng = await criarCampanhaAtiva(ong.cookie, {
      titulo: "Ativa da ONG",
    });
    rascunhoDaOng = await criarCampanha(ong.cookie, {
      titulo: "Rascunho da ONG",
    });
    ativaDeOutra = await criarCampanhaAtiva(outraOng.cookie, {
      titulo: "Ativa de outra",
    });
  });

  test("?ong=ID mostra só as campanhas ativas daquela ONG, sem login", async () => {
    const r = await api(`/api/v1/campanhas?ong=${ong.id}&limite=50`);
    const ids = r.corpo.itens.map((c) => c.id_campanha);

    expect(r.status).toBe(200);
    expect(ids).toContain(ativaDaOng.id_campanha);
    expect(ids).not.toContain(rascunhoDaOng.id_campanha);
    expect(ids).not.toContain(ativaDeOutra.id_campanha);
  });

  test("?ong com id inválido retorna 404", async () => {
    expect((await api("/api/v1/campanhas?ong=abc")).status).toBe(404);
  });

  test("a resposta traz o total e o número de páginas", async () => {
    const todas = await api("/api/v1/campanhas?minhas=true&limite=50", {
      cookie: ong.cookie,
    });
    const total = todas.corpo.paginacao.total;
    expect(total).toBe(todas.corpo.itens.length);

    const r = await api("/api/v1/campanhas?minhas=true&limite=1&pagina=2", {
      cookie: ong.cookie,
    });

    expect(r.status).toBe(200);
    expect(r.corpo.itens).toHaveLength(1);
    expect(r.corpo.paginacao).toEqual({
      pagina: 2,
      limite: 1,
      total,
      total_paginas: total,
    });
  });
});

describe("ciclo de vida (PATCH)", () => {
  let campanha;

  beforeAll(async () => {
    campanha = await criarCampanha(ong.cookie, { titulo: "Ciclo de vida" });
  });

  test("rascunho não pode ir direto para encerrada (409)", async () => {
    const r = await patch(campanha.id_campanha, ong.cookie, {
      status: "encerrada",
    });

    expect(r.status).toBe(409);
  });

  test("só a ONG dona altera: doador 403, outra ONG 403, sem login 401", async () => {
    const id = campanha.id_campanha;
    const corpo = { titulo: "Título novo" };

    expect((await patch(id, undefined, corpo)).status).toBe(401);
    expect((await patch(id, doador.cookie, corpo)).status).toBe(403);
    expect((await patch(id, outraOng.cookie, corpo)).status).toBe(403);
  });

  test("a dona ativa a campanha e edita o título", async () => {
    const r = await patch(campanha.id_campanha, ong.cookie, {
      status: "ativa",
      titulo: "Título atualizado",
    });

    expect(r.status).toBe(200);
    expect(r.corpo.status).toBe("ativa");
    expect(r.corpo.titulo).toBe("Título atualizado");
  });

  test("status que não existe e PATCH vazio são rejeitados", async () => {
    const id = campanha.id_campanha;

    expect((await patch(id, ong.cookie, { status: "inventado" })).status).toBe(
      409,
    );
    expect((await patch(id, ong.cookie, {})).status).toBe(400);
  });

  test("campanha encerrada fica congelada (409)", async () => {
    const id = campanha.id_campanha;
    expect((await patch(id, ong.cookie, { status: "encerrada" })).status).toBe(
      200,
    );

    const r = await patch(id, ong.cookie, { titulo: "Tarde demais" });

    expect(r.status).toBe(409);
  });
});

describe("locais de entrega", () => {
  let campanha;
  const local = { endereco: "Rua das Flores, 100", cidade: "Natal" };

  beforeAll(async () => {
    campanha = await criarCampanhaAtiva(ong.cookie, { titulo: "Com locais" });
  });

  const url = () => `/api/v1/campanhas/${campanha.id_campanha}/locais`;

  test("só a ONG dona cria local", async () => {
    expect((await api(url(), { metodo: "POST", corpo: local })).status).toBe(
      401,
    );
    expect(
      (
        await api(url(), {
          metodo: "POST",
          cookie: doador.cookie,
          corpo: local,
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await api(url(), {
          metodo: "POST",
          cookie: outraOng.cookie,
          corpo: local,
        })
      ).status,
    ).toBe(403);
  });

  test("dados inválidos retornam 400", async () => {
    const r = await api(url(), {
      metodo: "POST",
      cookie: ong.cookie,
      corpo: { endereco: "x", cidade: "" },
    });

    expect(r.status).toBe(400);
  });

  test("cria, lista publicamente e remove um local", async () => {
    const criado = await api(url(), {
      metodo: "POST",
      cookie: ong.cookie,
      corpo: local,
    });
    expect(criado.status).toBe(201);
    expect(criado.corpo.cidade).toBe("Natal");

    const lista = await api(url());
    expect(lista.status).toBe(200);
    expect(lista.corpo.map((l) => l.id_local)).toContain(criado.corpo.id_local);

    const urlLocal = `${url()}/${criado.corpo.id_local}`;
    expect(
      (await api(urlLocal, { metodo: "DELETE", cookie: outraOng.cookie }))
        .status,
    ).toBe(403);
    expect(
      (await api(urlLocal, { metodo: "DELETE", cookie: ong.cookie })).status,
    ).toBe(204);
    expect(
      (await api(urlLocal, { metodo: "DELETE", cookie: ong.cookie })).status,
    ).toBe(404);
  });

  test("campanha encerrada não aceita novos locais (409)", async () => {
    await mudarStatusCampanha(ong.cookie, campanha.id_campanha, "encerrada");

    const r = await api(url(), {
      metodo: "POST",
      cookie: ong.cookie,
      corpo: local,
    });

    expect(r.status).toBe(409);
  });
});
