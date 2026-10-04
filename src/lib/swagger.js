import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Documentação API Connect",
        version: "1.0.0",
      },
      paths: {
        "/api/v1/usuarios": {
          get: {
            summary: "Retorna lista de usuários no banco de dados",
            responses: {
              200: {
                description: "Sucesso",
              },
            },
          },
          post: {
            summary: "Envia os dados e cria o usuário e retorna um 201",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      email: {
                        type: "string",
                        example: "joao@email.com",
                      },
                      senhaHash: {
                        type: "string",
                        example: "senha123",
                      },
                      tipo: {
                        type: "string",
                        example: "doador",
                      },
                    },
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Criado com sucesso",
              },
            },
          },
        },
        "/api/v1/status": {
          get: {
            summary: "Retorna todos os status do servidor",
            responses: {
              200: {
                description: "sucess",
              },
            },
          },
        },
      },
    },
  });
  return spec;
};
