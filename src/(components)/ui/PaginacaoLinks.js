import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

// Paginação por links: cada página é um endereço (?pagina=2).
// Use em páginas de servidor, que leem a página da URL. Com só uma página,
// não mostra nada. (Mesmo visual da PaginationUI, que guarda a página no estado.)
//
// Uso: <PaginacaoLinks caminho="/dashboard/campanhas" paginaAtual={2} totalPaginas={5} />
//      <PaginacaoLinks caminho="/dashboard/campanhas/12?aba=doacoes" ... />

const ITEM =
  "flex size-10 items-center justify-center rounded-lg font-medium duration-300 ease";
const NORMAL = `${ITEM} text-muted hover:bg-surface hover:text-foreground`;
const ATIVA = `${ITEM} bg-accent text-accent-foreground`;
const DESABILITADA = `${ITEM} pointer-events-none text-muted opacity-40`;

export default function PaginacaoLinks({ caminho, paginaAtual, totalPaginas }) {
  if (totalPaginas <= 1) return null;

  // se o caminho já tem "?" (ex.: "...?aba=doacoes"), junta com "&"
  const separador = caminho.includes("?") ? "&" : "?";

  // [1, 2, 3, ..., totalPaginas]
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  const temAnterior = paginaAtual > 1;
  const temProxima = paginaAtual < totalPaginas;

  return (
    <nav aria-label="Paginação" className="flex justify-center">
      <ul className="flex gap-1 rounded-xl bg-default p-1">
        <li>
          <Link
            href={`${caminho}${separador}pagina=${paginaAtual - 1}`}
            aria-label="Página anterior"
            aria-disabled={!temAnterior}
            className={temAnterior ? NORMAL : DESABILITADA}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </Link>
        </li>
        {paginas.map((pagina) => {
          return (
            <li key={pagina}>
              <Link
                href={`${caminho}${separador}pagina=${pagina}`}
                aria-current={pagina === paginaAtual ? "page" : undefined}
                className={pagina === paginaAtual ? ATIVA : NORMAL}
              >
                {pagina}
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href={`${caminho}${separador}pagina=${paginaAtual + 1}`}
            aria-label="Próxima página"
            aria-disabled={!temProxima}
            className={temProxima ? NORMAL : DESABILITADA}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
