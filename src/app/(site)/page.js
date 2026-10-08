import Link from "next/link";
import { Accordion, Avatar } from "@heroui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faChevronDown,
  faHandHoldingHeart,
} from "@fortawesome/free-solid-svg-icons";
import Button from "@/(components)/ui/Button";
import CampaignCard from "@/(components)/ui/CampaignCard";
import Chip from "@/(components)/ui/Chip";
import Input from "@/(components)/ui/Input";
import Segmented from "@/(components)/ui/Segmented";
import Modal from "@/(components)/ui/Modal";
import { PaginationUI } from "@/(components)/ui/Pagination";
import { exigirUsuario, lerSessao } from "@/lib/sessao";

// Posição das bolhas igual ao Figma (frame Início, 1920px de largura).
// Tudo em porcentagem da área do destaque (1920 x 1024, a partir do topo da
// página, já que o menu é fixo e fica por cima), então a composição só
// aumenta ou diminui junto com a tela.
// left = x / 1920   |   top = y / 1024   |   width = largura / 1920
const BOLHAS = [
  { src: "/Bolha01.png", left: "4.74%", top: "11.62%", width: "20.47%" },
  { src: "/Bolha00.png", left: "8.8%", top: "57.32%", width: "15.78%" },
  { src: "/Bolha03.png", left: "64.9%", top: "8.79%", width: "15.94%" },
  { src: "/Bolha04.png", left: "81.25%", top: "47.85%", width: "8.91%" },
  { src: "/Bolha02.png", left: "55.42%", top: "82.13%", width: "9.38%" },
];

const CAMPANHAS = [
  {
    titulo: "Ajude crianças a ganharem presentes para o dia das crianças",
    ong: "Vida Nova",
    cidade: "Natal-RN",
    arrecadado: 3000,
    meta: 5000,
    status: "Ativa",
  },
  {
    titulo: "Ajude crianças a ganharem presentes para o dia das crianças",
    ong: "Vida Nova",
    cidade: "Natal-RN",
    arrecadado: 3000,
    meta: 5000,
    status: "Pendente",
  },
  {
    titulo: "Ajude crianças a ganharem presentes para o dia das crianças",
    ong: "Vida Nova",
    cidade: "Natal-RN",
    arrecadado: 3000,
    meta: 5000,
    status: "Cancelada",
  },
  {
    titulo: "Ajude crianças a ganharem presentes para o dia das crianças",
    ong: "Vida Nova",
    cidade: "Natal-RN",
    arrecadado: 3000,
    meta: 5000,
    status: "Rascunho",
  },
  {
    titulo: "Ajude crianças a ganharem presentes para o dia das crianças",
    ong: "Vida Nova",
    cidade: "Natal-RN",
    arrecadado: 3000,
    meta: 5000,
    status: "Rascunho",
  },
  {
    titulo: "Ajude crianças a ganharem presentes para o dia das crianças",
    ong: "Vida Nova",
    cidade: "Natal-RN",
    arrecadado: 3000,
    meta: 5000,
    status: "Rascunho",
  },
];

const pagina = [1, 2, 3, 4, 5];

// "Como o sistema funciona": os 3 cards menores do grid (passos 3, 4 e 5).
// Os passos 1 e 2 são maiores e ficam direto no JSX lá embaixo.
const PASSOS = [
  {
    etapa: "Passo 3",
    titulo: "A ONG confirma",
    texto: "Cada doação fica pendente até a ONG confirmar o recebimento.",
    ilustracao: (
      <div className="flex flex-col items-center gap-2">
        <Chip status="Pendente" />
        <FontAwesomeIcon icon={faArrowDown} className="text-neutral-500" />
        <Chip status="Confirmada" />
      </div>
    ),
  },
  {
    etapa: "Passo 4",
    titulo: "A ajuda chega",
    texto: "A ONG entrega as doações aos donatários vinculados à campanha.",
    ilustracao: (
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <FontAwesomeIcon icon={faHandHoldingHeart} />
        </div>
        <div className="text-start">
          <p className="text-sm font-semibold">Família Silva</p>
          <p className="text-xs opacity-70">Rua das Flores, 100 · Natal</p>
        </div>
      </div>
    ),
  },
  {
    etapa: "Passo 5",
    titulo: "Tudo transparente",
    texto: "Acompanhe quanto foi arrecadado e o status de cada doação.",
    ilustracao: (
      <div className="flex w-full flex-col gap-2 text-start">
        <p className="text-sm font-bold">R$ 3.000 de R$ 5.000</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
          <div className="h-full w-3/5 rounded-full bg-primary-500" />
        </div>
        <p className="text-xs font-medium opacity-70">
          60% da meta · 24 doações
        </p>
      </div>
    ),
  },
];

// "Maiores contribuidores": no futuro, vem da API (doadores com mais doações).
const CONTRIBUIDORES = [
  "Maria Souza",
  "João Lima",
  "Ana Costa",
  "Pedro Alves",
  "Júlia Rocha",
  "Lucas Melo",
  "Carla Dias",
  "Rafael Nunes",
  "Beatriz Lopes",
  "Felipe Ramos",
  "Larissa Pinto",
  "Gustavo Reis",
  "Camila Freitas",
  "Bruno Teixeira",
  "Mariana Castro",
  "Thiago Moura",
  "Fernanda Gomes",
  "Diego Martins",
  "Patrícia Cardoso",
  "Rodrigo Barros",
  "Aline Monteiro",
  "Vinícius Araújo",
  "Isabela Correia",
  "Eduardo Pires",
  "Natália Vieira",
  "Leonardo Duarte",
];

// cores das bolinhas com as iniciais (vão se repetindo)
const CORES_AVATAR = ["accent", "success", "warning", "danger", "default"];

function iniciais(nome) {
  const partes = nome.split(" ");
  return partes[0][0] + partes[partes.length - 1][0];
}

const PERGUNTAS = [
  {
    pergunta: "Como eu sei que minha doação está indo ao lugar esperado?",
    resposta:
      "Toda doação fica registrada com um status. A ONG confirma o recebimento e você acompanha tudo em “Minhas doações”.",
  },
  {
    pergunta: "Quem pode criar uma campanha?",
    resposta:
      "Somente ONGs cadastradas com CNPJ. A campanha começa como rascunho e só aparece para o público depois de publicada.",
  },
  {
    pergunta: "Posso doar itens além de dinheiro?",
    resposta:
      "Sim! Ao doar, escolha “Item” e descreva o que vai entregar. Os endereços de entrega aparecem na página da campanha.",
  },
  {
    pergunta: "Como acompanho as minhas doações?",
    resposta:
      "Entre na sua conta e acesse “Minhas doações”. Lá aparecem todas as doações, com status pendente, confirmada ou cancelada.",
  },
];

export default function Home() {
  return (
    <main className="flex w-full flex-1 flex-col items-center pb-16">
      <section className="relative w-full max-w-[1920px] flex flex-col items-center justify-center pt-36 pb-16 h-190 md:py-0">
        {/* bolhas: escondidas no celular */}

        {BOLHAS.map((bolha) => (
          <img
            key={bolha.src}
            src={bolha.src}
            alt=""
            aria-hidden="true"
            draggable="false"
            className="pointer-events-none absolute hidden select-none md:block"
            style={{ left: bolha.left, top: bolha.top, width: bolha.width }}
          />
        ))}

        {/* texto central: no Figma o título começa a 38,9% da altura */}
        <div className="flex flex-col items-center gap-5 px-4 text-center md:pt-25 md:w-full">
          <h1 className="max-w-[1200px] text-4xl font-bold leading-tight md:text-5xl">
            Conectando com Responsabilidade <br className="hidden md:block" />e
            Transformando Vidas.
          </h1>
          <p className="max-w-[600px] text-xl text-neutral-700">
            O Connect é um sistema de gerenciamento de doações que conecta
            doadores a campanhas de arrecadação, com ONGs servindo como ponte.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-4">
            <Link href="/campanhas">
              <Button variante="secundario" className="w-[220px]">
                Ver campanhas
              </Button>
            </Link>
            <Link href="/criar-conta">
              <Button variante="contorno" className="w-[220px]">
                Sou ONG
              </Button>
            </Link>
          </div>
        </div>

        <img
          src="/background-circles.png"
          alt=""
          aria-hidden="true"
          draggable="false"
          className="pointer-events-none absolute right-0 top-0 -z-10 opacity-[0.06] dark:invert-100"
        />
      </section>
      <section className="bg-primary-500 w-full min-h-300 flex flex-col item-center px-4 md:px-50 py-20">
        <article className="flex flex-col gap-3 text-center text-white">
          <h2 className="text-4xl font-semibold">Campanhas Ativas</h2>
          <p className="text-lg">Escolha uma campanha para apoiar</p>
          <div className="grid grid-cols-1 justify-items-center gap-4 mt-12 mb-5 lg:grid-cols-2 2xl:grid-cols-3">
            {CAMPANHAS.map((campanha, index) => {
              return (
                <CampaignCard
                  key={index}
                  titulo={campanha.titulo}
                  ong={campanha.ong}
                  cidade={campanha.cidade}
                  arrecadado={campanha.arrecadado}
                  meta={campanha.meta}
                  // status={campanha.status}
                />
              );
            })}
          </div>
          <PaginationUI paginas={pagina} />
        </article>
      </section>
      <section className="px-4 py-20 md:px-10">
        <article className="flex flex-col items-center gap-15">
          <h2 className="text-4xl font-semibold">Quem somos?</h2>
          <article>
            <div className="flex flex-col items-center gap-7 lg:flex-row lg:items-start">
              <div className="h-60 w-full max-w-150 shrink-0 rounded-2xl bg-neutral-600 lg:h-90 lg:w-150">
                {/* <img src="" alt="" /> */}
              </div>
              <div className="max-w-120 flex flex-col gap-2">
                <p className="font-semibold">
                  Desde sempre instituições de caridade ou pessoas com o
                  objetivo de doar alguns pertencem acabam não sabendo como
                  chegarem a pessoa final (donatário). A Connect é uma startup
                  sem fins lucrativos que nasceu da necessidade de facilitar
                  conexão entre doadores e as pessoas carentes.
                </p>
                <p className="opacity-80">
                  Através de uma plataforma inteligente e auditada, removemos as
                  barreiras burocráticas e a falta de informação, permitindo que
                  a ajuda certa chegue ao lugar exato no momento em que ela é
                  necessária.
                </p>
                <p className="opacity-80">
                  Nossa missão é transformar a intenção de ajudar em impacto
                  real e mensurável, construindo pontes sólidas de solidariedade
                  por todo o país.
                </p>
                <Link href={""} className="mt-6">
                  <Button variante="secundario">Vamos contribuir!</Button>
                </Link>
              </div>
            </div>
          </article>
        </article>
      </section>

      {/* Como o sistema funciona: grid no estilo "bento" */}
      <section className="w-full px-4 py-20">
        <article className="flex flex-col items-center gap-15">
          <h2 className="text-4xl font-semibold">Como o sistema funciona?</h2>

          <div className="grid w-full max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[380px_repeat(3,1fr)]">
            {/* Passo 1: card alto, ocupa as duas linhas */}
            <div className="flex flex-col gap-4 rounded-2xl bg-neutral-0 p-6 shadow-suave lg:row-span-2">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-primary-600">
                  Passo 1 · Para ONGs
                </p>
                <h2 className="text-lg font-semibold">
                  Crie sua campanha em minutos
                </h2>
                <p className="text-sm opacity-80">
                  Defina título e meta, adicione os locais de entrega e publique
                  quando estiver pronta.
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-3 rounded-xl bg-neutral-50 p-4">
                <div className="flex h-32 items-end rounded-xl bg-neutral-200 p-3">
                  <Chip status="Ativa" />
                </div>
                <p className="font-semibold">Natal Solidário</p>
                <p className="text-xs opacity-70">por Vida Nova · Natal-RN</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                  <div className="h-full w-3/5 rounded-full bg-primary-500" />
                </div>
                <p className="text-xs font-semibold text-primary-600">
                  R$ 3.000 arrecadados de R$ 5.000
                </p>
              </div>
            </div>

            {/* Passo 2: card largo, ocupa as três colunas da direita */}
            <div className="flex flex-col items-center gap-7 rounded-2xl bg-neutral-0 p-6 shadow-suave lg:col-span-3 lg:flex-row">
              <div className="flex max-w-75 flex-col gap-2">
                <p className="text-xs font-semibold text-primary-600">
                  Passo 2 · Para doadores
                </p>
                <h3 className="text-lg font-semibold">Doe dinheiro ou itens</h3>
                <p className="text-sm opacity-80">
                  Escolha uma campanha ativa, informe o valor ou o item e
                  confirme. Simples e seguro.
                </p>
              </div>
              <div className="flex w-full flex-1 flex-col gap-3 rounded-xl bg-neutral-50 p-4">
                <Segmented opcoes={["Dinheiro", "Item", "Alimento"]} />
                <Input placeholder="R$ 50,00" />
                <Button variante="secundario" tamanho="pequeno" larguraTotal>
                  Confirmar doação
                </Button>
              </div>
            </div>

            {/* Passos 3, 4 e 5: cards menores */}
            {PASSOS.map((passo) => {
              return (
                <div
                  key={passo.etapa}
                  className="flex flex-col gap-4 rounded-2xl bg-neutral-0 p-6 shadow-suave"
                >
                  <div className="flex h-28 items-center justify-center rounded-xl bg-neutral-50 p-4">
                    {passo.ilustracao}
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-primary-600">
                      {passo.etapa}
                    </p>
                    <h3 className="text-lg font-semibold">{passo.titulo}</h3>
                    <p className="text-sm opacity-80">{passo.texto}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      {/* Maiores contribuidores */}
      <section className="w-full px-4 py-20">
        <article className="flex flex-col items-center gap-15">
          <div className="flex flex-col gap-3 text-center">
            <h2 className="text-4xl font-semibold">Maiores Contribuidores</h2>
            <p className="text-lg opacity-70">
              Quem mais ajudou a transformar vidas pelo Connect
            </p>
          </div>

          <div className="flex max-w-150 flex-wrap justify-center gap-y-3 -space-x-2">
            {CONTRIBUIDORES.map((nome, index) => {
              return (
                <Avatar
                  key={nome}
                  color={CORES_AVATAR[index % CORES_AVATAR.length]}
                  className="ring-2 ring-[var(--bg-pagina)] duration-300 ease hover:z-10 hover:scale-110"
                >
                  <Avatar.Fallback className="text-sm font-semibold">
                    {iniciais(nome)}
                  </Avatar.Fallback>
                </Avatar>
              );
            })}
          </div>
        </article>
      </section>

      {/* Perguntas frequentes */}
      <section className="w-full px-4 py-20">
        <article className="flex flex-col items-center gap-15">
          <h2 className="text-4xl font-semibold">Perguntas Frequentes</h2>

          <div className="flex w-full max-w-7xl flex-col items-start gap-7 lg:flex-row">
            <Accordion
              defaultExpandedKeys={["pergunta-0"]}
              className="flex w-full flex-1 flex-col gap-3"
            >
              {PERGUNTAS.map((item, index) => {
                return (
                  <Accordion.Item
                    key={index}
                    id={`pergunta-${index}`}
                    className="rounded-2xl bg-neutral-0 px-5 shadow-suave"
                  >
                    <Accordion.Heading>
                      <Accordion.Trigger className="py-4 text-start font-semibold">
                        {item.pergunta}
                        <Accordion.Indicator>
                          <FontAwesomeIcon icon={faChevronDown} />
                        </Accordion.Indicator>
                      </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel>
                      <Accordion.Body className="pb-4 text-sm opacity-80">
                        {item.resposta}
                      </Accordion.Body>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>

            <div className="flex w-full flex-col gap-4 rounded-2xl bg-neutral-0 p-6 shadow-suave lg:max-w-100">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-semibold">Tem alguma pergunta?</h3>
                <p className="text-sm opacity-80">
                  Sua dúvida pode ser a de mais pessoas. Envie sua pergunta e
                  ela pode entrar nas Perguntas Frequentes.
                </p>
              </div>
              <Input rotulo="Seu nome" placeholder="Digite seu nome" />
              <Input
                rotulo="E-mail"
                type="email"
                placeholder="Digite seu e-mail"
              />
              <Input
                rotulo="Dúvida"
                placeholder="Digite sua dúvida"
                multilinha
              />
              <Button larguraTotal className="mt-2">
                Enviar pergunta
              </Button>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
