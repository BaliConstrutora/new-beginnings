import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Database, Lock } from "lucide-react";
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
import { useRole } from "@/lib/auth-store";
import { useParametros } from "@/lib/parametros-store";
import { useEquipamentos, useMaoObra } from "@/lib/cadastros-store";
import {
  getPlanejamento,
  savePlanejamento,
  uid,
  type EquipePrevista,
  type EquipamentoPrevisto,
  type ServicoPlanejado,
} from "@/lib/planejamento-store";

export const Route = createFileRoute("/planejamento")({
  head: () => ({
    meta: [
      { title: "Planejamento Diário — Bora Bora" },
      {
        name: "description",
        content: "Planeje serviços, equipes e equipamentos para a frente de trabalho do dia seguinte.",
      },
    ],
  }),
  component: PlanejamentoPage,
});

const SERVICOS = [
  ["corte", "Corte"],
  ["aterro", "Aterro"],
  ["bota-fora", "Bota-fora"],
  ["compactacao", "Compactação"],
  ["base-brita", "Base de Brita"],
  ["drenagem", "Drenagem"],
] as const;

const UNIDADES = [
  ["m3", "m³"],
  ["m2", "m²"],
  ["m", "m"],
  ["t", "t"],
] as const;

const FRENTES = [
  ["terraplenagem", "Terraplenagem"],
  ["drenagem", "Drenagem"],
  ["pavimentacao", "Pavimentação"],
  ["obras-arte", "Obras de arte"],
] as const;

function amanha() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function PlanejamentoPage() {
  const navigate = useNavigate();
  const obra = useObra();
  const role = useRole();
  const parametros = useParametros();
  const equipamentosCad = useEquipamentos();
  const maoObraCad = useMaoObra();

  const [data, setData] = useState(amanha());
  const [frente, setFrente] = useState("");
  const [servicos, setServicos] = useState<ServicoPlanejado[]>([]);
  const [equipe, setEquipe] = useState<EquipePrevista[]>([]);
  const [equipamentos, setEquipamentos] = useState<EquipamentoPrevisto[]>([]);

  const readOnly =
    role === "campo" && parametros.modelo === "centralizado";

  useEffect(() => {
    if (typeof window !== "undefined" && !obra) navigate({ to: "/" });
  }, [obra, navigate]);

  // load plan when date changes
  useEffect(() => {
    const p = getPlanejamento(data);
    if (p) {
      setFrente(p.frente);
      setServicos(p.servicos);
      setEquipe(p.equipe);
      setEquipamentos(p.equipamentos);
    } else {
      setFrente("");
      setServicos([]);
      setEquipe([]);
      setEquipamentos([]);
    }
  }, [data]);

  const funcoesOptions = useMemo(
    () => maoObraCad.map((m) => [m.id, `${m.funcao} (${m.categoria})`] as [string, string]),
    [maoObraCad],
  );
  const equipOptions = useMemo(
    () =>
      equipamentosCad.map(
        (e) => [e.id, `${e.prefixo} — ${e.descricao}`] as [string, string],
      ),
    [equipamentosCad],
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frente) {
      toast.error("Selecione a frente de serviço.");
      return;
    }
    if (servicos.length === 0) {
      toast.error("Adicione ao menos um serviço planejado.");
      return;
    }
    savePlanejamento({ data, frente, servicos, equipe, equipamentos });
    toast.success("Planejamento salvo!", {
      description: `Plano para ${data} registrado.`,
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">Planejamento Diário</h1>
        <p className="text-sm text-muted-foreground">
          Defina serviços, equipes e equipamentos previstos.
        </p>
        {readOnly && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border-2 border-amber-500/60 bg-amber-500/10 p-3 text-sm font-semibold text-amber-800 dark:text-amber-300">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              Planejamento <strong>Centralizado na Sede</strong>. Acesso somente
              leitura para o perfil Campo.
            </div>
          </div>
        )}
      </header>

      <section className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <Field label="Data">
          <Input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="h-12"
            disabled={readOnly}
          />
        </Field>
        <Field label="Frente de Serviço">
          <Select value={frente} onValueChange={setFrente} disabled={readOnly}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {FRENTES.map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </section>

      <Section title="Serviços Planejados (EAP)">
        {servicos.map((s, idx) => (
          <RowCard
            key={s.id}
            label={`Serviço ${idx + 1}`}
            onRemove={
              !readOnly
                ? () => setServicos((p) => p.filter((x) => x.id !== s.id))
                : undefined
            }
          >
            <Field label="Serviço">
              <Select
                value={s.servico}
                onValueChange={(v) =>
                  setServicos((p) =>
                    p.map((x) => (x.id === s.id ? { ...x, servico: v } : x)),
                  )
                }
                disabled={readOnly}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICOS.map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Meta (Quantidade)">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={s.metaQuantidade}
                  onChange={(e) =>
                    setServicos((p) =>
                      p.map((x) =>
                        x.id === s.id ? { ...x, metaQuantidade: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="0"
                  className="h-12"
                  disabled={readOnly}
                />
              </Field>
              <Field label="Unidade">
                <Select
                  value={s.unidade}
                  onValueChange={(v) =>
                    setServicos((p) =>
                      p.map((x) => (x.id === s.id ? { ...x, unidade: v } : x)),
                    )
                  }
                  disabled={readOnly}
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
          </RowCard>
        ))}
        {!readOnly && (
          <AddButton
            onClick={() =>
              setServicos((p) => [
                ...p,
                { id: uid(), servico: "", metaQuantidade: "", unidade: "" },
              ])
            }
          >
            Adicionar Serviço Planejado
          </AddButton>
        )}
      </Section>

      <Section title="Equipe Prevista">
        {funcoesOptions.length === 0 && <EmptyCadastro tipo="funções" />}
        {equipe.map((e, idx) => (
          <RowCard
            key={e.id}
            label={`Função ${idx + 1}`}
            onRemove={
              !readOnly
                ? () => setEquipe((p) => p.filter((x) => x.id !== e.id))
                : undefined
            }
          >
            <Field label="Função">
              <Dropdown
                value={e.funcaoId}
                onChange={(v) =>
                  setEquipe((p) =>
                    p.map((x) => (x.id === e.id ? { ...x, funcaoId: v } : x)),
                  )
                }
                placeholder="Selecione"
                options={funcoesOptions}
                disabled={readOnly}
              />
            </Field>
            <Field label="Quantidade Prevista">
              <Input
                type="number"
                inputMode="numeric"
                value={e.qtdPrevista}
                onChange={(ev) =>
                  setEquipe((p) =>
                    p.map((x) =>
                      x.id === e.id ? { ...x, qtdPrevista: ev.target.value } : x,
                    ),
                  )
                }
                placeholder="0"
                className="h-12"
                disabled={readOnly}
              />
            </Field>
          </RowCard>
        ))}
        {!readOnly && funcoesOptions.length > 0 && (
          <AddButton
            onClick={() =>
              setEquipe((p) => [
                ...p,
                { id: uid(), funcaoId: "", qtdPrevista: "" },
              ])
            }
          >
            Alocar Função
          </AddButton>
        )}
      </Section>

      <Section title="Equipamentos Previstos">
        {equipOptions.length === 0 && <EmptyCadastro tipo="equipamentos" />}
        {equipamentos.map((e, idx) => (
          <RowCard
            key={e.id}
            label={`Equipamento ${idx + 1}`}
            onRemove={
              !readOnly
                ? () => setEquipamentos((p) => p.filter((x) => x.id !== e.id))
                : undefined
            }
          >
            <Field label="Equipamento">
              <Dropdown
                value={e.equipamentoId}
                onChange={(v) =>
                  setEquipamentos((p) =>
                    p.map((x) =>
                      x.id === e.id ? { ...x, equipamentoId: v } : x,
                    ),
                  )
                }
                placeholder="Selecione"
                options={equipOptions}
                disabled={readOnly}
              />
            </Field>
          </RowCard>
        ))}
        {!readOnly && equipOptions.length > 0 && (
          <AddButton
            onClick={() =>
              setEquipamentos((p) => [
                ...p,
                { id: uid(), equipamentoId: "" },
              ])
            }
          >
            Alocar Equipamento
          </AddButton>
        )}
      </Section>

      {!readOnly && (
        <Button
          type="submit"
          className="h-14 w-full bg-emerald-600 text-base font-bold text-white shadow-md hover:bg-emerald-700"
        >
          Salvar Planejamento
        </Button>
      )}
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
      <p className="text-xs font-black uppercase tracking-wider text-primary">
        {title}
      </p>
      {children}
    </section>
  );
}

function RowCard({
  label,
  onRemove,
  children,
}: {
  label: string;
  onRemove?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-background p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted-foreground">{label}</p>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="grid h-9 w-9 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
            aria-label="Remover"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function AddButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="h-12 w-full border-2 border-dashed border-primary text-primary hover:bg-primary/10"
    >
      <Plus className="mr-2 h-4 w-4" /> {children}
    </Button>
  );
}

function Dropdown({
  value,
  onChange,
  placeholder,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: [string, string][];
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
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

function EmptyCadastro({ tipo }: { tipo: string }) {
  return (
    <Link
      to="/cadastros"
      className="flex items-center gap-2 rounded-xl border-2 border-dashed border-amber-500/60 bg-amber-500/10 p-3 text-sm font-semibold text-amber-800 dark:text-amber-300"
    >
      <Database className="h-4 w-4 shrink-0" />
      Nenhum(a) {tipo} cadastrado(a) — toque para cadastrar.
    </Link>
  );
}
