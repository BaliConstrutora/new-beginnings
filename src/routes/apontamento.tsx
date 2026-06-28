import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Plus,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useObra, useHydrated } from "@/lib/obra-store";
import { useEquipamentos, useMaoObra, useFrentes } from "@/lib/cadastros-store";
import { usePlanejamento } from "@/lib/planejamento-store";
import { saveApontamento } from "@/lib/apontamento-store";
import { useEquipes } from "@/lib/equipe-store";
import { useCarreteiros } from "@/lib/carreteiro-store";

export const Route = createFileRoute("/apontamento")({
  head: () => ({
    meta: [
      { title: "Apontamento Diário — Bora Bora" },
      { name: "description", content: "Apontamento Realizado x Planejado em campo." },
    ],
  }),
  component: ApontamentoPage,
});

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type Carga = {
  id: string;
  placa: string;
  horaDescarga: string;
  quantidade: string;
  fotoUrl: string | null;
};

type MaterialRealizado = {
  id: string;
  nome: string;
  unidade: string;
  quantidadeManual: string;
  freteAtivo: boolean;
  cargas: Carga[];
};

type EquipamentoRealizado = {
  id: string;
  prefixo: string;
  descricao: string;
  horimetroInicial: string;
  horimetroFinal: string;
};

type MaoObraRealizada = {
  id: string;
  funcao: string;
  horasNormais: string;
  horasExtras: string;
};

type ApontamentoItem = {
  itemId: string;
  descricao: string;
  frente: string;
  refIni: string;
  refFim: string;
  comprimento: number;
  largura: number;
  espessura: number;
  densidade: number;
  areaPlanejada: number;
  volumePlanejado: number;
  comprimentoRealizado: string;
  larguraRealizada: string;
  espessuraRealizada: string;
  areaRealizada: number;
  volumeRealizado: number;
  pesoRealizado: number;
  quantidadeRealizada: string;
  estacaInicial: string;
  estacaFinal: string;
  materiais: MaterialRealizado[];
  equipamentos: EquipamentoRealizado[];
  maoObra: MaoObraRealizada[];
  salvo: boolean;
  equipeId?: string;
  equipeNome?: string;
  equipeConfirmacao?: "confirmada" | "substituida" | "ignorar";
  equipeSubstitutaId?: string;
};

type Tela = "inicio" | "lista" | "form" | "avulso";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const hoje = new Date().toISOString().slice(0, 10);

const fmt = (v: number) =>
  v > 0 ? v.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "—";

function somaCargas(cargas: Carga[]): number {
  return cargas.reduce((s, c) => s + (parseFloat(c.quantidade) || 0), 0);
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
function ApontamentoPage() {
  const navigate = useNavigate();
  const obra = useObra();
  const hydrated = useHydrated();
  const equipamentosCad = useEquipamentos();
  const maoObraCad = useMaoObra();
  const frentesCad = useFrentes();
  const plano = usePlanejamento(hoje);

  useEffect(() => {
    if (hydrated && !obra) navigate({ to: "/" });
  }, [hydrated, obra, navigate]);

  const [tela, setTela] = useState<Tela>("inicio");
  const [itemSelecionado, setItemSelecionado] = useState<ApontamentoItem | null>(null);
  const [itensApontados, setItensApontados] = useState<ApontamentoItem[]>([]);

  const hojeLabel = useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [],
  );

  const itensDoDia: ApontamentoItem[] = useMemo(() => {
    if (!plano) return [];
    return plano.servicos.map((s) => {
      const existente = itensApontados.find((a) => a.itemId === s.id);
      if (existente) return existente;
      return {
        itemId: s.id,
        descricao: s.servico,
        frente:
          frentesCad.find((f) => f.id === plano.frente)?.nome ?? plano.frente,
        refIni: s.kmInicial,
        refFim: s.kmFinal,
        comprimento: parseFloat(s.comprimento) || 0,
        largura: parseFloat(s.largura) || 0,
        espessura: parseFloat(s.espessura) || 0,
        densidade: parseFloat(s.densidade) || 0,
        areaPlanejada:
          (parseFloat(s.comprimento) || 0) * (parseFloat(s.largura) || 0),
        volumePlanejado:
          (parseFloat(s.comprimento) || 0) *
          (parseFloat(s.largura) || 0) *
          (parseFloat(s.espessura) || 0),
        quantidadeRealizada: "",
        comprimentoRealizado: "",
        larguraRealizada: "",
        espessuraRealizada: "",
        areaRealizada: 0,
        volumeRealizado: 0,
        pesoRealizado: 0,
        estacaInicial: s.kmInicial,
        estacaFinal: s.kmFinal,
        materiais: [],
        equipamentos: equipamentosCad.map((e) => ({
          id: e.id,
          prefixo: e.prefixo,
          descricao: e.descricao,
          horimetroInicial: "",
          horimetroFinal: "",
        })),
        maoObra: maoObraCad.map((m) => ({
          id: m.id,
          funcao: m.nome ? `${m.nome} — ${m.funcao}` : m.funcao,
          horasNormais: "",
          horasExtras: "",
        })),
        salvo: false,
        equipeId: s.equipeId,
        equipeNome: s.equipeNome,
        equipeConfirmacao: undefined,
        equipeSubstitutaId: undefined,
      };
    });
  }, [plano, frentesCad, equipamentosCad, maoObraCad, itensApontados]);

  const apontados = itensDoDia.filter((i) => i.salvo).length;

  const handleSelecionarItem = (item: ApontamentoItem) => {
    setItemSelecionado({ ...item });
    setTela("form");
  };

  const handleSalvarItem = (item: ApontamentoItem) => {
    const atualizado = { ...item, salvo: true };
    setItensApontados((p) => {
      const idx = p.findIndex((a) => a.itemId === item.itemId);
      if (idx >= 0) {
        const copia = [...p];
        copia[idx] = atualizado;
        return copia;
      }
      return [...p, atualizado];
    });
    saveApontamento({
      data: hoje,
      frente: item.frente,
      servicos: [
        {
          id: item.itemId,
          servico: item.descricao,
          unidade: "m³",
          metaQuantidade: String(item.volumePlanejado),
          realizado: item.quantidadeRealizada,
          estacaInicial: item.estacaInicial,
          estacaFinal: item.estacaFinal,
        },
      ],
    });
    toast.success("Apontamento salvo!");
    setTela("lista");
  };

  // ---- TELA INÍCIO ----
  if (tela === "inicio") {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {hojeLabel}
          </p>
          <h1 className="text-2xl font-bold text-foreground">Apontamento Diário</h1>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setTela("lista")}
            className="w-full flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Selecionar item planejado
              </p>
              <p className="text-xs text-muted-foreground">
                {plano
                  ? `${itensDoDia.length} itens planejados para hoje`
                  : "Nenhum planejamento para hoje"}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            type="button"
            onClick={() => setTela("avulso")}
            className="w-full flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Plus className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Novo apontamento avulso
              </p>
              <p className="text-xs text-muted-foreground">Serviço não planejado</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  // ---- TELA LISTA ----
  if (tela === "lista") {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTela("inicio")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Itens planejados</h1>
            <p className="text-xs text-muted-foreground">{hojeLabel}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Total planejado
            </p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {itensDoDia.length}{" "}
              <span className="text-xs font-normal text-muted-foreground">itens</span>
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Apontados hoje
            </p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {apontados}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                de {itensDoDia.length}
              </span>
            </p>
          </div>
        </div>

        {itensDoDia.length === 0 ? (
          <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <p className="text-sm font-bold text-yellow-800">
                Planejamento não confirmado
              </p>
            </div>
            <p className="text-xs text-yellow-700 leading-relaxed">
              Para apontar a produção do dia, confirme o planejamento primeiro:
            </p>
            <div className="space-y-2">
              {[
                "Vá em Planejamento",
                "Adicione os itens do dia",
                'Clique em "Confirmar planejamento do dia"',
                "Volte ao Apontamento",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-xs text-yellow-800" dangerouslySetInnerHTML={{ __html: step.replace(/\"([^\"]+)\"/g, '<strong>$1</strong>').replace(/Planejamento/g, '<strong>Planejamento</strong>').replace(/Apontamento/g, '<strong>Apontamento</strong>') }} />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate({ to: "/planejamento" })}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 py-2.5 text-sm font-bold text-yellow-900 hover:bg-yellow-500 transition-colors"
            >
              <Calendar className="h-4 w-4" /> Ir para o Planejamento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {itensDoDia.map((item) => (
              <ItemPlanejadoCard
                key={item.itemId}
                item={item}
                onSelecionar={() => handleSelecionarItem(item)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- TELA FORM ----
  if (tela === "form" && itemSelecionado) {
    return (
      <FormRealizado
        item={itemSelecionado}
        onVoltar={() => setTela("lista")}
        onSalvar={handleSalvarItem}
      />
    );
  }

  // ---- TELA AVULSO ----
  if (tela === "avulso") {
    return (
      <FormAvulso
        frentes={frentesCad}
        equipamentos={equipamentosCad}
        maoObra={maoObraCad}
        onVoltar={() => setTela("inicio")}
        onSalvar={() => {
          toast.success("Apontamento avulso salvo!");
          setTela("inicio");
        }}
      />
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Card de item planejado
// ---------------------------------------------------------------------------
function ItemPlanejadoCard({
  item,
  onSelecionar,
}: {
  item: ApontamentoItem;
  onSelecionar: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-border bg-card">
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {item.frente}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              item.salvo
                ? "bg-emerald-100 text-emerald-700"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {item.salvo && <CheckCircle2 className="h-3 w-3" />}
            {item.salvo ? "Apontado" : "Pendente"}
          </span>
        </div>

        <p className="text-sm font-semibold text-foreground">{item.descricao}</p>
        <p className="text-xs text-muted-foreground">
          {item.refIni} → {item.refFim}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Comprimento", value: `${fmt(item.comprimento)} m` },
            { label: "Largura", value: `${fmt(item.largura)} m` },
            { label: "Espessura", value: `${fmt(item.espessura)} m` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-muted/50 p-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="text-xs font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-primary/5 p-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-primary/70">
              Área planejada
            </p>
            <p className="text-sm font-bold text-foreground">
              {fmt(item.areaPlanejada)} m²
            </p>
          </div>
          <div className="rounded-lg bg-primary/5 p-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-primary/70">
              Volume planejado
            </p>
            <p className="text-sm font-bold text-foreground">
              {fmt(item.volumePlanejado)} m³
            </p>
          </div>
        </div>

        {item.salvo && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <span className="text-xs font-semibold text-emerald-700">
              Realizado: {item.quantidadeRealizada} m³
            </span>
            <span className="text-xs font-bold text-emerald-700">
              {item.volumePlanejado > 0
                ? `${Math.round((parseFloat(item.quantidadeRealizada) / item.volumePlanejado) * 100)}%`
                : "—"}
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onSelecionar}
        className="flex w-full items-center justify-center gap-2 border-t border-border bg-muted/40 py-3 text-sm font-semibold text-primary hover:bg-muted"
      >
        {item.salvo ? (
          <>
            <CheckCircle2 className="h-4 w-4" /> Editar apontamento
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" /> Lançar realizado
          </>
        )}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Formulário de realizado
// ---------------------------------------------------------------------------
function FormRealizado({
  item,
  onVoltar,
  onSalvar,
}: {
  item: ApontamentoItem;
  onVoltar: () => void;
  onSalvar: (item: ApontamentoItem) => void;
}) {
  const [form, setForm] = useState<ApontamentoItem>({ ...item });

  const setField = <K extends keyof ApontamentoItem>(k: K, v: ApontamentoItem[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const updateMaterial = (id: string, patch: Partial<MaterialRealizado>) =>
    setForm((p) => ({
      ...p,
      materiais: p.materiais.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));

  const addMaterial = () =>
    setForm((p) => ({
      ...p,
      materiais: [
        ...p.materiais,
        {
          id: uid(),
          nome: "",
          unidade: "",
          quantidadeManual: "",
          freteAtivo: false,
          cargas: [],
        },
      ],
    }));

  const removeMaterial = (id: string) =>
    setForm((p) => ({ ...p, materiais: p.materiais.filter((m) => m.id !== id) }));

  const updateEquipamento = (id: string, patch: Partial<EquipamentoRealizado>) =>
    setForm((p) => ({
      ...p,
      equipamentos: p.equipamentos.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));

  const updateMaoObra = (id: string, patch: Partial<MaoObraRealizada>) =>
    setForm((p) => ({
      ...p,
      maoObra: p.maoObra.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onVoltar}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {form.frente}
          </p>
          <h1 className="text-base font-bold text-foreground">{form.descricao}</h1>
        </div>
      </div>

      {/* Referência planejada */}
      <div className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          📋 Referência do planejamento
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Comprimento", value: `${fmt(form.comprimento)} m` },
            { label: "Largura", value: `${fmt(form.largura)} m` },
            { label: "Espessura", value: `${fmt(form.espessura)} m` },
            { label: "Densidade", value: `${fmt(form.densidade)} t/m³` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-muted/50 p-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="text-xs font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-primary/5 p-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-primary/70">
              Área planejada
            </p>
            <p className="text-sm font-bold text-foreground">
              {fmt(form.areaPlanejada)} m²
            </p>
          </div>
          <div className="rounded-lg bg-primary/5 p-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-primary/70">
              Volume planejado
            </p>
            <p className="text-sm font-bold text-foreground">
              {fmt(form.volumePlanejado)} m³
            </p>
          </div>
        </div>
      </div>

      {/* Quantidade realizada */}
      <div className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          📐 Quantidade realizada
        </p>

        <p className="text-[11px] font-medium text-muted-foreground">
          Parâmetros medidos em campo
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Comprimento (m)">
            <input
              type="number"
              inputMode="decimal"
              value={form.comprimentoRealizado}
              onChange={(e) => {
                const v = e.target.value;
                const c = parseFloat(v) || 0;
                const l = parseFloat(form.larguraRealizada) || 0;
                const esp = parseFloat(form.espessuraRealizada) || 0;
                const area = c * l;
                const vol = c * l * esp;
                const peso = vol * form.densidade;
                setForm((p) => ({
                  ...p,
                  comprimentoRealizado: v,
                  areaRealizada: area,
                  volumeRealizado: vol,
                  pesoRealizado: peso,
                  quantidadeRealizada: vol.toFixed(3),
                }));
              }}
              placeholder="0"
              className="h-11 w-full rounded-xl border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>
          <Field label="Largura (m)">
            <input
              type="number"
              inputMode="decimal"
              value={form.larguraRealizada}
              onChange={(e) => {
                const v = e.target.value;
                const c = parseFloat(form.comprimentoRealizado) || 0;
                const l = parseFloat(v) || 0;
                const esp = parseFloat(form.espessuraRealizada) || 0;
                const area = c * l;
                const vol = c * l * esp;
                const peso = vol * form.densidade;
                setForm((p) => ({
                  ...p,
                  larguraRealizada: v,
                  areaRealizada: area,
                  volumeRealizado: vol,
                  pesoRealizado: peso,
                  quantidadeRealizada: vol.toFixed(3),
                }));
              }}
              placeholder="0"
              className="h-11 w-full rounded-xl border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>
        </div>

        <Field label="Espessura (m)">
          <input
            type="number"
            inputMode="decimal"
            value={form.espessuraRealizada}
            onChange={(e) => {
              const v = e.target.value;
              const c = parseFloat(form.comprimentoRealizado) || 0;
              const l = parseFloat(form.larguraRealizada) || 0;
              const esp = parseFloat(v) || 0;
              const area = c * l;
              const vol = c * l * esp;
              const peso = vol * form.densidade;
              setForm((p) => ({
                ...p,
                espessuraRealizada: v,
                areaRealizada: area,
                volumeRealizado: vol,
                pesoRealizado: peso,
                quantidadeRealizada: vol.toFixed(3),
              }));
            }}
            placeholder="0"
            className="h-11 w-full rounded-xl border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </Field>

        {/* Calculados */}
        <div className="space-y-2 rounded-xl bg-muted/50 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Calculado automaticamente · densidade planejada {fmt(form.densidade)} t/m³
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-card p-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Área realizada
              </p>
              <p className="text-xs font-bold text-foreground">
                {fmt(form.areaRealizada)} m²
              </p>
            </div>
            <div className="rounded-lg bg-card p-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Volume realizado
              </p>
              <p className="text-xs font-bold text-foreground">
                {fmt(form.volumeRealizado)} m³
              </p>
            </div>
            <div className="rounded-lg bg-card p-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Peso realizado
              </p>
              <p className="text-xs font-bold text-foreground">
                {fmt(form.pesoRealizado)} t
              </p>
            </div>
          </div>
        </div>

        {/* Aderência */}
        {form.volumePlanejado > 0 && (
          <div className="space-y-1.5">
            {(() => {
              const pct = Math.min((form.volumeRealizado / form.volumePlanejado) * 100, 100);
              const color =
                pct >= 90 ? "text-emerald-700" : pct >= 60 ? "text-amber-700" : "text-red-700";
              const barColor =
                pct >= 90 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500";
              return (
                <>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={color}>Aderência ao planejamento</span>
                    <span className={color}>{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${barColor} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Volume: {fmt(form.volumeRealizado)} m³ de {fmt(form.volumePlanejado)} m³ planejados
                  </p>
                </>
              );
            })()}
          </div>
        )}

        {/* Estacas */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Estaca inicial">
            <input
              type="text"
              value={form.estacaInicial}
              onChange={(e) => setField("estacaInicial", e.target.value)}
              placeholder={form.refIni}
              className="h-11 w-full rounded-xl border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>
          <Field label="Estaca final">
            <input
              type="text"
              value={form.estacaFinal}
              onChange={(e) => setField("estacaFinal", e.target.value)}
              placeholder={form.refFim}
              className="h-11 w-full rounded-xl border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>
        </div>
      </div>

      {/* Materiais */}
      <div className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          📦 Material utilizado
        </p>

        {form.materiais.length === 0 && (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
            Nenhum material adicionado.
          </p>
        )}

        {form.materiais.map((mat) => (
          <MaterialCard
            key={mat.id}
            material={mat}
            onChange={(patch) => updateMaterial(mat.id, patch)}
            onRemove={() => removeMaterial(mat.id)}
          />
        ))}

        <button
          type="button"
          onClick={addMaterial}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" /> Adicionar material
        </button>
      </div>

      {/* Confirmação de equipe (opcional — só aparece se houver equipe planejada) */}
      {form.equipeNome && (
        <EquipeConfirmBlock
          equipeNome={form.equipeNome}
          confirmacao={form.equipeConfirmacao}
          equipeSubstitutaId={form.equipeSubstitutaId}
          onConfirmacao={(v) => setForm((p) => ({ ...p, equipeConfirmacao: p.equipeConfirmacao === v ? undefined : v }))}
          onSubstituta={(id) => setForm((p) => ({ ...p, equipeSubstitutaId: id }))}
        />
      )}

      {/* Equipamentos */}
      <div className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          🏗️ Equipamentos
        </p>
        <p className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-center text-xs italic text-muted-foreground">
          Em breve
        </p>
      </div>

      {/* Mão de obra */}
      <div className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          👷 Mão de obra
        </p>
        <p className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-center text-xs italic text-muted-foreground">
          Em breve
        </p>
      </div>

      <button
        type="button"
        onClick={() => onSalvar(form)}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-md"
      >
        <CheckCircle2 className="h-5 w-5" /> Salvar apontamento
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EquipeConfirmBlock

function EquipeConfirmBlock({
  equipeNome,
  confirmacao,
  equipeSubstitutaId,
  onConfirmacao,
  onSubstituta,
}: {
  equipeNome: string;
  confirmacao?: "confirmada" | "substituida" | "ignorar";
  equipeSubstitutaId?: string;
  onConfirmacao: (v: "confirmada" | "substituida" | "ignorar") => void;
  onSubstituta: (id: string) => void;
}) {
  const equipes = useEquipes();

  const OPCOES = [
    {
      value: "confirmada" as const,
      label: "Confirmada",
      icon: "✓",
      activeClass: "bg-emerald-500 border-emerald-500 text-white",
    },
    {
      value: "substituida" as const,
      label: "Substituída",
      icon: "✕",
      activeClass: "bg-red-100 border-red-300 text-red-700",
    },
    {
      value: "ignorar" as const,
      label: "Ignorar",
      icon: "—",
      activeClass: "bg-muted border-border text-muted-foreground",
    },
  ];

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          👷 Equipe executora planejada
        </p>
        <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          opcional
        </span>
      </div>
      <p className="text-sm font-semibold text-foreground">{equipeNome}</p>
      <div className="grid grid-cols-3 gap-2">
        {OPCOES.map(({ value, label, icon, activeClass }) => {
          const isActive = confirmacao === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onConfirmacao(value)}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-xl border-2 text-[9px] font-semibold transition-colors ${
                isActive
                  ? activeClass
                  : "border-border bg-background text-muted-foreground hover:border-primary/40"
              }`}
            >
              <span className="text-[11px]">{icon}</span> {label}
            </button>
          );
        })}
      </div>

      {/* Select de equipe substituta — aparece só quando Substituída está ativo */}
      {confirmacao === "substituida" && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Equipe que executou</p>
          <select
            value={equipeSubstitutaId ?? ""}
            onChange={(e) => onSubstituta(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Selecione a equipe</option>
            {equipes.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.nome}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MaterialCard
// ---------------------------------------------------------------------------
function MaterialCard({
  material,
  onChange,
  onRemove,
}: {
  material: MaterialRealizado;
  onChange: (patch: Partial<MaterialRealizado>) => void;
  onRemove: () => void;
}) {
  const totalFrete = somaCargas(material.cargas);

  const addCarga = () =>
    onChange({
      cargas: [
        ...material.cargas,
        { id: uid(), placa: "", horaDescarga: "", quantidade: "", fotoUrl: null },
      ],
    });

  const updateCarga = (id: string, patch: Partial<Carga>) =>
    onChange({
      cargas: material.cargas.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });

  const removeCarga = (id: string) =>
    onChange({ cargas: material.cargas.filter((c) => c.id !== id) });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="space-y-3 p-3">
        <div className="grid grid-cols-[1fr_80px_auto] gap-2">
          <Field label="Material">
            <input
              type="text"
              value={material.nome}
              onChange={(e) => onChange({ nome: e.target.value })}
              placeholder="Ex: Solo argiloso"
              className="h-10 w-full rounded-lg border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>
          <Field label="Unidade">
            <input
              type="text"
              value={material.unidade}
              onChange={(e) => onChange({ unidade: e.target.value })}
              placeholder="m³"
              className="h-10 w-full rounded-lg border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>
          <div className="flex items-end">
            <button
              type="button"
              onClick={onRemove}
              className="grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {material.freteAtivo ? (
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3">
            <div>
              <p className="text-[11px] font-semibold text-foreground">
                Quantidade utilizada ({material.unidade || "—"})
              </p>
              <p className="text-[10px] text-muted-foreground">
                Somado automaticamente pelo frete
              </p>
            </div>
            <span className="text-sm font-bold text-foreground">
              {totalFrete > 0 ? totalFrete.toFixed(2) : "0"} {material.unidade}
            </span>
          </div>
        ) : (
          <Field label={`Quantidade utilizada ${material.unidade ? `(${material.unidade})` : ""}`}>
            <input
              type="number"
              inputMode="decimal"
              value={material.quantidadeManual}
              onChange={(e) => onChange({ quantidadeManual: e.target.value })}
              placeholder="0"
              className="h-11 w-full rounded-xl border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>
        )}
      </div>

      {/* Toggle frete */}
      <button
        type="button"
        onClick={() => onChange({ freteAtivo: !material.freteAtivo })}
        className="flex w-full items-center justify-between border-t border-border bg-muted px-3 py-2.5"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Truck className="h-4 w-4 text-indigo-600" />
          Apontar frete
          <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
            Opcional
          </span>
        </span>
        <span className="text-muted-foreground">
          {material.freteAtivo ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      {/* Cargas */}
      {material.freteAtivo && (
        <div className="space-y-2 border-t border-border bg-muted/30 p-3">
          <p className="text-[11px] font-medium text-muted-foreground">
            {material.cargas.length} carga(s) · Total:{" "}
            {totalFrete > 0 ? totalFrete.toFixed(2) : "0"} {material.unidade}
          </p>

          {material.cargas.map((carga, idx) => (
            <CargaCard
              key={carga.id}
              carga={carga}
              numero={idx + 1}
              unidade={material.unidade}
              onChange={(patch) => updateCarga(carga.id, patch)}
              onRemove={() => removeCarga(carga.id)}
            />
          ))}

          <button
            type="button"
            onClick={addCarga}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-indigo-300 bg-indigo-50 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar carga
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CargaCard
// ---------------------------------------------------------------------------
function CargaCard({
  carga,
  numero,
  unidade,
  onChange,
  onRemove,
}: {
  carga: Carga;
  numero: number;
  unidade: string;
  onChange: (patch: Partial<Carga>) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const carreteiros = useCarreteiros();

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ fotoUrl: url });
  };

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-indigo-700">
          Carga {numero}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:text-red-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Field label="Placa">
          {carreteiros.length === 0 ? (
            <input
              type="text"
              value={carga.placa}
              onChange={(e) => onChange({ placa: e.target.value.toUpperCase() })}
              placeholder="ABC1D23"
              maxLength={8}
              className="h-10 w-full rounded-lg border border-input px-2 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          ) : (
            <select
              value={carga.placa}
              onChange={(e) => onChange({ placa: e.target.value })}
              className="h-10 w-full rounded-lg border border-indigo-300 bg-indigo-50 px-2 text-xs font-mono font-bold uppercase text-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              <option value="">Selecionar</option>
              {carreteiros.map((c) => (
                <option key={c.id} value={c.placa}>
                  {c.placa} — {c.motorista}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Hora">
          <input
            type="time"
            value={carga.horaDescarga}
            onChange={(e) => onChange({ horaDescarga: e.target.value })}
            className="h-10 w-full rounded-lg border border-input px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </Field>
        <Field label={`Qtd ${unidade ? `(${unidade})` : ""}`}>
          <input
            type="number"
            inputMode="decimal"
            value={carga.quantidade}
            onChange={(e) => onChange({ quantidade: e.target.value })}
            placeholder="0"
            className="h-10 w-full rounded-lg border border-input px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </Field>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFoto}
        className="hidden"
      />

      {carga.fotoUrl ? (
        <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-2">
          <img
            src={carga.fotoUrl}
            alt={`Ticket carga ${numero}`}
            className="h-10 w-10 shrink-0 rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-indigo-700">Foto do ticket</p>
            <p className="text-[10px] text-indigo-600/80">Toque para substituir</p>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center gap-3 rounded-lg border border-dashed border-indigo-300 bg-indigo-50 p-2.5 transition-colors hover:bg-indigo-100"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-100 text-indigo-600">
            <Camera className="h-4 w-4" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[11px] font-semibold text-indigo-700">Tirar foto do ticket</p>
            <p className="text-[10px] text-indigo-600/80">Opcional · 1 foto por carga</p>
          </div>
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FormAvulso
// ---------------------------------------------------------------------------
function FormAvulso({
  frentes,
  equipamentos,
  maoObra,
  onVoltar,
  onSalvar,
}: {
  frentes: { id: string; nome: string }[];
  equipamentos: { id: string; prefixo: string; descricao: string }[];
  maoObra: { id: string; funcao: string }[];
  onVoltar: () => void;
  onSalvar: () => void;
}) {
  const [frenteNome, setFrenteNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [materiais, setMateriais] = useState<MaterialRealizado[]>([]);

  const addMaterial = () =>
    setMateriais((p) => [
      ...p,
      {
        id: uid(),
        nome: "",
        unidade: "",
        quantidadeManual: "",
        freteAtivo: false,
        cargas: [],
      },
    ]);

  const updateMaterial = (id: string, patch: Partial<MaterialRealizado>) =>
    setMateriais((p) => p.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const removeMaterial = (id: string) =>
    setMateriais((p) => p.filter((m) => m.id !== id));

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onVoltar}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Apontamento avulso</h1>
          <p className="text-xs text-muted-foreground">Serviço não planejado</p>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <Field label="Frente">
          <select
            value={frenteNome}
            onChange={(e) => setFrenteNome(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Selecionar frente</option>
            {frentes.map((f) => (
              <option key={f.id} value={f.nome}>
                {f.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Descrição">
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o serviço realizado..."
            rows={3}
            className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </Field>
        <Field label="Quantidade realizada">
          <input
            type="number"
            inputMode="decimal"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            placeholder="0"
            className="h-11 w-full rounded-xl border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </Field>
      </div>

      <div className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          📦 Material utilizado
        </p>
        {materiais.map((mat) => (
          <MaterialCard
            key={mat.id}
            material={mat}
            onChange={(patch) => updateMaterial(mat.id, patch)}
            onRemove={() => removeMaterial(mat.id)}
          />
        ))}
        <button
          type="button"
          onClick={addMaterial}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" /> Adicionar material
        </button>
      </div>

      <button
        type="button"
        onClick={onSalvar}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-md"
      >
        <CheckCircle2 className="h-5 w-5" /> Salvar apontamento
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Utilitário
// ---------------------------------------------------------------------------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
