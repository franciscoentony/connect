# CLAUDE.md — Como trabalhamos no Connect

Este arquivo explica o projeto e o jeito como o time trabalha (com e sem IA).
O Claude Code lê este arquivo automaticamente em toda conversa; pessoas novas
no time também devem ler antes de começar.

---

## 1. O projeto

O **Connect** conecta **doadores** a **campanhas de arrecadação** criadas por
**ONGs**. A ONG cria campanhas, cadastra locais de entrega e donatários e
confirma as doações recebidas; o doador doa dinheiro ou itens e acompanha o
status de cada doação.

- **Time:** desenvolvedores iniciantes. **Todo código precisa ser fácil de ler
  por um iniciante** — essa é a regra mais importante deste arquivo.
- **Idioma:** tudo em **português** — conversas, nomes de variáveis, funções,
  props, comentários, commits e mensagens de erro da API.

### Stack

| Parte       | Tecnologia                                                                  |
| ----------- | --------------------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router) + React 19, em **JavaScript** (sem TypeScript)      |
| Estilo      | Tailwind CSS v4                                                             |
| Componentes | HeroUI v3 (`@heroui/react` + `@heroui/styles`)                              |
| Ícones      | FontAwesome (`@fortawesome/free-solid-svg-icons`)                           |
| Fonte       | Manrope (via `next/font`), **só os pesos Regular, Medium, SemiBold e Bold** |
| Banco       | PostgreSQL (Docker) + `pg`, migrations com `node-pg-migrate`                |
| Login       | Cookie `sessao` com JWT (`jose`), senhas com `bcryptjs`                     |
| Testes      | Jest (testes de integração que chamam a API de verdade)                     |
| Formatação  | Prettier                                                                    |
| Node        | 24.14.0 (veja `.nvmrc`)                                                     |

### Comandos

```bash
npm run dev            # sobe o Postgres (Docker) e o Next em http://localhost:3000
npm test               # testes de integração (o `npm run dev` precisa estar rodando)
npm run migrations:up  # aplica as migrations no banco
npm run lint:check     # confere a formatação (Prettier)
npm run lint:fix       # formata tudo
```

Variáveis de ambiente (`.env`, modelo em `.env.example`): `POSTGRES_USER`,
`POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL` e `JWT_SECRET`
(no mínimo 32 caracteres).

---

## 2. Princípios de código (valem para backend e frontend)

1. **Simples antes de esperto.** Prefira `if` a operadores encadeados, `for`/
   `.map` claros, variáveis com nomes que explicam o que guardam e funções
   pequenas. Evite truques de linguagem quando uma forma mais longa for mais
   clara.
2. **Comente o "porquê", não o "o quê".** Quando uma parte é complexa por
   necessidade (segurança, banco, regra de negócio), explique o motivo num
   comentário curto. Ex.: o `HASH_FALSO` do login existe para o tempo de
   resposta não revelar quais e-mails estão cadastrados.
3. **Comentário de uso no topo dos componentes e funções públicas**, com um
   exemplo: `// Uso: <Chip status="Pendente" />`.
4. **Não mude comportamento sem avisar.** Refatorar é deixar o código mais
   simples mantendo o que ele faz; os testes precisam continuar passando.
5. **Dados de exemplo em constantes MAIÚSCULAS no topo do arquivo**
   (`BOLHAS`, `CAMPANHAS`, `PERGUNTAS`) e renderizados com `.map`.

---

## 3. Backend (API)

### Estrutura

```
infra/
  database.js        # Pool do Postgres + função query(texto, valores)
  migrations/        # migrations (NUNCA editar o SQL de uma migration já aplicada)
src/
  lib/
    erros.js         # ErroDeNegocio + responderErro (usado no catch de toda rota)
    requisicao.js    # lerJson, lerId, ehIdValido, lerPaginacao, respostaPaginada
    sessao.js        # iniciarSessao, encerrarSessao, lerSessao, exigirUsuario
    swagger.js       # documentação da API (exibida em /api-doc)
  models/            # regras de negócio + SQL (usuarios, campanha, doacao, donatario)
  app/api/v1/        # rotas: só leem a requisição, chamam o model e respondem
```

### Regras

- **Rota fina, model com a regra.** A rota lê os dados (`lerJson`, `lerId`,
  `lerPaginacao`), confere o login (`exigirUsuario("ong")`), chama o model e
  devolve `NextResponse.json`. Todo `catch` usa `responderErro(error)`.
- **Erros esperados** são `throw new ErroDeNegocio("mensagem", status)`.
  A mensagem vai para o usuário, então escreva em português, em minúsculo,
  sem detalhes internos. Status: 400 dado inválido, 401 sem login, 403 sem
  permissão, 404 não existe (ou o usuário não pode ver), 409 conflito com o
  estado atual.
- **SQL sempre com parâmetros** (`$1`, `$2`…). Nunca concatene valores do
  usuário no SQL.
- **UPDATE com colunas fixas:** busque o registro atual, troque só os campos
  enviados e faça um UPDATE com todas as colunas (nada de montar SQL dinâmico).
- **Status com os mesmos nomes em todo lugar:** doação `pendente | confirmada |
cancelada`; campanha `rascunho | ativa | encerrada | cancelada`.
- **Listagens paginadas** devolvem `{ itens, paginacao: { pagina, limite,
total, total_paginas } }` (use `respostaPaginada`).
- **Ids** trafegam como texto (`"12"`), porque vêm de colunas BIGINT.
- **Migrations já aplicadas não mudam.** Para alterar o banco, crie uma
  migration nova (`npm run migrations:create nome-da-mudanca`).
- **Ao criar ou mudar uma rota, atualize `src/lib/swagger.js`.**

### Testes

- Ficam em `tests/integration/api/v1/` e chamam a API rodando em
  `localhost:3000` (`tests/orchestrator.js` tem os helpers: `novaOng`,
  `novoDoador`, `criarCampanha`…).
- Todo usuário de teste usa e-mail `@teste.connect`; `limparDadosDeTeste()`
  apaga só esses dados ao fim de cada suíte. Use esse domínio também em testes
  manuais.
- `jest.config.js` usa `maxWorkers: 1` e `testTimeout: 30000` (o bcrypt é lento
  e as suítes compartilham o mesmo banco).
- **Toda correção de bug ou rota nova ganha teste.**

---

## 4. Frontend

### Estrutura

```
src/app/
  layout.js            # raiz: só fonte (Manrope) e tema
  globals.css          # tokens de cor do Design System + tema do HeroUI
  (site)/              # páginas com menu e rodapé (Header + Footer no layout)
    page.js            # Início
    campanhas/[id]/    # Detalhe da campanha
    ongs/[id]/         # Página pública da ONG (campanhas ativas)
    componentes/       # vitrine dos componentes (http://localhost:3000/componentes)
  (auth)/              # Entrar e Criar conta (logo + "Voltar", sem menu)
src/(components)/
  ui/                  # componentes básicos: Button, Chip, Input, Segmented,
                       # Table, Modal, CampaignCard, Pagination, Logo, ThemeToggle...
  base/(public)/       # Header, Footer, QueroDoar
  base/(ong)/          # Sidebar e Topbar do painel da ONG
  base/(auth)/         # AuthQuote (citação das telas de login/cadastro)
public/                # imagens (Bolha00..04.png, background-circles.png, identity/)
```

- Pastas entre parênteses são **grupos de rotas** do Next: não aparecem na URL
  e servem para cada grupo ter o próprio layout.
- Import sempre com o atalho `@/` (ex.: `@/(components)/ui/Button`).

### Componentes

- **Componentes nossos com API em português**, construídos sobre o HeroUI:
  `<Button variante="secundario" tamanho="pequeno" larguraTotal>`,
  `<Chip status="Pendente" />`, `<Input rotulo="E-mail" dica="..." />`,
  `<Segmented opcoes={["Doador", "ONG"]} aoMudar={setTipo} />`,
  `<Modal aberto aoFechar titulo subtitulo>`.
- Variantes do Button: `primario | secundario | suave | contorno | perigo`;
  tamanhos: `medio | pequeno`.
- **Atenção:** no `Input` (TextField do HeroUI) o `onChange` recebe o **texto**,
  não o evento: `onChange={setEmail}`.
- Quando não existe componente nosso, **use o HeroUI direto** (como em
  `Pagination.js`, `Accordion` e `Avatar` na home), com as classes de tema dele
  (`bg-default`, `text-muted`, `bg-accent`).
- Componentes do HeroUI já vêm com `"use client"`. Componentes nossos com estado
  (`useState`) ou eventos precisam de `"use client"` no topo.
- Páginas que só mostram dados são **componentes de servidor** e podem buscar
  direto nos models (ex.: `campanhas/[id]/page.js` usa `obterCampanhaVisivel`).
  Formulários e interações ficam em componentes de cliente que chamam a API com
  `fetch`.
- Mensagens de erro do formulário mostram o `erro` que vem da API.

### Estilo (Tailwind)

- **Cores só pelos tokens** do `globals.css`: `bg-primary-500`,
  `text-neutral-900`, `bg-success-100`, `bg-pagina`… Nunca cor fixa (hex) no
  componente — exceto casos pontuais documentados (ex.: o rosa do coração).
- **Modo escuro** é a classe `dark` no `<html>` (o `ThemeToggle` liga/desliga).
  Como os componentes usam os tokens, quase nada precisa de `dark:`; use
  `dark:` só para exceções (ex.: `dark:invert` em imagens pretas). Fundo escuro
  é `#14151c`, nunca preto puro.
- **Seções da página** (padrão da home):
  - `<section className="w-full px-4 py-20">` — o `px-4` alinha com o menu.
  - Conteúdo em `w-full max-w-7xl` (1280px, a mesma largura do menu).
  - `<article className="flex flex-col items-center gap-15">`.
  - Título da seção: `<h1 className="text-4xl font-semibold">`; subtítulo:
    `text-lg opacity-70`.
  - O menu é **fixo**: a primeira seção de cada página precisa de `pt-36`.
- **Escala de tamanhos** (não exagerar):
  - Cards: `rounded-2xl border border-neutral-200 bg-neutral-0 p-6
shadow-suave`, espaçamentos `gap-2`, `gap-4`, `gap-7`.
  - Título de card: `text-lg font-semibold` (ou `text-xl`/`text-2xl` em
    destaque); corpo: `text-sm`/padrão.
  - Texto secundário com **`opacity-70` / `opacity-80`** (em vez de cinza).
  - Formulários: `max-w-120`, campos com `gap-6`; botões de tabela com
    `tamanho="pequeno"`.
- Prefira as **classes numéricas** do Tailwind (`w-150`, `max-w-120`, `gap-15`,
  `h-110`) a valores arbitrários (`w-[600px]`).
- Transições e hover: `duration-300 ease`, `hover:opacity-100`,
  `hover:scale-110`.
- Imagens decorativas: `alt=""`, `aria-hidden="true"`, `draggable="false"`,
  `pointer-events-none`.
- **Fidelidade ao Figma:** posições copiadas do Figma viram porcentagens do
  frame de 1920px (veja `BOLHAS` em `(site)/page.js`).

### Editor (VS Code)

O `.vscode/settings.json` do projeto já configura:

- **Tailwind IntelliSense** apontando para `src/app/globals.css` (o Tailwind é
  importado através do `@heroui/styles`, e a extensão não acha sozinha);
- arquivos `.js` abertos como **JavaScript React** e **Emmet no JSX**
  (`div` + Tab → `<div></div>`).

Depois de mudar essas configurações: `Cmd/Ctrl + Shift + P` → "Developer:
Reload Window".

---

## 5. Design (Figma)

- Arquivo: **Connect** — https://www.figma.com/design/dkRvWQZTHvFjmEB9sdNNaM/Connect
- Páginas:
  - **🧩 Design System** — fundamentos (variáveis de cor em modo Claro/Escuro,
    espaçamentos, raios, estilos de texto em Manrope) e componentes (Navbar,
    Sidebar ONG, Topbar Painel, Card de campanha, Botão, Chip de status,
    Seletor segmentado, Campo de texto, Header/Card mobile…).
  - **🖥️ Telas** — seções Desktop · Público / Doador / ONG, Mobile e as
    versões **Escuro** de todas as telas.
  - **📦 Rascunho (original)** — o design inicial, guardado como referência.
- Os tokens do `globals.css` são os mesmos das variáveis do Figma; ao mudar uma
  cor, mude nos dois lugares.

---

## 6. Git e entrega

- Branches de trabalho saem da **`development`**:
  `feat/nome`, `fix/nome`, `refactor/nome`, `docs/nome`
  (ex.: `feat/perfil-e-paginacao`, `feat(front)-homepage`).
- Fluxo: **branch → PR para `development` → `homolog` → `main`**.
- **Commits** no padrão Conventional Commits, em português e sem acentos no
  título: `feat(donatarios): cadastro de donatarios e vinculo com campanhas`.
  Um assunto por commit (ex.: formatação do Prettier em commit separado).
- **Pull Requests são abertos e mergeados manualmente pelo dono do projeto.**
  O Claude pode commitar e dar push quando pedido, mas não abre PR nem faz
  merge sozinho.
- Nunca versionar segredos nem arquivos de cookie (`cookies.txt`, `.env`).

---

## 7. Como trabalhar com o Claude neste projeto

- **Responder em português**, explicando como para alguém iniciante: o que foi
  feito, por quê, e o que muda para quem usa o código.
- **Seguir as práticas do código existente.** Antes de criar algo, ler os
  arquivos parecidos (especialmente os editados à mão pelo time) e copiar o
  padrão — nomes, tamanhos, espaçamentos, estrutura das seções.
- **Ler o arquivo antes de editar.** O time edita os arquivos ao mesmo tempo;
  nunca sobrescrever mudanças que não sejam suas. Mudanças que parecem
  intencionais devem ser preservadas.
- **Verificar antes de dizer que terminou:**
  - backend: rodar `npm test` (todos os testes passando);
  - frontend: abrir a página no navegador (Chrome headless com captura de tela)
    e conferir claro e escuro; comparar com o Figma quando for uma tela do
    design; testar o fluxo de verdade (ex.: login, cadastro, doação);
  - `npm run lint:check` sem erros.
- **Dados de teste** sempre com e-mail `@teste.connect` (são apagados pelo
  `npm test`).
- **Perguntar antes de:** mudanças grandes de estrutura, mudar comportamento da
  API, instalar dependências, commitar/dar push, apagar arquivos.
- **Avisar o que ficou de fora** e problemas encontrados no caminho, mesmo que
  não tenham sido pedidos (ex.: erros de digitação, falhas de segurança).

---

## 8. Limitações conhecidas (para não estranhar)

- A **descrição** da campanha é opcional no rascunho, mas **obrigatória para
  publicar**. Depois do **último dia para doar** (`termina_em`, opcional), a
  campanha não recebe novas doações.
- **Fotos** (perfil e galeria da campanha) ficam no próprio Postgres, em
  colunas BYTEA (tabelas `foto_usuario` e `foto_campanha`): até 2 MB, só
  JPG/PNG/WEBP, no máximo 8 por campanha, e a primeira foto é a capa.
- A doação aceita só **`dinheiro` e `item`** (a aba "Alimento" do Figma não
  existe no backend).
- Não existe **recuperação de senha** ("Esqueceu a senha?" é `href="#"`).
- O **arrecadado** de uma campanha soma só doações em dinheiro **confirmadas**
  pela ONG.
- Ainda não existem as páginas `/campanhas` e `/minhas-doacoes`.
