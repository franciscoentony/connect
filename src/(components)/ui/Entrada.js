"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

// Peças de animação reutilizáveis (Motion). Todas respeitam o "reduzir
// movimento" do sistema: o MovimentoAcessivel (layout raiz) troca os
// deslocamentos por opacidade, e o Parallax fica parado.
//
// Uso:
//   <FundoQueExpande className="rounded-full bg-neutral-0/70" />
//   <SobeComQuique atraso={0.4}>Link do menu</SobeComQuique>
//   <Revelar atraso={0.6}><h1>Título</h1></Revelar>
//   <RevelarAoRolar><article>Seção</article></RevelarAoRolar>
//   <Parallax velocidade={0.3} esmaecer>Conteúdo do topo</Parallax>

// curva de desaceleração "confiante": chega rápido e assenta devagar
const DESACELERAR = [0.16, 1, 0.3, 1];

// Duração de cada tipo de animação, em segundos.
// Para deixar tudo mais rápido ou mais lento, mude aqui.
// (Os ATRASOS de cada elemento ficam onde ele é usado: Header e home.
// O menu e o topo da home animam ao mesmo tempo, cada um no seu ritmo.)
export const DURACAO = {
  fundo: 1.1, // fundo do menu se expandindo
  quique: 1.0, // itens do menu subindo com quique
  revelar: 1.0, // título, subtítulo e botões do topo
  rolar: 1.2, // seções reveladas ao rolar
};

// Fundo que nasce no centro e se expande para os lados (o menu do topo).
// Fica atrás do conteúdo: o elemento pai precisa de "relative isolate".
export function FundoQueExpande({ className = "" }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`absolute inset-0 -z-10 ${className}`}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: DURACAO.fundo, ease: DESACELERAR }}
    />
  );
}

// Sobe de baixo para cima com um quique (itens do menu).
export function SobeComQuique({ atraso = 0, className = "", children }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        bounce: 0.5,
        duration: DURACAO.quique,
        delay: atraso,
      }}
    >
      {children}
    </motion.div>
  );
}

// Aparece subindo um pouco, sem quique (título, subtítulo e botões do topo).
export function Revelar({ atraso = 0, className = "", children }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: DURACAO.revelar,
        ease: DESACELERAR,
        delay: atraso,
      }}
    >
      {children}
    </motion.div>
  );
}

// Revela o conteúdo quando ele entra na tela ao rolar (uma vez só).
export function RevelarAoRolar({ className = "", children }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: DURACAO.rolar, ease: DESACELERAR }}
    >
      {children}
    </motion.div>
  );
}

// Parallax: ao rolar, o conteúdo anda mais devagar que a página.
// velocidade 0 = rola junto com a página; 0.5 = anda metade (fica "mais longe").
// esmaecer = vai sumindo nos primeiros 600px de rolagem.
export function Parallax({
  velocidade = 0.3,
  esmaecer = false,
  className = "",
  children,
}) {
  const reduzirMovimento = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (rolado) =>
    reduzirMovimento ? 0 : rolado * velocidade,
  );
  const opacity = useTransform(scrollY, [0, 600], [1, esmaecer ? 0 : 1]);

  return (
    <motion.div className={className} style={{ y, opacity }}>
      {children}
    </motion.div>
  );
}
