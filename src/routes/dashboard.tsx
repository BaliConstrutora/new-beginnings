import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  ChevronRight,
  ClipboardList,
  CalendarRange,
  Target,
} from "lucide-react";
import { useObra, useHydrated } from "@/lib/obra-store";
import { usePlanejamento } from "@/lib/planejamento-store";
import { useApontamento, calcularAderencia } from "@/lib/apontamento-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Bora Bora" },
      {
        name: "description",
        content: "Resumo do dia: aderência ao planejamento e atalhos rápidos.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const obra = useObra();
  const hydrated = useHydrated();
  const hoje = new Date().toISOString().slice(0, 10);
  const plano = usePlanejamento(hoje);
  const apont = useApontamento(hoje);

  useEffect(() => {
    if (hydrated && !obra) navigate({ to: "/" });
  }, [hydrated, obra, navigate]);

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

  const today = hydrated
    ? new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    : "";

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Resumo do dia
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Dashboard</h1>
        <p
          className="mt-1 text-sm capitalize text-muted-foreground"
          suppressHydrationWarning
        >
          {today || "\u00A0"}
        </p>
      </header>

      {/* Aderência ao Planejamento */}
      <AderenciaCard pct={aderencia} hasPlano={!!plano} />

      {/* Atalhos rápidos */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ações rápidas
        </h2>

        {/* Novo Apontamento */}
        <Link
          to="/apontamento"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ClipboardList size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              Novo Apontamento
            </p>
            <p className="text-xs text-muted-foreground">
              Registrar o dia em campo
            </p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </Link>

        {/* Planejamento */}
        <Link
          to="/planejamento"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <CalendarRange size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Planejamento</p>
            <p className="text-xs text-muted-foreground">
              {plano
                ? `${plano.servicos.length} item(s) planejado(s) para hoje`
                : "Nenhum planejamento para hoje"}
            </p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </Link>
      </section>
    </div>
  );
}

function AderenciaCard({
  pct,
  hasPlano,
}: {
  pct: number | null;
  hasPlano: boolean;
}) {
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

  const barColor =
    pct === null
      ? "bg-muted"
      : pct >= 90
        ? "bg-emerald-500"
        : pct >= 60
          ? "bg-amber-500"
          : "bg-red-500";

  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/60 text-foreground">
          <Target size={18} className={color} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Aderência ao Planejamento
          </p>
          {pct === null ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {hasPlano
                ? "Sem realizados ainda."
                : "Sem planejamento para hoje."}
            </p>
          ) : (
            <p className={`mt-1 text-3xl font-bold ${color}`}>{pct}%</p>
          )}
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background/60">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct ?? 0}%` }}
        />
      </div>
    </div>
  );
}
