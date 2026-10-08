"use client";

import { Modal as HeroModal } from "@heroui/react";

// Janela por cima da página, com fundo escurecido, feita com o Modal do HeroUI.
// Fecha ao clicar fora, no X ou com Esc.
//
// Uso:
//   <Modal aberto={aberto} aoFechar={() => setAberto(false)} titulo="Criar campanha">
//     ...conteúdo...
//   </Modal>

export default function Modal({
  aberto,
  aoFechar,
  titulo,
  subtitulo,
  children,
}) {
  return (
    <HeroModal.Backdrop
      isOpen={aberto}
      onOpenChange={(abrir) => {
        if (!abrir) aoFechar();
      }}
    >
      <HeroModal.Container>
        <HeroModal.Dialog className="w-full gap-6 rounded-3xl p-10 shadow-modal sm:max-w-[640px]">
          <HeroModal.CloseTrigger />
          <HeroModal.Header className="flex-col items-start gap-1">
            <HeroModal.Heading className="text-[32px] font-bold leading-tight text-neutral-900">
              {titulo}
            </HeroModal.Heading>
            {subtitulo && (
              <p className="text-base text-neutral-500">{subtitulo}</p>
            )}
          </HeroModal.Header>
          <HeroModal.Body className="flex flex-col gap-6">
            {children}
          </HeroModal.Body>
        </HeroModal.Dialog>
      </HeroModal.Container>
    </HeroModal.Backdrop>
  );
}
