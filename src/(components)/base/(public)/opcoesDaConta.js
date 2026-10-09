import {
  faUser,
  faChartPie,
  faPlus,
  faHandHoldingHeart,
} from "@fortawesome/free-solid-svg-icons";

// Opções do menu da conta ("Olá, {nome}!"), por tipo de usuário.
// Usadas no menu suspenso (MenuUsuario) e na gaveta do celular (MenuMobile).
// "Sair da conta" fica de fora porque não é um link: veja sairDaConta.
//
// Uso: opcoesDaConta("ong") -> [{ chave, texto, href, icone }, ...]

const OPCOES = {
  ong: [
    {
      chave: "perfil",
      texto: "Meu perfil",
      href: "/dashboard/perfil",
      icone: faUser,
    },
    {
      chave: "dashboard",
      texto: "Dashboard",
      href: "/dashboard",
      icone: faChartPie,
    },
    {
      chave: "nova-campanha",
      texto: "Nova campanha",
      // o dashboard abre o modal de criação quando vê ?nova=1
      href: "/dashboard?nova=1",
      icone: faPlus,
    },
  ],
  doador: [
    { chave: "perfil", texto: "Meu perfil", href: "/perfil", icone: faUser },
    {
      chave: "minhas-doacoes",
      texto: "Minhas doações",
      href: "/minhas-doacoes",
      icone: faHandHoldingHeart,
    },
  ],
};

export function opcoesDaConta(tipo) {
  return OPCOES[tipo] || [];
}

// Encerra a sessão (apaga o cookie) e volta para o início.
// Uso: <button onClick={() => sairDaConta(router)}>Sair da conta</button>
export async function sairDaConta(router) {
  await fetch("/api/v1/sessao", { method: "DELETE" });
  router.push("/");
  router.refresh();
}
