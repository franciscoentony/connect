import { Manrope } from "next/font/google";
import "./globals.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

// Layout raiz: só fonte e tema.
// O menu e o rodapé ficam nos layouts de cada grupo:
//   (site)/layout.js  -> páginas públicas, com Header e Footer
//   (auth)/layout.js  -> Entrar e Criar conta, com logo e "Voltar"

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // só Regular a Bold
});

export const metadata = {
  title: "Connect",
  description: "Connect",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
