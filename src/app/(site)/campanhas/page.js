import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIdCard,
  faCircleCheck,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import CampaignCard from "@/(components)/ui/CampaignCard";
import PaginacaoLinks from "@/(components)/ui/PaginacaoLinks";
import BuscaCampanhas from "@/(components)/ui/BuscaCampanhas";
import { listarCampanhas } from "@/models/campanha.js";

// Campanhas: /campanhas?busca=natal&pagina=2
// Todas as campanhas ATIVAS, de todas as ONGs, com busca por título.
// (Rascunhos, encerradas e canceladas não aparecem aqui.)
// É um componente de servidor: busca os dados direto no model.

const POR_PAGINA = 9;

// O que protege o doador, em fatos que o sistema garante de verdade.
// (Nada de "ONG verificada": o CNPJ não é consultado na Receita Federal.)
const GARANTIAS = [
  { icone: faIdCard, texto: "Só ONGs com CNPJ criam campanhas" },
  { icone: faCircleCheck, texto: "A ONG confirma cada doação" },
  { icone: faLocationDot, texto: "Os locais de entrega ficam à vista" },
];

export default async function Campanhas({ searchParams }) {
  const { pagina, busca = "" } = await searchParams;

  // ?pagina=abc ou ?pagina=0 viram a página 1
  let paginaAtual = parseInt(pagina);
  if (!paginaAtual || paginaAtual < 1) paginaAtual = 1;

  const textoBuscado = busca.trim();

  // sem idOng: as campanhas ativas de todas as ONGs
  const campanhas = await listarCampanhas(
    { busca: textoBuscado },
    { limite: POR_PAGINA, pagina: paginaAtual },
  );
  const { total, total_paginas } = campanhas.paginacao;

  // a paginação precisa manter a busca no endereço
  let caminho = "/campanhas";
  if (textoBuscado) {
    caminho = `/campanhas?busca=${encodeURIComponent(textoBuscado)}`;
  }

  return (
    <main className="flex w-full flex-1 flex-col items-center px-4 pt-28 pb-20 lg:pt-36">
      <div className="flex w-full max-w-7xl flex-col gap-10">
        {/* título, garantias e busca */}
        <section className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-160 flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-semibold">Campanhas</h1>
              <p className="text-lg opacity-70">
                Escolha uma campanha para apoiar. Você acompanha sua doação até
                a ONG confirmar que recebeu.
              </p>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {GARANTIAS.map((garantia) => {
                return (
                  <li key={garantia.texto} className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={garantia.icone}
                      className="text-primary-600"
                    />
                    {garantia.texto}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex w-full flex-col items-end gap-2 sm:w-auto">
            <BuscaCampanhas caminho="/campanhas" valor={textoBuscado} />
            <p className="text-sm opacity-70">
              {total === 1 ? "1 campanha ativa" : `${total} campanhas ativas`}
              {textoBuscado && ` para “${textoBuscado}”`}
            </p>
          </div>
        </section>

        {/* lista */}
        {campanhas.itens.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-neutral-0 p-10 text-center shadow-suave">
            {textoBuscado ? (
              <>
                <p className="font-semibold">
                  Nenhuma campanha encontrada para “{textoBuscado}”
                </p>
                <p className="text-sm opacity-70">
                  Tente outra palavra do título ou{" "}
                  <Link
                    href="/campanhas"
                    className="font-semibold text-primary-600 hover:underline"
                  >
                    veja todas as campanhas
                  </Link>
                  .
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">Ainda não há campanhas ativas</p>
                <p className="text-sm opacity-70">
                  Quando uma ONG publicar uma campanha, ela aparece aqui.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 justify-items-center gap-10 md:grid-cols-2 xl:grid-cols-3">
            {campanhas.itens.map((campanha) => {
              return (
                <CampaignCard
                  key={campanha.id_campanha}
                  titulo={campanha.titulo}
                  ong={campanha.ong_nome}
                  arrecadado={Number(campanha.arrecadado)}
                  meta={campanha.meta ? Number(campanha.meta) : null}
                  imagem={campanha.capa_url}
                  href={`/campanhas/${campanha.id_campanha}`}
                />
              );
            })}
          </div>
        )}

        <PaginacaoLinks
          caminho={caminho}
          paginaAtual={paginaAtual}
          totalPaginas={total_paginas}
        />
      </div>
    </main>
  );
}
