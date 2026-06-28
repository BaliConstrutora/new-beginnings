import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/relatorios")({
  component: RelatoriosPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const APONTAMENTO_KEY = "borabora.apontamento";

type ServicoRealizado = {
  id: string;
  servico: string;
  unidade: string;
  metaQuantidade?: string;
  realizado: string;
  estacaInicial: string;
  estacaFinal: string;
};

type ApontamentoSalvo = {
  data: string;
  frente: string;
  servicos: ServicoRealizado[];
};

function loadStore(): Record<string, ApontamentoSalvo> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(APONTAMENTO_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function calcAderencia(servicos: ServicoRealizado[]): number | null {
  const validos = servicos.filter((s) => {
    const meta = parseFloat(s.metaQuantidade ?? "0");
    return meta > 0;
  });
  if (!validos.length) return null;
  const soma = validos.reduce((acc, s) => {
    const meta = parseFloat(s.metaQuantidade ?? "0");
    const real = parseFloat(s.realizado) || 0;
    return acc + Math.min(real / meta, 1);
  }, 0);
  return Math.round((soma / validos.length) * 100);
}

function formatDataLonga(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString("pt-BR", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });
}

function aderenciaColor(v: number | null) {
  if (v === null) return "text-muted-foreground";
  if (v >= 95) return "text-emerald-600";
  if (v >= 80) return "text-primary";
  return "text-red-500";
}

function barColor(pct: number | null) {
  if (pct == null) return "bg-muted";
  if (pct >= 95) return "bg-emerald-500";
  if (pct >= 80) return "bg-primary";
  return "bg-red-400";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function RelatoriosPage() {
  const hoje = new Date().toISOString().split("T")[0];
  const umMesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString().split("T")[0];

  const [dataInicio, setDataInicio] = useState(umMesAtras);
  const [dataFim, setDataFim] = useState(hoje);
  const [filtro, setFiltro] = useState({ inicio: umMesAtras, fim: hoje });

  const dias = useMemo(() => {
    const store = loadStore();
    return Object.values(store)
      .filter((a) => a.data >= filtro.inicio && a.data <= filtro.fim)
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [filtro]);

  const totalItens = dias.reduce((acc, d) => acc + d.servicos.length, 0);
  const mediaGeral = useMemo(() => {
    const todos = dias.flatMap((d) => d.servicos);
    return calcAderencia(todos);
  }, [dias]);

  return (
    <div className="space-y-5 pb-6">
      <header>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Histórico de apontamentos</p>
      </header>

      {/* Filtro */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Filtrar por período
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Data início</Label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Data fim</Label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="h-10"
            />
          </div>
        </div>
        <Button
          onClick={() => setFiltro({ inicio: dataInicio, fim: dataFim })}
          className="w-full h-10 font-bold gap-2"
        >
          <Search className="h-4 w-4" /> Filtrar
        </Button>
      </div>

      {/* Resumo do período */}
      {dias.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Dias</p>
            <p className="mt-1 text-xl font-bold text-foreground">{dias.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Itens</p>
            <p className="mt-1 text-xl font-bold text-foreground">{totalItens}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Aderência</p>
            <p className={`mt-1 text-xl font-bold ${aderenciaColor(mediaGeral)}`}>
              {mediaGeral != null ? `${mediaGeral}%` : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Lista */}
      {dias.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum apontamento no período selecionado.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Salve apontamentos para que apareçam aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {dias.map((dia) => {
            const ader = calcAderencia(dia.servicos);
            return (
              <div key={dia.data} className="space-y-2">
                <div className="flex items-center justify-between border-b border-border pb-1.5">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground capitalize">
                    {formatDataLonga(dia.data)}
                  </p>
                  <span className={`text-xs font-bold ${aderenciaColor(ader)}`}>
                    {ader != null ? `Aderência: ${ader}%` : "—"}
                  </span>
                </div>

                {dia.servicos.map((s) => {
                  const meta = parseFloat(s.metaQuantidade ?? "0");
                  const real = parseFloat(s.realizado) || 0;
                  const pct = meta > 0 ? Math.round(Math.min(real / meta, 1) * 100) : null;

                  return (
                    <div
                      key={s.id}
                      className="rounded-xl border border-border bg-card p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {s.servico}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {s.estacaInicial} → {s.estacaFinal}
                          </p>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ${aderenciaColor(pct)}`}>
                          {pct != null ? `${pct}%` : "—"}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground">
                        {real.toFixed(1)} {s.unidade} de {meta.toFixed(1)} {s.unidade} planejados
                      </p>

                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${barColor(pct)}`}
                          style={{ width: `${pct ?? 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
