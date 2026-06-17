import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Database } from "lucide-react";
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

export const Route = createFileRoute("/apontamento")({
  head: () => ({
    meta: [
      { title: "Apontamento Diário — Bora Bora" },
      {
        name: "description",
        content:
          "Registro diário de condições, mão de obra, equipamentos e produção.",
      },
    ],
  }),
  component: Apontamento,
});

type Row = { id: number };
type Equip = Row & {
  tipo: string;
  horInicial: string;
  horFinal: string;
  diesel: string;
};
type MoDireta = Row & {
  funcao: string;
  qtd: string;
  horasNormais: string;
  horasExtras: string;
};
type MoIndireta = Row & {
  funcao: string;
  qtd: string;
  horasNormais: string;
};
type Producao = Row & {
  servico: string;
  quantidade: string;
  unidade: string;
  estacaInicial: string;
  estacaFinal: string;
};

const newId = () => Date.now() + Math.floor(Math.random() * 1000);
const emptyEquip = (): Equip => ({
  id: newId(),
  tipo: "",
  horInicial: "",
  horFinal: "",
  diesel: "",
});
const emptyDireta = (): MoDireta => ({
  id: newId(),
  funcao: "",
  qtd: "",
  horasNormais: "",
  horasExtras: "",
});
const emptyIndireta = (): MoIndireta => ({
  id: newId(),
  funcao: "",
  qtd: "",
  horasNormais: "",
});
const emptyProducao = (): Producao => ({
  id: newId(),
  servico: "",
  quantidade: "",
  unidade: "",
  estacaInicial: "",
  estacaFinal: "",
});

const SERVICOS = [
  ["corte", "Corte"],
  ["aterro", "Aterro"],
  ["bota-fora", "Bota-fora"],
  ["compactacao", "Compactação"],
] as const;

const UNIDADES = [
  ["m3", "m³"],
  ["m2", "m²"],
  ["m", "m"],
  ["t", "t"],
] as const;

function Apontamento() {
  const hoje = new Date().toISOString().slice(0, 10);
  const navigate = useNavigate();
  const obra = useObra();
  const equipamentosCad = useEquipamentos();
  const maoObraCad = useMaoObra();

  const funcoesDiretas = useMemo(
    () =>
      maoObraCad
        .filter((m) => m.categoria === "direta")
        .map((m) => [m.id, m.funcao] as [string, string]),
    [maoObraCad],
  );
  const funcoesIndiretas = useMemo(
    () =>
      maoObraCad
        .filter((m) => m.categoria === "indireta")
        .map((m) => [m.id, m.funcao] as [string, string]),
    [maoObraCad],
  );
  const equipamentosOptions = useMemo(
    () =>
      equipamentosCad.map(
        (e) => [e.id, `${e.prefixo} — ${e.descricao}`] as [string, string],
      ),
    [equipamentosCad],
  );

  const [direta, setDireta] = useState<MoDireta[]>([emptyDireta()]);
  const [indireta, setIndireta] = useState<MoIndireta[]>([emptyIndireta()]);
  const [equipamentos, setEquipamentos] = useState<Equip[]>([emptyEquip()]);
  const [producao, setProducao] = useState<Producao[]>([emptyProducao()]);

  useEffect(() => {
    if (typeof window !== "undefined" && !obra) navigate({ to: "/" });
  }, [obra, navigate]);

  const remove = <T extends Row>(list: T[], id: number) =>
    list.length > 1 ? list.filter((r) => r.id !== id) : list;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Apontamento salvo com sucesso!", {
      description: "Os dados do dia foram registrados.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">Apontamento Diário</h1>
        <p className="text-sm text-muted-foreground">
          Preencha as etapas e salve no final.
        </p>
      </header>

      <Accordion
        type="single"
        collapsible
        defaultValue="condicoes"
        className="space-y-3"
      >
        <Step value="condicoes" n={1} title="Condições">
          <Field label="Data">
            <Input type="date" defaultValue={hoje} readOnly className="h-12" />
          </Field>
          <Field label="Clima">
            <Dropdown
              placeholder="Selecione"
              options={[
                ["ensolarado", "Ensolarado"],
                ["nublado", "Nublado"],
                ["chuva-fraca", "Chuva fraca"],
                ["chuva-forte", "Chuva forte"],
              ]}
            />
          </Field>
          <Field label="Frente de Serviço">
            <Dropdown
              placeholder="Selecione"
              options={[
                ["terraplenagem", "Terraplenagem"],
                ["drenagem", "Drenagem"],
                ["pavimentacao", "Pavimentação"],
                ["obras-arte", "Obras de arte"],
              ]}
            />
          </Field>
        </Step>

        <Step value="mao-obra" n={2} title="Mão de Obra">
          <SubSection title="Direta (Produção)">
            {funcoesDiretas.length === 0 && <EmptyCadastro tipo="funções diretas" />}
            {direta.map((r, idx) => (
              <RowCard
                key={r.id}
                label={`Direta ${idx + 1}`}
                onRemove={
                  direta.length > 1
                    ? () => setDireta((p) => remove(p, r.id))
                    : undefined
                }
              >
                <Field label="Função">
                  <Dropdown
                    placeholder={
                      funcoesDiretas.length ? "Selecione" : "Cadastre antes"
                    }
                    options={funcoesDiretas}
                    disabled={funcoesDiretas.length === 0}
                  />
                </Field>
                <Field label="Quantidade de Pessoas">
                  <Input type="number" inputMode="numeric" placeholder="0" className="h-12" />
                </Field>
                <Field label="Horas Normais">
                  <Input type="number" inputMode="decimal" placeholder="0" className="h-12" />
                </Field>
                <Field label="Horas Extras">
                  <Input type="number" inputMode="decimal" placeholder="0" className="h-12" />
                </Field>
              </RowCard>
            ))}
            <AddButton onClick={() => setDireta((p) => [...p, emptyDireta()])}>
              Adicionar mais MO Direta
            </AddButton>
          </SubSection>

          <div className="my-4 h-px bg-border" />

          <SubSection title="Indireta (Apoio)">
            {funcoesIndiretas.length === 0 && (
              <EmptyCadastro tipo="funções indiretas" />
            )}
            {indireta.map((r, idx) => (
              <RowCard
                key={r.id}
                label={`Indireta ${idx + 1}`}
                onRemove={
                  indireta.length > 1
                    ? () => setIndireta((p) => remove(p, r.id))
                    : undefined
                }
              >
                <Field label="Função">
                  <Dropdown
                    placeholder={
                      funcoesIndiretas.length ? "Selecione" : "Cadastre antes"
                    }
                    options={funcoesIndiretas}
                    disabled={funcoesIndiretas.length === 0}
                  />
                </Field>
                <Field label="Quantidade de Pessoas">
                  <Input type="number" inputMode="numeric" placeholder="0" className="h-12" />
                </Field>
                <Field label="Horas Normais">
                  <Input type="number" inputMode="decimal" placeholder="0" className="h-12" />
                </Field>
              </RowCard>
            ))}
            <AddButton onClick={() => setIndireta((p) => [...p, emptyIndireta()])}>
              Adicionar mais MO Indireta
            </AddButton>
          </SubSection>
        </Step>

        <Step value="equipamentos" n={3} title="Equipamentos">
          {equipamentosOptions.length === 0 && <EmptyCadastro tipo="equipamentos" />}
          {equipamentos.map((eq, idx) => (
            <RowCard
              key={eq.id}
              label={`Equipamento ${idx + 1}`}
              onRemove={
                equipamentos.length > 1
                  ? () => setEquipamentos((p) => remove(p, eq.id))
                  : undefined
              }
            >
              <Field label="Equipamento">
                <Dropdown
                  placeholder={
                    equipamentosOptions.length ? "Selecione" : "Cadastre antes"
                  }
                  options={equipamentosOptions}
                  disabled={equipamentosOptions.length === 0}
                />
              </Field>
              <Field label="Horímetro Inicial">
                <Input type="number" inputMode="decimal" placeholder="0" className="h-12" />
              </Field>
              <Field label="Horímetro Final">
                <Input type="number" inputMode="decimal" placeholder="0" className="h-12" />
              </Field>
              <Field label="Diesel (L)">
                <Input type="number" inputMode="decimal" placeholder="0" className="h-12" />
              </Field>
            </RowCard>
          ))}
          <AddButton onClick={() => setEquipamentos((p) => [...p, emptyEquip()])}>
            Adicionar mais um equipamento
          </AddButton>
        </Step>

        <Step value="producao" n={4} title="Produção">
          {producao.map((p, idx) => (
            <RowCard
              key={p.id}
              label={`Serviço ${idx + 1}`}
              onRemove={
                producao.length > 1
                  ? () => setProducao((prev) => remove(prev, p.id))
                  : undefined
              }
            >
              <Field label="Serviço Executado">
                <Dropdown placeholder="Selecione" options={SERVICOS} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantidade">
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    className="h-12"
                  />
                </Field>
                <Field label="Unidade">
                  <Dropdown placeholder="Un." options={UNIDADES} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Estaca Inicial">
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    required
                    className="h-12"
                  />
                </Field>
                <Field label="Estaca Final">
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    required
                    className="h-12"
                  />
                </Field>
              </div>
            </RowCard>
          ))}
          <AddButton onClick={() => setProducao((p) => [...p, emptyProducao()])}>
            Adicionar mais um serviço
          </AddButton>
        </Step>
      </Accordion>

      <Button type="submit" className="h-14 w-full text-base font-bold shadow-md">
        Salvar Apontamento
      </Button>
    </form>
  );
}

function EmptyCadastro({ tipo }: { tipo: string }) {
  return (
    <Link
      to="/cadastros"
      className="flex items-center gap-2 rounded-xl border-2 border-dashed border-amber-500/60 bg-amber-500/10 p-3 text-sm font-semibold text-amber-800 dark:text-amber-300"
    >
      <Database className="h-4 w-4 shrink-0" />
      Nenhuma {tipo} cadastrada — toque para cadastrar.
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
          <Badge n={n} /> {title}
        </span>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pt-2">{children}</AccordionContent>
    </AccordionItem>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-wider text-primary">
        {title}
      </p>
      {children}
    </div>
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
  placeholder,
  options,
  disabled,
}: {
  placeholder: string;
  options: ReadonlyArray<readonly [string, string]>;
  disabled?: boolean;
}) {
  return (
    <Select disabled={disabled}>
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

function Badge({ n }: { n: number }) {
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
      {n}
    </span>
  );
}
