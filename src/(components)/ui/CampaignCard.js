import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faShareFromSquare } from "@fortawesome/free-solid-svg-icons";
import Chip from "@/(components)/ui/Chip";
import Button from "@/(components)/ui/Button";
import BarraDeProgresso from "@/(components)/ui/BarraDeProgresso";

// Card da lista de campanhas (Início e página da ONG).
// Os campos batem com o que a API devolve em GET /api/v1/campanhas.
// "cidade", "imagem" e "href" são opcionais. Com "href", o botão
// "Contribuir agora" leva para a página da campanha.
//
// Uso:
//   <CampaignCard titulo="Natal Solidário" ong="Amigos do Bem" cidade="Natal-RN"
//                 arrecadado={3000} meta={5000} status="Ativa"
//                 imagem={campanha.capa_url} href="/campanhas/12" />

function reais(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export default function CampaignCard({
  titulo,
  ong,
  cidade,
  arrecadado = 0,
  meta,
  status = "Ativa",
  imagem,
  href,
}) {
  // a meta é opcional: sem meta, a barra não aparece
  const porcentagem = meta
    ? Math.min(100, Math.round((arrecadado / meta) * 100))
    : null;

  const botao = (
    <Button
      variante="suave"
      className="hover:bg-primary-500 hover:text-white duration-300 ease"
      larguraTotal
    >
      Contribuir agora
    </Button>
  );

  return (
    <article className="w-full max-w-100 h-140 flex flex-col gap-4 rounded-[28px] bg-neutral-0 p-4 shadow-suave">
      <div
        className="flex h-[290px] items-end justify-between rounded-[20px] bg-neutral-200 bg-cover bg-center p-4"
        style={imagem ? { backgroundImage: `url(${imagem})` } : undefined}
      >
        <Chip status={status} />
        <div className="flex gap-2">
          <button
            aria-label="Compartilhar"
            className="flex size-11 items-center justify-center rounded-full bg-neutral-0 text-neutral-900 cursor-pointer"
          >
            <FontAwesomeIcon icon={faShareFromSquare} />
          </button>
          <button
            aria-label="Favoritar"
            className="flex size-11 items-center justify-center rounded-full bg-neutral-0 text-[#fb6894] cursor-pointer"
          >
            <FontAwesomeIcon icon={faHeart} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-2 pt-1">
        <h3 className="text-start text-xl font-semibold leading-snug text-neutral-900">
          {titulo}
        </h3>
        <p className="flex items-center gap-2 text-sm text-neutral-500">
          <span>por {ong}</span>
          {cidade && (
            <>
              <span className="size-1 rounded-full bg-neutral-300" />
              <span>{cidade}</span>
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-2 px-2">
        {porcentagem !== null && <BarraDeProgresso porcentagem={porcentagem} />}
        <span className="text-start text-sm font-semibold text-primary-600">
          {reais(arrecadado)} arrecadados{meta ? ` de ${reais(meta)}` : ""}
        </span>
      </div>

      {href ? (
        <Link href={href} className="w-full">
          {botao}
        </Link>
      ) : (
        botao
      )}
    </article>
  );
}
