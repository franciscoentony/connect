# Guia de Instalação e Configuração

## 1. Pré-requisitos

| Ferramenta | Versão mínima |
| ---------- | ------------- |
| Node.js    | 18.x          |
| npm/yarn   | 9.x           |
| Docker     | 24.x          |
| PostgreSQL | 14.x          |

## 2. Clonando o Repositório

```bash
git clone https://github.com/franciscoentony/connect.git
cd connect
```

## 3. Instalando Dependências

```bash
npm install
```

## 4. Configurando Variáveis de Ambiente

Copie o arquivo de exemplo e edite conforme necessário:

```bash
cp .env.example .env
```

| Variável       | Descrição                           | Exemplo                                  |
| -------------- | ----------------------------------- | ---------------------------------------- |
| `PORT`         | Porta da aplicação                  | `3000`                                   |
| `DATABASE_URL` | String de conexão do banco de dados | `postgres://user:pass@localhost:5432/db` |
| `JWT_SECRET`   | Chave secreta para tokens JWT       | `sua_chave_secreta`                      |

## 5. Configurando o Banco de Dados

```bash
# Rodar migrações
npm run migrate

# (Opcional) Popular com dados de exemplo
npm run seed
```

## 6. Executando o Projeto

**Modo desenvolvimento:**

```bash
npm run dev
```

**Modo produção:**

```bash
npm run build
npm start
```

**Com Docker:**

```bash
docker compose up --build
```

## 7. Executando os Testes

```bash
npm run test          # Testes unitários
npm run test:e2e      # Testes end-to-end
npm run test:coverage # Relatório de cobertura
```

## 8. Solução de Problemas (Troubleshooting)

| Problema                    | Possível Causa                | Solução                            |
| --------------------------- | ----------------------------- | ---------------------------------- |
| Erro de conexão com o banco | `DATABASE_URL` incorreta      | Verifique as credenciais no `.env` |
| Porta já em uso             | Outro processo usando a porta | Altere a variável `PORT`           |

## 9. Próximos Passos

Consulte [README.md](../README.md) para visão geral do projeto e [ARCHITECTURE.md](ARCHITECTURE.md) para entender a arquitetura.
