import {
  api,
  aguardarServidor,
  limparDadosDeTeste,
  novaOng,
  novoDoador,
  criarCampanha,
  criarCampanhaAtiva,
  mudarStatusCampanha,
  criarDonatario,
} from "../../../orchestrator.js";

let ong, outraOng, doador;

beforeAll(async () => {
  await aguardarServidor();
  [ong, outraOng, doador] = await Promise.all([novaOng(), novaOng(), novoDoador()]);
});
afterAll(limparDadosDeTeste);

const vincular = (cookie, idCampanha, idDonatario) =>
  api(`/api/v1/campanhas/${idCampanha}/donatarios`, {
    metodo: "POST",
    cookie,
    corpo: { id_donatario: idDonatario },
  });

describe("/api/v1/donatarios", () => {
  test("exige login (401) e perfil de ONG (403)", async () => {
    expect((await api("/api/v1/donatarios")).status).toBe(401);
    expect((await api("/api/v1/donatarios", { cookie: doador.cookie })).status).toBe(403);

    const post = await api("/api/v1/donatarios", {
      metodo: "POST",
      cookie: doador.cookie,
      corpo: { nome: "Alguém" },
    });
    expect(post.status).toBe(403);
  });

  test("cadastra, valida e lista só os donatários da própria ONG", async () => {
    const criado = await criarDonatario(ong.cookie, { nome: "Família Silva" });
    expect(criado.nome).toBe("Família Silva");
    expect(criado.id_donatario).toBeDefined();

    const invalido = await api("/api/v1/donatarios", {
      metodo: "POST",
      cookie: ong.cookie,
      corpo: { nome: "x" },
    });
    expect(invalido.status).toBe(400);

    const minha = await api("/api/v1/donatarios?limite=50", { cookie: ong.cookie });
    const dela = await api("/api/v1/donatarios?limite=50", { cookie: outraOng.cookie });
    expect(minha.corpo.map((d) => d.id_donatario)).toContain(criado.id_donatario);
    expect(dela.corpo.map((d) => d.id_donatario)).not.toContain(criado.id_donatario);
  });

  test("outra ONG não vê, não edita e não apaga (404, não 403)", async () => {
    const d = await criarDonatario(ong.cookie);
    const url = `/api/v1/donatarios/${d.id_donatario}`;

    expect((await api(url, { cookie: outraOng.cookie })).status).toBe(404);
    expect(
      (await api(url, { metodo: "PATCH", cookie: outraOng.cookie, corpo: { nome: "Invasor" } }))
        .status,
    ).toBe(404);
    expect((await api(url, { metodo: "DELETE", cookie: outraOng.cookie })).status).toBe(404);

    // e o registro continua intacto para a dona
    const intacto = await api(url, { cookie: ong.cookie });
    expect(intacto.status).toBe(200);
    expect(intacto.corpo.nome).toBe(d.nome);
  });

  test("edita nome e contato, e aceita limpar o contato", async () => {
    const d = await criarDonatario(ong.cookie);
    const url = `/api/v1/donatarios/${d.id_donatario}`;

    const editado = await api(url, {
      metodo: "PATCH",
      cookie: ong.cookie,
      corpo: { nome: "Nome novo", contato: null },
    });

    expect(editado.status).toBe(200);
    expect(editado.corpo.nome).toBe("Nome novo");
    expect(editado.corpo.contato).toBeNull();

    const vazio = await api(url, { metodo: "PATCH", cookie: ong.cookie, corpo: {} });
    expect(vazio.status).toBe(400);
  });

  test("id inválido retorna 404", async () => {
    expect((await api("/api/v1/donatarios/abc", { cookie: ong.cookie })).status).toBe(404);
  });
});

describe("vínculo com campanhas", () => {
  let campanha, donatario;

  beforeAll(async () => {
    campanha = await criarCampanhaAtiva(ong.cookie, { titulo: "Com donatários" });
    donatario = await criarDonatario(ong.cookie, { nome: "Para vincular" });
  });

  test("a ONG dona vincula um donatário seu à campanha dela", async () => {
    const r = await vincular(ong.cookie, campanha.id_campanha, donatario.id_donatario);

    expect(r.status).toBe(201);
    expect(r.corpo.id_donatario).toBe(donatario.id_donatario);
  });

  test("vincular de novo o mesmo donatário retorna 409", async () => {
    const r = await vincular(ong.cookie, campanha.id_campanha, donatario.id_donatario);

    expect(r.status).toBe(409);
  });

  test("id_donatario ausente ou inválido retorna 400", async () => {
    const semId = await api(`/api/v1/campanhas/${campanha.id_campanha}/donatarios`, {
      metodo: "POST",
      cookie: ong.cookie,
      corpo: {},
    });
    const invalido = await vincular(ong.cookie, campanha.id_campanha, "abc");

    expect(semId.status).toBe(400);
    expect(invalido.status).toBe(400);
  });

  test("não dá para misturar ONGs: nem na campanha alheia, nem com donatário alheio", async () => {
    const dela = await criarDonatario(outraOng.cookie, { nome: "Da outra ONG" });

    // outra ONG tentando usar a campanha da primeira
    const naCampanhaAlheia = await vincular(
      outraOng.cookie,
      campanha.id_campanha,
      dela.id_donatario,
    );
    expect(naCampanhaAlheia.status).toBe(403);

    // a primeira ONG tentando usar o donatário da outra
    const comDonatarioAlheio = await vincular(
      ong.cookie,
      campanha.id_campanha,
      dela.id_donatario,
    );
    expect(comDonatarioAlheio.status).toBe(404);
  });

  test("campanha inexistente retorna 404", async () => {
    const r = await vincular(ong.cookie, "999999999", donatario.id_donatario);

    expect(r.status).toBe(404);
  });

  test("a lista de vinculados é restrita à ONG dona", async () => {
    const url = `/api/v1/campanhas/${campanha.id_campanha}/donatarios`;

    const dona = await api(url, { cookie: ong.cookie });
    expect(dona.status).toBe(200);
    expect(dona.corpo.map((d) => d.id_donatario)).toContain(donatario.id_donatario);

    expect((await api(url)).status).toBe(401);
    expect((await api(url, { cookie: doador.cookie })).status).toBe(403);
    expect((await api(url, { cookie: outraOng.cookie })).status).toBe(403);
  });

  test("donatário vinculado não pode ser apagado; depois de desvincular, pode", async () => {
    const urlDonatario = `/api/v1/donatarios/${donatario.id_donatario}`;
    const urlVinculo = `/api/v1/campanhas/${campanha.id_campanha}/donatarios/${donatario.id_donatario}`;

    const bloqueado = await api(urlDonatario, { metodo: "DELETE", cookie: ong.cookie });
    expect(bloqueado.status).toBe(409);

    expect((await api(urlVinculo, { metodo: "DELETE", cookie: outraOng.cookie })).status).toBe(403);
    expect((await api(urlVinculo, { metodo: "DELETE", cookie: ong.cookie })).status).toBe(204);
    expect((await api(urlVinculo, { metodo: "DELETE", cookie: ong.cookie })).status).toBe(404);

    expect((await api(urlDonatario, { metodo: "DELETE", cookie: ong.cookie })).status).toBe(204);
    expect((await api(urlDonatario, { cookie: ong.cookie })).status).toBe(404);
  });
});

describe("campanha encerrada", () => {
  test("não aceita novos vínculos nem remoção de vínculos (409)", async () => {
    const campanha = await criarCampanhaAtiva(ong.cookie, { titulo: "Vai encerrar" });
    const vinculado = await criarDonatario(ong.cookie, { nome: "Já vinculado" });
    const novo = await criarDonatario(ong.cookie, { nome: "Chegou tarde" });
    expect(
      (await vincular(ong.cookie, campanha.id_campanha, vinculado.id_donatario)).status,
    ).toBe(201);

    await mudarStatusCampanha(ong.cookie, campanha.id_campanha, "encerrada");

    expect(
      (await vincular(ong.cookie, campanha.id_campanha, novo.id_donatario)).status,
    ).toBe(409);
    const desvincular = await api(
      `/api/v1/campanhas/${campanha.id_campanha}/donatarios/${vinculado.id_donatario}`,
      { metodo: "DELETE", cookie: ong.cookie },
    );
    expect(desvincular.status).toBe(409);
  });

  test("rascunho aceita vínculos normalmente", async () => {
    const rascunho = await criarCampanha(ong.cookie, { titulo: "Ainda rascunho" });
    const d = await criarDonatario(ong.cookie);

    const r = await vincular(ong.cookie, rascunho.id_campanha, d.id_donatario);

    expect(r.status).toBe(201);
  });
});
