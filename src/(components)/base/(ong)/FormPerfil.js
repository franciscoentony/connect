"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/(components)/ui/Button";
import Input from "@/(components)/ui/Input";
import { formatarCnpj } from "@/lib/formatar";

// Formulário "Meu perfil": nome, descrição, site e contato podem mudar
// (os três últimos aparecem na página pública da ONG).
// E-mail e CNPJ identificam a conta, então aparecem travados.
// Salva em PATCH /api/v1/perfil.
//
// Uso: <FormPerfil usuario={usuario} />  (usuario vem de buscarUsuarioPorId)

export default function FormPerfil({ usuario }) {
  const router = useRouter();
  const [nome, setNome] = useState(usuario.nome);
  // "?? """: campo que a ONG ainda não preencheu vem null; o Input precisa de texto
  const [descricao, setDescricao] = useState(usuario.descricao ?? "");
  const [site, setSite] = useState(usuario.site ?? "");
  const [contato, setContato] = useState(usuario.contato ?? "");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function salvar(evento) {
    evento.preventDefault(); // não recarrega a página
    setErro("");
    setMensagem("");
    setCarregando(true);

    try {
      const resposta = await fetch("/api/v1/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, descricao, site, contato }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro); // mensagem que vem da API
        return;
      }
      // a API pode ajustar o site (ex.: "amigos.org" vira "https://amigos.org")
      setSite(dados.site ?? "");
      setMensagem("Perfil atualizado!");
      router.refresh(); // atualiza também o nome na barra do topo
    } catch {
      setErro("Não foi possível conectar. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form
      onSubmit={salvar}
      className="flex w-full max-w-140 flex-col gap-6 rounded-2xl bg-neutral-0 p-6 shadow-suave"
    >
      <Input rotulo="Nome" value={nome} onChange={setNome} />
      <Input
        rotulo="Descrição"
        placeholder="Conte o que a sua ONG faz"
        dica="Aparece na sua página pública · até 500 caracteres"
        multilinha
        value={descricao}
        onChange={setDescricao}
      />
      <Input
        rotulo="Site"
        placeholder="suaong.org.br"
        value={site}
        onChange={setSite}
      />
      <Input
        rotulo="Contato público"
        placeholder="Telefone ou e-mail"
        dica="Usado no botão “Entrar em contato” da sua página"
        value={contato}
        onChange={setContato}
      />
      <Input
        rotulo="E-mail"
        value={usuario.email}
        desabilitado
        dica="O e-mail não pode ser alterado"
      />
      {usuario.cnpj && (
        <Input
          rotulo="CNPJ"
          value={formatarCnpj(usuario.cnpj)}
          desabilitado
          dica="O CNPJ não pode ser alterado"
        />
      )}

      {erro && <p className="text-sm font-medium text-danger-500">{erro}</p>}
      {mensagem && (
        <p className="text-sm font-medium text-success-500">{mensagem}</p>
      )}

      <Button type="submit" isPending={carregando}>
        Salvar
      </Button>
    </form>
  );
}
