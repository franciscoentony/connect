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
