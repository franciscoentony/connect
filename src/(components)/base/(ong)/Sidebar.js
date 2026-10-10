"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faHandHoldingHeart,
  faUsers,
  faUser,
  faRightFromBracket,
  faBars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Logo from "@/(components)/ui/Logo";
import { sairDaConta } from "@/(components)/base/(public)/opcoesDaConta";

// Menu lateral do painel da ONG.
// O item ativo é descoberto sozinho pela URL (não precisa passar nada).
// No computador (lg para cima) é a coluna fixa à esquerda; no celular e no
// tablet vira uma barra no topo com o botão ☰, que abre os mesmos itens.
//
// Uso: <Sidebar />

const ITENS = [
  {
    texto: "Dashboard",
    icone: faChartPie,
    href: "/dashboard",
  },
  {
    texto: "Minhas campanhas",
    icone: faHandHoldingHeart,
    href: "/dashboard/campanhas",
  },
  {
    texto: "Donatários",
    icone: faUsers,
    href: "/dashboard/donatarios",
  },
  {
    texto: "Meu perfil",
    icone: faUser,
    href: "/dashboard/perfil",
  },
];

export default function Sidebar() {
  const caminho = usePathname(); // ex.: "/dashboard/campanhas/12"
  const [aberto, setAberto] = useState(false); // menu do celular

  // fecha o menu do celular quando a página muda
  useEffect(() => {
    setAberto(false);
  }, [caminho]);

  // "Dashboard" só fica ativo na página exata; os outros ficam ativos
  // também nas páginas de dentro deles (ex.: /dashboard/campanhas/12).
  function estaAtivo(href) {
    if (href === "/dashboard") return caminho === "/dashboard";
    return caminho.startsWith(href);
  }

  // itens do menu: os mesmos no computador e no celular
  const itens = (
    <nav aria-label="Menu do painel" className="flex flex-col gap-1">
      {ITENS.map((item) => {
        const selecionado = estaAtivo(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={selecionado ? "page" : undefined}
            className={`flex min-h-12 items-center gap-4 rounded-xl px-4 py-3.5 font-medium duration-300 ease ${
              selecionado
                ? "bg-primary-100 text-primary-600"
                : "text-neutral-900 hover:bg-neutral-50"
            }`}
          >
            <FontAwesomeIcon icon={item.icone} className="w-5" />
            {item.texto}
          </Link>
        );
      })}
    </nav>
  );

  const botaoSair = (
    <button
      onClick={sairDaConta}
      className="flex min-h-12 items-center gap-4 rounded-xl bg-danger-100 px-4 py-3.5 font-medium text-danger-500 cursor-pointer duration-300 ease hover:brightness-95"
    >
      <FontAwesomeIcon icon={faRightFromBracket} className="w-5" />
      Sair da conta
    </button>
  );

  return (
    <>
      {/* computador: coluna fixa */}
      <aside className="sticky top-6 hidden h-[calc(100vh-48px)] w-75 shrink-0 flex-col rounded-2xl bg-neutral-0 p-4 shadow-suave lg:flex">
        <div className="px-4 pb-10 pt-6">
          <Logo largura={150} />
        </div>
        {itens}
        <div className="mt-auto flex flex-col">{botaoSair}</div>
      </aside>

      {/* celular e tablet: barra no topo + menu que abre */}
      <div className="rounded-2xl bg-neutral-0 shadow-suave lg:hidden">
        <div className="flex h-16 items-center justify-between pl-4 pr-2">
          <Logo largura={120} />
          <button
            type="button"
            onClick={() => setAberto(!aberto)}
            aria-expanded={aberto}
            aria-controls="menu-painel"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            className="flex size-12 items-center justify-center rounded-xl text-2xl text-neutral-900 cursor-pointer duration-300 ease hover:bg-neutral-100"
          >
            <FontAwesomeIcon icon={aberto ? faXmark : faBars} />
          </button>
        </div>
        {aberto && (
          <div id="menu-painel" className="flex flex-col gap-6 px-2 pb-4">
            {itens}
            {botaoSair}
          </div>
        )}
      </div>
    </>
  );
}
