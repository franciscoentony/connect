"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import Button from "@/(components)/ui/Button";
import Chip from "@/(components)/ui/Chip";
import Input from "@/(components)/ui/Input";
import Modal from "@/(components)/ui/Modal";
import Segmented from "@/(components)/ui/Segmented";

// Botão "Quero doar" da página da campanha + o modal de doação.
// Muda conforme quem está vendo:
//   - campanha que não está ativa: só um aviso
//   - visitante: botão que leva para o login
//   - ONG: aviso de que só doadores doam
//   - doador: abre o modal e faz POST /api/v1/campanhas/{id}/doacoes
//
// Uso: <QueroDoar idCampanha="12" titulo="Natal Solidário" status="ativa"
//                 tipoUsuario="doador" metodos={[{ id_metodo: "1", nome: "Pix" }]} />

export default function QueroDoar({
  idCampanha,
  titulo,
  status,
  tipoUsuario,
  metodos,
}) {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState("Dinheiro"); // "Dinheiro" ou "Item"
  const [valor, setValor] = useState("");
  // Pix já vem marcado (se existir), como no Figma
  const pix = metodos.find((metodo) => metodo.nome === "Pix") || metodos[0];
  const [idMetodo, setIdMetodo] = useState(pix?.id_metodo);
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [doado, setDoado] = useState(false);

  if (status !== "ativa") {
    return (
      <p className="text-sm opacity-70">
        Esta campanha não está recebendo doações.
      </p>
    );
  }

  if (!tipoUsuario) {
    return (
      // depois de entrar, o visitante volta para esta campanha
      <Link href={`/entrar?voltar=/campanhas/${idCampanha}`}>
        <Button larguraTotal>Entre para doar</Button>
      </Link>
    );
  }

  if (tipoUsuario === "ong") {
    return (
      <p className="text-sm opacity-70">
        Somente doadores podem fazer doações.
      </p>
    );
  }

  function fechar() {
    setAberto(false);
    setDoado(false);
    setErro("");
  }

  async function doar(evento) {
    evento.preventDefault(); // não recarrega a página
    setErro("");
    setCarregando(true);

    // "1.250,50" (como a pessoa digita) vira "1250.50" (como a API espera)
    const valorParaApi = valor.replace(/\./g, "").replace(",", ".");
    const corpo =
      tipo === "Dinheiro"
        ? { tipo: "dinheiro", valor: valorParaApi, id_metodo: idMetodo }
        : { tipo: "item", descricao };

    try {
      const resposta = await fetch(`/api/v1/campanhas/${idCampanha}/doacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro); // mensagem que vem da API
        return;
      }
      setDoado(true);
      setValor("");
      setDescricao("");
    } catch {
      setErro("Não foi possível conectar. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <Button larguraTotal onClick={() => setAberto(true)}>
        Quero doar
      </Button>

      <Modal
        aberto={aberto}
        aoFechar={fechar}
        titulo={doado ? "Doação registrada!" : "Fazer uma doação"}
        subtitulo={doado ? null : `para “${titulo}”`}
      >
        {doado ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-success-100 text-3xl text-success-500">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <p className="opacity-80">
              Obrigado por apoiar! Sua doação fica pendente até a ONG confirmar
              o recebimento.
            </p>
            <Chip status="Pendente" />
            <Link href="/minhas-doacoes" className="w-full">
              <Button larguraTotal>Ver minhas doações</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={doar} className="flex flex-col gap-6">
            <Segmented opcoes={["Dinheiro", "Item"]} aoMudar={setTipo} />

            {tipo === "Dinheiro" ? (
              <>
                <Input
                  rotulo="Valor (R$)"
                  placeholder="50,00"
                  dica="Até 2 casas decimais"
                  value={valor}
                  onChange={setValor}
                />
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold">Forma de pagamento</p>
                  {metodos.map((metodo) => {
                    const selecionado = metodo.id_metodo === idMetodo;
                    return (
                      <button
                        key={metodo.id_metodo}
                        type="button"
                        role="radio"
                        aria-checked={selecionado}
                        onClick={() => setIdMetodo(metodo.id_metodo)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-start font-medium cursor-pointer duration-200 ease ${
                          selecionado
                            ? "border-primary-500 bg-primary-100"
                            : "border-neutral-200 hover:bg-neutral-50"
                        }`}
                      >
                        <span
                          className={`size-5 rounded-full border-2 ${
                            selecionado
                              ? "border-[6px] border-primary-500"
                              : "border-neutral-300"
                          }`}
                        />
                        {metodo.nome}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <Input
                rotulo="O que você vai doar?"
                placeholder="Ex.: 10 kg de arroz"
                dica="De 3 a 255 caracteres. Entregue em um dos locais desta página."
                multilinha
                value={descricao}
                onChange={setDescricao}
              />
            )}

            {erro && (
              <p className="text-sm font-medium text-danger-500">{erro}</p>
            )}

            <Button
              type="submit"
              variante="secundario"
              larguraTotal
              isPending={carregando}
            >
              Confirmar doação
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
