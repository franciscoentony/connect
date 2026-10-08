"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/(components)/ui/Button";
import Input from "@/(components)/ui/Input";
import AuthQuote from "@/(components)/base/(auth)/AuthQuote";
import { lerVoltar, comVoltar } from "@/lib/voltar";

// Tela de Entrar: formulário à esquerda, citação à direita.
// Faz login em POST /api/v1/sessao (o cookie de sessão é gravado sozinho).
export default function Entrar() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  // de onde a pessoa veio (ex.: "/campanhas/12"), lido do ?voltar= da URL
  const [voltar, setVoltar] = useState(null);

  useEffect(() => {
    setVoltar(lerVoltar());
  }, []);

  async function entrar(evento) {
    evento.preventDefault(); // não recarrega a página
    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch("/api/v1/sessao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro); // mensagem que vem da API
        return;
      }
      // a ONG vai para o painel; o doador volta de onde veio (ou vai ao início)
      router.push(dados.tipo === "ong" ? "/dashboard" : voltar || "/");
      router.refresh();
    } catch {
      setErro("Não foi possível conectar. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="flex w-full items-center justify-between gap-15">
      <form onSubmit={entrar} className="flex w-full max-w-120 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold">Entrar</h1>
          <p className="opacity-70">
            Que bom te ver de novo! Acesse sua conta.
          </p>
        </div>

        <Input
          rotulo="E-mail"
          type="email"
          placeholder="você@email.com"
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />

        <div className="flex flex-col gap-2">
          <Input
            rotulo="Senha"
            type="password"
            placeholder="Sua senha"
            autoComplete="current-password"
            value={senha}
            onChange={setSenha}
          />
          {/* ainda não existe recuperação de senha no backend */}
          <Link
            href="#"
            className="self-end text-sm font-semibold text-primary-600 hover:underline"
          >
            Esqueceu a senha?
          </Link>
        </div>

        {erro && <p className="text-sm font-medium text-danger-500">{erro}</p>}

        <Button type="submit" larguraTotal isPending={carregando}>
          Entrar
        </Button>

        <p className="text-center text-sm">
          Ainda não tem conta?{" "}
          <Link
            href={comVoltar("/criar-conta", voltar)}
            className="font-semibold text-primary-600 hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </form>

      <AuthQuote />
    </section>
  );
}
