"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/(components)/ui/Button";
import Input from "@/(components)/ui/Input";

// Aba "Dados" do gerenciar campanha: edita título e meta.
// Salva em PATCH /api/v1/campanhas/{id}.
// Campanha encerrada ou cancelada não pode mudar: os campos ficam travados.
//
// Uso: <FormDadosCampanha campanha={campanha} bloqueado={false} />

// "5000.00" (como vem da API) vira "5.000,00" (como a pessoa lê)
function metaParaTela(meta) {
  if (!meta) return "";
  return Number(meta).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export default function FormDadosCampanha({ campanha, bloqueado }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(campanha.titulo);
  const [meta, setMeta] = useState(metaParaTela(campanha.meta));
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function salvar(evento) {
    evento.preventDefault(); // não recarrega a página
    setErro("");
    setMensagem("");
    setCarregando(true);

    // "5.000,00" vira "5000.00"; meta vazia = campanha sem meta
    const metaParaApi = meta ? meta.replace(/\./g, "").replace(",", ".") : null;

    try {
      const resposta = await fetch(
        `/api/v1/campanhas/${campanha.id_campanha}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titulo, meta: metaParaApi }),
        },
      );
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro); // mensagem que vem da API
        return;
      }
      setMensagem("Alterações salvas!");
      router.refresh();
    } catch {
      setErro("Não foi possível conectar. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form
      onSubmit={salvar}
      className="flex w-full max-w-140 flex-col gap-6 rounded-2xl bg-neutral-0 p-6 shadow-suave"
    >
      <h2 className="text-xl font-semibold">Dados da campanha</h2>
      <Input
        rotulo="Título"
        dica="De 3 a 150 caracteres"
        value={titulo}
        onChange={setTitulo}
        desabilitado={bloqueado}
      />
      <Input
        rotulo="Meta (R$)"
        placeholder="Opcional"
        dica="Deixe vazio para não ter meta"
        value={meta}
        onChange={setMeta}
        desabilitado={bloqueado}
      />

      {erro && <p className="text-sm font-medium text-danger-500">{erro}</p>}
      {mensagem && (
        <p className="text-sm font-medium text-success-500">{mensagem}</p>
      )}

      {bloqueado ? (
        <p className="text-sm opacity-70">
          Campanhas encerradas ou canceladas não podem ser alteradas.
        </p>
      ) : (
        <Button type="submit" isPending={carregando}>
          Salvar alterações
        </Button>
      )}
    </form>
  );
}
