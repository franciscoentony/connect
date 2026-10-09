"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/(components)/ui/Button";

// Botão que abre o seletor de arquivos e envia a foto escolhida para a API.
// Depois de enviar, atualiza a página. Se der erro, mostra a mensagem embaixo.
// - url/metodo: para onde enviar (o arquivo vai no campo "foto");
// - o resto (variante, tamanho...) vai para o Button.
//
// Uso:
//   <BotaoEnviarFoto url="/api/v1/perfil/foto" metodo="PUT">Trocar foto</BotaoEnviarFoto>
//   <BotaoEnviarFoto url="/api/v1/campanhas/12/fotos">+ Adicionar foto</BotaoEnviarFoto>

const TAMANHO_MAXIMO = 2 * 1024 * 1024; // 2 MB, o mesmo limite da API

export default function BotaoEnviarFoto({
  url,
  metodo = "POST",
  children,
  ...props
}) {
  const router = useRouter();
  // "ref" guarda o <input type="file"> escondido, para o botão poder clicar nele
  const seletor = useRef(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(evento) {
    const arquivo = evento.target.files[0];
    evento.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (!arquivo) return; // a pessoa fechou o seletor sem escolher

    setErro("");
    // confere o tamanho antes, para não enviar um arquivo que a API vai recusar
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro("a foto deve ter no máximo 2 MB");
      return;
    }

    setCarregando(true);
    try {
      // Arquivo não vai em JSON: vai num formulário (FormData).
      // Não coloque "Content-Type": o fetch monta sozinho para formulários.
      const formulario = new FormData();
      formulario.append("foto", arquivo);

      const resposta = await fetch(url, { method: metodo, body: formulario });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro); // mensagem que vem da API
        return;
      }
      router.refresh(); // busca os dados da página de novo (com a foto nova)
    } catch {
      setErro("Não foi possível conectar. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={seletor}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={enviar}
        className="hidden"
      />
      <Button
        {...props}
        isPending={carregando}
        onClick={() => seletor.current.click()}
      >
        {children}
      </Button>
      {erro && <p className="text-sm font-medium text-danger-500">{erro}</p>}
    </div>
  );
}
