import { redirect } from "next/navigation";
import FotoPerfil from "@/(components)/base/(ong)/FotoPerfil";
import FormPerfil from "@/(components)/base/(ong)/FormPerfil";
import { lerSessao } from "@/lib/sessao";
import { buscarUsuarioPorId } from "@/models/usuarios";

// Meu perfil (doador): /perfil
// Foto e nome; o e-mail aparece travado. A ONG tem o perfil dela dentro
// do painel (/dashboard/perfil), com mais campos.

export default async function MeuPerfilDoador() {
  const sessao = await lerSessao();

  // sem login: entra e volta para cá
  if (!sessao) redirect("/entrar?voltar=/perfil");
  if (sessao.tipo === "ong") redirect("/dashboard/perfil");

  const usuario = await buscarUsuarioPorId(sessao.id_usuario);
  const membroDesde = new Date(usuario.criado_em).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex w-full flex-1 flex-col items-center px-4 pt-28 pb-20 lg:pt-36">
      <div className="flex w-full max-w-140 flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold">Meu perfil</h1>
          <p className="text-lg opacity-70">
            Dados da sua conta · no Connect desde {membroDesde}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <FotoPerfil fotoUrl={usuario.foto_url} />
          <FormPerfil usuario={usuario} />
        </div>
      </div>
    </main>
  );
}
