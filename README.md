# Connect

> O Connect é um sistema de gerenciamento de doações que conecta doadores a campanhas de arrecadação, com ONGs servindo como ponte. Ele elimina o receio que pessoas podem ter ao quererem doar itens aos necessitados e se sentirem vítimas de exploração.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Demonstração](#demonstração)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Testes](#testes)
- [Roadmap](#roadmap)
- [Como Contribuir](#-como-contribuir)
- [Licença](#-licença)
- [Autores](#autores)
- [Contato](#contato)

## Sobre o Projeto

Com o objetivo de eliminar o receio de pessoas para doar itens aos necessitados, o Connect é destinado a doadores, ou possíveis doadores, que querem tornar a vida de pessoas carentes melhor.

## Funcionalidades

- [ ] Criar Conta
- [ ] Efetuar Login
- [ ] Cadastro como ONG ou Instituição
- [ ] Cadastro como Doador Individual
- [ ] Cadastro de Nova Campanha Através de Contas do Tipo ONG ou Instituição
- [ ] Realizar Doação Para Uma Campanha
- [ ] Exibir Perfis
- [ ] Alterar Conta
- [ ] Criador da Campanha Pode Realizar Atualizações Sobre Andamento da Campanha
- [ ] Conta do Tipo ONG ou Instituição Terá Painel Dashboard Com Gráficos para Exibir Dados Sobre a(s) Campanha(s)
- [ ] Contatar Criador de Determinada Campanha

## Demonstração

<!-- TODO: substituir pelos assets reais do projeto (GIF, screenshots ou link de deploy) -->

![Screenshot](docs/assets/screenshot.png)

🔗 [Acesse a demo online](https://exemplo.com)

## Tecnologias Utilizadas

| Camada         | Tecnologia                                |
| -------------- | ----------------------------------------- |
| Front-end      | Next.JS / React.js / TailwindCSS / HeroUI |
| Back-end       | Node.js / Express.js / JWT / Cors         |
| Banco de Dados | PostgreSQL                                |
| Infraestrutura | Docker / Cloudflare / Vercel              |

## Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (versão >= 18)
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/)

## Instalação

```bash
# Clone o repositório
git clone https://github.com/franciscoentony/connect.git

# Acesse a pasta do projeto
cd connect

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

> Para o passo a passo completo de configuração, consulte [docs/INSTALL.md](docs/INSTALL.md).

## Como Usar

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Por padrão, a aplicação estará disponível em `http://localhost:3000`.

<!-- TODO: adicionar exemplos práticos de uso (fluxo de cadastro, criação de campanha, doação) e prints de tela -->

## Estrutura do Projeto

```
connect/
├── src/                # Código-fonte da aplicação
├── docs/               # Documentação técnica (arquitetura, API, requisitos)
├── tests/              # Testes automatizados
├── .github/            # Templates de issues, PRs e workflows CI/CD
├── .env.example        # Exemplo de variáveis de ambiente
├── CONTRIBUTING.md
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
└── README.md
```

## Testes

```bash
npm run test
npm run test:watch      # Roda os testes continuamente
```

## Roadmap

- [x] MVP funcional
- [ ] Cobertura completa de testes automatizados
- [ ] Suporte a múltiplos idiomas
- [ ] Deploy em produção

Veja as [issues abertas](https://github.com/franciscoentony/connect/issues) para propostas e melhorias futuras.

## Como Contribuir

Contribuições são bem-vindas! Consulte o guia [CONTRIBUTING.md](CONTRIBUTING.md) antes de enviar um Pull Request.

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE) para mais informações.

## Autores

<!-- TODO: adicionar nome, GitHub e/ou LinkedIn de cada integrante do projeto -->

- [Francisco Entony](https://github.com/franciscoentony)

## Contato

<!-- TODO: adicionar canais de contato reais (e-mail, Discord, LinkedIn etc.) -->

Dúvidas ou sugestões? Abra uma [issue](https://github.com/franciscoentony/connect/issues) ou entre em contato por [e-mail](mailto:contato@exemplo.com).
