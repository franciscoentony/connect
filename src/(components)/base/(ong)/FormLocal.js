"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/(components)/ui/Button";
import Input from "@/(components)/ui/Input";

// Aba "Locais de entrega": formulário para adicionar um local.
// Salva em POST /api/v1/campanhas/{id}/locais.
//
// Uso: <FormLocal idCampanha="12" />

export default function FormLocal({ idCampanha }) {
  const router = useRouter();
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function adicionar(evento) {
    evento.preventDefault(); // não recarrega a página
    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch(`/api/v1/campanhas/${idCampanha}/locais`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endereco, cidade }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro); // mensagem que vem da API
        return;
      }
      setEndereco("");
      setCidade("");
      router.refresh();
    } catch {
      setErro("Não foi possível conectar. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form
      onSubmit={adicionar}
      className="flex w-full flex-col gap-6 rounded-2xl bg-neutral-0 p-6 shadow-suave lg:max-w-100"
    >
      <h2 className="text-xl font-semibold">Adicionar local</h2>
      <Input
        rotulo="Endereço"
        placeholder="Rua, número, bairro"
        value={endereco}
        onChange={setEndereco}
      />
      <Input
        rotulo="Cidade"
        placeholder="Ex.: Natal"
        value={cidade}
        onChange={setCidade}
      />
      {erro && <p className="text-sm font-medium text-danger-500">{erro}</p>}
      <Button type="submit" larguraTotal isPending={carregando}>
        Adicionar
      </Button>
    </form>
  );
}
