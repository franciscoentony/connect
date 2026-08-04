# Documentação da API

## Visão Geral

- **Base URL:** `https://localhost:3000/api/v1`
- **Formato:** JSON
- **Autenticação:** Bearer Token (JWT)

## Autenticação

Todas as requisições autenticadas devem incluir o header:

```
Authorization: Bearer {seu_token}
```

### POST /auth/login

Autentica um usuário e retorna um token de acesso.

**Request Body**

```json
{
  "email": "usuario@exemplo.com",
  "password": "sua_senha"
}
```

**Response — 200 OK**

```json
{
  "token": "jwt_token_aqui",
  "expires_in": 3600
}
```

**Erros**

| Código | Descrição              |
| ------ | ---------------------- |
| 400    | Dados inválidos        |
| 401    | Credenciais incorretas |

---

## Endpoints

### GET /recurso

Retorna a lista de recursos.

**Parâmetros de Query**

| Parâmetro | Tipo    | Obrigatório | Descrição                     |
| --------- | ------- | ----------- | ----------------------------- |
| page      | integer | Não         | Página atual (padrão: 1)      |
| limit     | integer | Não         | Itens por página (padrão: 20) |

**Response — 200 OK**

```json
{
  "data": [{ "id": 1, "nome": "Exemplo" }],
  "meta": { "total": 1, "page": 1 }
}
```

---

### POST /recurso

Cria um novo recurso.

**Request Body**

```json
{
  "nome": "Novo recurso"
}
```

**Response — 201 Created**

```json
{
  "id": 2,
  "nome": "Novo recurso"
}
```

**Erros**

| Código | Descrição                |
| ------ | ------------------------ |
| 400    | Dados inválidos          |
| 422    | Regra de negócio violada |

---

### GET /recurso/{id}

Retorna um recurso específico.

**Response — 200 OK**

```json
{ "id": 1, "nome": "Exemplo" }
```

**Response — 404 Not Found**

```json
{ "erro": "Recurso não encontrado" }
```

---

### PUT /recurso/{id}

Atualiza um recurso existente.

### DELETE /recurso/{id}

Remove um recurso.

**Response — 204 No Content**

---

## Códigos de Status HTTP

| Código | Significado              |
| ------ | ------------------------ |
| 200    | Sucesso                  |
| 201    | Criado com sucesso       |
| 204    | Sucesso sem conteúdo     |
| 400    | Requisição inválida      |
| 401    | Não autenticado          |
| 403    | Sem permissão            |
| 404    | Não encontrado           |
| 422    | Entidade não processável |
| 500    | Erro interno do servidor |

## Rate Limiting

- Limite: X requisições por minuto por token
- Header de resposta: `X-RateLimit-Remaining`

## Versionamento

A API segue versionamento por URL (`/v1`, `/v2`). Mudanças que quebram compatibilidade geram uma nova versão.
