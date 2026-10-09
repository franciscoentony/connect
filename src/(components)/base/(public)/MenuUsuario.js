"use client";

import { Dropdown, Separator } from "@heroui/react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import {
  opcoesDaConta,
  sairDaConta,
} from "@/(components)/base/(public)/opcoesDaConta";

// Botão "Olá, {nome}!" que abre o menu da conta.
// Feito com o Dropdown do HeroUI: já vem com teclado (setas, Enter, Esc),
// foco e leitura correta por leitores de tela.
// - ONG: Meu perfil, Dashboard, Nova campanha, Sair da conta
// - doador: Meu perfil, Minhas doações, Sair da conta
// "nomeNoCelular={false}" esconde o "Olá, {nome}!" em telas pequenas
// (fica só a foto), como na barra do topo do painel.
//
// Uso: <MenuUsuario usuario={{ nome: "Entony", tipo: "ong", foto_url: null }} />

export default function MenuUsuario({ usuario, nomeNoCelular = true }) {
  const router = useRouter();
  const opcoes = opcoesDaConta(usuario.tipo);

  // "chave" é o id do item escolhido no menu
  function aoEscolher(chave) {
    if (chave === "sair") {
      sairDaConta(router);
      return;
    }
    const opcao = opcoes.find((item) => item.chave === chave);
    router.push(opcao.href);
  }

  return (
    <Dropdown>
      <Dropdown.Trigger className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 outline-none cursor-pointer duration-300 ease hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-primary-500">
        <img
          src={usuario.foto_url || "/identity/co.png"}
          alt=""
          className="size-11 rounded-full bg-neutral-200 object-cover"
        />
        <span
          className={`font-semibold text-neutral-900 ${nomeNoCelular ? "" : "hidden md:inline"}`}
        >
          Olá, {usuario.nome}!
        </span>
        {/* sem o nome visível, o leitor de tela ainda sabe o que o botão faz */}
        {!nomeNoCelular && (
          <span className="sr-only md:hidden">Abrir menu da conta</span>
        )}
        <span
          className={`text-sm text-neutral-700 ${nomeNoCelular ? "" : "hidden md:inline"}`}
        >
          <FontAwesomeIcon icon={faChevronDown} />
        </span>
      </Dropdown.Trigger>

      <Dropdown.Popover placement="bottom end" className="min-w-60">
        <Dropdown.Menu aria-label="Menu da conta" onAction={aoEscolher}>
          {opcoes.map((opcao) => {
            return (
              <Dropdown.Item
                key={opcao.chave}
                id={opcao.chave}
                textValue={opcao.texto}
                className="min-h-11 gap-3 rounded-xl px-3 font-medium"
              >
                <FontAwesomeIcon
                  icon={opcao.icone}
                  className="w-4 text-primary-600"
                />
                {opcao.texto}
              </Dropdown.Item>
            );
          })}
          <Separator className="my-1" />
          <Dropdown.Item
            id="sair"
            textValue="Sair da conta"
            variant="danger"
            className="min-h-11 gap-3 rounded-xl px-3 font-medium text-danger-500"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
            Sair da conta
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
