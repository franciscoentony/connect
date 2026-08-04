# Guia de Contribuição

Obrigado por considerar contribuir com este projeto! Este documento define o fluxo de trabalho, padrões de código e boas práticas para colaborar.

## Antes de Começar

- Leia o [Código de Conduta](CODE_OF_CONDUCT.md)
- Verifique as [issues abertas](../../issues) para não duplicar esforços
- Para mudanças grandes, abra uma issue de discussão antes de começar a implementar

## Configurando o Ambiente

1. Faça um fork do repositório
2. Clone o seu fork:
   ```bash
   git clone https://github.com/franciscoentony/connect.git
   ```
3. Adicione o repositório original como upstream:
   ```bash
   git remote add upstream https://github.com/franciscoentony/connect.git
   ```
4. Instale as dependências e siga o [guia de instalação](docs/INSTALL.md)

## Fluxo de Branches

Utilizamos o modelo baseado em `main` + branches de feature:

| Branch         | Finalidade                          |
| -------------- | ----------------------------------- |
| `main`         | Código estável em produção          |
| `develop`      | Integração de novas funcionalidades |
| `feature/nome` | Novas funcionalidades               |
| `fix/nome`     | Correção de bugs                    |
| `hotfix/nome`  | Correções urgentes em produção      |

```bash
git checkout -b feature/nome-da-funcionalidade
```

## Padrão de Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo opcional>): <descrição curta>

[corpo opcional]

[rodapé opcional]
```

Tipos comuns:

- `feat`: nova funcionalidade
- `fix`: correção de bug
- `docs`: alterações na documentação
- `style`: formatação, sem alteração de lógica
- `refactor`: refatoração de código
- `test`: adição ou correção de testes
- `chore`: tarefas de manutenção

Exemplo:

```
feat(auth): adiciona autenticação via OAuth2
```

## Checklist Antes do Pull Request

- [ ] Código segue o guia de estilo do projeto (linter sem erros)
- [ ] Testes foram adicionados/atualizados e estão passando
- [ ] Documentação foi atualizada, se necessário
- [ ] Commits seguem o padrão Conventional Commits
- [ ] Branch está atualizada com a `main`/`develop`

## Processo de Pull Request

1. Envie sua branch para o seu fork
2. Abra um Pull Request para a branch `develop` (ou conforme definido pelo mantenedor)
3. Preencha o template de PR completamente
4. Aguarde revisão — ajustes podem ser solicitados
5. Após aprovação, o PR será mesclado pelo mantenedor

## Reportando Bugs

Use o [template de bug report](.github/ISSUE_TEMPLATE/bug_report.md) e inclua:

- Passos para reproduzir
- Comportamento esperado vs. observado
- Ambiente (SO, versão, navegador etc.)
- Logs ou screenshots, se aplicável

## Sugerindo Funcionalidades

Use o [template de feature request](.github/ISSUE_TEMPLATE/feature_request.md) descrevendo o problema que a funcionalidade resolve e possíveis abordagens.

## Padrões de Código

- Siga o linter/formatter configurado no projeto (ESLint, Prettier, Black, etc.)
- Escreva nomes de variáveis e funções descritivos
- Prefira funções pequenas e com responsabilidade única (SRP)
- Comente apenas o que não é óbvio pelo próprio código

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.
