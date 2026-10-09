import Header from "@/(components)/base/(public)/Header";
import Footer from "@/(components)/base/(public)/Footer";
import { lerSessao } from "@/lib/sessao";
import { buscarUsuarioPorId } from "@/models/usuarios";

// Páginas públicas do site (Início, Campanhas...): com menu e rodapé.
export default async function SiteLayout({ children }) {
  const sessao = await lerSessao();

  // sem login, "usuario" fica undefined e o Header mostra "Entrar"
  let usuario;
  if (sessao) {
    usuario = await buscarUsuarioPorId(sessao.id_usuario);
  }

  return (
    <>
      <Header usuario={usuario} />
      {children}
      <Footer />
    </>
  );
}
