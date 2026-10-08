import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faArrowRightToBracket,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import Logo from "@/(components)/ui/Logo";
import ThemeToggle from "@/(components)/ui/ThemeToggle";
import MenuMobile from "@/(components)/base/(public)/MenuMobile";

// Menu do topo das telas públicas e do doador.
// Sem "usuario": mostra Login + Vamos começar (visitante).
// Com "usuario": mostra avatar e nome (logado).
// No computador (lg para cima) é a pílula; abaixo disso, o MenuMobile.
//
// Uso: <Header />  ou  <Header usuario={{ nome: "Entony", foto_url: "/api/v1/perfil/foto?v=1" }} />

export default function Header({ usuario }) {
  const links = usuario
    ? [
        ["Início", "/"],
        ["Campanhas", "/campanhas"],
        ["Minhas doações", "/minhas-doacoes"],
        ["Contato", "/contato"],
      ]
    : [
        ["Início", "/"],
        ["Campanhas", "/campanhas"],
        ["Sobre nós", "/sobre"],
        ["Contato", "/contato"],
      ];

  return (
    <header className="fixed z-99 w-full duration-300 ease lg:px-4 lg:pt-8">
      <MenuMobile links={links} usuario={usuario} />

      <nav className="mx-auto hidden max-w-7xl grid-cols-3 lg:grid items-center rounded-full bg-neutral-100 duration-300 ease py-2 pl-9 pr-4 shadow-suave">
        <Link href="/" className="justify-self-start">
          <Logo />
        </Link>

        <ul className="flex items-center justify-center gap-10 text-base font-medium text-neutral-700">
          {links.map(([texto, href]) => (
            <li key={texto}>
              <Link
                href={href}
                className="whitespace-nowrap hover:text-neutral-900"
              >
                {texto}
              </Link>
            </li>
          ))}
          <li>
            <button
              aria-label="Buscar"
              className="hover:text-neutral-900 cursor-pointer"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </li>
        </ul>

        <div className="flex items-center justify-self-end gap-6">
          <ThemeToggle />
          {usuario ? (
            <button className="flex items-center gap-3 pr-2 cursor-pointer">
              <img
                src={usuario.foto_url || "/identity/co.png"}
                alt=""
                className="size-11 rounded-full bg-neutral-200 object-cover"
              />
              <span className="font-semibold text-neutral-900">
                Olá, {usuario.nome}!
              </span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className="text-sm text-neutral-700"
              />
            </button>
          ) : (
            <>
              <Link
                href="/entrar"
                className="flex items-center gap-2 font-medium text-neutral-700 hover:text-neutral-900"
              >
                <FontAwesomeIcon icon={faArrowRightToBracket} />
                Login
              </Link>
              <Link
                href="/criar-conta"
                className="rounded-full bg-primary-500/20 px-7 py-3.5 font-semibold text-primary-600 hover:bg-primary-500 hover:text-white duration-200 ease dark:bg-primary-500/70 dark:text-neutral-900"
              >
                Vamos começar!
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
