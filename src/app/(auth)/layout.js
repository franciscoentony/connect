import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Logo from "@/(components)/ui/Logo";

// Telas de Entrar e Criar conta: sem o menu do site,
// só a logo e o "Voltar" no canto, como no Figma.
export default function AuthLayout({ children }) {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center px-4">
      <img
        src="/background-circles.png"
        alt=""
        aria-hidden="true"
        draggable="false"
        className="pointer-events-none absolute right-0 top-0 -z-10 opacity-[0.06] dark:invert-100"
      />

      <div className="flex w-full max-w-7xl flex-col gap-3 pt-12">
        <Link href="/" className="w-fit">
          <Logo largura={180} />
        </Link>
        <Link
          href="/"
          className="flex w-fit items-center gap-2 opacity-70 duration-300 ease hover:opacity-100"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Voltar
        </Link>
      </div>

      <div className="flex w-full max-w-7xl flex-1 items-center py-12">
        {children}
      </div>
    </main>
  );
}
