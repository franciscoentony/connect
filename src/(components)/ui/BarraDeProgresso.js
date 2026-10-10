"use client";

import { motion, useReducedMotion } from "motion/react";

// Barra de progresso da meta (cards de campanha e página da campanha).
// Quando aparece na tela, a barra "enche" do zero até a porcentagem: mostra
// que o valor foi conquistado aos poucos. Anima uma vez só.
// Usa scaleX (e não width) para o navegador não recalcular o layout a cada
// quadro.
//
// Uso: <BarraDeProgresso porcentagem={60} />

export default function BarraDeProgresso({ porcentagem }) {
  const reduzirMovimento = useReducedMotion();

  return (
    <div
      role="progressbar"
      aria-valuenow={porcentagem}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso da meta"
      className="h-2 w-full overflow-hidden rounded-full bg-neutral-100"
    >
      <motion.div
        className="h-full origin-left rounded-full bg-primary-500"
        style={{ width: `${porcentagem}%` }}
        initial={reduzirMovimento ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      />
    </div>
  );
}
