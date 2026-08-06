# Arquitetura do Projeto

## Sobre o projeto

O sistema cria uma conta que pode, ou não, ter a tag de ONG ou Instituição. ONGs e Instituições podem criar campanhas solidárias que outros usuários podem realizar doações de itens. Conforme ela avança, a campanha realiza atualizações sobre o estado atual.

## Tecnologias usadas

- **Front-end:** Next.JS, React.JS e TailwindCSS
- **Back-end:** Node.Js, Express.js, JWT e Cors
- **Banco de dados:** PostgreSQL
- **Hospedagem / Deploy:** Vercel

## Como as partes se conectam

O frontend (React) envia a requisição a API (Node.js), que salva dados no banco PostgreSQL e retorna uma resposta. Serviços externos incluem: envio de emais para confirmação de conta.
