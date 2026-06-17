import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";

export const Route = createFileRoute("/checklist")({
  head: () => ({
    meta: [
      { title: "Checklist de Frota — Gestão de Obras" },
      { name: "description", content: "Inspeção pré-operacional dos equipamentos da frota." },
    ],
  }),
  component: Checklist,
});

function Checklist() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Checklist de Frota</h1>
        <p className="text-sm text-muted-foreground">Inspeção pré-operacional.</p>
      </header>
      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
        <Truck className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 font-semibold">Em breve</p>
        <p className="text-sm text-muted-foreground">
          Este módulo está em construção.
        </p>
      </div>
    </div>
  );
}
