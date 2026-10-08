"use client";

import { Chip as HeroChip } from "@heroui/react";

// Chip de status, feito com o Chip do HeroUI.
// Os nomes são os mesmos do backend.
// Doação:   "Pendente" | "Confirmada" | "Cancelada"
// Campanha: "Rascunho" | "Ativa" | "Encerrada"
//
// Uso: <Chip status="Pendente" />

const ESTILOS = {
  Pendente: {
    color: "default",
    variant: "soft",
    className: "bg-info-100 text-info-500",
  },
  Confirmada: {
    color: "success",
    variant: "soft",
    className: "bg-success-100 text-success-500",
  },
  Cancelada: {
    color: "danger",
    variant: "soft",
    className: "bg-danger-100 text-danger-500",
  },
  Rascunho: {
    color: "default",
    variant: "soft",
    className: "bg-neutral-100 text-neutral-700",
  },
  Ativa: {
    color: "success",
    variant: "primary",
    className: "bg-success-500 text-sobre-verde",
  },
  Encerrada: {
    color: "default",
    variant: "soft",
    className: "bg-neutral-200 text-neutral-700",
  },
};

export default function Chip({ status }) {
  const e = ESTILOS[status];
  return (
    <HeroChip
      color={e.color}
      variant={e.variant}
      className={`gap-2 py-1.5 pl-3 pr-3.5 text-sm font-semibold ${e.className}`}
    >
      <span className="size-2 rounded-full bg-current" />
      <HeroChip.Label>{status}</HeroChip.Label>
    </HeroChip>
  );
}
