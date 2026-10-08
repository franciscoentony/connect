import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Button from "@/(components)/ui/Button";
import Chip from "@/(components)/ui/Chip";
import Table from "@/(components)/ui/Table";
import PaginacaoLinks from "@/(components)/ui/PaginacaoLinks";
import BotaoAcao from "@/(components)/base/(ong)/BotaoAcao";
import FormDadosCampanha from "@/(components)/base/(ong)/FormDadosCampanha";
import FormLocal from "@/(components)/base/(ong)/FormLocal";
import FormVincularDonatario from "@/(components)/base/(ong)/FormVincularDonatario";
import BotaoEnviarFoto from "@/(components)/base/(ong)/BotaoEnviarFoto";
import { lerSessao } from "@/lib/sessao";
import { ehIdValido } from "@/lib/requisicao";
import { obterCampanhaDaOng, listarLocais } from "@/models/campanha";
import { listarDoacoesDaCampanha } from "@/models/doacao";
import {
  listarFotosDaCampanha,
  MAXIMO_DE_FOTOS_POR_CAMPANHA,
} from "@/models/foto";
import {
  listarDonatarios,
  listarDonatariosDaCampanha,
} from "@/models/donatario";

// Gerenciar campanha: /dashboard/campanhas/12?aba=doacoes
// Cabeçalho com os botões de status + 5 abas (cada aba é um link).
// Componente de servidor: só busca os dados da aba aberta.

// o status vem da API em minúsculo; o Chip usa com a primeira letra maiúscula
const STATUS = {
  rascunho: "Rascunho",
  ativa: "Ativa",
  encerrada: "Encerrada",
  cancelada: "Cancelada",
  pendente: "Pendente",
  confirmada: "Confirmada",
};

const ABAS = [
  { chave: "dados", texto: "Dados" },
  { chave: "fotos", texto: "Fotos" },
  { chave: "locais", texto: "Locais de entrega" },
  { chave: "doacoes", texto: "Doações recebidas" },
  { chave: "donatarios", texto: "Donatários" },
];

// Botões de status que aparecem em cada situação (mesma regra do backend):
// rascunho -> publicar ou cancelar | ativa -> encerrar ou cancelar
// encerrada e cancelada -> nenhum (a campanha fica só para leitura)
const CANCELAR = {
  status: "cancelada",
  texto: "Cancelar campanha",
  variante: "perigo",
  confirmacao: "Cancelar a campanha? Isso não pode ser desfeito.",
};
const ACOES_DE_STATUS = {
  rascunho: [
    { status: "ativa", texto: "Publicar campanha", variante: "primario" },
    CANCELAR,
  ],
  ativa: [
    {
      status: "encerrada",
      texto: "Encerrar campanha",
      variante: "secundario",
      confirmacao: "Encerrar a campanha? Ela deixa de receber doações.",
    },
    CANCELAR,
  ],
  encerrada: [],
  cancelada: [],
};

function reais(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function GerenciarCampanha({ params, searchParams }) {
  const { id } = await params;
  const { aba = "doacoes", pagina } = await searchParams;
  if (!ehIdValido(id)) notFound();

  const sessao = await lerSessao();
  // 404 se não existir ou se for de outra ONG
  const campanha = await obterCampanhaDaOng(id, sessao.id_usuario).catch(
    () => null,
  );
  if (!campanha) notFound();

  const finalizada =
    campanha.status === "encerrada" || campanha.status === "cancelada";
  const caminho = `/dashboard/campanhas/${id}`;

  let paginaAtual = parseInt(pagina);
  if (!paginaAtual || paginaAtual < 1) paginaAtual = 1;

  return (
    <main className="flex flex-col gap-8">
      {/* cabeçalho */}
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <nav aria-label="Caminho" className="flex items-center gap-2 text-sm">
            <Link
              href="/dashboard/campanhas"
              className="opacity-70 duration-300 ease hover:opacity-100"
            >
              Minhas campanhas
            </Link>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-xs opacity-70"
            />
            <span className="font-semibold">{campanha.titulo}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-semibold">{campanha.titulo}</h1>
            <Chip status={STATUS[campanha.status]} />
          </div>
          <p className="text-lg opacity-70">
            {reais(campanha.arrecadado)} arrecadados
            {campanha.meta ? ` de ${reais(campanha.meta)}` : " · sem meta"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/campanhas/${id}`}>
            <Button variante="suave">Ver página pública</Button>
          </Link>
          {ACOES_DE_STATUS[campanha.status].map((acao) => {
            return (
              <BotaoAcao
                key={acao.status}
                metodo="PATCH"
                url={`/api/v1/campanhas/${id}`}
                corpo={{ status: acao.status }}
                variante={acao.variante}
                confirmacao={acao.confirmacao}
              >
                {acao.texto}
              </BotaoAcao>
            );
          })}
        </div>
      </section>

      {/* abas */}
      {/* no celular as abas não cabem: a linha rola para o lado */}
      <nav
        aria-label="Abas"
        className="flex gap-8 overflow-x-auto border-b border-neutral-200"
      >
        {ABAS.map((item) => {
          const ativa = item.chave === aba;
          return (
            <Link
              key={item.chave}
              href={`${caminho}?aba=${item.chave}`}
              aria-current={ativa ? "page" : undefined}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-2 pb-3 duration-300 ease ${
                ativa
                  ? "border-neutral-900 font-semibold"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {item.texto}
            </Link>
          );
        })}
      </nav>

      {/* conteúdo da aba aberta */}
      {aba === "dados" && (
        <FormDadosCampanha campanha={campanha} bloqueado={finalizada} />
      )}
      {aba === "fotos" && <AbaFotos idCampanha={id} finalizada={finalizada} />}
      {aba === "locais" && (
        <AbaLocais idCampanha={id} finalizada={finalizada} />
      )}
      {aba === "doacoes" && (
        <AbaDoacoes
          idCampanha={id}
          idOng={sessao.id_usuario}
          caminho={`${caminho}?aba=doacoes`}
          paginaAtual={paginaAtual}
        />
      )}
      {aba === "donatarios" && (
        <AbaDonatarios
          idCampanha={id}
          idOng={sessao.id_usuario}
          finalizada={finalizada}
        />
      )}
    </main>
  );
}

// ---------- abas ----------
// Cada aba é uma função à parte para a página principal ficar fácil de ler.

async function AbaFotos({ idCampanha, finalizada }) {
  const fotos = await listarFotosDaCampanha(idCampanha);
  const podeAdicionar =
    !finalizada && fotos.length < MAXIMO_DE_FOTOS_POR_CAMPANHA;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm opacity-70">
          {fotos.length} de {MAXIMO_DE_FOTOS_POR_CAMPANHA} fotos · a primeira é
          a capa da campanha · JPG, PNG ou WEBP de até 2 MB
        </p>
        {podeAdicionar && (
          <BotaoEnviarFoto url={`/api/v1/campanhas/${idCampanha}/fotos`}>
            + Adicionar foto
          </BotaoEnviarFoto>
        )}
      </div>

      {fotos.length === 0 ? (
        <Vazio texto="Esta campanha ainda não tem fotos." />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {fotos.map((foto, posicao) => {
            return (
              <article
                key={foto.id_foto}
                className="flex flex-col gap-3 rounded-2xl bg-neutral-0 p-3 shadow-suave"
              >
                <div className="relative">
                  <img
                    src={foto.url}
                    alt={`Foto ${posicao + 1}`}
                    className="h-44 w-full rounded-xl bg-neutral-200 object-cover"
                  />
                  {posicao === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
                      Capa
                    </span>
                  )}
                </div>
                {!finalizada && (
                  <BotaoAcao
                    metodo="DELETE"
                    url={foto.url}
                    confirmacao="Apagar esta foto?"
                    variante="perigo"
                    tamanho="pequeno"
                    larguraTotal
                  >
                    Apagar
                  </BotaoAcao>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

async function AbaLocais({ idCampanha, finalizada }) {
  const locais = await listarLocais(idCampanha);

  const linhas = locais.map((local) => {
    return {
      endereco: local.endereco,
      cidade: local.cidade,
      acoes: finalizada ? null : (
        <div className="flex justify-end">
          <BotaoAcao
            metodo="DELETE"
            url={`/api/v1/campanhas/${idCampanha}/locais/${local.id_local}`}
            confirmacao={`Remover o local "${local.endereco}"?`}
            variante="perigo"
            tamanho="pequeno"
          >
            Remover
          </BotaoAcao>
        </div>
      ),
    };
  });

  return (
    <section className="flex flex-col items-start gap-6 lg:flex-row">
      <div className="w-full flex-1">
        {linhas.length === 0 ? (
          <Vazio texto="Esta campanha ainda não tem locais de entrega." />
        ) : (
          <Table
            rotulo="Locais de entrega"
            colunas={[
              { titulo: "Endereço", chave: "endereco" },
              { titulo: "Cidade", chave: "cidade" },
              { titulo: "", chave: "acoes" },
            ]}
            linhas={linhas}
          />
        )}
      </div>
      {!finalizada && <FormLocal idCampanha={idCampanha} />}
    </section>
  );
}

async function AbaDoacoes({ idCampanha, idOng, caminho, paginaAtual }) {
  const doacoes = await listarDoacoesDaCampanha(idCampanha, idOng, {
    limite: 10,
    pagina: paginaAtual,
  });

  const linhas = doacoes.itens.map((doacao) => {
    // "Dinheiro • R$ 50,00 • Pix" ou "Item • 3 cobertores"
    const descricao =
      doacao.tipo === "dinheiro"
        ? `Dinheiro • ${reais(doacao.valor)} • ${doacao.metodo_nome}`
        : `Item • ${doacao.descricao}`;

    return {
      doador: doacao.doador_nome,
      doacao: descricao,
      data: new Date(doacao.data).toLocaleDateString("pt-BR"),
      status: <Chip status={STATUS[doacao.status]} />,
      // só doação pendente pode ser confirmada ou cancelada
      acoes:
        doacao.status !== "pendente" ? null : (
          <div className="flex justify-end gap-2">
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
        ),
    };
  });

  return (
    <section className="flex flex-col gap-6">
      {linhas.length === 0 ? (
        <Vazio texto="Esta campanha ainda não recebeu doações." />
      ) : (
        <Table
          rotulo="Doações recebidas"
          colunas={[
            { titulo: "Doador", chave: "doador" },
            { titulo: "Doação", chave: "doacao" },
            { titulo: "Data", chave: "data" },
            { titulo: "Status", chave: "status" },
            { titulo: "", chave: "acoes" },
          ]}
          linhas={linhas}
        />
      )}
      <PaginacaoLinks
        caminho={caminho}
        paginaAtual={paginaAtual}
        totalPaginas={doacoes.paginacao.total_paginas}
      />
    </section>
  );
}

async function AbaDonatarios({ idCampanha, idOng, finalizada }) {
  const [vinculados, todos] = await Promise.all([
    listarDonatariosDaCampanha(idCampanha, idOng, { limite: 50, pagina: 1 }),
    listarDonatarios(idOng, { limite: 50, pagina: 1 }),
  ]);

  // para o formulário: só os donatários que ainda não estão na campanha
  const idsVinculados = vinculados.itens.map((d) => d.id_donatario);
  const disponiveis = todos.itens.filter(
    (d) => !idsVinculados.includes(d.id_donatario),
  );

  const linhas = vinculados.itens.map((donatario) => {
    return {
      nome: donatario.nome,
      contato: donatario.contato || "—",
      acoes: finalizada ? null : (
        <div className="flex justify-end">
          <BotaoAcao
            metodo="DELETE"
            url={`/api/v1/campanhas/${idCampanha}/donatarios/${donatario.id_donatario}`}
            confirmacao={`Desvincular "${donatario.nome}" desta campanha?`}
            variante="perigo"
            tamanho="pequeno"
          >
            Desvincular
          </BotaoAcao>
        </div>
      ),
    };
  });

  return (
    <section className="flex flex-col items-start gap-6 lg:flex-row">
      <div className="w-full flex-1">
        {linhas.length === 0 ? (
          <Vazio texto="Nenhum donatário vinculado a esta campanha." />
        ) : (
          <Table
            rotulo="Donatários da campanha"
            colunas={[
              { titulo: "Donatário", chave: "nome" },
              { titulo: "Contato", chave: "contato" },
              { titulo: "", chave: "acoes" },
            ]}
            linhas={linhas}
          />
        )}
      </div>
      {!finalizada && (
        <FormVincularDonatario
          idCampanha={idCampanha}
          donatarios={disponiveis}
        />
      )}
    </section>
  );
}

// aviso para quando a aba não tem nada para mostrar
function Vazio({ texto }) {
  return (
    <div className="rounded-2xl bg-neutral-0 shadow-suave p-10 text-center text-sm opacity-70">
      {texto}
    </div>
  );
}
