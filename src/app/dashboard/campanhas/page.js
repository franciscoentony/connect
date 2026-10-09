import NovaCampanha from "@/(components)/base/(ong)/NovaCampanha";
import TabelaCampanhas from "@/(components)/base/(ong)/TabelaCampanhas";
import PaginacaoLinks from "@/(components)/ui/PaginacaoLinks";
import { lerSessao } from "@/lib/sessao";
import { listarCampanhas } from "@/models/campanha";

// Minhas campanhas: /dashboard/campanhas?pagina=2
// Todas as campanhas da ONG logada, de qualquer status (inclusive rascunhos),
// 10 por página. (O layout.js já garantiu que quem está aqui é uma ONG.)

const POR_PAGINA = 10;

export default async function MinhasCampanhas({ searchParams }) {
  const { pagina } = await searchParams;

  // ?pagina=abc ou ?pagina=0 viram a página 1
  let paginaAtual = parseInt(pagina);
  if (!paginaAtual || paginaAtual < 1) paginaAtual = 1;

  const sessao = await lerSessao();
  const campanhas = await listarCampanhas(
    { idOng: sessao.id_usuario, todosOsStatus: true },
    { limite: POR_PAGINA, pagina: paginaAtual },
  );
  const { total, total_paginas } = campanhas.paginacao;

  return (
    <main className="flex flex-col gap-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold">Minhas campanhas</h1>
          <p className="text-lg opacity-70">
            {total === 1 ? "1 campanha" : `${total} campanhas`}, inclusive
            rascunhos
          </p>
        </div>
        <NovaCampanha />
      </section>

      <section className="flex flex-col gap-6">
        <TabelaCampanhas campanhas={campanhas.itens} />
        <PaginacaoLinks
          caminho="/dashboard/campanhas"
          paginaAtual={paginaAtual}
          totalPaginas={total_paginas}
        />
      </section>
    </main>
  );
}
