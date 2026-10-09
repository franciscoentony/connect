# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Usuário principal: o doador.** Uma pessoa comum que quer ajudar quem precisa,
mas tem receio de doar e ser enganada (ver a doação desviada, cair em golpe ou
em alguém explorando a boa vontade dela). É a experiência dele que decide se o
Connect deu certo: ele precisa confiar o suficiente para doar e, depois, ter
certeza de que a doação chegou.

**Usuário secundário: a ONG.** A equipe de uma organização com CNPJ que cria
campanhas, cadastra locais de entrega e donatários e confirma as doações
recebidas no painel (`/dashboard`). Sem ONGs ativas não há o que doar, mas,
quando houver conflito de prioridade, o doador vem primeiro.

## Product Purpose

O Connect conecta doadores a campanhas de arrecadação criadas por ONGs, que
servem de ponte entre quem doa e quem recebe. Existe para eliminar o receio de
doar: cada etapa entre "quero ajudar" e "a ajuda chegou" precisa ser visível e
confirmada.

Sucesso = o doador escolhe uma campanha, doa (dinheiro ou item) e acompanha a
doação até ela ser confirmada pela ONG, sem ficar em dúvida em nenhum momento.

## Positioning

Diferente de uma vaquinha comum, onde qualquer pessoa pede dinheiro e o doador
não sabe o que acontece depois, no Connect a confiança é construída por
mecanismos do próprio sistema:

1. **Só ONGs com CNPJ criam campanhas** — pessoas físicas não pedem doações.
2. **A ONG confirma cada doação** — o doador acompanha o status
   (`pendente` → `confirmada`, ou `cancelada`) e sabe que ela foi recebida.
3. **O destino é visível** — a campanha mostra os locais de entrega e os
   donatários atendidos (pessoas, famílias ou instituições).
4. **Atualizações da campanha** — a ONG publica o andamento da campanha.
   _(Decidido, mas ainda não existe no sistema.)_

## Operating Context

- Projeto de um time de desenvolvedores iniciantes. Começou como estudo, com o
  plano de ser lançado para ONGs e doadores reais depois.
- Tudo em português do Brasil: interface, mensagens, código e documentação.
- Valores em reais (R$); a doação pode ser em **dinheiro** (com método de
  pagamento: Pix, cartão, boleto) ou em **item**.
- Fluxo da ONG: cria a campanha (nasce como rascunho) → publica (ativa) →
  recebe e confirma doações → encerra. Uma campanha também pode ser cancelada.
- Deploy previsto na Vercel; banco PostgreSQL.

## Capabilities and Constraints

**Existe hoje:** cadastro e login de doador e ONG; campanhas com status
(`rascunho | ativa | encerrada | cancelada`), meta opcional e total arrecadado
(soma só doações em dinheiro confirmadas); galeria de fotos da campanha (a
primeira é a capa); locais de entrega; donatários vinculados às campanhas;
doações com status; foto de perfil; página pública da ONG (descrição, site,
contato público, contribuidores, campanhas ativas); painel da ONG com resumo,
campanhas, donatários e perfil.

**Decidido, mas ainda não existe:** atualizações de andamento da campanha;
gráficos no painel da ONG; páginas `/campanhas` (lista) e `/minhas-doacoes`
(acompanhamento do doador); recuperação de senha.

**Em aberto (sem regra definida):** seguir uma ONG e contar seguidores; selos
de conquista da ONG; descrição e cidade da própria campanha; doação do tipo
"alimento".

**Restrições:**

- O código precisa ser fácil de ler por iniciantes (ver `CLAUDE.md`).
- O CNPJ é validado só pelo formato (14 dígitos); **não há verificação junto à
  Receita Federal**, então a interface não pode prometer "ONG verificada".
- Os status têm os mesmos nomes em todo o sistema (doação:
  `pendente | confirmada | cancelada`; campanha:
  `rascunho | ativa | encerrada | cancelada`).

## Brand Commitments

- Nome: **Connect**. Logos em `public/identity/` (`logo_connect.png`,
  `CONNECT_1..6.png`, `co.png`).
- Design oficial no Figma (arquivo **Connect**,
  https://www.figma.com/design/dkRvWQZTHvFjmEB9sdNNaM/Connect), com Design
  System próprio; os tokens do `src/app/globals.css` espelham as variáveis do
  Figma e as telas devem seguir o layout definido lá.

## Evidence on Hand

- Fotos de ação social usadas na home: `public/Bolha00.png` a `Bolha04.png`.
- **Ainda não existem** ONGs reais, doadores reais, depoimentos, números de
  impacto ou parceiros. Os dados da home (`CAMPANHAS`, maiores contribuidores,
  perguntas frequentes) são **exemplos** e não podem ser apresentados como
  reais. Não inventar números, depoimentos ou selos de verificação.

## Product Principles

1. **Confiança se mostra, não se promete.** Cada afirmação de segurança precisa
   corresponder a algo que o sistema realmente faz (status confirmado, CNPJ,
   destino visível); nada de selos ou garantias que o sistema não sustenta.
2. **O doador nunca fica no escuro.** Em qualquer tela, ele sabe onde está a
   doação dele e qual é o próximo passo.
3. **Doar é fácil; desconfiar é desnecessário.** O caminho até doar é curto, e
   as informações que tiram a dúvida (quem é a ONG, para onde vai, quem recebe)
   ficam à vista, não escondidas.
4. **A ONG trabalha sem atrito.** O painel resolve o dia a dia (confirmar
   doações, manter a campanha atualizada) com o mínimo de passos, porque uma ONG
   pequena tem pouco tempo.
