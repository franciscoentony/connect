"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/(components)/ui/Button";

// Aba "Donatários": escolhe um donatário da ONG e vincula à campanha.
// Salva em POST /api/v1/campanhas/{id}/donatarios.
// "donatarios" são os da ONG que ainda NÃO estão nesta campanha.
//
// Uso: <FormVincularDonatario idCampanha="12" donatarios={[{ id_donatario: "3", nome: "Família Silva" }]} />

export default function FormVincularDonatario({ idCampanha, donatarios }) {
  const router = useRouter();
  const [escolhido, setEscolhido] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function vincular(evento) {
    evento.preventDefault(); // não recarrega a página
    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch(
        `/api/v1/campanhas/${idCampanha}/donatarios`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_donatario: escolhido }),
        },
      );
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro); // mensagem que vem da API
        return;
      }
      setEscolhido("");
      router.refresh();
    } catch {
      setErro("Não foi possível conectar. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form
      onSubmit={vincular}
      className="flex w-full flex-col gap-6 rounded-2xl bg-neutral-0 p-6 shadow-suave lg:max-w-100"
    >
      <h2 className="text-xl font-semibold">Vincular donatário</h2>

      {donatarios.length === 0 ? (
        <p className="text-sm opacity-70">
          Todos os donatários da sua ONG já estão nesta campanha. Para cadastrar
          um novo, use o menu Donatários.
        </p>
      ) : (
        <>
          {/* select simples do HTML, com o mesmo visual dos campos */}
          <div className="flex flex-col gap-2">
            <label htmlFor="donatario" className="text-sm font-semibold">
              Donatário
            </label>
            <select
              id="donatario"
              value={escolhido}
              onChange={(evento) => setEscolhido(evento.target.value)}
              className="w-full rounded-xl bg-neutral-100 px-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Escolha um donatário</option>
              {donatarios.map((donatario) => {
                return (
                  <option
                    key={donatario.id_donatario}
                    value={donatario.id_donatario}
                  >
                    {donatario.nome}
                  </option>
                );
              })}
            </select>
            <span className="text-xs font-medium opacity-70">
              Só aparecem donatários cadastrados pela sua ONG.
            </span>
          </div>
          {erro && (
            <p className="text-sm font-medium text-danger-500">{erro}</p>
          )}
          <Button type="submit" larguraTotal isPending={carregando}>
            Vincular
          </Button>
        </>
      )}
    </form>
  );
}
