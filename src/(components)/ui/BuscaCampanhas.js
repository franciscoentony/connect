import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

// Caixa "Buscar campanha" das páginas de lista (/campanhas e /ongs/[id]).
// É um formulário GET comum: ao apertar Enter, vai para "caminho?busca=texto",
// e a página (de servidor) lê o ?busca= e filtra. Não precisa de JavaScript.
//
// Uso: <BuscaCampanhas caminho="/campanhas" valor={textoBuscado} />

export default function BuscaCampanhas({ caminho, valor = "" }) {
  return (
    <form
      role="search"
      action={caminho}
      className="flex h-12 w-full items-center gap-3 rounded-xl bg-neutral-100 px-4 text-sm sm:w-80"
    >
      <FontAwesomeIcon icon={faMagnifyingGlass} />
      <input
        name="busca"
        defaultValue={valor}
        placeholder="Buscar campanha"
        aria-label="Buscar campanha pelo título"
        className="w-full bg-transparent text-base outline-none placeholder:text-neutral-700"
      />
    </form>
  );
}
