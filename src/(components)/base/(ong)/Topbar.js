import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import ThemeToggle from "@/(components)/ui/ThemeToggle";
import MenuUsuario from "@/(components)/base/(public)/MenuUsuario";

// Barra do topo do painel da ONG: busca + usuário.
//
// Uso: <Topbar usuario={{ nome: "Entony", foto_url: "/api/v1/perfil/foto?v=1" }} />

export default function Topbar({ usuario }) {
  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-3xl bg-neutral-0 px-4 py-4 shadow-suave lg:px-6 lg:py-5">
      <label className="flex w-full max-w-100 min-w-0 items-center gap-3 rounded-xl bg-neutral-100 px-4 py-3 text-neutral-500">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
        <input
          placeholder="Buscar campanha"
          aria-label="Buscar campanha"
          className="w-full bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-500"
        />
      </label>

      <div className="flex shrink-0 items-center gap-3 lg:gap-6">
        <ThemeToggle />
        {usuario && <MenuUsuario usuario={usuario} nomeNoCelular={false} />}
      </div>
    </div>
  );
}
