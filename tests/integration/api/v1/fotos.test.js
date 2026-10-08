import {
  api,
  aguardarServidor,
  limparDadosDeTeste,
  novaOng,
  novoDoador,
  criarCampanha,
  criarCampanhaAtiva,
  mudarStatusCampanha,
  enviarFoto,
  baixar,
  PNG_PEQUENO,
} from "../../../orchestrator.js";

let ong, outraOng, doador;

beforeAll(async () => {
  await aguardarServidor();
  ong = await novaOng();
  outraOng = await novaOng();
  doador = await novoDoador();
});
afterAll(limparDadosDeTeste);

describe("foto de perfil (/api/v1/perfil/foto)", () => {
  test("sem login retorna 401", async () => {
    const r = await enviarFoto("/api/v1/perfil/foto", { metodo: "PUT" });

    expect(r.status).toBe(401);
  });

  test("sem foto, foto_url é null e o GET dá 404", async () => {
    const sessao = await api("/api/v1/sessao", { cookie: doador.cookie });
    expect(sessao.corpo.foto_url).toBeNull();

    const r = await baixar("/api/v1/perfil/foto", { cookie: doador.cookie });
    expect(r.status).toBe(404);
  });

  test("envia, baixa e remove a foto", async () => {
    const envio = await enviarFoto("/api/v1/perfil/foto", {
      metodo: "PUT",
      cookie: doador.cookie,
    });
    expect(envio.status).toBe(200);
    expect(envio.corpo.foto_url).toMatch(/^\/api\/v1\/perfil\/foto\?v=\d+$/);

    const imagem = await baixar(envio.corpo.foto_url, {
      cookie: doador.cookie,
    });
    expect(imagem.status).toBe(200);
    expect(imagem.tipo).toBe("image/png");
    expect(imagem.bytes.equals(PNG_PEQUENO)).toBe(true);

    const remocao = await api("/api/v1/perfil/foto", {
      metodo: "DELETE",
      cookie: doador.cookie,
    });
    expect(remocao.status).toBe(204);

    const sessao = await api("/api/v1/sessao", { cookie: doador.cookie });
    expect(sessao.corpo.foto_url).toBeNull();
  });

  test("recusa arquivo que não é imagem, mesmo dizendo que é PNG", async () => {
    const r = await enviarFoto("/api/v1/perfil/foto", {
      metodo: "PUT",
      cookie: doador.cookie,
      bytes: Buffer.from("<script>alert(1)</script>"),
    });

    expect(r.status).toBe(400);
    expect(r.corpo.erro).toBe("a foto deve ser JPG, PNG ou WEBP");
  });

  test("recusa foto maior que 2 MB com 413", async () => {
    const grande = Buffer.concat([PNG_PEQUENO, Buffer.alloc(2 * 1024 * 1024)]);
    const r = await enviarFoto("/api/v1/perfil/foto", {
      metodo: "PUT",
      cookie: doador.cookie,
      bytes: grande,
    });

    expect(r.status).toBe(413);
  });

  test("recusa JSON no lugar do formulário", async () => {
    const r = await api("/api/v1/perfil/foto", {
      metodo: "PUT",
      cookie: doador.cookie,
      corpo: { foto: "abc" },
    });

    expect(r.status).toBe(400);
  });
});

describe("foto pública da ONG (/api/v1/ongs/{id}/foto)", () => {
  test("a foto da ONG é pública e aparece em GET /ongs/{id}", async () => {
    await enviarFoto("/api/v1/perfil/foto", {
      metodo: "PUT",
      cookie: ong.cookie,
    });

    const perfil = await api(`/api/v1/ongs/${ong.id}`);
    expect(perfil.corpo.foto_url).toMatch(
      new RegExp(`^/api/v1/ongs/${ong.id}/foto\\?v=\\d+$`),
    );

    const imagem = await baixar(perfil.corpo.foto_url); // sem login
    expect(imagem.status).toBe(200);
    expect(imagem.tipo).toBe("image/png");
  });

  test("a foto de um doador não sai pela rota de ONG", async () => {
    await enviarFoto("/api/v1/perfil/foto", {
      metodo: "PUT",
      cookie: doador.cookie,
    });

    const r = await baixar(`/api/v1/ongs/${doador.id}/foto`);
    expect(r.status).toBe(404);
  });
});

describe("fotos da campanha (/api/v1/campanhas/{id}/fotos)", () => {
  test("a ONG dona adiciona fotos; a primeira vira a capa", async () => {
    const campanha = await criarCampanhaAtiva(ong.cookie);
    const caminho = `/api/v1/campanhas/${campanha.id_campanha}/fotos`;
    expect(campanha.capa_url).toBeNull();

    const primeira = await enviarFoto(caminho, { cookie: ong.cookie });
    const segunda = await enviarFoto(caminho, { cookie: ong.cookie });
    expect(primeira.status).toBe(201);
    expect(segunda.status).toBe(201);

    const lista = await api(caminho); // sem login: a campanha é pública
    expect(lista.status).toBe(200);
    expect(lista.corpo.map((foto) => foto.id_foto)).toEqual([
      primeira.corpo.id_foto,
      segunda.corpo.id_foto,
    ]);

    const detalhe = await api(`/api/v1/campanhas/${campanha.id_campanha}`);
    expect(detalhe.corpo.capa_url).toBe(primeira.corpo.url);

    const imagem = await baixar(primeira.corpo.url);
    expect(imagem.status).toBe(200);
    expect(imagem.tipo).toBe("image/png");
  });

  test("apagar a capa faz a próxima foto virar capa", async () => {
    const campanha = await criarCampanhaAtiva(ong.cookie);
    const caminho = `/api/v1/campanhas/${campanha.id_campanha}/fotos`;
    const primeira = await enviarFoto(caminho, { cookie: ong.cookie });
    const segunda = await enviarFoto(caminho, { cookie: ong.cookie });

    const r = await api(primeira.corpo.url, {
      metodo: "DELETE",
      cookie: ong.cookie,
    });
    expect(r.status).toBe(204);

    const detalhe = await api(`/api/v1/campanhas/${campanha.id_campanha}`);
    expect(detalhe.corpo.capa_url).toBe(segunda.corpo.url);
    expect((await baixar(primeira.corpo.url)).status).toBe(404);
  });

  test("outra ONG não adiciona nem apaga fotos (403)", async () => {
    const campanha = await criarCampanhaAtiva(ong.cookie);
    const caminho = `/api/v1/campanhas/${campanha.id_campanha}/fotos`;
    const foto = await enviarFoto(caminho, { cookie: ong.cookie });

    const envio = await enviarFoto(caminho, { cookie: outraOng.cookie });
    const remocao = await api(foto.corpo.url, {
      metodo: "DELETE",
      cookie: outraOng.cookie,
    });

    expect(envio.status).toBe(403);
    expect(remocao.status).toBe(403);
  });

  test("doador não adiciona fotos (403)", async () => {
    const campanha = await criarCampanhaAtiva(ong.cookie);
    const r = await enviarFoto(
      `/api/v1/campanhas/${campanha.id_campanha}/fotos`,
      { cookie: doador.cookie },
    );

    expect(r.status).toBe(403);
  });

  test("fotos de rascunho só aparecem para a ONG dona", async () => {
    const campanha = await criarCampanha(ong.cookie); // rascunho
    const caminho = `/api/v1/campanhas/${campanha.id_campanha}/fotos`;
    const foto = await enviarFoto(caminho, { cookie: ong.cookie });

    expect((await api(caminho)).status).toBe(404);
    expect((await baixar(foto.corpo.url)).status).toBe(404);
    expect((await baixar(foto.corpo.url, { cookie: ong.cookie })).status).toBe(
      200,
    );
  });

  test("campanha encerrada não aceita novas fotos (409)", async () => {
    const campanha = await criarCampanhaAtiva(ong.cookie);
    await mudarStatusCampanha(ong.cookie, campanha.id_campanha, "encerrada");

    const r = await enviarFoto(
      `/api/v1/campanhas/${campanha.id_campanha}/fotos`,
      { cookie: ong.cookie },
    );
    expect(r.status).toBe(409);
  });

  test("aceita no máximo 8 fotos (409 na 9ª)", async () => {
    const campanha = await criarCampanhaAtiva(ong.cookie);
    const caminho = `/api/v1/campanhas/${campanha.id_campanha}/fotos`;
    for (let i = 0; i < 8; i++) {
      await enviarFoto(caminho, { cookie: ong.cookie });
    }

    const r = await enviarFoto(caminho, { cookie: ong.cookie });
    expect(r.status).toBe(409);
  });

  test("foto de outra campanha retorna 404", async () => {
    const campanhaA = await criarCampanhaAtiva(ong.cookie);
    const campanhaB = await criarCampanhaAtiva(ong.cookie);
    const foto = await enviarFoto(
      `/api/v1/campanhas/${campanhaA.id_campanha}/fotos`,
      { cookie: ong.cookie },
    );

    const r = await baixar(
      `/api/v1/campanhas/${campanhaB.id_campanha}/fotos/${foto.corpo.id_foto}`,
    );
    expect(r.status).toBe(404);
  });
});
