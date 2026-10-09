import { redirect } from "next/navigation";
import { lerSessao } from "@/lib/sessao";
import { buscarUsuarioPorId } from "@/models/usuarios";
import Sidebar from "@/(components)/base/(ong)/Sidebar";
import Topbar from "@/(components)/base/(ong)/Topbar";

// Todas as páginas dentro de /dashboard passam por aqui:
// 1. só ONG logada entra (o proxy.js também confere; aqui é a garantia);
// 2. monta a moldura do painel: menu lateral + barra do topo.
export default async function DashboardLayout({ children }) {
  const sessao = await lerSessao();

  if (!sessao) redirect("/entrar");
  if (sessao.tipo !== "ong") redirect("/");

  const usuario = await buscarUsuarioPorId(sessao.id_usuario);

  return (
    <div className="flex min-h-screen w-full flex-col gap-4 bg-painel p-4 lg:flex-row lg:gap-6 lg:p-6">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <Topbar usuario={usuario} />
        {children}
      </div>
    </div>
  );
}
