"use client";

import { Tabs } from "@heroui/react";

// Seletor segmentado (ex.: Doador/ONG, Dinheiro/Item/Alimento),
// feito com as Tabs do HeroUI.
//
// Uso:
//   <Segmented opcoes={["Doador", "ONG"]} aoMudar={(opcao) => console.log(opcao)} />

export default function Segmented({ opcoes, inicial = opcoes[0], aoMudar }) {
  return (
    <Tabs
      className="w-full"
      defaultSelectedKey={inicial}
      onSelectionChange={(chave) => aoMudar && aoMudar(chave)}
    >
      <Tabs.ListContainer className="w-full">
        <Tabs.List
          aria-label="Opções"
          className="w-full rounded-full bg-neutral-100 p-1.5"
        >
          {opcoes.map((opcao) => (
            <Tabs.Tab
              key={opcao}
              id={opcao}
              className="h-auto flex-1 rounded-full px-6 py-3 text-base font-medium text-neutral-500 data-[selected=true]:font-semibold data-[selected=true]:text-neutral-900"
            >
              {opcao}
              <Tabs.Indicator className="rounded-full bg-neutral-0 shadow-sm" />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
}
