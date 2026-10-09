---
name: Connect
description: Doações com confiança — doadores, ONGs e campanhas num só lugar.
colors:
  lavanda-solidaria: "#775bf0"
  lavanda-profunda: "#6a55c5"
  lavanda-nevoa: "#eae6fd"
  limao-esperanca: "#82ce2d"
  limao-maduro: "#679f29"
  limao-nevoa: "#ecf7df"
  verde-confirmado: "#17c964"
  verde-confirmado-nevoa: "#d1f4e0"
  rosa-alerta: "#f31260"
  rosa-alerta-nevoa: "#fdd0df"
  azul-aguardando: "#006fee"
  azul-aguardando-nevoa: "#cce3fd"
  tinta: "#11181c"
  grafite: "#3f3f46"
  cinza-medio: "#6d6d76"
  cinza-borda-forte: "#d4d4d8"
  cinza-borda: "#e4e4e7"
  cinza-campo: "#f4f4f5"
  cinza-sutil: "#fafafa"
  branco-superficie: "#ffffff"
  fundo-painel: "#f1f1f3"
  noite-praca: "#14151c"
  texto-sobre-verde: "#11181c"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.25
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.025em"
rounded:
  md: "12px"
  lg: "16px"
  xl: "24px"
  card-campanha: "28px"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.lavanda-solidaria}"
    textColor: "{colors.branco-superficie}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-secondary:
    backgroundColor: "{colors.limao-esperanca}"
    textColor: "{colors.texto-sobre-verde}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-secondary-hover:
    backgroundColor: "{colors.limao-maduro}"
  button-soft:
    backgroundColor: "{colors.lavanda-nevoa}"
    textColor: "{colors.lavanda-profunda}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-outline:
    backgroundColor: "{colors.branco-superficie}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-danger:
    backgroundColor: "{colors.rosa-alerta-nevoa}"
    textColor: "{colors.rosa-alerta}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-small:
    typography: "{typography.body-small}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  chip-ativa:
    backgroundColor: "{colors.verde-confirmado}"
    textColor: "{colors.texto-sobre-verde}"
    rounded: "{rounded.full}"
    padding: "6px 14px 6px 12px"
  chip-pendente:
    backgroundColor: "{colors.azul-aguardando-nevoa}"
    textColor: "{colors.azul-aguardando}"
    rounded: "{rounded.full}"
    padding: "6px 14px 6px 12px"
  chip-confirmada:
    backgroundColor: "{colors.verde-confirmado-nevoa}"
    textColor: "{colors.verde-confirmado}"
    rounded: "{rounded.full}"
    padding: "6px 14px 6px 12px"
  chip-cancelada:
    backgroundColor: "{colors.rosa-alerta-nevoa}"
    textColor: "{colors.rosa-alerta}"
    rounded: "{rounded.full}"
    padding: "6px 14px 6px 12px"
  chip-rascunho:
    backgroundColor: "{colors.cinza-campo}"
    textColor: "{colors.grafite}"
    rounded: "{rounded.full}"
    padding: "6px 14px 6px 12px"
  card:
    backgroundColor: "{colors.branco-superficie}"
    rounded: "{rounded.lg}"
    padding: "24px"
  card-campanha:
    backgroundColor: "{colors.branco-superficie}"
    rounded: "{rounded.card-campanha}"
    padding: "16px"
  input:
    backgroundColor: "{colors.cinza-campo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
  navbar:
    backgroundColor: "{colors.cinza-campo}"
    rounded: "{rounded.full}"
    height: "64px"
  sidebar-item-ativo:
    backgroundColor: "{colors.lavanda-nevoa}"
    textColor: "{colors.lavanda-profunda}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
---

# Design System: Connect

## Overview

**Creative North Star: "A Praça Solidária"**

O Connect é um lugar público e acolhedor onde a comunidade se encontra para
ajudar. Como uma boa praça, ele é aberto, iluminado e organizado: dá para ver
tudo de longe, ninguém se perde, e cada canto convida a chegar mais perto. A
atmosfera é **acolhedora e confiável**: calor humano de ONG de bairro, com a
ordem de quem cuida bem do que recebe.

Os elementos são **macios e convidativos**: cantos generosos, fundos lavanda e
cinza bem claros, sombras quase imperceptíveis e muito respiro entre os blocos.
A cor aparece com intenção: a Lavanda Solidária chama para agir, o Limão
Esperança celebra o que deu certo, e as cores de status contam ao doador, sem
ambiguidade, onde está a doação dele. O tema escuro é a mesma praça à noite
(Noite da Praça, nunca preto puro), com as mesmas cores levemente acesas.

O Connect **não deve parecer um sistema de banco**: nada frio, burocrático ou de
tabelas sem respiro. Mesmo no painel da ONG, onde há dados e tabelas, os
blocos são arredondados, espaçados e com a voz gentil do produto.

**Key Characteristics:**

- Uma única família tipográfica (Manrope), só de Regular a Bold.
- Lavanda como cor de ação; verde reservado para sucesso e confirmação.
- Superfícies brancas sobre fundo claro, separadas só por tom e sombras
  difusas: sem bordas de contorno (borda é exclusiva dos botões).
- Cantos arredondados em todos os níveis, do botão (12px) ao card de campanha
  (28px) e às pílulas (chips, menu).
- Tema claro e escuro completos, trocados só por variáveis.

## Colors

Uma paleta clara e otimista: uma lavanda de ação, um limão de esperança, cores
de status inequívocas e cinzas frios que dão ordem sem esfriar.

### Primary

- **Lavanda Solidária** (`lavanda-solidaria`): a cor de agir. Botão principal
  ("Doar", "Publicar campanha"), página e aba ativas, barra de progresso da
  meta, foco dos campos e paginação ativa.
- **Lavanda Profunda** (`lavanda-profunda`): texto sobre fundo lavanda (botão
  suave, item ativo do menu lateral) e valores arrecadados.
- **Névoa Lavanda** (`lavanda-nevoa`): fundo de ações leves (botão suave,
  "Contribuir agora"), item ativo do menu e destaques sutis.

### Secondary

- **Limão Esperança** (`limao-esperanca`): o "deu certo". Botão secundário
  para confirmar doação ou encerrar campanha, e o gradiente do card de destaque
  do painel. O texto sobre ele é sempre escuro (`texto-sobre-verde`, Tinta
  fixa nos dois temas).
- **Limão Maduro** (`limao-maduro`): hover e estado pressionado do botão
  secundário.
- **Névoa Limão** (`limao-nevoa`): fundo suave para mensagens positivas.

### Tertiary

As cores de status. Cada uma tem um par forte/névoa e um significado fixo, o
mesmo nome do backend:

- **Verde Confirmado** (`verde-confirmado`) / névoa: doação **confirmada**,
  campanha **ativa**, mensagens de sucesso.
- **Azul Aguardando** (`azul-aguardando`) / névoa: doação **pendente**.
- **Rosa Alerta** (`rosa-alerta`) / névoa: doação **cancelada**, erros, ações
  destrutivas ("Excluir", "Sair da conta").

### Neutral

- **Tinta** (`tinta`): títulos e texto principal.
- **Grafite** (`grafite`): texto de apoio e links do menu.
- **Cinza Médio** (`cinza-medio`): placeholders e cabeçalhos de tabela.
- **Cinza Borda** (`cinza-borda`) / **Borda Forte** (`cinza-borda-forte`):
  linhas divisórias (entre linhas de tabela, itens de lista e abas) / contorno
  do botão de contorno.
- **Cinza Campo** (`cinza-campo`): fundo de campos, busca, menu do topo e
  cabeçalho de tabela.
- **Branco Superfície** (`branco-superficie`): cards, tabelas, modais.
- **Fundo do Painel** (`fundo-painel`): fundo da área logada da ONG, para os
  cards brancos se destacarem.
- **Noite da Praça** (`noite-praca`): fundo da página no tema escuro.

No tema escuro, cada variável troca de valor (as superfícies vão de `#1c1d27`
a `#262733`, o texto vira `#f4f4f6`, a lavanda clareia para `#8d76f3`); os
componentes não mudam.

### Named Rules

**The Uma Cor, Um Significado Rule.** Verde é sempre "confirmado/ativo/deu
certo", azul é sempre "aguardando", rosa é sempre "cancelado/erro/destrutivo".
Nunca use uma cor de status como decoração: o doador aprende a ler o status
pela cor.

**The Contraste AA Rule.** Todo texto tem contraste de pelo menos 4,5:1 com o
fundo (WCAG AA). Por isso: texto e ícone roxo usam a Lavanda Profunda
(`primary-600`), não a Lavanda Solidária; texto sobre verde é sempre escuro;
e texto branco sobre a faixa roxa não leva opacidade.

**The Variável Sempre Rule.** Cor só pelos tokens (`bg-primary-500`,
`text-neutral-900`…). Hex direto no componente quebra o tema escuro; a única
exceção documentada é o rosa do coração de favoritar (`#fb6894`).

## Typography

**Display Font:** Manrope (com fallback sans-serif)
**Body Font:** Manrope (com fallback sans-serif)

**Character:** uma única família geométrica e humana, arredondada o bastante
para ser acolhedora e firme o bastante para números e status. A hierarquia
vem do peso e do tamanho, nunca de uma segunda fonte.

### Hierarchy

- **Display** (Bold, 48px, 1.25): só a frase principal da home.
- **Headline** (SemiBold, 36px, 1.2): título de cada seção e de cada página do
  painel ("Campanhas ativas", "Donatários"). Nas páginas públicas mais densas,
  pode descer para 30px Bold.
- **Title** (SemiBold, 20px, 1.35): título de card e de bloco ("Onde entregar
  as doações", título do card de campanha). 18px em cards menores.
- **Body** (Regular, 16px, 1.5): texto corrido e células de tabela. Subtítulos
  de seção usam 18px com 70% de opacidade.
- **Body Small** (Regular, 14px, 1.5): texto de apoio, dicas, metadados ("por
  Amigos do Bem · criada em…").
- **Label** (SemiBold, 12px, espaçamento 0.025em, MAIÚSCULAS): cabeçalho de
  tabela. Rótulos de campo usam 14px SemiBold, sem caixa alta.

### Named Rules

**The Opacidade, Não Cinza Rule.** Texto secundário usa a cor do texto com
opacidade (`opacity-70` / `opacity-80`), não um cinza diferente. Assim ele
acompanha o tema claro e o escuro sozinho.

**The Regular-a-Bold Rule.** Só os pesos 400, 500, 600 e 700 da Manrope.
Nada de Light ou ExtraBold.

## Layout

- **Container:** conteúdo em largura máxima de 1280px, centralizado, com 16px
  de margem lateral, alinhado à largura do menu do topo.
- **Seções públicas:** 80px de espaço vertical entre seções; títulos
  centralizados na home e alinhados à esquerda nas páginas internas. O menu do
  topo é fixo, então a primeira seção começa com 144px de espaço no topo.
- **Painel da ONG:** fundo do painel, menu lateral fixo de 300px à esquerda,
  barra do topo e conteúdo à direita, com 24px de espaço entre todos os blocos.
- **Ritmo:** escala de 4px (4, 8, 12, 16, 24, 32, 48, 64). Dentro de cards
  `gap` de 8–16px; entre campos de formulário 24px; entre blocos de página
  32–48px.
- **Grades:** campanhas em 3 colunas (cards de 400px, 40px de espaço) que caem
  para 2 e 1 coluna em telas menores. Formulários com largura máxima de
  480–560px.
- **Densidade:** generosa. Prefira mais respiro a mais informação por tela;
  tabelas têm células altas (20px de padding vertical).

## Elevation & Depth

Um sistema **híbrido e discreto**: a profundidade vem principalmente da troca
de tom (superfície branca sobre fundo claro), com uma sombra difusa que só
"descola" o elemento do fundo; nenhuma superfície tem borda de contorno. Nada flutua de forma dramática,
exceto o modal.

### Shadow Vocabulary

- **Suave** (`box-shadow: 0 1px 2px rgb(17 24 28 / 0.04), 0 12px 32px -8px rgb(17 24 28 / 0.06)`):
  cards, tabelas, formulários, menu lateral, barra do topo e menu público.
- **Modal** (`box-shadow: 0 24px 64px -12px rgb(17 24 28 / 0.18)`): só janelas
  sobre a página.

### Named Rules

**The Sombra Que Não Se Vê Rule.** A sombra suave deve ser sentida, não vista.
Se dá para apontar onde a sombra está, ela está forte demais. Uma superfície
nunca recebe mais de uma sombra.

## Shapes

Tudo é arredondado, e o raio cresce com o tamanho do elemento:

- **12px:** botões, campos, itens do menu lateral, miniaturas.
- **16px:** cards, tabelas, formulários, menu lateral.
- **20–24px:** imagem dentro do card de campanha, modal, barra do topo do
  painel, faixa da página da ONG.
- **28px:** card de campanha.
- **Pílula (total):** chips de status, menu do topo, seletor segmentado,
  barras de progresso, avatares.

Só os botões têm borda (o botão de contorno usa 2px, Borda Forte). Cards,
tabelas, formulários, menus e estados vazios não têm contorno; linhas finas de
1px (Cinza Borda) aparecem apenas como divisórias internas (entre linhas de
tabela, itens de lista, abas).

**The Borda É de Botão Rule.** Contorno é sinal de "clicável". Se o elemento
não é um botão (ou uma opção selecionável que funciona como botão), ele não
tem borda: a separação vem do fundo e da sombra.

### Named Rules

**The Nada Quina Viva Rule.** Nenhum elemento visível tem canto reto. Se um
elemento novo não se encaixa na escala acima, use o raio do vizinho mais
próximo em tamanho.

## Components

### Buttons

Macios e convidativos: cantos de 12px, peso SemiBold, sem caixa alta.

- **Shape:** cantos suavemente arredondados (12px).
- **Primário:** Lavanda Solidária com texto branco, 14px × 28px. A ação
  principal da tela; no máximo um por bloco.
- **Secundário:** Limão Esperança com texto escuro (Tinta, nos dois temas);
  escurece para Limão Maduro no hover. Só para confirmar/concluir (confirmar doação, encerrar campanha).
- **Suave:** Névoa Lavanda com texto Lavanda Profunda. Ações leves ("Ver
  página pública", "Contribuir agora").
- **Contorno:** fundo da superfície, borda de 2px Borda Forte, texto Tinta.
  Ações alternativas ("Editar", "Entrar em contato").
- **Perigo:** Névoa Rosa com texto Rosa Alerta. Excluir, cancelar, sair.
- **Tamanhos:** médio (padrão) e pequeno (10px × 18px, 14px), usado dentro de
  tabelas e cards.
- **Hover / Focus:** transição de 200–300ms; anel de foco na Lavanda Solidária.
  Estado de carregando com spinner no próprio botão.

### Chips

- **Style:** pílula com ponto colorido de 8px + texto 14px SemiBold.
- **Status de doação:** Pendente (azul névoa), Confirmada (verde névoa),
  Cancelada (rosa névoa).
- **Status de campanha:** Ativa (verde cheio, texto escuro, o único chip
  sólido, para chamar atenção nas imagens), Rascunho (cinza campo), Encerrada
  (cinza borda).

### Cards / Containers

- **Corner Style:** 16px (cards e tabelas); 28px no card de campanha.
- **Background:** Branco Superfície.
- **Shadow Strategy:** sombra Suave (ver Elevation & Depth).
- **Border:** nenhuma (só sombra e tom).
- **Internal Padding:** 24px; 16px no card de campanha.

### Inputs / Fields

- **Style:** fundo Cinza Campo, sem borda, cantos de 12px, 14px × 16px de
  padding, texto 16px. Rótulo em cima (14px SemiBold) e dica embaixo (12px).
- **Focus:** anel na Lavanda Solidária.
- **Error / Disabled:** a mensagem de erro aparece embaixo do formulário em
  Rosa Alerta (14px Medium), com o texto vindo da API; campo desabilitado fica
  esmaecido e mantém o fundo.

### Navigation

- **Menu público (topo):** pílula fixa de 64px de altura sobre Cinza Campo, com
  sombra suave e sem borda; logo à esquerda, links (16px Medium, Grafite → Tinta no
  hover) no centro, tema + login/avatar à direita.
- **Menu lateral do painel:** coluna branca de 300px, cantos de 16px. Itens com
  ícone + texto (16px Medium); o ativo ganha fundo Névoa Lavanda e texto
  Lavanda Profunda. "Sair da conta" fica no rodapé, em Perigo.
- **Abas:** links com sublinhado de 2px no item ativo (texto SemiBold); os
  inativos ficam com 70% de opacidade.

### Card de Campanha (componente assinatura)

O rosto de cada campanha: card de 400 × 560px, cantos de 28px, imagem de capa
de 290px (cantos de 20px) com o chip de status embaixo à esquerda e os botões
redondos de compartilhar/favoritar à direita; depois título (20px SemiBold),
"por ONG · cidade", barra de progresso em pílula (Lavanda Solidária sobre
Cinza Campo), valor arrecadado em Lavanda Profunda e o botão suave
"Contribuir agora" em largura total.

## Do's and Don'ts

### Do:

- **Do** usar só os tokens de cor do `globals.css`; o tema escuro depende disso.
- **Do** reservar a Lavanda Solidária para a ação principal e o estado ativo.
- **Do** usar verde, azul e rosa sempre com o mesmo significado de status.
- **Do** arredondar tudo seguindo a escala (12 → 16 → 24 → 28px → pílula).
- **Do** usar a sombra Suave em superfícies e a sombra Modal só em janelas.
- **Do** dar respiro: 24px entre campos, 32–48px entre blocos, 80px entre
  seções públicas.
- **Do** mostrar estados vazios como um card branco com sombra suave e uma
  frase que diga o próximo passo.

### Don't:

- **Don't** deixar o site com cara de sistema de banco: nada de telas densas,
  tabelas sem respiro, cinza dominante ou linguagem burocrática.
- **Don't** usar cor fixa (hex) nos componentes, nem preto puro no tema escuro
  (o fundo escuro é `#14151c`).
- **Don't** usar uma segunda família de fonte, nem pesos fora de 400–700.
- **Don't** usar cinza para texto secundário; use opacidade.
- **Don't** usar verde para enfeite ou rosa para destacar algo que não é erro
  ou ação destrutiva.
- **Don't** empilhar sombras ou deixar a sombra visível a ponto de "flutuar".
- **Don't** criar cantos retos.
- **Don't** colocar borda de contorno em nada que não seja botão.
