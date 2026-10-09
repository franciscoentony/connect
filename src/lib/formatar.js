// Funções para mostrar dados na tela (servem no servidor e no navegador).

// "12345678000190" vira "12.345.678/0001-90"
//
// Uso: formatarCnpj(ong.cnpj)
export function formatarCnpj(cnpj) {
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

// "2026-12-20" vira "20/12/2026".
// (Separa o texto em vez de usar new Date, que pode "voltar um dia" por
// causa do fuso horário.)
//
// Uso: formatarData(campanha.termina_em)
export function formatarData(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Quantos dias faltam de "hoje" até "data" (as duas no formato "AAAA-MM-DD").
// Negativo = a data já passou.
//
// Uso: diasAte("2026-12-20", hojeNoBrasil())
export function diasAte(data, hoje) {
  const umDia = 24 * 60 * 60 * 1000;
  return Math.round((new Date(data) - new Date(hoje)) / umDia);
}
