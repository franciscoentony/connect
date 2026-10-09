"use client";

import { useState } from "react";

// Galeria da página de detalhe da campanha: uma foto grande e, embaixo,
// as miniaturas. Clicar numa miniatura troca a foto grande.
// Sem fotos, mostra um fundo cinza.
//
// Uso: <GaleriaCampanha fotos={[{ id_foto: "3", url: "/api/v1/campanhas/1/fotos/3" }]} titulo="Natal Solidário" />

export default function GaleriaCampanha({ fotos, titulo }) {
  // posição (0, 1, 2...) da foto que aparece grande
  const [escolhida, setEscolhida] = useState(0);

  if (fotos.length === 0) {
    return <div className="h-110 rounded-2xl bg-neutral-200" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <img
        src={fotos[escolhida].url}
        alt={`Foto ${escolhida + 1} da campanha ${titulo}`}
        className="h-110 w-full rounded-2xl bg-neutral-200 object-cover"
      />

      {/* com uma foto só, não precisa de miniaturas */}
      {fotos.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {fotos.map((foto, posicao) => {
            const ativa = posicao === escolhida;
            return (
              <button
                key={foto.id_foto}
                onClick={() => setEscolhida(posicao)}
                aria-label={`Ver foto ${posicao + 1}`}
                aria-current={ativa ? "true" : undefined}
                className={`size-20 overflow-hidden rounded-xl border-2 duration-300 ease cursor-pointer ${
                  ativa
                    ? "border-primary-500"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={foto.url}
                  alt=""
                  className="size-full bg-neutral-200 object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
