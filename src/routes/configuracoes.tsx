import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Gestão de Obras" },
      { name: "description", content: "Preferências e dados da obra." },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Preferências do aplicativo.</p>
      </header>
      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
        <Settings className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 font-semibold">Em breve</p>
        <p className="text-sm text-muted-foreground">
          Este módulo está em construção.
        </p>
      </div>
    </div>
  );
}
