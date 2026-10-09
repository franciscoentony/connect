# Documentação da API

A documentação completa e atualizada de cada rota fica no **Swagger**:

- com o projeto rodando (`npm run dev`), acesse <http://localhost:3000/api-doc>;
- o arquivo que gera a documentação é `src/lib/swagger.js`. Ao criar ou alterar uma rota, atualize a entrada dela lá.

Este arquivo resume só o essencial para começar.

## Visão geral

- **Base URL:** `http://localhost:3000/api/v1`
- **Formato:** JSON
- **Ids:** são enviados e devolvidos como texto (ex.: `"12"`).

## Autenticação (cookie de sessão)

1. Faça login com `POST /api/v1/sessao`:

   ```json
   { "email": "contato@amigos.org", "senha": "senha-segura-123" }
   ```

2. A resposta grava um cookie chamado `sessao`. O navegador envia esse cookie sozinho nas próximas requisições, então não é preciso mandar nenhum cabeçalho `Authorization`.
3. Para sair, use `DELETE /api/v1/sessao`.

Com o `curl`, guarde e reenvie o cookie com `-c` e `-b`:

```bash
curl -c cookies.txt -X POST http://localhost:3000/api/v1/sessao \
  -H "Content-Type: application/json" \
  -d '{"email":"contato@amigos.org","senha":"senha-segura-123"}'

curl -b cookies.txt http://localhost:3000/api/v1/sessao
```

O `cookies.txt` está no `.gitignore`: ele contém o seu token e não deve ir para o repositório.

## Paginação

As listagens aceitam `?pagina=1&limite=20`. O limite padrão é 20, e o máximo é 50.

A resposta vem neste formato:

```json
{
  "itens": [{ "id_campanha": "1", "titulo": "Natal Solidário" }],
  "paginacao": { "pagina": 1, "limite": 20, "total": 45, "total_paginas": 3 }
}
```

Use `total_paginas` para montar a navegação ("página 1 de 3").

Listas curtas e sem paginação, como `/metodos-pagamento` e `/campanhas/{id}/locais`, continuam devolvendo um array simples.

## Erros

Todo erro tem o formato:

```json
{ "erro": "campanha não encontrada" }
```

| Código | Quando acontece                                                    |
| ------ | ------------------------------------------------------------------ |
| 400    | Dados inválidos (campo faltando, tamanho errado, JSON malformado)  |
| 401    | Não está logado                                                    |
| 403    | Logado, mas sem permissão (ex.: doador tentando criar campanha)    |
| 404    | Não existe, ou existe mas você não pode vê-lo                      |
| 409    | Conflito com o estado atual (ex.: doar para campanha encerrada)    |
| 500    | Erro inesperado no servidor (o detalhe aparece só no terminal)     |
