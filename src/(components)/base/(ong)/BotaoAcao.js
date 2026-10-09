"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/(components)/ui/Button";

// Botão que chama a API e atualiza a página (Publicar, Confirmar, Remover...).
// - metodo/url/corpo: a requisição que o botão faz;
// - confirmacao: se tiver, pergunta antes (use nas ações que não dá para desfazer);
// - o resto (variante, tamanho...) vai para o Button.
// Se a API devolver erro, mostra a mensagem dela num alerta.
//
// Uso:
//   <BotaoAcao metodo="PATCH" url="/api/v1/doacoes/5" corpo={{ status: "confirmada" }}
//              variante="secundario" tamanho="pequeno">Confirmar</BotaoAcao>

export default function BotaoAcao({
  metodo,
  url,
  corpo,
  confirmacao,
  children,
  ...props
}) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function executar() {
    if (confirmacao && !window.confirm(confirmacao)) return;

    setCarregando(true);
    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: corpo ? { "Content-Type": "application/json" } : undefined,
        body: corpo ? JSON.stringify(corpo) : undefined,
      });
      // respostas 204 (ex.: DELETE) não têm corpo
      if (!resposta.ok) {
        const dados = await resposta.json();
        window.alert(dados.erro); // mensagem que vem da API
        return;
      }
      router.refresh(); // busca os dados da página de novo
    } catch {
      window.alert("Não foi possível conectar. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Button onClick={executar} isPending={carregando} {...props}>
      {children}
    </Button>
  );
}
