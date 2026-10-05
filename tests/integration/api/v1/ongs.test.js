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

describe("GET /api/v1/ongs/{id}", () => {
  test("qualquer pessoa vê nome e CNPJ, mas não o e-mail", async () => {
    const r = await api(`/api/v1/ongs/${ong.id}`);

    expect(r.status).toBe(200);
    expect(r.corpo).toEqual({
      id_ong: ong.id,
      nome: "ONG de Teste",
      cnpj: expect.stringMatching(/^\d{14}$/),
      criado_em: expect.any(String),
    });
  });

  test("id de doador não é ONG: 404", async () => {
    expect((await api(`/api/v1/ongs/${doador.id}`)).status).toBe(404);
  });

  test("id inválido ou inexistente retorna 404", async () => {
    expect((await api("/api/v1/ongs/abc")).status).toBe(404);
    expect((await api("/api/v1/ongs/999999999")).status).toBe(404);
  });
});
