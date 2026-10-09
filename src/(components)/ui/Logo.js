// Logo do Connect. No modo escuro a imagem é invertida (preto vira branco).
export default function Logo({ largura = 140 }) {
  return (
    <img
      src="/identity/logo_connect.png"
      alt="Connect"
      width={largura}
      className="h-auto dark:invert"
    />
  );
}
