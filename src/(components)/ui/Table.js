"use client";

import { Table as HeroTable } from "@heroui/react";

// Tabela simples, feita com a Table do HeroUI.
// colunas: [{ titulo: "Campanha", chave: "campanha" }, ...]
// linhas:  [{ campanha: "Natal Solidário", status: <Chip status="Ativa" /> }, ...]
// O valor de cada célula pode ser texto ou um componente (Chip, Button...).
// A primeira coluna aparece em destaque.

export default function Table({ colunas, linhas, rotulo = "Tabela" }) {
  return (
    <HeroTable className="w-full overflow-hidden rounded-2xl bg-neutral-0 shadow-suave">
      <HeroTable.ScrollContainer>
        <HeroTable.Content aria-label={rotulo}>
          <HeroTable.Header className="bg-neutral-100">
            {colunas.map((coluna, i) => (
              <HeroTable.Column
                key={coluna.chave}
                isRowHeader={i === 0}
                className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                {coluna.titulo}
              </HeroTable.Column>
            ))}
          </HeroTable.Header>
          <HeroTable.Body>
            {linhas.map((linha, i) => (
              <HeroTable.Row key={i} className="border-t border-neutral-200">
                {colunas.map((coluna, j) => (
                  <HeroTable.Cell
                    key={coluna.chave}
                    className={`px-6 py-5 text-base ${j === 0 ? "font-medium text-neutral-900" : "text-neutral-700"}`}
                  >
                    {linha[coluna.chave]}
                  </HeroTable.Cell>
                ))}
              </HeroTable.Row>
            ))}
          </HeroTable.Body>
        </HeroTable.Content>
      </HeroTable.ScrollContainer>
    </HeroTable>
  );
}
