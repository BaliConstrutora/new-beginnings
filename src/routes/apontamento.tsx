import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Database, Target, Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useObra } from "@/lib/obra-store";
import { useEquipamentos, useMaoObra } from "@/lib/cadastros-store";
import { usePlanejamento, uid } from "@/lib/planejamento-store";
import {
  saveApontamento,
  getApontamento,
  type ServicoRealizado,
} from "@/lib/apontamento-store";

export const Route = createFileRoute("/apontamento")({
  head: () => ({
    meta: [
      { title: "Apontamento Diário — Bora Bora" },
      {
        name: "description",
        content: "Apontamento Realizado x Planejado em campo.",
      },
    ],
  }),
  component: Apontamento,
});

const SERVICO_LABELS: Record<string, string> = {
  corte: "Corte",
  aterro: "Aterro",
  "bota-fora": "Bota-fora",
  compactacao: "Compactação",
  "base-brita": "Base de Brita",
  drenagem: "Drenagem",
};

const SERVICOS_EXTRA = [
  ["corte", "Corte"],
  ["aterro", "Aterro"],
  ["bota-fora", "Bota-fora"],
  ["compactacao", "Compactação"],
  ["base-brita", "Base de Brita"],
  ["drenagem", "Drenagem"],
  ["limpeza", "Limpeza emergencial"],
  ["manutencao", "Manutenção"],
] as const;

const UNIDADES = [
  ["m3", "m³"],
  ["m2", "m²"],
  ["m", "m"],
  ["t", "t"],
] as const;

type EquipReal = {
  id: string;
  equipamentoId: string;
  horInicial: string;
  horFinal: string;
  diesel: string;
};
type MoReal = {
  id: string;
  funcaoId: string;
  qtd: string;
  horasNormais: string;
  horasExtras: string;
};

function Apontamento() {
  const hoje = new Date().toISOString().slice(0, 10);
  const navigate = useNavigate();
  const obra = useObra();
  const equipamentosCad = useEquipamentos();
  const maoObraCad = useMaoObra();
  const plano = usePlanejamento(hoje);

  useEffect(() => {
    if (typeof window !== "undefined" && !obra) navigate({ to: "/" });
  }, [obra, navigate]);

  const equipMap = useMemo(
    () => new Map(equipamentosCad.map((e) => [e.id, e])),
    [equipamentosCad],
  );
  const moMap = useMemo(
    () => new Map(maoObraCad.map((m) => [m.id, m])),
    [maoObraCad],
  );

  // Serviços = derivados do plano + extras (não planejados)
  const [servicos, setServicos] = useState<ServicoRealizado[]>([]);
  const [equipamentos, setEquipamentos] = useState<EquipReal[]>([]);
  const [equipe, setEquipe] = useState<MoReal[]>([]);

  // Hidratar a partir do plano (apenas uma vez, ou quando plano mudar)
  useEffect(() => {
    const existing = getApontamento(hoje);
    if (existing) {
      setServicos(existing.servicos);
    } else if (plano) {
      setServicos(
        plano.servicos.map((s) => ({
          id: s.id,
          servico: s.servico,
          unidade: s.unidade,
          metaQuantidade: s.metaQuantidade,
          realizado: "",
          estacaInicial: "",
          estacaFinal: "",
        })),
      );
    }
    if (plano) {
      setEquipamentos(
        plano.equipamentos.map((e) => ({
          id: e.id,
          equipamentoId: e.equipamentoId,
          horInicial: "",
          horFinal: "",
          diesel: "",
        })),
      );
      setEquipe(
        plano.equipe.map((e) => ({
          id: e.id,
          funcaoId: e.funcaoId,
          qtd: e.qtdPrevista,
          horasNormais: "",
          horasExtras: "",
        })),
      );
    }
  }, [plano, hoje]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveApontamento({
      data: hoje,
      frente: plano?.frente ?? "",
      servicos,
    });
    toast.success("Apontamento salvo com sucesso!", {
      description: "Realizado registrado contra o planejado.",
    });
  };

  const addExtra = () =>
    setServicos((p) => [
      ...p,
      {
        id: uid(),
        servico: "",
        unidade: "",
        realizado: "",
        estacaInicial: "",
        estacaFinal: "",
        extraPlano: true,
      },
    ]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">Apontamento Diário</h1>
        <p className="text-sm text-muted-foreground">
          {plano
            ? `Plano carregado · Frente: ${plano.frente || "—"}`
            : "Nenhum planejamento encontrado para hoje."}
        </p>
        {!plano && (
          <Link
            to="/planejamento"
            className="mt-2 inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-amber-500/60 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-800 dark:text-amber-300"
          >
            <Target className="h-4 w-4" />
            Criar planejamento de hoje
          </Link>
        )}
      </header>

      <Accordion
        type="single"
        collapsible
        defaultValue="producao"
        className="space-y-3"
      >
        <Step value="condicoes" n={1} title="Condições">
          <Field label="Data">
            <Input type="date" defaultValue={hoje} readOnly className="h-12" />
          </Field>
          <Field label="Clima">
            <SimpleDropdown
              placeholder="Selecione"
              options={[
                ["ensolarado", "Ensolarado"],
                ["nublado", "Nublado"],
                ["chuva-fraca", "Chuva fraca"],
                ["chuva-forte", "Chuva forte"],
              ]}
            />
          </Field>
        </Step>

        <Step value="producao" n={2} title="Produção (Planejado x Realizado)">
          {servicos.length === 0 && (
            <p className="rounded-xl border-2 border-dashed border-border bg-background p-4 text-center text-sm text-muted-foreground">
              Nenhum serviço — crie o planejamento ou adicione um serviço extra.
            </p>
          )}
          {servicos.map((s, idx) => (
            <ServicoCard
              key={s.id}
              servico={s}
              idx={idx}
              onChange={(patch) =>
                setServicos((p) =>
                  p.map((x) => (x.id === s.id ? { ...x, ...patch } : x)),
                )
              }
              onRemove={
                s.extraPlano
                  ? () => setServicos((p) => p.filter((x) => x.id !== s.id))
                  : undefined
              }
            />
          ))}
          <Button
            type="button"
            onClick={addExtra}
            className="h-12 w-full bg-orange-600 font-bold text-white hover:bg-orange-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Adicionar Serviço Extra/Não Planejado
          </Button>
        </Step>

        <Step value="equipamentos" n={3} title="Equipamentos (Realizado)">
          {equipamentos.length === 0 && <EmptyPlano tipo="equipamentos previstos" />}
          {equipamentos.map((eq, idx) => {
            const info = equipMap.get(eq.equipamentoId);
            return (
              <div
                key={eq.id}
                className="space-y-3 rounded-xl border border-border bg-background p-3"
              >
                <p className="text-sm font-bold">
                  {info ? `${info.prefixo} — ${info.descricao}` : `Equipamento ${idx + 1}`}
                </p>
                <Field label="Horímetro Inicial">
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={eq.horInicial}
                    onChange={(e) =>
                      setEquipamentos((p) =>
                        p.map((x) =>
                          x.id === eq.id ? { ...x, horInicial: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="0"
                    className="h-12"
                  />
                </Field>
                <Field label="Horímetro Final">
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={eq.horFinal}
                    onChange={(e) =>
                      setEquipamentos((p) =>
                        p.map((x) =>
                          x.id === eq.id ? { ...x, horFinal: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="0"
                    className="h-12"
                  />
                </Field>
                <Field label="Diesel Consumido (L)">
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={eq.diesel}
                    onChange={(e) =>
                      setEquipamentos((p) =>
                        p.map((x) =>
                          x.id === eq.id ? { ...x, diesel: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="0"
                    className="h-12"
                  />
                </Field>
              </div>
            );
          })}
        </Step>

        <Step value="equipe" n={4} title="Mão de Obra (Realizado)">
          {equipe.length === 0 && <EmptyPlano tipo="equipe prevista" />}
          {equipe.map((m, idx) => {
            const info = moMap.get(m.funcaoId);
            return (
              <div
                key={m.id}
                className="space-y-3 rounded-xl border border-border bg-background p-3"
              >
                <p className="text-sm font-bold">
                  {info ? `${info.funcao} (${info.categoria})` : `Função ${idx + 1}`}
                  <span className="ml-2 text-xs font-semibold text-muted-foreground">
                    Previsto: {m.qtd || "—"} pessoa(s)
                  </span>
                </p>
                <Field label="Horas Reais Trabalhadas">
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={m.horasNormais}
                    onChange={(e) =>
                      setEquipe((p) =>
                        p.map((x) =>
                          x.id === m.id ? { ...x, horasNormais: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="0"
                    className="h-12"
                  />
                </Field>
                <Field label="Horas Extras">
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={m.horasExtras}
                    onChange={(e) =>
                      setEquipe((p) =>
                        p.map((x) =>
                          x.id === m.id ? { ...x, horasExtras: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="0"
                    className="h-12"
                  />
                </Field>
              </div>
            );
          })}
        </Step>
      </Accordion>

      <Button type="submit" className="h-14 w-full text-base font-bold shadow-md">
        Salvar Apontamento (Realizado)
      </Button>
    </form>
  );
}

function ServicoCard({
  servico,
  idx,
  onChange,
  onRemove,
}: {
  servico: ServicoRealizado;
  idx: number;
  onChange: (patch: Partial<ServicoRealizado>) => void;
  onRemove?: () => void;
}) {
  const meta =
    servico.metaQuantidade && !servico.extraPlano
      ? `Meta: ${servico.metaQuantidade} ${servico.unidade || ""}`
      : null;
  const label =
    SERVICO_LABELS[servico.servico] ||
    servico.servico ||
    (servico.extraPlano ? `Extra ${idx + 1}` : `Serviço ${idx + 1}`);

  return (
    <div
      className={`space-y-3 rounded-xl border-2 p-3 ${
        servico.extraPlano
          ? "border-orange-500/50 bg-orange-500/5"
          : "border-primary/40 bg-primary/5"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-foreground">
            {label}
            {servico.extraPlano && (
              <span className="ml-2 rounded bg-orange-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                Extra
              </span>
            )}
          </p>
          {meta && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-primary">
              <Target className="h-3 w-3" /> {meta}
            </p>
          )}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
            aria-label="Remover"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {servico.extraPlano && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Serviço">
            <Select
              value={servico.servico}
              onValueChange={(v) => onChange({ servico: v })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {SERVICOS_EXTRA.map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Unidade">
            <Select
              value={servico.unidade}
              onValueChange={(v) => onChange({ unidade: v })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Un." />
              </SelectTrigger>
              <SelectContent>
                {UNIDADES.map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      )}

      <Field label={`Realizado (Quantidade Real)${servico.unidade ? ` em ${servico.unidade}` : ""}`}>
        <Input
          type="number"
          inputMode="decimal"
          value={servico.realizado}
          onChange={(e) => onChange({ realizado: e.target.value })}
          placeholder="0"
          className="h-12 font-bold"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Estaca Inicial">
          <Input
            type="number"
            inputMode="decimal"
            value={servico.estacaInicial}
            onChange={(e) => onChange({ estacaInicial: e.target.value })}
            placeholder="0"
            className="h-12"
            required
          />
        </Field>
        <Field label="Estaca Final">
          <Input
            type="number"
            inputMode="decimal"
            value={servico.estacaFinal}
            onChange={(e) => onChange({ estacaFinal: e.target.value })}
            placeholder="0"
            className="h-12"
            required
          />
        </Field>
      </div>
    </div>
  );
}

function EmptyPlano({ tipo }: { tipo: string }) {
  return (
    <Link
      to="/planejamento"
      className="flex items-center gap-2 rounded-xl border-2 border-dashed border-amber-500/60 bg-amber-500/10 p-3 text-sm font-semibold text-amber-800 dark:text-amber-300"
    >
      <Database className="h-4 w-4 shrink-0" />
      Sem {tipo} no plano — toque para planejar.
    </Link>
  );
}

function Step({
  value,
  n,
  title,
  children,
}: {
  value: string;
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="rounded-2xl border-2 border-border bg-card px-4"
    >
      <AccordionTrigger className="text-base font-bold hover:no-underline">
        <span className="flex items-center gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {n}
          </span>
          {title}
        </span>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 pt-2">{children}</AccordionContent>
    </AccordionItem>
  );
}

function SimpleDropdown({
  placeholder,
  options,
}: {
  placeholder: string;
  options: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <Select>
      <SelectTrigger className="h-12">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">{label}</Label>
      {children}
    </div>
  );
}

// avoid unused import warning
void Plus;
