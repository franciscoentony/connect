# Documento de Requisitos (SRS)

## 1. Introdução

### 1.1 Propósito

Descreva o objetivo deste documento e do sistema a ser desenvolvido.

### 1.2 Escopo

Defina os limites do sistema: o que está e o que não está incluso.

### 1.3 Definições, Acrônimos e Abreviações

| Termo | Definição |
| ----- | --------- |
|       |           |

### 1.4 Referências

Liste documentos, normas ou materiais consultados.

## 2. Descrição Geral

### 2.1 Perspectiva do Produto

Contexto do sistema: é novo, substitui outro sistema, integra com quais outros sistemas?

### 2.2 Funções do Produto

Resumo das principais funcionalidades (visão macro).

### 2.3 Características dos Usuários

Descreva os perfis de usuários (ex.: administrador, cliente, operador) e seu nível técnico esperado.

### 2.4 Restrições

Limitações técnicas, legais, de prazo ou orçamento.

### 2.5 Suposições e Dependências

Fatores externos que, se mudarem, afetam os requisitos.

## 3. Requisitos Funcionais

| ID     | Descrição                                   | Prioridade | Critério de Aceite                               |
| ------ | ------------------------------------------- | ---------- | ------------------------------------------------ |
| RF-001 | O sistema deve permitir cadastro de usuário | Alta       | Usuário consegue se cadastrar com e-mail e senha |
| RF-002 | O sistema deve permitir login               | Alta       | Usuário autenticado recebe token de acesso       |

## 4. Requisitos Não Funcionais

| ID      | Categoria   | Descrição                                           |
| ------- | ----------- | --------------------------------------------------- |
| RNF-001 | Performance | Resposta da API em até 300ms em 95% das requisições |
| RNF-002 | Segurança   | Senhas armazenadas com hash bcrypt                  |
| RNF-003 | Usabilidade | Interface responsiva para dispositivos móveis       |

## 5. Casos de Uso / Histórias de Usuário

### UC-001 — Cadastro de Usuário

**Como** um visitante,
**Eu quero** me cadastrar no sistema,
**Para que** eu possa acessar as funcionalidades exclusivas.

**Critérios de aceite:**

- [ ] Campos obrigatórios validados
- [ ] E-mail único no sistema
- [ ] Confirmação por e-mail enviada

## 6. Regras de Negócio

| ID     | Regra |
| ------ | ----- |
| RN-001 |       |

## 7. Glossário

| Termo | Significado |
| ----- | ----------- |
|       |             |

## 8. Aprovações

| Nome | Papel | Data | Assinatura |
| ---- | ----- | ---- | ---------- |
|      |       |      |            |
