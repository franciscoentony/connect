import Link from "next/link";
import { redirect } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillWave, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import Button from "@/(components)/ui/Button";
import Chip from "@/(components)/ui/Chip";
import PaginacaoLinks from "@/(components)/ui/PaginacaoLinks";
import BotaoAcao from "@/(components)/base/(ong)/BotaoAcao";
import { lerSessao } from "@/lib/sessao";
import {
  listarPendentesDoDoador,
  listarHistoricoDoDoador,
  resumoDoDoador,
} from "@/models/doacao";

// Minhas doações (doador): /minhas-doacoes?pagina=2
// "O doador nunca fica no escuro" (PRODUCT.md): primeiro o que ainda espera a
// ONG confirmar, depois o histórico (confirmadas e canceladas).
// É um componente de servidor: busca os dados direto nos models.

const POR_PAGINA = 10;

// o status vem da API em minúsculo; o Chip usa com a primeira letra maiúscula
const STATUS = {
  pendente: "Pendente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
};

function reais(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// "R$ 50,00 via Pix" ou "5 cobertores de casal"
function textoDaDoacao(doacao) {
  if (doacao.tipo === "dinheiro") {
    return `${reais(doacao.valor)} via ${doacao.metodo_nome}`;
  }
  return doacao.descricao;
}

export default async function MinhasDoacoes({ searchParams }) {
  const sessao = await lerSessao();

  // sem login: entra e volta para cá; a ONG acompanha doações no painel
  if (!sessao) redirect("/entrar?voltar=/minhas-doacoes");
  if (sessao.tipo === "ong") redirect("/dashboard");

  const { pagina } = await searchParams;
  let paginaAtual = parseInt(pagina);
  if (!paginaAtual || paginaAtual < 1) paginaAtual = 1;

  const [resumo, pendentes, historico] = await Promise.all([
    resumoDoDoador(sessao.id_usuario),
    listarPendentesDoDoador(sessao.id_usuario),
    listarHistoricoDoDoador(sessao.id_usuario, {
      limite: POR_PAGINA,
      pagina: paginaAtual,
    }),
  ]);
  const nuncaDoou = pendentes.length === 0 && historico.paginacao.total === 0;

  return (
    <main className="flex w-full flex-1 flex-col items-center px-4 pt-28 pb-20 lg:pt-36">
      <div className="flex w-full max-w-200 flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold">Minhas doações</h1>
          <p className="text-lg opacity-70">
            Acompanhe cada doação até a ONG confirmar que recebeu.
          </p>
        </div>

        {nuncaDoou ? (
          <section className="flex flex-col items-center gap-4 rounded-2xl bg-neutral-0 p-10 text-center shadow-suave">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">
                Você ainda não fez nenhuma doação
              </h2>
              <p className="text-sm opacity-70">
                Escolha uma campanha. Depois de doar, você acompanha aqui quando
                a ONG confirmar o recebimento.
              </p>
            </div>
            <Link href="/campanhas">
              <Button>Ver campanhas</Button>
            </Link>
          </section>
        ) : (
          <>
            {/* resumo */}
            <section
              aria-label="Resumo das suas doações"
              className="grid grid-cols-1 gap-4 rounded-2xl bg-neutral-0 p-6 shadow-suave sm:grid-cols-3"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-70">
                  Confirmado em dinheiro
                </span>
                <span className="text-2xl font-bold">
                  {reais(resumo.confirmadoEmDinheiro)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-70">Doações confirmadas</span>
                <span className="text-2xl font-bold">{resumo.confirmadas}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm opacity-70">Aguardando a ONG</span>
                <span className="text-2xl font-bold">{resumo.pendentes}</span>
              </div>
            </section>

            {/* aguardando a ONG: o que mais importa fica no topo */}
            {pendentes.length > 0 && (
              <section className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold">Aguardando a ONG</h2>
                  <p className="text-sm opacity-70">
                    A ONG confirma quando receber. Até lá, você pode cancelar.
                  </p>
                </div>
                <ul className="flex flex-col gap-3">
                  {pendentes.map((doacao) => {
                    return (
                      <ItemDoacao key={doacao.id_doacao} doacao={doacao} />
                    );
                  })}
                </ul>
              </section>
            )}

            {/* histórico */}
            {historico.itens.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Histórico</h2>
                <ul className="flex flex-col gap-3">
                  {historico.itens.map((doacao) => {
                    return (
                      <ItemDoacao key={doacao.id_doacao} doacao={doacao} />
                    );
                  })}
                </ul>
                <PaginacaoLinks
                  caminho="/minhas-doacoes"
                  paginaAtual={paginaAtual}
                  totalPaginas={historico.paginacao.total_paginas}
                />
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// Uma doação: o que foi doado, para qual campanha, quando e o status.
// A explicação embaixo diz o que o status significa e o que vem depois.
function ItemDoacao({ doacao }) {
  const pendente = doacao.status === "pendente";
  const data = new Date(doacao.data).toLocaleDateString("pt-BR");

  let explicacao;
  if (pendente && doacao.tipo === "item") {
    explicacao =
      "Entregue o item em um dos locais de entrega da campanha. A ONG confirma quando receber.";
  } else if (pendente) {
    explicacao = "A ONG ainda não confirmou o recebimento.";
  } else if (doacao.status === "confirmada") {
    explicacao = "A ONG confirmou que recebeu. Obrigado por ajudar!";
  } else {
    explicacao = "Esta doação foi cancelada e não conta na campanha.";
  }

  return (
    <li className="flex flex-col gap-4 rounded-2xl bg-neutral-0 p-5 shadow-suave">
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <FontAwesomeIcon
            icon={doacao.tipo === "dinheiro" ? faMoneyBillWave : faBoxOpen}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{textoDaDoacao(doacao)}</p>
            <Chip status={STATUS[doacao.status]} />
          </div>
          <p className="text-sm opacity-70">
            para{" "}
            <Link
              href={`/campanhas/${doacao.id_campanha}`}
              className="font-semibold underline"
            >
              {doacao.campanha_titulo}
            </Link>{" "}
            · feita em {data}
          </p>
          <p className="text-sm">{explicacao}</p>
        </div>
      </div>

      {/* só a doação pendente pode ser cancelada pelo doador */}
      {pendente && (
        <div className="flex justify-end">
          <BotaoAcao
            metodo="PATCH"
            url={`/api/v1/doacoes/${doacao.id_doacao}`}
            corpo={{ status: "cancelada" }}
            confirmacao={`Cancelar a doação "${textoDaDoacao(doacao)}" para ${doacao.campanha_titulo}?`}
            variante="perigo"
            tamanho="pequeno"
          >
            Cancelar doação
          </BotaoAcao>
        </div>
      )}
    </li>
  );
}
