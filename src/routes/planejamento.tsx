import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Database, Lock, Upload } from "lucide-react";
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
import { useObra, useHydrated } from "@/lib/obra-store";
import { useRole } from "@/lib/auth-store";
import { useParametros } from "@/lib/parametros-store";
import { useEquipamentos, useMaoObra, useFrentes } from "@/lib/cadastros-store";
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
      { title: "Planejamento — Bora Bora" },
      {
        name: "description",
        content:
          "Planeje serviços, equipes e equipamentos para a frente de trabalho.",
      },
    ],
  }),
  component: PlanejamentoPage,
});

const PISTAS = [
  ["norte", "Norte"],
  ["sul", "Sul"],
  ["leste", "Leste"],
  ["oeste", "Oeste"],
  ["simples", "Simples"],
] as const;

function amanha() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function num(v: string) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}
function fmt(n: number) {
  if (!isFinite(n) || n === 0) return "";
  return n.toFixed(3).replace(/\.?0+$/, "");
}

function novoServico(data: string): ServicoPlanejado {
  return {
    id: uid(),
    data,
    kmInicial: "",
    kmFinal: "",
    faixa: "",
    pista: "",
    comprimento: "",
    largura: "",
    espessura: "",
    densidade: "",
    servico: "",
    metaQuantidade: "",
    unidade: "m³",
  };
}

function PlanejamentoPage() {
  const navigate = useNavigate();
  const obra = useObra();
  const hydrated = useHydrated();
  const role = useRole();
  const parametros = useParametros();
  const equipamentosCad = useEquipamentos();
  const maoObraCad = useMaoObra();
  const frentesCad = useFrentes();

  const [data, setData] = useState(amanha());
  const [frente, setFrente] = useState("");
  const [servicos, setServicos] = useState<ServicoPlanejado[]>([]);
  const [equipe, setEquipe] = useState<EquipePrevista[]>([]);
  const [equipamentos, setEquipamentos] = useState<EquipamentoPrevisto[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const readOnly = role === "campo" && parametros.modelo === "centralizado";

  useEffect(() => {
    if (hydrated && !obra) navigate({ to: "/" });
  }, [hydrated, obra, navigate]);

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
  const frenteOptions = useMemo(
    () => frentesCad.map((f) => [f.id, f.nome] as [string, string]),
    [frentesCad],
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
    // sincroniza meta = volume calculado
    const finalServicos = servicos.map((s) => {
      const area = num(s.comprimento) * num(s.largura);
      const volume = area * num(s.espessura);
      return { ...s, metaQuantidade: fmt(volume), unidade: "m³" };
    });
    savePlanejamento({ data, frente, servicos: finalServicos, equipe, equipamentos });
    toast.success("Planejamento salvo!", {
      description: `Plano para ${data} registrado.`,
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Mock: gera 3 serviços fictícios independente do conteúdo
    const mock: ServicoPlanejado[] = [
      mockServico(data, "0+000", "0+250", "1", "norte", "250", "3.5", "0.05", "2.4"),
      mockServico(data, "0+250", "0+500", "2", "sul", "250", "3.5", "0.05", "2.4"),
      mockServico(data, "0+500", "0+800", "1", "simples", "300", "7.0", "0.07", "2.4"),
    ];
    setServicos((prev) => [...prev, ...mock]);
    toast.success("Planejamento importado com sucesso!", {
      description: `${mock.length} serviços importados de ${file.name}.`,
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">Planejamento</h1>
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
          {frenteOptions.length === 0 ? (
            <EmptyCadastro tipo="frentes de serviço" />
          ) : (
            <Dropdown
              value={frente}
              onChange={setFrente}
              placeholder="Selecione"
              options={frenteOptions}
              disabled={readOnly}
            />
          )}
        </Field>
      </section>

      <Section title="Serviços Planejados (EAP)">
        {!readOnly && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="h-12 w-full bg-emerald-600 font-bold text-white hover:bg-emerald-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Importar Planilha (Excel/CSV)
            </Button>
          </>
        )}
        {servicos.map((s, idx) => (
          <ServicoCard
            key={s.id}
            servico={s}
            idx={idx}
            disabled={readOnly}
            onChange={(patch) =>
              setServicos((p) =>
                p.map((x) => (x.id === s.id ? { ...x, ...patch } : x)),
              )
            }
            onRemove={
              !readOnly
                ? () => setServicos((p) => p.filter((x) => x.id !== s.id))
                : undefined
            }
          />
        ))}
        {!readOnly && (
          <AddButton onClick={() => setServicos((p) => [...p, novoServico(data)])}>
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
              setEquipe((p) => [...p, { id: uid(), funcaoId: "", qtdPrevista: "" }])
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
              setEquipamentos((p) => [...p, { id: uid(), equipamentoId: "" }])
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

function mockServico(
  data: string,
  ki: string,
  kf: string,
  faixa: string,
  pista: string,
  c: string,
  l: string,
  e: string,
  d: string,
): ServicoPlanejado {
  const area = num(c) * num(l);
  const volume = area * num(e);
  return {
    id: uid(),
    data,
    kmInicial: ki,
    kmFinal: kf,
    faixa,
    pista,
    comprimento: c,
    largura: l,
    espessura: e,
    densidade: d,
    servico: "",
    metaQuantidade: fmt(volume),
    unidade: "m³",
  };
}

function ServicoCard({
  servico,
  idx,
  disabled,
  onChange,
  onRemove,
}: {
  servico: ServicoPlanejado;
  idx: number;
  disabled?: boolean;
  onChange: (patch: Partial<ServicoPlanejado>) => void;
  onRemove?: () => void;
}) {
  const area = num(servico.comprimento) * num(servico.largura);
  const volume = area * num(servico.espessura);
  const peso = volume * num(servico.densidade);

  return (
    <div className="space-y-3 rounded-xl border-2 border-primary/40 bg-primary/5 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">Serviço {idx + 1}</p>
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

      <Field label="Data">
        <Input
          type="date"
          value={servico.data}
          onChange={(e) => onChange({ data: e.target.value })}
          className="h-12"
          disabled={disabled}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Km Inicial">
          <Input
            value={servico.kmInicial}
            onChange={(e) => onChange({ kmInicial: e.target.value })}
            placeholder="0+000"
            className="h-12"
            disabled={disabled}
          />
        </Field>
        <Field label="Km Final">
          <Input
            value={servico.kmFinal}
            onChange={(e) => onChange({ kmFinal: e.target.value })}
            placeholder="0+250"
            className="h-12"
            disabled={disabled}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Faixa">
          <Input
            type="number"
            inputMode="numeric"
            value={servico.faixa}
            onChange={(e) => onChange({ faixa: e.target.value })}
            placeholder="1"
            className="h-12"
            disabled={disabled}
          />
        </Field>
        <Field label="Pista">
          <Select
            value={servico.pista}
            onValueChange={(v) => onChange({ pista: v })}
            disabled={disabled}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {PISTAS.map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Field label="Compr. (m)">
          <Input
            type="number"
            inputMode="decimal"
            value={servico.comprimento}
            onChange={(e) => onChange({ comprimento: e.target.value })}
            placeholder="0"
            className="h-12"
            disabled={disabled}
          />
        </Field>
        <Field label="Largura (m)">
          <Input
            type="number"
            inputMode="decimal"
            value={servico.largura}
            onChange={(e) => onChange({ largura: e.target.value })}
            placeholder="0"
            className="h-12"
            disabled={disabled}
          />
        </Field>
        <Field label="Espess. (m)">
          <Input
            type="number"
            inputMode="decimal"
            value={servico.espessura}
            onChange={(e) => onChange({ espessura: e.target.value })}
            placeholder="0"
            className="h-12"
            disabled={disabled}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Área (m²)">
          <Input
            value={fmt(area)}
            readOnly
            className="h-12 bg-muted font-bold"
            placeholder="—"
          />
        </Field>
        <Field label="Volume (m³)">
          <Input
            value={fmt(volume)}
            readOnly
            className="h-12 bg-muted font-bold"
            placeholder="—"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Densidade (ton/m³)">
          <Input
            type="number"
            inputMode="decimal"
            value={servico.densidade}
            onChange={(e) => onChange({ densidade: e.target.value })}
            placeholder="2.4"
            className="h-12"
            disabled={disabled}
          />
        </Field>
        <Field label="Peso (ton)">
          <Input
            value={fmt(peso)}
            readOnly
            className="h-12 bg-muted font-bold"
            placeholder="—"
          />
        </Field>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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
