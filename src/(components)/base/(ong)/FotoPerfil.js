import BotaoAcao from "@/(components)/base/(ong)/BotaoAcao";
import BotaoEnviarFoto from "@/(components)/base/(ong)/BotaoEnviarFoto";

// Card "Foto de perfil" da página Meu perfil: mostra a foto atual,
// com botões para enviar/trocar e remover.
//
// Uso: <FotoPerfil fotoUrl={usuario.foto_url} />  (null = ainda sem foto)

export default function FotoPerfil({ fotoUrl }) {
  return (
    <section className="flex w-full max-w-140 items-center gap-6 rounded-2xl bg-neutral-0 p-6 shadow-suave">
      <img
        src={fotoUrl || "/identity/co.png"}
        alt="Foto de perfil"
        className="size-24 shrink-0 rounded-full bg-neutral-200 object-cover"
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Foto de perfil</h2>
          <p className="text-sm opacity-70">JPG, PNG ou WEBP de até 2 MB.</p>
        </div>

        <div className="flex flex-wrap items-start gap-2">
          <BotaoEnviarFoto
            url="/api/v1/perfil/foto"
            metodo="PUT"
            tamanho="pequeno"
          >
            {fotoUrl ? "Trocar foto" : "Enviar foto"}
          </BotaoEnviarFoto>
          {fotoUrl && (
            <BotaoAcao
              metodo="DELETE"
              url="/api/v1/perfil/foto"
              confirmacao="Remover a foto de perfil?"
              variante="perigo"
              tamanho="pequeno"
            >
              Remover
            </BotaoAcao>
          )}
        </div>
      </div>
    </section>
  );
}
