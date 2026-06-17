import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Clock, Fuel, CloudSun, ClipboardList, ArrowRight } from "lucide-react";
import { useObra } from "@/lib/obra-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Bora Bora" },
      {
        name: "description",
        content: "Resumo rápido do dia: horas apontadas, diesel consumido e clima.",
      },
    ],
  }),
  component: Dashboard,
});

type Summary = {
  label: string;
  value: string;
  unit?: string;
  icon: typeof Clock;
  tint: string;
};

const summaries: Summary[] = [
  {
    label: "Horas Apontadas Hoje",
    value: "84,5",
    unit: "h",
    icon: Clock,
    tint: "bg-primary/10 text-primary",
  },
  {
    label: "Diesel Consumido",
    value: "312",
    unit: "L",
    icon: Fuel,
    tint: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  {
    label: "Status do Clima",
    value: "Ensolarado",
    icon: CloudSun,
    tint: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const obra = useObra();

  useEffect(() => {
    if (!obra) navigate({ to: "/" });
  }, [obra, navigate]);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Resumo do dia
        </p>
        <h1 className="mt-1 text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">{today}</p>
      </header>

      <section className="space-y-3">
        {summaries.map(({ label, value, unit, icon: Icon, tint }) => (
          <article
            key={label}
            className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4 shadow-sm"
          >
            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl ${tint}`}>
              <Icon className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 text-2xl font-black text-foreground">
                {value}
                {unit && (
                  <span className="ml-1 text-base font-bold text-muted-foreground">
                    {unit}
                  </span>
                )}
              </p>
            </div>
          </article>
        ))}
      </section>

      <Link
        to="/apontamento"
        className="flex items-center justify-between rounded-2xl border-2 border-primary bg-primary/5 p-4 transition-colors hover:bg-primary/10"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-foreground">Novo Apontamento</p>
            <p className="text-sm text-muted-foreground">Registrar o dia em campo</p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-primary" />
      </Link>
    </div>
  );
}
