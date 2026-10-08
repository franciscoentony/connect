"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faArrowRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import Logo from "@/(components)/ui/Logo";
import ThemeToggle from "@/(components)/ui/ThemeToggle";

// Menu do topo no celular e tablet (Figma: "Header Mobile").
// Barra com logo + botão ☰; o botão abre um painel com os links.
// No computador (lg para cima) quem aparece é o menu em pílula do Header.
//
// Uso: <MenuMobile links={[["Início", "/"], ...]} usuario={usuario} />

export default function MenuMobile({ links, usuario }) {
  const [aberto, setAberto] = useState(false);
  const caminho = usePathname();

  // fecha o painel quando a página muda (ex.: tocou num link)
  useEffect(() => {
    setAberto(false);
  }, [caminho]);

  // fecha com a tecla Esc
  useEffect(() => {
    if (!aberto) return;
    function aoApertarTecla(evento) {
      if (evento.key === "Escape") setAberto(false);
    }
    window.addEventListener("keydown", aoApertarTecla);
    return () => window.removeEventListener("keydown", aoApertarTecla);
  }, [aberto]);

  return (
    <div className="lg:hidden">
      <div className="flex h-16 items-center justify-between bg-neutral-0 px-4 shadow-suave">
        <Link href="/" aria-label="Início">
          <Logo largura={120} />
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setAberto(!aberto)}
            aria-expanded={aberto}
            aria-controls="menu-mobile"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            className="flex size-12 items-center justify-center rounded-xl text-2xl text-neutral-900 cursor-pointer duration-300 ease hover:bg-neutral-100"
          >
            <FontAwesomeIcon icon={aberto ? faXmark : faBars} />
          </button>
        </div>
      </div>

      {aberto && (
        <nav
          id="menu-mobile"
          aria-label="Menu principal"
          className="flex flex-col gap-6 rounded-b-3xl bg-neutral-0 px-4 pt-2 pb-6 shadow-suave"
        >
          {/* usuário logado: foto e nome no topo do painel */}
          {usuario && (
            <div className="flex items-center gap-3 px-3 pt-2">
              <img
                src={usuario.foto_url || "/identity/co.png"}
                alt=""
                className="size-11 rounded-full bg-neutral-200 object-cover"
              />
              <span className="font-semibold">Olá, {usuario.nome}!</span>
            </div>
          )}

          <ul className="flex flex-col">
            {links.map(([texto, href]) => {
              const ativo = caminho === href;
              return (
                <li key={texto}>
                  <Link
                    href={href}
                    aria-current={ativo ? "page" : undefined}
                    className={`flex min-h-12 items-center rounded-xl px-3 text-lg duration-300 ease ${
                      ativo
                        ? "bg-primary-100 font-semibold text-primary-600"
                        : "font-medium text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {texto}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* visitante: as duas ações do menu do computador, em largura total */}
          {!usuario && (
            <div className="flex flex-col gap-3">
              <Link
                href="/criar-conta"
                className="flex min-h-12 items-center justify-center rounded-xl bg-primary-500 px-7 font-semibold text-white duration-200 ease hover:brightness-95"
              >
                Vamos começar!
              </Link>
              <Link
                href="/entrar"
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-neutral-300 px-7 font-semibold text-neutral-900 duration-200 ease hover:bg-neutral-100"
              >
                <FontAwesomeIcon icon={faArrowRightToBracket} />
                Login
              </Link>
            </div>
          )}
        </nav>
      )}
    </div>
  );
}
