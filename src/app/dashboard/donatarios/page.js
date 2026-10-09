import Table from "@/(components)/ui/Table";
import PaginacaoLinks from "@/(components)/ui/PaginacaoLinks";
import BotaoAcao from "@/(components)/base/(ong)/BotaoAcao";
import ModalDonatario from "@/(components)/base/(ong)/ModalDonatario";
import { lerSessao } from "@/lib/sessao";
import { listarDonatarios } from "@/models/donatario";

// Donatários: /dashboard/donatarios?pagina=2
// Pessoas, famílias e instituições atendidas pela ONG logada.
// Só a própria ONG vê os seus donatários. 10 por página.

const POR_PAGINA = 10;

const COLUNAS = [
  { titulo: "Nome", chave: "nome" },
  { titulo: "Contato", chave: "contato" },
  { titulo: "Cadastrado em", chave: "cadastradoEm" },
  { titulo: "", chave: "acoes" },
];

export default async function Donatarios({ searchParams }) {
  const { pagina } = await searchParams;

  // ?pagina=abc ou ?pagina=0 viram a página 1
  let paginaAtual = parseInt(pagina);
  if (!paginaAtual || paginaAtual < 1) paginaAtual = 1;

  const sessao = await lerSessao();
  const donatarios = await listarDonatarios(sessao.id_usuario, {
    limite: POR_PAGINA,
    pagina: paginaAtual,
  });
  const { total, total_paginas } = donatarios.paginacao;

  // cada donatário vira uma linha da tabela
  const linhas = donatarios.itens.map((donatario) => {
    return {
      nome: donatario.nome,
      contato: donatario.contato || "—",
      cadastradoEm: new Date(donatario.criado_em).toLocaleDateString("pt-BR"),
      acoes: (
        <div className="flex justify-end gap-2">
          <ModalDonatario donatario={donatario} />
          {/* a API recusa (409) se ele estiver vinculado a alguma campanha */}
          <BotaoAcao
            metodo="DELETE"
            url={`/api/v1/donatarios/${donatario.id_donatario}`}
            confirmacao={`Excluir "${donatario.nome}"?`}
            variante="perigo"
            tamanho="pequeno"
          >
            Excluir
          </BotaoAcao>
        </div>
      ),
    };
  });

  return (
    <main className="flex flex-col gap-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold">Donatários</h1>
          <p className="text-lg opacity-70">
            Pessoas e instituições atendidas pela sua ONG
            {total > 0 &&
              ` · ${total === 1 ? "1 cadastrado" : `${total} cadastrados`}`}
          </p>
        </div>
        <ModalDonatario />
      </section>

      <section className="flex flex-col gap-6">
        {linhas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-neutral-0 shadow-suave p-10 text-center">
            <p className="font-semibold">Nenhum donatário cadastrado</p>
            <p className="text-sm opacity-70">
              Clique em “+ Novo donatário” para cadastrar o primeiro.
            </p>
          </div>
        ) : (
          <Table colunas={COLUNAS} linhas={linhas} rotulo="Donatários" />
        )}
        <PaginacaoLinks
          caminho="/dashboard/donatarios"
          paginaAtual={paginaAtual}
          totalPaginas={total_paginas}
        />
      </section>
    </main>
  );
}
