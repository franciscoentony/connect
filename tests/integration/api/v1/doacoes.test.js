import {
  api,
  aguardarServidor,
  limparDadosDeTeste,
  novaOng,
  novoDoador,
  criarCampanha,
  criarCampanhaAtiva,
  mudarStatusCampanha,
  terminarPrazoNoBanco,
} from "../../../orchestrator.js";

let ong, outraOng, doador, outroDoador, metodoId;

beforeAll(async () => {
  await aguardarServidor();
  [ong, outraOng, doador, outroDoador] = await Promise.all([
    novaOng(),
    novaOng(),
    novoDoador(),
    novoDoador(),
  ]);

  const metodos = await api("/api/v1/metodos-pagamento");
  if (metodos.status !== 200 || metodos.corpo.length === 0) {
    throw new Error(
      "Nenhum método de pagamento cadastrado. Rode as migrations antes dos testes.",
    );
  }
  metodoId = metodos.corpo[0].id_metodo;
});
afterAll(limparDadosDeTeste);

const doar = (cookie, idCampanha, corpo) =>
  api(`/api/v1/campanhas/${idCampanha}/doacoes`, {
    metodo: "POST",
    cookie,
    corpo,
  });

const mudarStatus = (cookie, idDoacao, status) =>
  api(`/api/v1/doacoes/${idDoacao}`, {
    metodo: "PATCH",
    cookie,
    corpo: { status },
  });

const arrecadado = async (idCampanha) => {
  const r = await api(`/api/v1/campanhas/${idCampanha}`);
  return Number(r.corpo.arrecadado);
};

describe("GET /api/v1/metodos-pagamento", () => {
  test("é público e lista os métodos cadastrados", async () => {
    const r = await api("/api/v1/metodos-pagamento");

    expect(r.status).toBe(200);
    expect(r.corpo[0]).toEqual(
      expect.objectContaining({
        id_metodo: expect.anything(),
        nome: expect.any(String),
      }),
    );
  });
});

describe("quem pode doar, e para quê", () => {
  let ativa, rascunho;

  beforeAll(async () => {
    ativa = await criarCampanhaAtiva(ong.cookie, { titulo: "Recebe doações" });
    rascunho = await criarCampanha(ong.cookie, { titulo: "Em rascunho" });
  });

  const dinheiro = () => ({ tipo: "dinheiro", valor: 20, id_metodo: metodoId });

  test("sem login retorna 401 e ONG retorna 403", async () => {
    expect((await doar(undefined, ativa.id_campanha, dinheiro())).status).toBe(
      401,
    );
    expect((await doar(ong.cookie, ativa.id_campanha, dinheiro())).status).toBe(
      403,
    );
  });

  test("campanha em rascunho não recebe doações (409)", async () => {
    const r = await doar(doador.cookie, rascunho.id_campanha, dinheiro());

    expect(r.status).toBe(409);
  });

  test("campanha inexistente retorna 404", async () => {
    const r = await doar(doador.cookie, "999999999", dinheiro());

    expect(r.status).toBe(404);
  });

  test("campanha encerrada deixa de receber doações (409)", async () => {
    const encerrada = await criarCampanhaAtiva(ong.cookie, {
      titulo: "Vai encerrar",
    });
    await mudarStatusCampanha(ong.cookie, encerrada.id_campanha, "encerrada");

    const r = await doar(doador.cookie, encerrada.id_campanha, dinheiro());

    expect(r.status).toBe(409);
  });
});

describe("doação em dinheiro", () => {
  let campanha;

  beforeAll(async () => {
    campanha = await criarCampanhaAtiva(ong.cookie, { titulo: "Dinheiro" });
  });

  test("doação válida nasce pendente, com valor e método", async () => {
    const r = await doar(doador.cookie, campanha.id_campanha, {
      tipo: "dinheiro",
      valor: 50,
      id_metodo: metodoId,
    });

    expect(r.status).toBe(201);
    expect(r.corpo.status).toBe("pendente");
    expect(Number(r.corpo.valor)).toBe(50);
    expect(r.corpo.id_doador).toBe(doador.id);
    expect(r.corpo.metodo_nome).toEqual(expect.any(String));
  });

  test.each([
    ["sem método de pagamento", { tipo: "dinheiro", valor: 10 }],
    [
      "com método que não existe",
      { tipo: "dinheiro", valor: 10, id_metodo: 999999999 },
    ],
    [
      "com mais de 2 casas decimais",
      { tipo: "dinheiro", valor: 10.555, id_metodo: 1 },
    ],
    ["com valor zero", { tipo: "dinheiro", valor: 0, id_metodo: 1 }],
    ["com valor negativo", { tipo: "dinheiro", valor: -5, id_metodo: 1 }],
    [
      "com valor que não é número",
      { tipo: "dinheiro", valor: "abc", id_metodo: 1 },
    ],
    ["com tipo inválido", { tipo: "cripto", valor: 10, id_metodo: 1 }],
  ])("rejeita doação %s com 400", async (_descricao, corpo) => {
    const r = await doar(doador.cookie, campanha.id_campanha, corpo);

    expect(r.status).toBe(400);
  });
});

describe("doação em item", () => {
  let campanha;

  beforeAll(async () => {
    campanha = await criarCampanhaAtiva(ong.cookie, { titulo: "Itens" });
  });

  test("aceita descrição e ignora valor e método enviados por engano", async () => {
    const r = await doar(doador.cookie, campanha.id_campanha, {
      tipo: "item",
      descricao: "10 cestas básicas",
      valor: 100,
      id_metodo: metodoId,
    });

    expect(r.status).toBe(201);
    expect(r.corpo.descricao).toBe("10 cestas básicas");
    expect(r.corpo.valor).toBeNull();
    expect(r.corpo.id_metodo).toBeNull();
  });

  test("exige descrição (400)", async () => {
    const r = await doar(doador.cookie, campanha.id_campanha, { tipo: "item" });

    expect(r.status).toBe(400);
  });
});

describe("confirmação, cancelamento e total arrecadado", () => {
  let campanha;

  beforeAll(async () => {
    campanha = await criarCampanhaAtiva(ong.cookie, { titulo: "Arrecadação" });
  });

  const criar = async (corpo, cookie = doador.cookie) => {
    const r = await doar(cookie, campanha.id_campanha, corpo);
    expect(r.status).toBe(201);
    return r.corpo;
  };

  test("só doações confirmadas, em dinheiro, entram no total arrecadado", async () => {
    expect(await arrecadado(campanha.id_campanha)).toBe(0);

    const pendente = await criar({
      tipo: "dinheiro",
      valor: 50,
      id_metodo: metodoId,
    });
    expect(await arrecadado(campanha.id_campanha)).toBe(0); // pendente não conta

    expect(
      (await mudarStatus(ong.cookie, pendente.id_doacao, "confirmada")).status,
    ).toBe(200);
    expect(await arrecadado(campanha.id_campanha)).toBe(50);

    const item = await criar({ tipo: "item", descricao: "Cobertores" });
    await mudarStatus(ong.cookie, item.id_doacao, "confirmada");
    expect(await arrecadado(campanha.id_campanha)).toBe(50); // item não soma

    const cancelada = await criar({
      tipo: "dinheiro",
      valor: 30,
      id_metodo: metodoId,
    });
    await mudarStatus(doador.cookie, cancelada.id_doacao, "cancelada");
    expect(await arrecadado(campanha.id_campanha)).toBe(50); // cancelada não soma
  });

  test("o doador não confirma a própria doação (403)", async () => {
    const d = await criar({ tipo: "item", descricao: "Brinquedos" });

    const r = await mudarStatus(doador.cookie, d.id_doacao, "confirmada");

    expect(r.status).toBe(403);
  });

  test("outra ONG não enxerga nem altera a doação (404)", async () => {
    const d = await criar({ tipo: "item", descricao: "Roupas" });

    const r = await mudarStatus(outraOng.cookie, d.id_doacao, "confirmada");

    expect(r.status).toBe(404);
  });

  test("uma doação já resolvida não muda mais (409)", async () => {
    const d = await criar({ tipo: "item", descricao: "Livros" });
    expect(
      (await mudarStatus(ong.cookie, d.id_doacao, "confirmada")).status,
    ).toBe(200);

    expect(
      (await mudarStatus(ong.cookie, d.id_doacao, "confirmada")).status,
    ).toBe(409);
    expect(
      (await mudarStatus(ong.cookie, d.id_doacao, "cancelada")).status,
    ).toBe(409);
    expect(
      (await mudarStatus(doador.cookie, d.id_doacao, "cancelada")).status,
    ).toBe(409);
  });

  test("status que não pode ser pedido retorna 400", async () => {
    const d = await criar({ tipo: "item", descricao: "Material escolar" });

    const r = await mudarStatus(ong.cookie, d.id_doacao, "pendente");

    expect(r.status).toBe(400);
  });
});

describe("privacidade das doações", () => {
  let campanha, doacaoDoDoador, doacaoDoOutro;

  beforeAll(async () => {
    campanha = await criarCampanhaAtiva(ong.cookie, { titulo: "Privacidade" });
    doacaoDoDoador = (
      await doar(doador.cookie, campanha.id_campanha, {
        tipo: "item",
        descricao: "Item A",
      })
    ).corpo;
    doacaoDoOutro = (
      await doar(outroDoador.cookie, campanha.id_campanha, {
        tipo: "item",
        descricao: "Item B",
      })
    ).corpo;
  });

  test("'minhas doações' traz só as do doador logado", async () => {
    const r = await api("/api/v1/doacoes?limite=50", { cookie: doador.cookie });
    const ids = r.corpo.itens.map((d) => d.id_doacao);

    expect(r.status).toBe(200);
    expect(ids).toContain(doacaoDoDoador.id_doacao);
    expect(ids).not.toContain(doacaoDoOutro.id_doacao);
    expect(r.corpo.itens.every((d) => d.id_doador === doador.id)).toBe(true);
  });

  test("ONG não usa a rota de 'minhas doações' (403)", async () => {
    expect((await api("/api/v1/doacoes", { cookie: ong.cookie })).status).toBe(
      403,
    );
  });

  test("a doação só é visível ao doador dono e à ONG dona", async () => {
    const url = `/api/v1/doacoes/${doacaoDoDoador.id_doacao}`;

    expect((await api(url, { cookie: doador.cookie })).status).toBe(200);
    expect((await api(url, { cookie: ong.cookie })).status).toBe(200);
    expect((await api(url, { cookie: outroDoador.cookie })).status).toBe(404);
    expect((await api(url, { cookie: outraOng.cookie })).status).toBe(404);
    expect((await api(url)).status).toBe(401);
  });

  test("a ONG dona lista as doações da campanha; outros não", async () => {
    const url = `/api/v1/campanhas/${campanha.id_campanha}/doacoes?limite=50`;

    const dona = await api(url, { cookie: ong.cookie });
    expect(dona.status).toBe(200);
    expect(dona.corpo.itens.map((d) => d.id_doacao)).toEqual(
      expect.arrayContaining([
        doacaoDoDoador.id_doacao,
        doacaoDoOutro.id_doacao,
      ]),
    );

    expect((await api(url, { cookie: outraOng.cookie })).status).toBe(403);
    expect((await api(url, { cookie: doador.cookie })).status).toBe(403);
    expect((await api(url)).status).toBe(401);
  });

  test("a resposta não expõe e-mail nem dados da senha do doador", async () => {
    const r = await api(`/api/v1/doacoes/${doacaoDoDoador.id_doacao}`, {
      cookie: ong.cookie,
    });

    expect(r.corpo).not.toHaveProperty("email");
    expect(r.corpo).not.toHaveProperty("senha_hash");
  });
});

describe("campanha com prazo encerrado", () => {
  test("não recebe novas doações depois da data de término (409)", async () => {
    const campanha = await criarCampanhaAtiva(ong.cookie, {
      titulo: "Prazo acabou",
    });
    await terminarPrazoNoBanco(campanha.id_campanha);

    const r = await api(`/api/v1/campanhas/${campanha.id_campanha}/doacoes`, {
      metodo: "POST",
      cookie: doador.cookie,
      corpo: { tipo: "item", descricao: "3 cobertores" },
    });

    expect(r.status).toBe(409);
    expect(r.corpo.erro).toBe("o prazo desta campanha já terminou");
  });
});
