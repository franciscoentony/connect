import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faArrowRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import Logo from "@/(components)/ui/Logo";
import ThemeToggle from "@/(components)/ui/ThemeToggle";
import MenuMobile from "@/(components)/base/(public)/MenuMobile";
import MenuUsuario from "@/(components)/base/(public)/MenuUsuario";

// Menu do topo das telas públicas e do doador.
// Sem "usuario": mostra Login + Vamos começar (visitante).
// Com "usuario": mostra avatar e nome, que abrem o menu da conta (logado).
// No computador (lg para cima) é a pílula; abaixo disso, o MenuMobile.
//
// Uso: <Header />  ou  <Header usuario={{ nome: "Entony", foto_url: "/api/v1/perfil/foto?v=1" }} />

export default function Header({ usuario }) {
  // o 3º link muda conforme quem está logado
  let links;
  if (usuario?.tipo === "ong") {
    links = [
      ["Início", "/"],
      ["Campanhas", "/campanhas"],
      ["Painel", "/dashboard"],
    ];
  } else if (usuario) {
    links = [
      ["Início", "/"],
      ["Campanhas", "/campanhas"],
      ["Minhas doações", "/minhas-doacoes"],
    ];
  } else {
    links = [
      ["Início", "/"],
      ["Campanhas", "/campanhas"],
      ["Sobre nós", "/#quem-somos"],
    ];
  }

  return (
    <header className="fixed z-99 w-full duration-300 ease lg:px-4 lg:pt-8">
      <MenuMobile links={links} usuario={usuario} />

      {/* vidro fosco: fundo translúcido que desfoca o que passa por trás */}
      <nav className="mx-auto hidden max-w-7xl grid-cols-3 lg:grid items-center rounded-full bg-neutral-0/70 shadow-vidro backdrop-blur-xl backdrop-saturate-150 duration-300 ease py-2 pl-9 pr-4">
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
            {/* a busca de campanhas fica na página /campanhas */}
            <Link
              href="/campanhas"
              aria-label="Buscar campanhas"
              className="hover:text-neutral-900"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </Link>
          </li>
        </ul>

        <div className="flex items-center justify-self-end gap-6">
          <ThemeToggle />
          {usuario ? (
            <MenuUsuario usuario={usuario} />
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
