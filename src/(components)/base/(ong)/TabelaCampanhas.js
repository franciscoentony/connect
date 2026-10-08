import Link from "next/link";
import Button from "@/(components)/ui/Button";
import Chip from "@/(components)/ui/Chip";
import Table from "@/(components)/ui/Table";

// Tabela de campanhas do painel da ONG (Dashboard e Minhas campanhas).
// Recebe a lista que vem de listarCampanhas(...).itens.
// Sem campanhas, mostra um aviso no lugar da tabela.
//
// Uso: <TabelaCampanhas campanhas={campanhas.itens} />

// o status vem da API em minúsculo; o Chip usa com a primeira letra maiúscula
const STATUS = {
  rascunho: "Rascunho",
  ativa: "Ativa",
  encerrada: "Encerrada",
  cancelada: "Cancelada",
};

const COLUNAS = [
  { titulo: "Campanha", chave: "campanha" },
  { titulo: "Arrecadado / meta", chave: "valores" },
  { titulo: "Criada em", chave: "criadaEm" },
  { titulo: "Status", chave: "status" },
  { titulo: "", chave: "acoes" },
];

function reais(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function TabelaCampanhas({ campanhas }) {
  if (campanhas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-neutral-0 shadow-suave p-10 text-center">
        <p className="font-semibold">Você ainda não tem campanhas</p>
        <p className="text-sm opacity-70">
          Clique em “+ Nova campanha” para criar a primeira.
        </p>
      </div>
    );
  }

  // cada campanha vira uma linha da tabela
  const linhas = campanhas.map((campanha) => {
    return {
      campanha: campanha.titulo,
      valores: `${reais(campanha.arrecadado)} / ${
        campanha.meta ? reais(campanha.meta) : "sem meta"
      }`,
      criadaEm: new Date(campanha.criado_em).toLocaleDateString("pt-BR"),
      status: <Chip status={STATUS[campanha.status]} />,
      acoes: (
        <div className="flex justify-end">
          <Link href={`/dashboard/campanhas/${campanha.id_campanha}`}>
            <Button variante="contorno" tamanho="pequeno">
              Gerenciar
            </Button>
          </Link>
        </div>
      ),
    };
  });

  return <Table colunas={COLUNAS} linhas={linhas} rotulo="Campanhas" />;
}
