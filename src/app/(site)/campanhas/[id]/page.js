import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faClock,
  faChevronRight,
  faLocationDot,
  faIdCard,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import Button from "@/(components)/ui/Button";
import Chip from "@/(components)/ui/Chip";
import BarraDeProgresso from "@/(components)/ui/BarraDeProgresso";
import QueroDoar from "@/(components)/base/(public)/QueroDoar";
import GaleriaCampanha from "@/(components)/base/(public)/GaleriaCampanha";
import {
  obterCampanhaVisivel,
  listarLocais,
  campanhaTerminou,
  hojeNoBrasil,
} from "@/models/campanha.js";
import { listarMetodos, contarDoacoesConfirmadas } from "@/models/doacao.js";
import { listarFotosDaCampanha } from "@/models/foto.js";
import { buscarOngPublica } from "@/models/usuarios.js";
import { lerSessao } from "@/lib/sessao.js";
import { ehIdValido } from "@/lib/requisicao.js";
import { formatarCnpj, formatarData, diasAte } from "@/lib/formatar.js";

// Página de detalhe da campanha: /campanhas/12
// É um componente de servidor: busca os dados direto nos models do backend,
// com a mesma regra da API (rascunho e cancelada só aparecem para a ONG dona).

// o status vem da API em minúsculo; o Chip usa com a primeira letra maiúscula
const STATUS = {
  rascunho: "Rascunho",
  ativa: "Ativa",
  encerrada: "Encerrada",
  cancelada: "Cancelada",
};

function reais(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function DetalheCampanha({ params }) {
  const { id } = await params;
  if (!ehIdValido(id)) notFound();

  const sessao = await lerSessao();
  const campanha = await obterCampanhaVisivel(id, sessao).catch(() => null);
  if (!campanha) notFound(); // não existe ou o usuário não pode ver

  const [locais, metodos, fotos, ong, confirmadas] = await Promise.all([
    listarLocais(id),
    listarMetodos(),
    listarFotosDaCampanha(id),
    buscarOngPublica(campanha.id_ong),
    contarDoacoesConfirmadas(id),
  ]);

  // O que protege o doador, em fatos que o sistema garante de verdade.
  // (Nada de "ONG verificada": o CNPJ não é consultado na Receita Federal.)
  const protecoes = [
    {
      icone: faIdCard,
      titulo: "Campanha de uma ONG com CNPJ",
      texto: "Só organizações com CNPJ criam campanhas no Connect.",
    },
    {
      icone: faCircleCheck,
      titulo: "A ONG confirma cada doação",
      texto:
        "Sua doação fica pendente até a ONG confirmar que recebeu, e você acompanha o status.",
    },
  ];
  if (locais.length > 0) {
    protecoes.push({
      icone: faLocationDot,
      titulo: "Você sabe para onde vai",
      texto: "Os itens são entregues nos locais de entrega desta página.",
    });
  }

  // a meta é opcional: sem meta, não tem barra nem porcentagem
  const porcentagem = campanha.meta
    ? Math.min(100, Math.round((campanha.arrecadado / campanha.meta) * 100))
    : null;
  const criadaEm = new Date(campanha.criado_em).toLocaleDateString("pt-BR");

  // prazo: "Último dia para doar: 20/12/2026 · faltam 5 dias"
  const prazoEncerrado = campanhaTerminou(campanha);
  let textoDoPrazo = null;
  if (campanha.termina_em) {
    const data = formatarData(campanha.termina_em);
    const dias = diasAte(campanha.termina_em, hojeNoBrasil());
    if (prazoEncerrado) {
      textoDoPrazo = `Prazo encerrado em ${data}`;
    } else if (dias === 0) {
      textoDoPrazo = `Último dia para doar: hoje (${data})`;
    } else if (dias === 1) {
      textoDoPrazo = `Último dia para doar: ${data} · falta 1 dia`;
    } else {
      textoDoPrazo = `Último dia para doar: ${data} · faltam ${dias} dias`;
    }
  }

  return (
    <main className="flex w-full flex-1 flex-col items-center px-4 pt-36 pb-20">
      <div className="flex w-full max-w-7xl flex-col gap-6">
        {/* breadcrumb */}
        <nav aria-label="Caminho" className="flex items-center gap-2 text-sm">
          <Link
            href="/campanhas"
            className="opacity-70 duration-300 ease hover:opacity-100"
          >
            Campanhas
          </Link>
          <FontAwesomeIcon
            icon={faChevronRight}
            className="text-xs opacity-70"
          />
          <span className="font-semibold">{campanha.titulo}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_440px]">
          {/* coluna da esquerda: fotos e informações */}
          <article className="flex flex-col gap-6">
            <GaleriaCampanha fotos={fotos} titulo={campanha.titulo} />

            <div className="flex flex-col gap-3">
              <div>
                <Chip status={STATUS[campanha.status]} />
              </div>
              <h1 className="text-4xl font-semibold">{campanha.titulo}</h1>
              <p className="flex flex-wrap items-center gap-2 text-sm opacity-70">
                por
                <Link
                  href={`/ongs/${campanha.id_ong}`}
                  className="underline duration-300 ease hover:opacity-100"
                >
                  {campanha.ong_nome}
                </Link>
                <span className="size-1 rounded-full bg-current" />
                <FontAwesomeIcon icon={faCalendar} />
                criada em {criadaEm}
              </p>
              {textoDoPrazo && (
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-primary-600"
                  />
                  {textoDoPrazo}
                </p>
              )}
            </div>

            {/* para que é a campanha: o doador lê antes de decidir */}
            {campanha.descricao && (
              <section className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold">Sobre a campanha</h2>
                <p className="max-w-prose whitespace-pre-line leading-relaxed">
                  {campanha.descricao}
                </p>
              </section>
            )}
          </article>

          {/* coluna da direita: arrecadação, locais e ONG */}
          <aside className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 rounded-2xl bg-neutral-0 p-6 shadow-suave">
              <div>
                <p className="text-3xl font-bold">
                  {reais(campanha.arrecadado)}
                </p>
                <p className="text-sm opacity-70">
                  {campanha.meta
                    ? `arrecadados de ${reais(campanha.meta)}`
                    : "arrecadados · campanha sem meta"}
                </p>
                {confirmadas > 0 && (
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
                    {/* só o ícone é verde: texto verde sobre branco não tem contraste */}
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="text-success-500"
                    />
                    {confirmadas === 1
                      ? "1 doação confirmada pela ONG"
                      : `${confirmadas} doações confirmadas pela ONG`}
                  </p>
                )}
              </div>
              {porcentagem !== null && (
                <div className="flex flex-col gap-2">
                  <BarraDeProgresso porcentagem={porcentagem} />
                  <p className="text-sm font-semibold text-primary-600">
                    {porcentagem}% da meta
                  </p>
                </div>
              )}
              <QueroDoar
                idCampanha={campanha.id_campanha}
                titulo={campanha.titulo}
                status={campanha.status}
                tipoUsuario={sessao?.tipo}
                metodos={metodos}
                prazoEncerrado={prazoEncerrado}
              />

              {/* o que protege o doador, antes de ele decidir */}
              <div className="flex flex-col gap-3 rounded-xl bg-neutral-50 p-4">
                <h2 className="text-sm font-semibold">
                  Como sua doação é protegida
                </h2>
                <ul className="flex flex-col gap-3">
                  {protecoes.map((protecao) => {
                    return (
                      <li key={protecao.titulo} className="flex gap-3">
                        <FontAwesomeIcon
                          icon={protecao.icone}
                          className="mt-1 w-4 shrink-0 text-primary-600"
                        />
                        <div>
                          <p className="text-sm font-semibold">
                            {protecao.titulo}
                          </p>
                          <p className="text-sm opacity-70">{protecao.texto}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl bg-neutral-0 p-6 shadow-suave">
              <h2 className="text-xl font-semibold">
                Onde entregar as doações
              </h2>
              {locais.length === 0 ? (
                <p className="text-sm opacity-70">
                  Esta campanha ainda não tem locais de entrega.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {locais.map((local) => {
                    return (
                      <li
                        key={local.id_local}
                        className="flex items-center gap-3 border-b border-neutral-200 py-3 last:border-b-0"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                          <FontAwesomeIcon icon={faLocationDot} />
                        </div>
                        <div>
                          <p className="font-semibold">{local.endereco}</p>
                          <p className="text-sm opacity-70">{local.cidade}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-neutral-0 p-6 shadow-suave">
              {/* foto da ONG; sem foto, a primeira letra do nome */}
              {ong.foto_url ? (
                <img
                  src={ong.foto_url}
                  alt=""
                  className="size-12 shrink-0 rounded-full bg-neutral-200 object-cover"
                />
              ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-neutral-200 font-semibold">
                  {campanha.ong_nome[0]}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold">{campanha.ong_nome}</p>
                <p className="text-sm opacity-70">
                  CNPJ {formatarCnpj(ong.cnpj)}
                </p>
              </div>
              <Link href={`/ongs/${campanha.id_ong}`}>
                <Button variante="suave" tamanho="pequeno">
                  Ver ONG
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
