import Link from "next/link";
import Button from "@/(components)/ui/Button";
import FormPerfil from "@/(components)/base/(ong)/FormPerfil";
import FotoPerfil from "@/(components)/base/(ong)/FotoPerfil";
import { lerSessao } from "@/lib/sessao";
import { buscarUsuarioPorId } from "@/models/usuarios";

// Meu perfil (ONG): /dashboard/perfil
// Mostra a foto e os dados da conta; só a foto e o nome podem ser alterados.

export default async function MeuPerfil() {
  const sessao = await lerSessao();
  const usuario = await buscarUsuarioPorId(sessao.id_usuario);
  const membroDesde = new Date(usuario.criado_em).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex flex-col gap-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold">Meu perfil</h1>
          <p className="text-lg opacity-70">
            Dados da sua conta · no Connect desde {membroDesde}
          </p>
        </div>
        <Link href={`/ongs/${usuario.id_usuario}`}>
          <Button variante="suave">Ver minha página pública</Button>
        </Link>
      </section>

      <div className="flex flex-col gap-6">
        <FotoPerfil fotoUrl={usuario.foto_url} />
        <FormPerfil usuario={usuario} />
      </div>
    </main>
  );
}
