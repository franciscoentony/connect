import {
  api,
  aguardarServidor,
  limparDadosDeTeste,
  novoDoador,
  novaOng,
  SENHA,
} from "../../../orchestrator.js";

let doador, ong;

beforeAll(async () => {
  await aguardarServidor();
  doador = await novoDoador();
  ong = await novaOng();
});
afterAll(limparDadosDeTeste);

const login = (corpo) => api("/api/v1/sessao", { metodo: "POST", corpo });

describe("POST /api/v1/sessao (login)", () => {
  test("login válido devolve o usuário e um cookie httpOnly", async () => {
    const r = await login({ email: doador.email, senha: SENHA });

    expect(r.status).toBe(200);
    expect(r.corpo.tipo).toBe("doador");
    expect(r.corpo.email).toBe(doador.email);
    expect(r.corpo).not.toHaveProperty("senha_hash");

    const cookie = r.headers.getSetCookie().join(";");
    expect(cookie).toMatch(/sessao=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=lax/i);
  });

  test("o e-mail do login não diferencia maiúsculas de minúsculas", async () => {
    const r = await login({ email: doador.email.toUpperCase(), senha: SENHA });

    expect(r.status).toBe(200);
  });

  test("senha errada e e-mail inexistente dão exatamente a mesma resposta", async () => {
    const senhaErrada = await login({
      email: doador.email,
      senha: "senha-errada-123",
    });
    const emailInexistente = await login({
      email: "ninguem@teste.connect",
      senha: SENHA,
    });

    expect(senhaErrada.status).toBe(401);
    expect(emailInexistente.status).toBe(401);
    expect(senhaErrada.corpo).toEqual(emailInexistente.corpo);
  });

  test("login sem corpo preenchido retorna 401, não 500", async () => {
    const r = await login({});

    expect(r.status).toBe(401);
  });
});

describe("GET /api/v1/sessao (quem sou eu)", () => {
  test("sem cookie retorna 401", async () => {
    const r = await api("/api/v1/sessao");

    expect(r.status).toBe(401);
  });

  test("com cookie válido devolve o usuário logado", async () => {
    const r = await api("/api/v1/sessao", { cookie: doador.cookie });

    expect(r.status).toBe(200);
    expect(r.corpo.id_usuario).toBe(doador.id);
    expect(r.corpo.tipo).toBe("doador");
    expect(r.corpo.nome).toBe("Doador de Teste");
    expect(r.corpo).not.toHaveProperty("senha_hash");
  });

  test("para ONG, devolve também o nome e o CNPJ", async () => {
    const r = await api("/api/v1/sessao", { cookie: ong.cookie });

    expect(r.status).toBe(200);
    expect(r.corpo.tipo).toBe("ong");
    expect(r.corpo.nome).toBe("ONG de Teste");
    expect(r.corpo.cnpj).toMatch(/^\d{14}$/);
  });

  test("cookie adulterado é rejeitado", async () => {
    const r = await api("/api/v1/sessao", { cookie: "sessao=abc.def.ghi" });

    expect(r.status).toBe(401);
  });

  test("token com a assinatura alterada é rejeitado", async () => {
    const [nome, token] = doador.cookie.split("=");
    const adulterado =
      token.slice(0, -4) + (token.endsWith("AAAA") ? "BBBB" : "AAAA");

    const r = await api("/api/v1/sessao", { cookie: `${nome}=${adulterado}` });

    expect(r.status).toBe(401);
  });
});

describe("DELETE /api/v1/sessao (logout)", () => {
  test("retorna 204 e manda o navegador apagar o cookie", async () => {
    const r = await api("/api/v1/sessao", {
      metodo: "DELETE",
      cookie: doador.cookie,
    });

    expect(r.status).toBe(204);
    expect(r.headers.getSetCookie().join(";")).toMatch(/sessao=;/);
  });

  test("apaga o cookie com os mesmos atributos do login", async () => {
    // Se o cookie de "apagar" vier com atributos diferentes dos do login,
    // alguns navegadores (como o Safari) ignoram e a pessoa continua logada.
    const r = await api("/api/v1/sessao", {
      metodo: "DELETE",
      cookie: doador.cookie,
    });
    const apagar = r.headers.getSetCookie().join(";");

    expect(apagar).toMatch(/Max-Age=0/i);
    expect(apagar).toMatch(/Path=\//i);
    expect(apagar).toMatch(/HttpOnly/i);
    expect(apagar).toMatch(/SameSite=lax/i);
  });
});
