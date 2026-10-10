"use client";

import { MotionConfig } from "motion/react";

// Envolve o site inteiro (no layout raiz). Quem ativou "reduzir movimento"
// no sistema não vê deslocamentos (subir, crescer, deslizar): as animações
// do Motion viram só transições de opacidade, automaticamente.
//
// Uso: <MovimentoAcessivel>{children}</MovimentoAcessivel>

export default function MovimentoAcessivel({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
