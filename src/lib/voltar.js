// "Para onde voltar depois do login": lê o ?voltar= da URL com segurança.
//
// Exemplo: o visitante clica em "Entre para doar" na campanha 12 e vai para
// /entrar?voltar=/campanhas/12. Depois de entrar, ele volta para a campanha.
//
// Por segurança, só aceitamos caminhos DO PRÓPRIO SITE ("/campanhas/12").
// Sem essa conferência, alguém poderia mandar um link
// "/entrar?voltar=https://site-falso.com" e levar o doador para um golpe
// logo depois do login (o ataque se chama "open redirect").
//
// Uso (no navegador): const destino = lerVoltar() || "/";

export function lerVoltar() {
  const voltar = new URLSearchParams(window.location.search).get("voltar");
  if (!voltar) return null;

  // Aceita só: uma barra no começo (não duas) e depois letras, números e os
  // símbolos comuns de um endereço (- _ . / ? = & %).
  // Assim ficam de fora "//site.com", "https://site.com", barras invertidas
  // e espaços/tabs (o navegador ignora tabs: "/<tab>/site.com" viraria
  // "//site.com").
  const caminhoDoSite = /^\/(?!\/)[\w\-./?=&%]*$/;
  if (!caminhoDoSite.test(voltar)) return null;

  return voltar;
}

// Monta o link para outra tela de login mantendo o ?voltar=.
// Uso: <Link href={comVoltar("/criar-conta", voltar)}>
export function comVoltar(caminho, voltar) {
  if (!voltar) return caminho;
  return `${caminho}?voltar=${encodeURIComponent(voltar)}`;
}
