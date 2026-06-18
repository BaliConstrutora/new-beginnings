import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  Clock,
  Fuel,
  CloudSun,
  ClipboardList,
  ArrowRight,
  Target,
} from "lucide-react";
import { useObra, useHydrated } from "@/lib/obra-store";
import { useRole } from "@/lib/auth-store";
import { usePlanejamento } from "@/lib/planejamento-store";
import { useApontamento, calcularAderencia } from "@/lib/apontamento-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Bora Bora" },
      {
        name: "description",
        content: "Resumo do dia: horas, diesel, clima e aderência ao planejamento.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const obra = useObra();
  const role = useRole();
  const hoje = new Date().toISOString().slice(0, 10);
  const plano = usePlanejamento(hoje);
  const apont = useApontamento(hoje);

  useEffect(() => {
    if (!obra) navigate({ to: "/" });
  }, [obra, navigate]);

  const aderencia = useMemo(() => {
    if (!plano) return null;
    return calcularAderencia(
      plano.servicos.map((s) => ({ id: s.id, metaQuantidade: s.metaQuantidade })),
      (apont?.servicos ?? []).map((s) => ({
        id: s.id,
        realizado: s.realizado,
        metaQuantidade: s.metaQuantidade,
      })),
    );
  }, [plano, apont]);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const showCostKPIs = role !== "campo";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Resumo do dia
        </p>
        <h1 className="mt-1 text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">{today}</p>
      </header>

      <AderenciaCard pct={aderencia} hasPlano={!!plano} />

      <section className="space-y-3">
        <KPI
          icon={Clock}
          label="Horas Apontadas Hoje"
          value="84,5"
          unit="h"
          tint="bg-primary/10 text-primary"
        />
        {showCostKPIs && (
          <KPI
            icon={Fuel}
            label="Diesel Consumido"
            value="312"
            unit="L"
            tint="bg-amber-500/15 text-amber-700 dark:text-amber-400"
          />
        )}
        <KPI
          icon={CloudSun}
          label="Status do Clima"
          value="Ensolarado"
          tint="bg-sky-500/15 text-sky-700 dark:text-sky-400"
        />
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

function AderenciaCard({ pct, hasPlano }: { pct: number | null; hasPlano: boolean }) {
  const tone =
    pct === null
      ? "border-border bg-card"
      : pct >= 90
        ? "border-emerald-500/60 bg-emerald-500/10"
        : pct >= 60
          ? "border-amber-500/60 bg-amber-500/10"
          : "border-red-500/60 bg-red-500/10";
  const color =
    pct === null
      ? "text-muted-foreground"
      : pct >= 90
        ? "text-emerald-700 dark:text-emerald-400"
        : pct >= 60
          ? "text-amber-700 dark:text-amber-400"
          : "text-red-700 dark:text-red-400";

  return (
    <article className={`rounded-2xl border-2 p-4 shadow-sm ${tone}`}>
      <div className="flex items-center gap-3">
        <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-background ${color}`}>
          <Target className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Aderência ao Planejamento
          </p>
          {pct === null ? (
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {hasPlano ? "Sem realizados ainda." : "Sem planejamento para hoje."}
            </p>
          ) : (
            <p className={`mt-1 text-3xl font-black ${color}`}>{pct}%</p>
          )}
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background">
        <div
          className={`h-full transition-all ${
            pct === null
              ? "bg-muted"
              : pct >= 90
                ? "bg-emerald-500"
                : pct >= 60
                  ? "bg-amber-500"
                  : "bg-red-500"
          }`}
          style={{ width: `${pct ?? 0}%` }}
        />
      </div>
    </article>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  unit,
  tint,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  unit?: string;
  tint: string;
}) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4 shadow-sm">
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
  );
}
