import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Button from "@/(components)/ui/Button";
import CampaignCard from "@/(components)/ui/CampaignCard";
import PaginacaoLinks from "@/(components)/ui/PaginacaoLinks";
import { buscarOngPublica } from "@/models/usuarios.js";
import { listarCampanhas } from "@/models/campanha.js";
import { contarContribuidoresDaOng } from "@/models/doacao.js";
import { ehIdValido } from "@/lib/requisicao.js";
import { formatarCnpj } from "@/lib/formatar.js";

// Página pública da ONG: /ongs/12?busca=natal&pagina=2
// Layout do Figma "Página da ONG": faixa verde, foto, nome, CNPJ, descrição,
// site, contato e números;
// embaixo, as campanhas ATIVAS da ONG com busca por título. 9 por página.
// É um componente de servidor: busca os dados direto nos models.

const POR_PAGINA = 9;

// O contato é um texto livre: e-mail vira link "mailto:" (abre o e-mail)
// e telefone vira "tel:" (liga no celular).
function linkDoContato(contato) {
  if (contato.includes("@")) {
    return `mailto:${contato}`;
  }
  const soNumeros = contato.replace(/\D/g, "");
  return `tel:${soNumeros}`;
}

// "https://amigos.org.br/" vira "amigos.org.br", para mostrar na tela
function siteSemProtocolo(site) {
  return site.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export default async function PaginaDaOng({ params, searchParams }) {
  const { id } = await params;
  const { pagina, busca = "" } = await searchParams;
  if (!ehIdValido(id)) notFound();

  // 404 se não existir ou se o id for de um doador
  const ong = await buscarOngPublica(id).catch(() => null);
  if (!ong) notFound();

  // ?pagina=abc ou ?pagina=0 viram a página 1
  let paginaAtual = parseInt(pagina);
  if (!paginaAtual || paginaAtual < 1) paginaAtual = 1;

  const textoBuscado = busca.trim();

  // sem "todosOsStatus": só as campanhas ativas desta ONG
  const [campanhas, todasAtivas, contribuidores] = await Promise.all([
    listarCampanhas(
      { idOng: id, busca: textoBuscado },
      { limite: POR_PAGINA, pagina: paginaAtual },
    ),
    // sem busca, só para o número "Campanhas" do topo
    listarCampanhas({ idOng: id }, { limite: 1, pagina: 1 }),
    contarContribuidoresDaOng(id),
  ]);
  const { total, total_paginas } = campanhas.paginacao;

  // números ao lado do nome
  const metricas = [
    { titulo: "Contribuidores", valor: contribuidores },
    { titulo: "Campanhas", valor: todasAtivas.paginacao.total },
  ];

  // a paginação precisa manter a busca no endereço
  let caminho = `/ongs/${id}`;
  if (textoBuscado) {
    caminho = `/ongs/${id}?busca=${encodeURIComponent(textoBuscado)}`;
  }

  return (
    <main className="flex w-full flex-1 flex-col items-center px-4 pt-36 pb-20">
      <div className="flex w-full max-w-7xl flex-col gap-15">
        {/* perfil: faixa verde + foto + informações */}
        <section className="flex flex-col">
          <div className="h-44 w-full rounded-3xl bg-success-500" />

          <div className="flex flex-col gap-6 px-8 md:flex-row">
            {/* a foto "encosta" na faixa verde (-mt-5) */}
            {ong.foto_url ? (
              <img
                src={ong.foto_url}
                alt={`Foto da ONG ${ong.nome}`}
                className="-mt-5 size-36 shrink-0 rounded-3xl border-6 border-neutral-0 bg-neutral-200 object-cover shadow-suave"
              />
            ) : (
              <div className="-mt-5 flex size-36 shrink-0 items-center justify-center rounded-3xl border-6 border-neutral-0 bg-primary-100 text-5xl font-bold text-primary-600 shadow-suave">
                {ong.nome[0]}
              </div>
            )}

            <div className="flex flex-1 flex-wrap justify-between gap-6 pt-5">
              <div className="flex max-w-140 flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold">{ong.nome}</h1>
                  <p className="opacity-70">CNPJ {formatarCnpj(ong.cnpj)}</p>
                </div>

                {/* descrição, site e contato são opcionais: só aparecem se a
                    ONG preencheu em "Meu perfil" */}
                {(ong.descricao || ong.site) && (
                  <div className="flex flex-col gap-1">
                    {ong.descricao && <p>{ong.descricao}</p>}
                    {ong.site && (
                      <a
                        href={ong.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-fit text-primary-600 hover:underline"
                      >
                        {siteSemProtocolo(ong.site)}
                      </a>
                    )}
                  </div>
                )}

                {ong.contato && (
                  <a
                    href={linkDoContato(ong.contato)}
                    title={ong.contato}
                    className="w-fit"
                  >
                    <Button variante="contorno" tamanho="pequeno">
                      Entrar em contato
                    </Button>
                  </a>
                )}
              </div>

              <ul className="flex gap-10">
                {metricas.map((metrica) => {
                  return (
                    <li key={metrica.titulo} className="flex flex-col gap-1">
                      <span className="text-sm opacity-70">
                        {metrica.titulo}
                      </span>
                      <span className="text-2xl font-bold">
                        {metrica.valor}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* campanhas ativas */}
        <section className="flex flex-col gap-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold">Campanhas Ativas</h2>
              <p className="opacity-70">Campanhas feitas por {ong.nome}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              {/* formulário GET: ao apertar Enter, vai para ?busca=texto */}
              <form
                action={`/ongs/${id}`}
                className="flex h-12 w-80 items-center gap-3 rounded-xl bg-neutral-100 px-4 text-sm"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <input
                  name="busca"
                  defaultValue={textoBuscado}
                  placeholder="Buscar campanha"
                  aria-label="Buscar campanha"
                  className="w-full bg-transparent text-base outline-none placeholder:text-neutral-700"
                />
              </form>
              <p className="text-sm opacity-70">
                {total === 1 ? "1 campanha" : `${total} campanhas`}
              </p>
            </div>
          </div>

          {campanhas.itens.length === 0 ? (
            <div className="rounded-2xl bg-neutral-0 shadow-suave p-10 text-center text-sm opacity-70">
              {textoBuscado
                ? `Nenhuma campanha encontrada para "${textoBuscado}".`
                : "Esta ONG não tem campanhas ativas no momento."}
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
        </section>
      </div>
    </main>
  );
}
