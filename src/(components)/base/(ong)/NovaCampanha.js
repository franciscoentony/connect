"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/(components)/ui/Button";
import Input from "@/(components)/ui/Input";
import Modal from "@/(components)/ui/Modal";

// Botão "+ Nova campanha" do painel da ONG + o modal de criação.
// Cria a campanha em POST /api/v1/campanhas (ela nasce como rascunho)
// e atualiza a página para a campanha aparecer na tabela.
//
// Com "abrir", o modal já começa aberto: é o que acontece quando a ONG
// escolhe "Nova campanha" no menu da conta (o link é /dashboard?nova=1).
//
// Uso: <NovaCampanha />  ou  <NovaCampanha abrir />

export default function NovaCampanha({ abrir = false }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(abrir);

  // se já estava no dashboard e escolheu "Nova campanha" de novo
  useEffect(() => {
    if (abrir) setAberto(true);
  }, [abrir]);
  const [titulo, setTitulo] = useState("");
  const [meta, setMeta] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function fechar() {
    setAberto(false);
    setErro("");
    // tira o ?nova=1 do endereço, para o modal não reabrir ao atualizar
    if (abrir) router.replace("/dashboard");
  }

  async function criar(evento) {
    evento.preventDefault(); // não recarrega a página
    setErro("");
    setCarregando(true);

    // "5.000,00" (como a pessoa digita) vira "5000.00" (como a API espera).
    // Meta vazia = campanha sem meta.
    const metaParaApi = meta ? meta.replace(/\./g, "").replace(",", ".") : null;

    try {
      const resposta = await fetch("/api/v1/campanhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, meta: metaParaApi }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro); // mensagem que vem da API
        return;
      }
      setTitulo("");
      setMeta("");
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
      <Button onClick={() => setAberto(true)}>+ Nova campanha</Button>

      <Modal
        aberto={aberto}
        aoFechar={fechar}
        titulo="Criar campanha"
        subtitulo="Ela começa como rascunho; você publica quando quiser."
      >
        <form onSubmit={criar} className="flex flex-col gap-6">
          <Input
            rotulo="Título"
            placeholder="Ex.: Natal Solidário"
            dica="De 3 a 150 caracteres"
            value={titulo}
            onChange={setTitulo}
          />
          <Input
            rotulo="Meta (R$)"
            placeholder="Opcional"
            dica="Deixe vazio para não ter meta"
            value={meta}
            onChange={setMeta}
          />

          {erro && (
            <p className="text-sm font-medium text-danger-500">{erro}</p>
          )}

          <Button type="submit" larguraTotal isPending={carregando}>
            Criar rascunho
          </Button>
        </form>
      </Modal>
    </>
  );
}
