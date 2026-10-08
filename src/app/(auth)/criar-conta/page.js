"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/(components)/ui/Button";
import Input from "@/(components)/ui/Input";
import Segmented from "@/(components)/ui/Segmented";
import AuthQuote from "@/(components)/base/(auth)/AuthQuote";
import { lerVoltar, comVoltar } from "@/lib/voltar";

// Tela de Criar conta: citação à esquerda, formulário à direita.
// 1. Cria o usuário em POST /api/v1/usuarios
// 2. Já faz o login em POST /api/v1/sessao
export default function CriarConta() {
  const router = useRouter();
  const [tipo, setTipo] = useState("Doador"); // "Doador" ou "ONG"
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cnpj, setCnpj] = useState("");
  // de onde a pessoa veio (ex.: "/campanhas/12"), lido do ?voltar= da URL
  const [voltar, setVoltar] = useState(null);

  useEffect(() => {
    setVoltar(lerVoltar());
  }, []);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(url, corpo) {
    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.erro); // mensagem que vem da API
    return dados;
  }

  async function criarConta(evento) {
    evento.preventDefault(); // não recarrega a página
    setErro("");
    setCarregando(true);

    try {
      await enviar("/api/v1/usuarios", {
        tipo: tipo === "ONG" ? "ong" : "doador",
        nome,
        email,
        senha,
        cnpj: tipo === "ONG" ? cnpj : undefined,
      });
      await enviar("/api/v1/sessao", { email, senha });
      // a ONG vai para o painel; o doador volta de onde veio (ou vai ao início)
      router.push(tipo === "ONG" ? "/dashboard" : voltar || "/");
    } catch (e) {
      setErro(e.message || "Não foi possível conectar. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="flex w-full items-center justify-between gap-15">
      <AuthQuote />

      <form
        onSubmit={criarConta}
        className="ml-auto flex w-full max-w-120 flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold">Cadastro</h1>
          <p className="opacity-70">Você é</p>
        </div>

        <Segmented opcoes={["Doador", "ONG"]} aoMudar={setTipo} />

        <Input
          rotulo={tipo === "ONG" ? "Nome da ONG" : "Nome"}
          placeholder={tipo === "ONG" ? "Ex.: Amigos do Bem" : "Seu nome"}
          autoComplete="name"
          value={nome}
          onChange={setNome}
        />
        <Input
          rotulo="E-mail"
          type="email"
          placeholder="você@email.com"
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />
        <Input
          rotulo="Senha"
          type="password"
          placeholder="Crie uma senha"
          autoComplete="new-password"
          dica="Mínimo de 8 caracteres"
          value={senha}
          onChange={setSenha}
        />

        {/* o CNPJ só aparece para ONG */}
        {tipo === "ONG" && (
          <Input
            rotulo="CNPJ"
            placeholder="00.000.000/0000-00"
            dica="Pode digitar com ou sem pontuação"
            value={cnpj}
            onChange={setCnpj}
          />
        )}

        {erro && <p className="text-sm font-medium text-danger-500">{erro}</p>}

        <Button type="submit" larguraTotal isPending={carregando}>
          Criar conta
        </Button>

        <p className="text-center text-sm">
          Já tem conta?{" "}
          <Link
            href={comVoltar("/entrar", voltar)}
            className="font-semibold text-primary-600 hover:underline"
          >
            Entre
          </Link>
        </p>
      </form>
    </section>
  );
}
