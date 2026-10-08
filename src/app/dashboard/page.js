import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faClock,
  faDollarSign,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import NovaCampanha from "@/(components)/base/(ong)/NovaCampanha";
import TabelaCampanhas from "@/(components)/base/(ong)/TabelaCampanhas";
import BotaoAcao from "@/(components)/base/(ong)/BotaoAcao";
import Table from "@/(components)/ui/Table";
import { lerSessao } from "@/lib/sessao";
import { buscarUsuarioPorId } from "@/models/usuarios";
import { listarCampanhas, resumoDoPainel } from "@/models/campanha";
import { listarDoacoesPendentesDaOng } from "@/models/doacao";

// Dashboard da ONG: /dashboard
// Componente de servidor: busca os dados direto nos models.
// (O layout.js já garantiu que quem está aqui é uma ONG logada.)
//
// A tarefa mais importante da ONG aqui é confirmar doações: o doador só vê a
// doação como confirmada depois disso. Por isso, quando há doações pendentes,
// o destaque vai para elas e a seção "Precisa da sua atenção" aparece primeiro.

// quantas doações pendentes aparecem no dashboard (o resto fica em cada campanha)
const PENDENTES_NO_DASHBOARD = 5;

function reais(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function Dashboard() {
  const sessao = await lerSessao();
  const [usuario, resumo, campanhas, pendentes] = await Promise.all([
    buscarUsuarioPorId(sessao.id_usuario),
    resumoDoPainel(sessao.id_usuario),
    listarCampanhas(
      { idOng: sessao.id_usuario, todosOsStatus: true },
      { limite: 5, pagina: 1 }, // só as 5 mais recentes; o resto fica em "Minhas campanhas"
    ),
    listarDoacoesPendentesDaOng(sessao.id_usuario, PENDENTES_NO_DASHBOARD),
  ]);
  const temPendentes = resumo.doacoesPendentes > 0;

  // os 3 cards do topo
  const RESUMO = [
    {
      titulo: "Campanhas ativas",
      valor: resumo.campanhasAtivas,
      icone: faCircleCheck,
      destaque: !temPendentes, // card verde (Figma) quando não há o que confirmar
    },
    {
      titulo: "Arrecadado (confirmado)",
      valor: reais(resumo.arrecadado),
      icone: faDollarSign,
    },
    {
      titulo: "Doações pendentes",
      valor: resumo.doacoesPendentes,
      icone: faClock,
      destaque: temPendentes, // há doações esperando: o destaque vem para cá
      link: temPendentes ? "#pendentes" : null, // leva para a lista abaixo
    },
  ];

  return (
    <main className="flex flex-col gap-8">
      {/* título + botão de criar */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold">Olá, {usuario.nome}!</h1>
          <p className="text-lg opacity-70">Suas campanhas</p>
        </div>
        <NovaCampanha />
      </section>

      {/* resumo */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {RESUMO.map((item) => {
          const conteudo = (
            <article
              className={`flex h-full flex-col gap-4 rounded-2xl p-6 shadow-suave ${
                item.destaque
                  ? "bg-gradient-to-br from-success-500 to-secondary-600 text-sobre-verde"
                  : "bg-neutral-0"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={item.destaque ? "font-medium" : "opacity-70"}>
                  {item.titulo}
                </p>
                <div
                  className={`flex size-10 items-center justify-center rounded-full ${
                    item.destaque
                      ? "bg-white/30"
                      : "bg-primary-100 text-primary-600"
                  }`}
                >
                  <FontAwesomeIcon icon={item.icone} />
                </div>
              </div>
              <p className="text-4xl font-bold">{item.valor}</p>
              {item.link && (
                <p className="flex items-center gap-2 text-sm font-semibold">
                  Confirmar agora
                  <FontAwesomeIcon icon={faArrowDown} />
                </p>
              )}
            </article>
          );

          if (!item.link) {
            return <div key={item.titulo}>{conteudo}</div>;
          }
          return (
            <Link
              key={item.titulo}
              href={item.link}
              className="rounded-2xl duration-300 ease hover:-translate-y-0.5"
            >
              {conteudo}
            </Link>
          );
        })}
      </section>

      {/* doações esperando confirmação: só aparece quando existe alguma */}
      {temPendentes && (
        <section id="pendentes" className="flex scroll-mt-6 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Precisa da sua atenção</h2>
            <p className="text-sm opacity-70">
              Confirme quando receber. O doador só vê a doação como confirmada
              depois disso.
            </p>
          </div>

          {/* computador: tabela */}
          <div className="hidden md:block">
            <Table
              rotulo="Doações pendentes"
              colunas={[
                { titulo: "Doador", chave: "doador" },
                { titulo: "Doação", chave: "doacao" },
                { titulo: "Campanha", chave: "campanha" },
                { titulo: "Feita em", chave: "data" },
                { titulo: "", chave: "acoes" },
              ]}
              linhas={pendentes.map((doacao) => {
                return {
                  doador: doacao.doador_nome,
                  doacao: textoDaDoacao(doacao),
                  campanha: <LinkDaCampanha doacao={doacao} />,
                  data: new Date(doacao.data).toLocaleDateString("pt-BR"),
                  acoes: <AcoesDaDoacao doacao={doacao} />,
                };
              })}
            />
          </div>

          {/* celular: um card por doação, com os botões sempre à vista */}
          <ul className="flex flex-col gap-3 md:hidden">
            {pendentes.map((doacao) => {
              return (
                <li
                  key={doacao.id_doacao}
                  className="flex flex-col gap-4 rounded-2xl bg-neutral-0 p-5 shadow-suave"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">{textoDaDoacao(doacao)}</p>
                    <p className="text-sm opacity-70">
                      {doacao.doador_nome} ·{" "}
                      {new Date(doacao.data).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-sm">
                      <LinkDaCampanha doacao={doacao} />
                    </p>
                  </div>
                  <AcoesDaDoacao doacao={doacao} />
                </li>
              );
            })}
          </ul>

          {resumo.doacoesPendentes > pendentes.length && (
            <p className="text-sm opacity-70">
              Mostrando as {pendentes.length} mais antigas de{" "}
              {resumo.doacoesPendentes}. As outras estão em cada campanha, na
              aba “Doações recebidas”.
            </p>
          )}
        </section>
      )}

      {/* campanhas mais recentes */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Campanhas recentes</h2>
          {campanhas.paginacao.total > campanhas.itens.length && (
            <Link
              href="/dashboard/campanhas"
              className="text-sm font-semibold text-primary-600 hover:underline"
            >
              Ver todas ({campanhas.paginacao.total})
            </Link>
          )}
        </div>
        <TabelaCampanhas campanhas={campanhas.itens} />
      </section>
    </main>
  );
}

// ---------- partes da lista de doações pendentes ----------
// (usadas tanto na tabela do computador quanto nos cards do celular)

// "R$ 50,00 • Pix" ou "5 cobertores de casal"
function textoDaDoacao(doacao) {
  if (doacao.tipo === "dinheiro") {
    return `${reais(doacao.valor)} • ${doacao.metodo_nome}`;
  }
  return doacao.descricao;
}

function LinkDaCampanha({ doacao }) {
  return (
    <Link
      href={`/dashboard/campanhas/${doacao.id_campanha}?aba=doacoes`}
      className="hover:underline"
    >
      {doacao.campanha_titulo}
    </Link>
  );
}

function AcoesDaDoacao({ doacao }) {
  return (
    <div className="flex gap-2 md:justify-end">
      <BotaoAcao
        metodo="PATCH"
        url={`/api/v1/doacoes/${doacao.id_doacao}`}
        corpo={{ status: "confirmada" }}
        variante="secundario"
        tamanho="pequeno"
      >
        Confirmar
      </BotaoAcao>
      <BotaoAcao
        metodo="PATCH"
        url={`/api/v1/doacoes/${doacao.id_doacao}`}
        corpo={{ status: "cancelada" }}
        confirmacao="Cancelar esta doação?"
        variante="perigo"
        tamanho="pequeno"
      >
        Cancelar
      </BotaoAcao>
    </div>
  );
}
