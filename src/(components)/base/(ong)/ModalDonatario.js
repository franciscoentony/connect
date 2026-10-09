"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/(components)/ui/Button";
import Input from "@/(components)/ui/Input";
import Modal from "@/(components)/ui/Modal";

// Botão + modal para CRIAR ou EDITAR um donatário (o mesmo formulário).
// - sem "donatario": botão "+ Novo donatário" -> POST /api/v1/donatarios
// - com "donatario": botão "Editar" -> PATCH /api/v1/donatarios/{id}
// Depois de salvar, atualiza a página.
//
// Uso: <ModalDonatario />   ou   <ModalDonatario donatario={donatario} />

export default function ModalDonatario({ donatario }) {
  const router = useRouter();
  const editando = Boolean(donatario);
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState(donatario?.nome || "");
  const [contato, setContato] = useState(donatario?.contato || "");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function fechar() {
    setAberto(false);
    setErro("");
  }

  async function salvar(evento) {
    evento.preventDefault(); // não recarrega a página
    setErro("");
    setCarregando(true);

    const url = editando
      ? `/api/v1/donatarios/${donatario.id_donatario}`
      : "/api/v1/donatarios";

    try {
      const resposta = await fetch(url, {
        method: editando ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, contato }), // contato vazio vira "sem contato"
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro); // mensagem que vem da API
        return;
      }
      if (!editando) {
        setNome("");
        setContato("");
      }
      fechar();
      router.refresh(); // busca os dados da página de novo
    } catch {
      setErro("Não foi possível conectar. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      {editando ? (
        <Button
          variante="contorno"
          tamanho="pequeno"
          onClick={() => setAberto(true)}
        >
          Editar
        </Button>
      ) : (
        <Button onClick={() => setAberto(true)}>+ Novo donatário</Button>
      )}

      <Modal
        aberto={aberto}
        aoFechar={fechar}
        titulo={editando ? "Editar donatário" : "Novo donatário"}
        subtitulo="Pessoa, família ou instituição atendida pela sua ONG."
      >
        <form onSubmit={salvar} className="flex flex-col gap-6">
          <Input
            rotulo="Nome"
            placeholder="Ex.: Família Silva"
            dica="De 2 a 150 caracteres"
            value={nome}
            onChange={setNome}
          />
          <Input
            rotulo="Contato"
            placeholder="Telefone ou e-mail (opcional)"
            value={contato}
            onChange={setContato}
          />

          {erro && (
            <p className="text-sm font-medium text-danger-500">{erro}</p>
          )}

          <Button type="submit" larguraTotal isPending={carregando}>
            {editando ? "Salvar alterações" : "Cadastrar"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
