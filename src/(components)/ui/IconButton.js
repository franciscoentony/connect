"use client";

import { Button as HeroButton } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Botão quadrado só com ícone (ex.: excluir), feito com o Button do HeroUI.
// variante: "perigo" | "neutro"
//
// Uso: <IconButton icone={faTrash} rotulo="Excluir" onClick={excluir} />

const VARIANTES = {
  perigo:
    "[--button-bg:var(--danger-100)] [--button-bg-hover:var(--danger-100)] [--button-fg:var(--danger-500)]",
  neutro:
    "[--button-bg:var(--neutral-100)] [--button-bg-hover:var(--neutral-200)] [--button-fg:var(--neutral-700)]",
};

export default function IconButton({
  icone,
  rotulo,
  variante = "perigo",
  onClick,
  className = "",
  ...props
}) {
  return (
    <HeroButton
      isIconOnly
      aria-label={rotulo}
      onPress={onClick}
      className={`size-10 rounded-xl ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      <FontAwesomeIcon icon={icone} />
    </HeroButton>
  );
}
