"use client";

import { Button as HeroButton } from "@heroui/react";

// Botão do Design System, feito com o Button do HeroUI.
// variante: "primario" | "secundario" | "suave" | "contorno" | "perigo"
// tamanho:  "medio" (padrão) | "pequeno" (dentro de tabelas)
//
// Uso: <Button variante="secundario" onClick={confirmar}>Confirmar doação</Button>

// Cada variante usa uma variante do HeroUI e ajusta as cores com as
// variáveis do próprio botão (--button-bg, --button-fg...).
const VARIANTES = {
  primario: { variant: "primary", className: "" },
  secundario: {
    variant: "primary",
    className:
      "[--button-bg:var(--secondary-500)] [--button-bg-hover:var(--secondary-600)] [--button-bg-pressed:var(--secondary-600)] [--button-fg:var(--texto-sobre-verde)]",
  },
  suave: {
    variant: "secondary",
    className:
      "[--button-bg:var(--primary-100)] [--button-bg-hover:var(--primary-100)] [--button-bg-pressed:var(--primary-100)] [--button-fg:var(--primary-600)]",
  },
  contorno: { variant: "outline", className: "border-2 border-neutral-300" },
  perigo: {
    variant: "danger-soft",
    className:
      "[--button-bg:var(--danger-100)] [--button-bg-hover:var(--danger-100)] [--button-bg-pressed:var(--danger-100)] [--button-fg:var(--danger-500)]",
  },
};

const TAMANHOS = {
  medio: "h-auto px-7 py-3.5 text-base",
  pequeno: "h-auto px-[18px] py-2.5 text-sm",
};

export default function Button({
  children,
  variante = "primario",
  tamanho = "medio",
  larguraTotal = false,
  onClick,
  className = "",
  ...props
}) {
  const v = VARIANTES[variante];
  return (
    <HeroButton
      variant={v.variant}
      fullWidth={larguraTotal}
      onPress={onClick}
      className={`rounded-xl font-semibold duration-200 ${TAMANHOS[tamanho]} ${v.className} ${className}`}
      {...props}
    >
      {children}
    </HeroButton>
  );
}
