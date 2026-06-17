import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Truck, Settings, HardHat } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — Gestão de Obras" },
      { name: "description", content: "Painel inicial do app de Gestão de Obras de Infraestrutura." },
    ],
  }),
  component: Dashboard,
});

const shortcuts = [
  {
    to: "/apontamento" as const,
    title: "Apontamento Diário",
    desc: "Registre clima, equipamentos e produção do dia.",
    icon: ClipboardList,
  },
  {
    to: "/checklist" as const,
    title: "Checklist de Frota",
    desc: "Inspeção pré-operacional dos equipamentos.",
    icon: Truck,
  },
  {
    to: "/configuracoes" as const,
    title: "Configurações",
    desc: "Preferências e dados da obra.",
    icon: Settings,
  },
];

function Dashboard() {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-sidebar text-sidebar-foreground p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <HardHat className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-sidebar-foreground/70">
              Bem-vindo
            </p>
            <h1 className="truncate text-xl font-bold">Equipe de Campo</h1>
          </div>
        </div>
        <p className="mt-3 text-sm capitalize text-sidebar-foreground/80">{today}</p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Atalhos rápidos
        </h2>
        <ul className="space-y-3">
          {shortcuts.map(({ to, title, desc, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4 transition-colors hover:border-primary active:bg-accent"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
