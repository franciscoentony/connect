"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

// Bolhas com fotos do topo da home: aparecem com um "pop" e depois orbitam
// devagar ao redor do título.
//
// Como a órbita funciona (sem precisar decorar a matemática):
// - cada bolha começa exatamente onde está no Figma (left/top/width em %);
// - medimos o vetor do centro do título até o centro da bolha, em "frações"
//   da largura e da altura da área (ex.: 0,35 da largura para a esquerda);
// - a cada quadro, giramos esse vetor um pouquinho e voltamos para pixels.
//   Como a área é mais larga que alta, o caminho vira uma elipse.
//
// Uso: <BolhasDoTopo bolhas={[{ src, left: "4.74%", top: "11.62%", width: "20.47%" }]} />

const SEGUNDOS_POR_VOLTA = 80; // devagar: é um movimento de fundo
const CENTRO = { x: 0.5, y: 0.52 }; // centro do título, em frações da área
// distância mínima do centro (em frações): afasta bolhas que passariam por
// cima do título
const RAIO_MINIMO = 0.42;

export default function BolhasDoTopo({ bolhas }) {
  const area = useRef(null);
  const visivel = useInView(area); // a órbita pausa quando o topo sai da tela
  const reduzirMovimento = useReducedMotion();

  // tamanho da área em pixels (atualizado quando a janela muda de tamanho)
  const largura = useMotionValue(0);
  const altura = useMotionValue(0);
  // quanto a órbita já girou, em radianos (começa em 0 = posição do Figma)
  const angulo = useMotionValue(0);

  useEffect(() => {
    const observador = new ResizeObserver(([entrada]) => {
      largura.set(entrada.contentRect.width);
      altura.set(entrada.contentRect.height);
    });
    observador.observe(area.current);
    return () => observador.disconnect();
  }, [largura, altura]);

  // a cada quadro: gira um pouco, proporcional ao tempo que passou
  useAnimationFrame((_tempo, delta) => {
    if (!visivel || reduzirMovimento) return;
    const voltasPorMs = 1 / (SEGUNDOS_POR_VOLTA * 1000);
    angulo.set(angulo.get() + delta * voltasPorMs * 2 * Math.PI);
  });

  return (
    <div
      ref={area}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden select-none md:block"
    >
      {bolhas.map((bolha, indice) => {
        return (
          <Bolha
            key={bolha.src}
            bolha={bolha}
            indice={indice}
            largura={largura}
            altura={altura}
            angulo={angulo}
            reduzirMovimento={reduzirMovimento}
          />
        );
      })}
    </div>
  );
}

function Bolha({ bolha, indice, largura, altura, angulo, reduzirMovimento }) {
  // posição e tamanho do Figma, em frações (ex.: "20.47%" vira 0.2047)
  const esquerda = parseFloat(bolha.left) / 100;
  const topo = parseFloat(bolha.top) / 100;
  const tamanho = parseFloat(bolha.width) / 100; // em fração da LARGURA

  // posição da bolha (canto de cima à esquerda) em pixels, a cada quadro
  const x = useTransform(() => calcularPosicao().x);
  const y = useTransform(() => calcularPosicao().y);

  function calcularPosicao() {
    const W = largura.get();
    const H = altura.get();
    const lado = tamanho * W; // a bolha é quadrada

    // vetor do centro do título até o centro da bolha, em frações da área
    let vx = esquerda + lado / 2 / W - CENTRO.x;
    let vy = topo + lado / 2 / H - CENTRO.y;
    if (!W || !H) {
      vx = 0;
      vy = 0;
    }

    // afasta do título quem ficaria perto demais
    const raio = Math.hypot(vx, vy);
    if (raio > 0 && raio < RAIO_MINIMO) {
      vx = (vx / raio) * RAIO_MINIMO;
      vy = (vy / raio) * RAIO_MINIMO;
    }

    // gira o vetor (fórmula de rotação) e volta para pixels
    const a = angulo.get();
    const girado = {
      x: vx * Math.cos(a) - vy * Math.sin(a),
      y: vx * Math.sin(a) + vy * Math.cos(a),
    };
    return {
      x: (CENTRO.x + girado.x) * W - lado / 2,
      y: (CENTRO.y + girado.y) * H - lado / 2,
    };
  }

  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ x, y, width: bolha.width }}
    >
      {/* o "pop": cresce com um leve quique, uma bolha depois da outra */}
      <motion.img
        src={bolha.src}
        alt=""
        draggable="false"
        className="w-full"
        initial={reduzirMovimento ? { opacity: 0 } : { opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          reduzirMovimento
            ? { duration: 0.4 }
            : {
                type: "spring",
                bounce: 0.45,
                duration: 0.8,
                delay: 0.15 + indice * 0.12,
              }
        }
      />
    </motion.div>
  );
}
