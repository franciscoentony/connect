import { createSwaggerSpec } from "next-swagger-doc";

// Documentação da API no formato OpenAPI, exibida em /api-doc.
//
// Como ler este arquivo:
// - "components.schemas" descreve o formato de cada objeto (Campanha, Doacao...).
// - "components.responses" tem as respostas de erro que se repetem.
// - "paths" lista cada rota e, dentro dela, cada método (get, post, patch, delete).
// - "$ref" é um atalho para reaproveitar algo definido em "components".
// - "security: [{ cookieSessao: [] }]" marca as rotas que exigem login.
//
// Ao criar ou alterar uma rota, atualize a entrada dela aqui.

// Respostas de erro (todas têm o formato { "erro": "mensagem" })
const ERRO_400 = { $ref: "#/components/responses/Erro400" };
const ERRO_401 = { $ref: "#/components/responses/Erro401" };
const ERRO_403 = { $ref: "#/components/responses/Erro403" };
const ERRO_404 = { $ref: "#/components/responses/Erro404" };
const ERRO_409 = { $ref: "#/components/responses/Erro409" };

const PRECISA_LOGIN = [{ cookieSessao: [] }];

// Parâmetros que se repetem
const PARAM_ID = (descricao) => ({
  name: "id",
  in: "path",
  required: true,
  description: descricao,
  schema: { type: "string", example: "1" },
});
const PARAM_PAGINA = {
  name: "pagina",
  in: "query",
  description: "Página (padrão: 1)",
  schema: { type: "integer", minimum: 1, default: 1 },
};
const PARAM_LIMITE = {
  name: "limite",
  in: "query",
  description: "Itens por página (padrão: 20, máximo: 50)",
  schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
};

// Atalhos para descrever o corpo da requisição e da resposta
function corpoJson(schema) {
  return { required: true, content: { "application/json": { schema } } };
}
function respostaJson(descricao, schema) {
  return {
    description: descricao,
    content: { "application/json": { schema } },
  };
}
function lista(nomeDoSchema) {
  return {
    type: "array",
    items: { $ref: `#/components/schemas/${nomeDoSchema}` },
  };
}
// Formato das listagens paginadas: { itens: [...], paginacao: {...} }
function listaPaginada(nomeDoSchema) {
  return {
    type: "object",
    properties: {
      itens: lista(nomeDoSchema),
      paginacao: { $ref: "#/components/schemas/Paginacao" },
    },
  };
}
function objeto(nomeDoSchema) {
  return { $ref: `#/components/schemas/${nomeDoSchema}` };
}

const definition = {
  openapi: "3.0.0",
  info: {
    title: "Documentação API Connect",
    version: "1.0.0",
    description:
      "API do Connect: ONGs criam campanhas, doadores fazem doações.\n\n" +
      "**Login:** faça `POST /api/v1/sessao`. A resposta grava o cookie `sessao`, " +
      "que o navegador envia sozinho nas próximas requisições.\n\n" +
      '**Ids** são enviados e devolvidos como texto (ex.: `"12"`).',
  },
  servers: [{ url: "/", description: "Este servidor" }],
  tags: [
    { name: "Usuários e sessão" },
    { name: "Campanhas" },
    { name: "Locais de entrega" },
    { name: "Doações" },
    { name: "Donatários" },
    { name: "Sistema" },
  ],

  components: {
    securitySchemes: {
      cookieSessao: {
        type: "apiKey",
        in: "cookie",
        name: "sessao",
        description: "Cookie criado pelo login (POST /api/v1/sessao).",
      },
    },

    responses: {
      Erro400: respostaJson("Dados inválidos", objeto("Erro")),
      Erro401: respostaJson("Não está logado", objeto("Erro")),
      Erro403: respostaJson("Logado, mas sem permissão", objeto("Erro")),
      Erro404: respostaJson("Não encontrado", objeto("Erro")),
      Erro409: respostaJson(
        "Conflito com o estado atual (ex.: campanha encerrada)",
        objeto("Erro"),
      ),
    },

    schemas: {
      Erro: {
        type: "object",
        properties: {
          erro: { type: "string", example: "campanha não encontrada" },
        },
      },

      Paginacao: {
        type: "object",
        properties: {
          pagina: { type: "integer", example: 2 },
          limite: { type: "integer", example: 20 },
          total: {
            type: "integer",
            description: "Total de itens em todas as páginas",
            example: 45,
          },
          total_paginas: { type: "integer", example: 3 },
        },
      },

      // ---------- usuários ----------
      NovoUsuario: {
        type: "object",
        required: ["tipo", "nome", "email", "senha"],
        properties: {
          tipo: { type: "string", enum: ["ong", "doador"] },
          nome: {
            type: "string",
            minLength: 2,
            maxLength: 150,
            example: "Amigos do Bem",
          },
          email: {
            type: "string",
            format: "email",
            example: "contato@amigos.org",
          },
          senha: {
            type: "string",
            minLength: 8,
            maxLength: 72,
            example: "senha-segura-123",
          },
          cnpj: {
            type: "string",
            description: "Obrigatório quando tipo = ong. Pode ter pontuação.",
            example: "12.345.678/0001-90",
          },
        },
      },
      Usuario: {
        type: "object",
        properties: {
          id_usuario: { type: "string", example: "1" },
          email: { type: "string", example: "contato@amigos.org" },
          tipo: { type: "string", enum: ["ong", "doador"] },
          criado_em: { type: "string", format: "date-time" },
        },
      },
      Perfil: {
        type: "object",
        description: "Usuário logado com os dados do perfil.",
        properties: {
          id_usuario: { type: "string", example: "1" },
          email: { type: "string", example: "contato@amigos.org" },
          tipo: { type: "string", enum: ["ong", "doador"] },
          criado_em: { type: "string", format: "date-time" },
          nome: { type: "string", example: "Amigos do Bem" },
          cnpj: {
            type: "string",
            description: "Só para ONG",
            example: "12345678000190",
          },
        },
      },
      OngPublica: {
        type: "object",
        properties: {
          id_ong: { type: "string", example: "1" },
          nome: { type: "string", example: "Amigos do Bem" },
          cnpj: { type: "string", example: "12345678000190" },
          criado_em: { type: "string", format: "date-time" },
        },
      },
      Login: {
        type: "object",
        required: ["email", "senha"],
        properties: {
          email: { type: "string", example: "contato@amigos.org" },
          senha: { type: "string", example: "senha-segura-123" },
        },
      },

      // ---------- campanhas ----------
      NovaCampanha: {
        type: "object",
        required: ["titulo"],
        properties: {
          titulo: {
            type: "string",
            minLength: 3,
            maxLength: 150,
            example: "Natal Solidário",
          },
          meta: {
            type: "number",
            nullable: true,
            description: "Opcional, em reais",
            example: 5000,
          },
        },
      },
      AlterarCampanha: {
        type: "object",
        description: "Envie só os campos que quer mudar.",
        properties: {
          titulo: { type: "string", minLength: 3, maxLength: 150 },
          meta: { type: "number", nullable: true },
          status: {
            type: "string",
            enum: ["ativa", "encerrada", "cancelada"],
            description:
              "Mudanças permitidas: rascunho → ativa ou cancelada; ativa → encerrada ou cancelada.",
          },
        },
      },
      Campanha: {
        type: "object",
        properties: {
          id_campanha: { type: "string", example: "1" },
          id_ong: { type: "string", example: "1" },
          ong_nome: { type: "string", example: "Amigos do Bem" },
          titulo: { type: "string", example: "Natal Solidário" },
          meta: { type: "string", nullable: true, example: "5000.00" },
          status: {
            type: "string",
            enum: ["rascunho", "ativa", "encerrada", "cancelada"],
          },
          criado_em: { type: "string", format: "date-time" },
          arrecadado: {
            type: "string",
            description: "Soma das doações em dinheiro confirmadas",
            example: "150.00",
          },
        },
      },

      // ---------- locais de entrega ----------
      NovoLocal: {
        type: "object",
        required: ["endereco", "cidade"],
        properties: {
          endereco: {
            type: "string",
            minLength: 5,
            maxLength: 255,
            example: "Rua das Flores, 100",
          },
          cidade: {
            type: "string",
            minLength: 2,
            maxLength: 100,
            example: "Natal",
          },
        },
      },
      Local: {
        type: "object",
        properties: {
          id_local: { type: "string", example: "1" },
          endereco: { type: "string", example: "Rua das Flores, 100" },
          cidade: { type: "string", example: "Natal" },
        },
      },

      // ---------- doações ----------
      MetodoPagamento: {
        type: "object",
        properties: {
          id_metodo: { type: "string", example: "1" },
          nome: { type: "string", example: "Pix" },
          tipo: { type: "string", example: "instantaneo" },
        },
      },
      NovaDoacao: {
        type: "object",
        required: ["tipo"],
        description:
          "Dinheiro: envie valor e id_metodo. Item: envie descricao.",
        properties: {
          tipo: { type: "string", enum: ["dinheiro", "item"] },
          valor: {
            type: "string",
            description: "Só para dinheiro. Até 2 casas decimais.",
            example: "50.00",
          },
          id_metodo: {
            type: "string",
            description: "Só para dinheiro",
            example: "1",
          },
          descricao: {
            type: "string",
            description: "Só para item. De 3 a 255 caracteres.",
            example: "10 kg de arroz",
          },
        },
      },
      Doacao: {
        type: "object",
        properties: {
          id_doacao: { type: "string", example: "1" },
          id_doador: { type: "string", example: "2" },
          doador_nome: { type: "string", example: "Maria Souza" },
          id_campanha: { type: "string", example: "1" },
          campanha_titulo: { type: "string", example: "Natal Solidário" },
          id_ong: { type: "string", example: "1" },
          id_metodo: { type: "string", nullable: true, example: "1" },
          metodo_nome: { type: "string", nullable: true, example: "Pix" },
          tipo: { type: "string", enum: ["dinheiro", "item"] },
          valor: { type: "string", nullable: true, example: "50.00" },
          descricao: { type: "string", nullable: true },
          data: { type: "string", format: "date-time" },
          status: {
            type: "string",
            enum: ["pendente", "confirmada", "cancelada"],
          },
        },
      },

      // ---------- donatários ----------
      NovoDonatario: {
        type: "object",
        required: ["nome"],
        properties: {
          nome: {
            type: "string",
            minLength: 2,
            maxLength: 150,
            example: "Família Silva",
          },
          contato: {
            type: "string",
            nullable: true,
            maxLength: 150,
            example: "(84) 99999-0000",
          },
        },
      },
      AlterarDonatario: {
        type: "object",
        description: "Envie só os campos que quer mudar.",
        properties: {
          nome: { type: "string", minLength: 2, maxLength: 150 },
          contato: { type: "string", nullable: true, maxLength: 150 },
        },
      },
      Donatario: {
        type: "object",
        properties: {
          id_donatario: { type: "string", example: "1" },
          nome: { type: "string", example: "Família Silva" },
          contato: {
            type: "string",
            nullable: true,
            example: "(84) 99999-0000",
          },
          criado_em: { type: "string", format: "date-time" },
        },
      },
    },
  },

  paths: {
    // ==================== usuários e sessão ====================
    "/api/v1/usuarios": {
      post: {
        tags: ["Usuários e sessão"],
        summary: "Cadastra uma ONG ou um doador",
        requestBody: corpoJson(objeto("NovoUsuario")),
        responses: {
          201: respostaJson("Usuário criado", objeto("Usuario")),
          400: ERRO_400,
          409: respostaJson("E-mail ou CNPJ já cadastrado", objeto("Erro")),
        },
      },
    },

    "/api/v1/sessao": {
      post: {
        tags: ["Usuários e sessão"],
        summary: "Login: confere e-mail e senha e grava o cookie de sessão",
        requestBody: corpoJson(objeto("Login")),
        responses: {
          200: respostaJson(
            "Logado. O cookie 'sessao' vem no cabeçalho Set-Cookie.",
            objeto("Usuario"),
          ),
          400: ERRO_400,
          401: respostaJson("E-mail ou senha incorretos", objeto("Erro")),
        },
      },
      get: {
        tags: ["Usuários e sessão"],
        summary: "Quem sou eu: dados do usuário logado",
        security: PRECISA_LOGIN,
        responses: {
          200: respostaJson("Usuário logado", objeto("Perfil")),
          401: ERRO_401,
        },
      },
      delete: {
        tags: ["Usuários e sessão"],
        summary: "Logout: apaga o cookie de sessão",
        responses: { 204: { description: "Deslogado" } },
      },
    },

    "/api/v1/perfil": {
      patch: {
        tags: ["Usuários e sessão"],
        summary: "Altera o nome do usuário logado",
        description: "E-mail e CNPJ não podem ser alterados por aqui.",
        security: PRECISA_LOGIN,
        requestBody: corpoJson({
          type: "object",
          required: ["nome"],
          properties: {
            nome: { type: "string", minLength: 2, maxLength: 150 },
          },
        }),
        responses: {
          200: respostaJson("Perfil alterado", objeto("Perfil")),
          400: ERRO_400,
          401: ERRO_401,
        },
      },
    },

    "/api/v1/ongs/{id}": {
      get: {
        tags: ["Usuários e sessão"],
        summary: "Página pública de uma ONG",
        description:
          "As campanhas da ONG ficam em GET /api/v1/campanhas?ong={id}.",
        parameters: [PARAM_ID("Id da ONG")],
        responses: {
          200: respostaJson("ONG", objeto("OngPublica")),
          404: ERRO_404,
        },
      },
    },

    // ==================== campanhas ====================
    "/api/v1/campanhas": {
      get: {
        tags: ["Campanhas"],
        summary:
          "Lista campanhas ativas; filtre por ONG com ?ong=ID ou veja as suas com ?minhas=true",
        parameters: [
          {
            name: "ong",
            in: "query",
            description: "Id de uma ONG: só as campanhas ativas dela (público)",
            schema: { type: "string" },
          },
          {
            name: "minhas",
            in: "query",
            description:
              "true = todas as campanhas da ONG logada, de qualquer status",
            schema: { type: "boolean" },
          },
          PARAM_PAGINA,
          PARAM_LIMITE,
        ],
        responses: {
          200: respostaJson("Lista de campanhas", listaPaginada("Campanha")),
          401: ERRO_401,
          403: ERRO_403,
        },
      },
      post: {
        tags: ["Campanhas"],
        summary: "Cria uma campanha (nasce como rascunho). Só ONG.",
        security: PRECISA_LOGIN,
        requestBody: corpoJson(objeto("NovaCampanha")),
        responses: {
          201: respostaJson("Campanha criada", objeto("Campanha")),
          400: ERRO_400,
          401: ERRO_401,
          403: ERRO_403,
        },
      },
    },

    "/api/v1/campanhas/{id}": {
      get: {
        tags: ["Campanhas"],
        summary: "Detalhe de uma campanha",
        description:
          "Rascunho e cancelada só aparecem para a ONG dona; para os outros é 404.",
        parameters: [PARAM_ID("Id da campanha")],
        responses: {
          200: respostaJson("Campanha", objeto("Campanha")),
          404: ERRO_404,
        },
      },
      patch: {
        tags: ["Campanhas"],
        summary: "Altera título, meta e/ou status. Só a ONG dona.",
        security: PRECISA_LOGIN,
        parameters: [PARAM_ID("Id da campanha")],
        requestBody: corpoJson(objeto("AlterarCampanha")),
        responses: {
          200: respostaJson("Campanha alterada", objeto("Campanha")),
          400: ERRO_400,
          401: ERRO_401,
          403: ERRO_403,
          404: ERRO_404,
          409: ERRO_409,
        },
      },
    },

    // ==================== locais de entrega ====================
    "/api/v1/campanhas/{id}/locais": {
      get: {
        tags: ["Locais de entrega"],
        summary: "Lista os locais de entrega da campanha",
        parameters: [PARAM_ID("Id da campanha")],
        responses: {
          200: respostaJson("Lista de locais", lista("Local")),
          404: ERRO_404,
        },
      },
      post: {
        tags: ["Locais de entrega"],
        summary: "Adiciona um local de entrega. Só a ONG dona.",
        security: PRECISA_LOGIN,
        parameters: [PARAM_ID("Id da campanha")],
        requestBody: corpoJson(objeto("NovoLocal")),
        responses: {
          201: respostaJson("Local criado", objeto("Local")),
          400: ERRO_400,
          401: ERRO_401,
          403: ERRO_403,
          404: ERRO_404,
          409: ERRO_409,
        },
      },
    },

    "/api/v1/campanhas/{id}/locais/{idLocal}": {
      delete: {
        tags: ["Locais de entrega"],
        summary: "Remove um local de entrega. Só a ONG dona.",
        security: PRECISA_LOGIN,
        parameters: [
          PARAM_ID("Id da campanha"),
          {
            name: "idLocal",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          204: { description: "Removido" },
          401: ERRO_401,
          403: ERRO_403,
          404: ERRO_404,
        },
      },
    },

    // ==================== doações ====================
    "/api/v1/metodos-pagamento": {
      get: {
        tags: ["Doações"],
        summary: "Lista os métodos de pagamento (Pix, cartão, boleto)",
        responses: {
          200: respostaJson("Lista de métodos", lista("MetodoPagamento")),
        },
      },
    },

    "/api/v1/campanhas/{id}/doacoes": {
      post: {
        tags: ["Doações"],
        summary: "Faz uma doação para uma campanha ativa. Só doador.",
        description: "A doação nasce como 'pendente'.",
        security: PRECISA_LOGIN,
        parameters: [PARAM_ID("Id da campanha")],
        requestBody: corpoJson(objeto("NovaDoacao")),
        responses: {
          201: respostaJson("Doação criada", objeto("Doacao")),
          400: ERRO_400,
          401: ERRO_401,
          403: ERRO_403,
          404: ERRO_404,
          409: respostaJson("A campanha não está ativa", objeto("Erro")),
        },
      },
      get: {
        tags: ["Doações"],
        summary: "Lista as doações recebidas pela campanha. Só a ONG dona.",
        security: PRECISA_LOGIN,
        parameters: [PARAM_ID("Id da campanha"), PARAM_PAGINA, PARAM_LIMITE],
        responses: {
          200: respostaJson("Lista de doações", listaPaginada("Doacao")),
          401: ERRO_401,
          403: ERRO_403,
          404: ERRO_404,
        },
      },
    },

    "/api/v1/doacoes": {
      get: {
        tags: ["Doações"],
        summary: "Minhas doações: as doações feitas pelo doador logado",
        security: PRECISA_LOGIN,
        parameters: [PARAM_PAGINA, PARAM_LIMITE],
        responses: {
          200: respostaJson("Lista de doações", listaPaginada("Doacao")),
          401: ERRO_401,
          403: ERRO_403,
        },
      },
    },

    "/api/v1/doacoes/{id}": {
      get: {
        tags: ["Doações"],
        summary: "Detalhe de uma doação",
        description:
          "Só o doador que doou e a ONG dona da campanha veem; para os outros é 404.",
        security: PRECISA_LOGIN,
        parameters: [PARAM_ID("Id da doação")],
        responses: {
          200: respostaJson("Doação", objeto("Doacao")),
          401: ERRO_401,
          404: ERRO_404,
        },
      },
      patch: {
        tags: ["Doações"],
        summary: "Confirma ou cancela uma doação pendente",
        description:
          "A ONG dona pode confirmar ou cancelar. O doador só pode cancelar.",
        security: PRECISA_LOGIN,
        parameters: [PARAM_ID("Id da doação")],
        requestBody: corpoJson({
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["confirmada", "cancelada"] },
          },
        }),
        responses: {
          200: respostaJson("Doação alterada", objeto("Doacao")),
          400: ERRO_400,
          401: ERRO_401,
          403: ERRO_403,
          404: ERRO_404,
          409: respostaJson("A doação não está mais pendente", objeto("Erro")),
        },
      },
    },

    // ==================== donatários ====================
    "/api/v1/donatarios": {
      get: {
        tags: ["Donatários"],
        summary: "Lista os donatários da ONG logada",
        security: PRECISA_LOGIN,
        parameters: [PARAM_PAGINA, PARAM_LIMITE],
        responses: {
          200: respostaJson("Lista de donatários", listaPaginada("Donatario")),
          401: ERRO_401,
          403: ERRO_403,
        },
      },
      post: {
        tags: ["Donatários"],
        summary: "Cadastra um donatário. Só ONG.",
        security: PRECISA_LOGIN,
        requestBody: corpoJson(objeto("NovoDonatario")),
        responses: {
          201: respostaJson("Donatário criado", objeto("Donatario")),
          400: ERRO_400,
          401: ERRO_401,
          403: ERRO_403,
        },
      },
    },

    "/api/v1/donatarios/{id}": {
      get: {
        tags: ["Donatários"],
        summary: "Detalhe de um donatário da ONG logada",
        security: PRECISA_LOGIN,
        parameters: [PARAM_ID("Id do donatário")],
        responses: {
          200: respostaJson("Donatário", objeto("Donatario")),
          401: ERRO_401,
          403: ERRO_403,
          404: ERRO_404,
        },
      },
      patch: {
        tags: ["Donatários"],
        summary: "Altera nome e/ou contato",
        security: PRECISA_LOGIN,
        parameters: [PARAM_ID("Id do donatário")],
        requestBody: corpoJson(objeto("AlterarDonatario")),
        responses: {
          200: respostaJson("Donatário alterado", objeto("Donatario")),
          400: ERRO_400,
          401: ERRO_401,
          403: ERRO_403,
          404: ERRO_404,
        },
      },
      delete: {
        tags: ["Donatários"],
        summary:
          "Remove um donatário que não está vinculado a nenhuma campanha",
        security: PRECISA_LOGIN,
        parameters: [PARAM_ID("Id do donatário")],
        responses: {
          204: { description: "Removido" },
          401: ERRO_401,
          403: ERRO_403,
          404: ERRO_404,
          409: respostaJson("Ainda está vinculado a campanhas", objeto("Erro")),
        },
      },
    },

    "/api/v1/campanhas/{id}/donatarios": {
      get: {
        tags: ["Donatários"],
        summary: "Lista os donatários vinculados à campanha. Só a ONG dona.",
        security: PRECISA_LOGIN,
        parameters: [PARAM_ID("Id da campanha"), PARAM_PAGINA, PARAM_LIMITE],
        responses: {
          200: respostaJson("Lista de donatários", listaPaginada("Donatario")),
          401: ERRO_401,
          403: ERRO_403,
          404: ERRO_404,
        },
      },
      post: {
        tags: ["Donatários"],
        summary: "Vincula um donatário à campanha. Só a ONG dona.",
        security: PRECISA_LOGIN,
        parameters: [PARAM_ID("Id da campanha")],
        requestBody: corpoJson({
          type: "object",
          required: ["id_donatario"],
          properties: { id_donatario: { type: "string", example: "1" } },
        }),
        responses: {
          201: respostaJson(
            "Vinculado; devolve o donatário",
            objeto("Donatario"),
          ),
          400: ERRO_400,
          401: ERRO_401,
          403: ERRO_403,
          404: ERRO_404,
          409: respostaJson(
            "Já vinculado, ou campanha finalizada",
            objeto("Erro"),
          ),
        },
      },
    },

    "/api/v1/campanhas/{id}/donatarios/{idDonatario}": {
      delete: {
        tags: ["Donatários"],
        summary: "Desvincula o donatário da campanha. Só a ONG dona.",
        security: PRECISA_LOGIN,
        parameters: [
          PARAM_ID("Id da campanha"),
          {
            name: "idDonatario",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          204: { description: "Desvinculado" },
          401: ERRO_401,
          403: ERRO_403,
          404: ERRO_404,
          409: ERRO_409,
        },
      },
    },

    // ==================== sistema ====================
    "/api/v1/status": {
      get: {
        tags: ["Sistema"],
        summary: "Situação do servidor e do banco de dados",
        responses: { 200: { description: "Servidor no ar" } },
      },
    },
  },
};

export const getApiDocs = async () => {
  return createSwaggerSpec({ definition });
};
