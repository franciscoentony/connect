"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

// Botão que liga/desliga o modo escuro.
// Coloca ou tira a classe "dark" do <html> e lembra a escolha no navegador.
export default function ThemeToggle() {
  const [escuro, setEscuro] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem("tema") === "escuro";
    setEscuro(salvo);
    document.documentElement.classList.toggle("dark", salvo);
  }, []);

  function alternar() {
    const novo = !escuro;
    setEscuro(novo);
    document.documentElement.classList.toggle("dark", novo);
    localStorage.setItem("tema", novo ? "escuro" : "claro");
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={escuro ? "Usar modo claro" : "Usar modo escuro"}
      className="text-lg text-neutral-700 hover:text-neutral-900 cursor-pointer"
    >
      <FontAwesomeIcon icon={escuro ? faSun : faMoon} />
    </button>
  );
}
