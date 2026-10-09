// Citação + número de pessoas ajudadas, ao lado do formulário
// nas telas de Entrar e Criar conta. Some no celular.
export default function AuthQuote() {
  return (
    <div className="hidden max-w-150 flex-col gap-12 lg:flex">
      <figure className="flex flex-col gap-4">
        <blockquote className="text-3xl font-semibold leading-snug">
          “Nascemos para ajudar-nos uns aos outros, como os pés ajudam as mãos,
          as pálpebras e os dentes de cima e de baixo. É contra a natureza
          prejudicarmo-nos mutuamente.”
        </blockquote>
        <figcaption className="self-end text-lg opacity-70">
          Marco Aurélio
        </figcaption>
      </figure>

      <div>
        <p className="flex items-baseline gap-3">
          <span className="text-8xl font-bold">236</span>
          <span className="text-5xl">pessoas</span>
        </p>
        <p className="text-3xl">ajudadas pelo Connect!</p>
      </div>
    </div>
  );
}
