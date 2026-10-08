"use client";

import { useState } from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Header from "@/(components)/base/(public)/Header";
import Footer from "@/(components)/base/(public)/Footer";
import Sidebar from "@/(components)/base/(ong)/Sidebar";
import Topbar from "@/(components)/base/(ong)/Topbar";
import Button from "@/(components)/ui/Button";
import IconButton from "@/(components)/ui/IconButton";
import Chip from "@/(components)/ui/Chip";
import Input from "@/(components)/ui/Input";
import Segmented from "@/(components)/ui/Segmented";
import Table from "@/(components)/ui/Table";
import Modal from "@/(components)/ui/Modal";
import CampaignCard from "@/(components)/ui/CampaignCard";

// Vitrine dos componentes do Design System (http://localhost:3000/componentes).
// Serve para conferir o visual no claro e no escuro (botão da lua no menu).

function Secao({ titulo, children }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold text-neutral-900">{titulo}</h2>
      {children}
    </section>
  );
}

export default function Componentes() {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-[1504px] flex-col gap-14 px-4 py-16">
        <h1 className="text-5xl font-bold text-neutral-900">Componentes</h1>

        <Secao titulo="Header logado">
          <Header usuario={{ nome: "Entony" }} />
        </Secao>

        <Secao titulo="Botões">
          <div className="flex flex-wrap items-center gap-4">
            <Button>Primário</Button>
            <Button variante="secundario">Secundário</Button>
            <Button variante="suave">Suave</Button>
            <Button variante="contorno">Contorno</Button>
            <Button variante="perigo">Perigo</Button>
            <Button tamanho="pequeno">Pequeno</Button>
            <IconButton icone={faTrash} rotulo="Excluir" />
          </div>
        </Secao>

        <Secao titulo="Chips de status">
          <div className="flex flex-wrap gap-3">
            {[
              "Pendente",
              "Confirmada",
              "Cancelada",
              "Rascunho",
              "Ativa",
              "Encerrada",
            ].map((s) => (
              <Chip key={s} status={s} />
            ))}
          </div>
        </Secao>

        <Secao titulo="Formulário">
          <div className="flex max-w-[576px] flex-col gap-6 rounded-3xl bg-neutral-0 p-8 shadow-suave">
            <Segmented opcoes={["Doador", "ONG"]} />
            <Input rotulo="E-mail" type="email" placeholder="você@email.com" />
            <Input
              rotulo="Senha"
              type="password"
              dica="Mínimo de 8 caracteres"
            />
            <Input
              rotulo="CNPJ"
              defaultValue="12.345.678/0001-90"
              desabilitado
              dica="O CNPJ não pode ser alterado"
            />
            <Button larguraTotal>Criar conta</Button>
          </div>
        </Secao>

        <Secao titulo="Card de campanha">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <CampaignCard
              titulo="Ajude crianças a ganharem presentes no dia das crianças"
              ong="Amigos do Bem"
              cidade="Natal-RN"
              arrecadado={3000}
              meta={5000}
              status="Ativa"
            />
            <CampaignCard
              titulo="Inverno Quente"
              ong="Abrigo Esperança"
              cidade="Natal-RN"
              arrecadado={1800}
              status="Encerrada"
            />
          </div>
        </Secao>

        <Secao titulo="Tabela">
          <Table
            colunas={[
              { titulo: "Doador", chave: "doador" },
              { titulo: "Doação", chave: "doacao" },
              { titulo: "Data", chave: "data" },
              { titulo: "Status", chave: "status" },
              { titulo: "", chave: "acoes" },
            ]}
            linhas={[
              {
                doador: "Maria Souza",
                doacao: "Dinheiro • R$ 50,00 • Pix",
                data: "05/10/2026",
                status: <Chip status="Pendente" />,
                acoes: (
                  <div className="flex justify-end gap-2">
                    <Button variante="secundario" tamanho="pequeno">
                      Confirmar
                    </Button>
                    <Button variante="perigo" tamanho="pequeno">
                      Cancelar
                    </Button>
                  </div>
                ),
              },
              {
                doador: "Ana Costa",
                doacao: "Dinheiro • R$ 100,00 • Cartão",
                data: "05/10/2026",
                status: <Chip status="Confirmada" />,
                acoes: null,
              },
            ]}
          />
        </Secao>

        <Secao titulo="Modal">
          <div>
            <Button onClick={() => setModalAberto(true)}>Abrir modal</Button>
          </div>
          <Modal
            aberto={modalAberto}
            aoFechar={() => setModalAberto(false)}
            titulo="Criar campanha"
            subtitulo="Ela começa como rascunho."
          >
            <Input
              rotulo="Título"
              placeholder="Ex.: Natal Solidário"
              dica="De 3 a 150 caracteres"
            />
            <Input rotulo="Meta (R$)" placeholder="Opcional" />
            <Button larguraTotal>Criar rascunho</Button>
          </Modal>
        </Secao>

        <Secao titulo="Painel da ONG">
          <div className="flex gap-6 rounded-3xl bg-painel p-6">
            <Sidebar ativo="campanhas" />
            <div className="flex-1">
              <Topbar usuario={{ nome: "Entony" }} />
            </div>
          </div>
        </Secao>
      </main>
      <Footer />
    </>
  );
}
