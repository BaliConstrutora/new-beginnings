import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
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
  categoria: string;
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
  quantidadeRealizada: string;
  estacaInicial: string;
  estacaFinal: string;
  materiais: MaterialRealizado[];
  equipamentos: EquipamentoRealizado[];
  maoObra: MaoObraRealizada[];
  salvo: boolean;
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
  const [itemSelecionado, setItemSelecionado] =
    useState<ApontamentoItem | null>(null);
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
      const C = parseFloat(s.comprimento) || 0;
      const L = parseFloat(s.largura) || 0;
      const E = parseFloat(s.espessura) || 0;
      const D = parseFloat(s.densidade) || 0;
      return {
        itemId: s.id,
        descricao: s.servico,
        frente:
          frentesCad.find((f) => f.id === plano.frente)?.nome ?? plano.frente,
        refIni: s.kmInicial,
        refFim: s.kmFinal,
        comprimento: C,
        largura: L,
        espessura: E,
        densidade: D,
        areaPlanejada: C * L,
        volumePlanejado: C * L * E,
        quantidadeRealizada: "",
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
          funcao: m.funcao,
          categoria: m.categoria,
          horasNormais: "",
          horasExtras: "",
        })),
        salvo: false,
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
      <div className="px-4 py-6 space-y-5 max-w-2xl mx-auto">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            {hojeLabel}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Apontamento Diário
          </h1>
        </header>

        <div className="space-y-3">
          <button
            onClick={() => setTela("lista")}
            className="w-full flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Selecionar item planejado</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {plano
                  ? `${itensDoDia.length} itens planejados para hoje`
                  : "Nenhum planejamento para hoje"}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </button>

          <button
            onClick={() => setTela("avulso")}
            className="w-full flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
              <Plus className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Novo apontamento avulso</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Serviço não planejado
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </button>
        </div>
      </div>
    );
  }

  // ---- TELA LISTA ----
  if (tela === "lista") {
    return (
      <div className="px-4 py-6 space-y-5 max-w-2xl mx-auto">
        <header className="flex items-center gap-3">
          <button
            onClick={() => setTela("inicio")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight">Itens planejados</h1>
            <p className="text-xs text-muted-foreground">{hojeLabel}</p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Total planejado
            </p>
            <p className="text-xl font-bold mt-0.5">
              {itensDoDia.length}{" "}
              <span className="text-xs text-muted-foreground font-normal">
                itens
              </span>
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Apontados hoje
            </p>
            <p className="text-xl font-bold mt-0.5 text-primary">
              {apontados}{" "}
              <span className="text-xs text-muted-foreground font-normal">
                de {itensDoDia.length}
              </span>
            </p>
          </div>
        </div>

        {itensDoDia.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center space-y-2">
            <ClipboardList className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum item planejado para hoje.
            </p>
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
// Card de item planejado na lista
// ---------------------------------------------------------------------------
function ItemPlanejadoCard({
  item,
  onSelecionar,
}: {
  item: ApontamentoItem;
  onSelecionar: () => void;
}) {
  const pct =
    item.salvo && item.volumePlanejado > 0
      ? Math.round(
          (parseFloat(item.quantidadeRealizada || "0") / item.volumePlanejado) *
            100,
        )
      : 0;

  return (
    <div className="rounded-2xl border-2 border-border bg-card overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {item.frente}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
              item.salvo
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {item.salvo ? "Apontado" : "Pendente"}
          </span>
        </div>

        <p className="font-semibold text-sm leading-snug">{item.descricao}</p>
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
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="text-xs font-semibold mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border p-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Área planejada
            </p>
            <p className="text-sm font-bold mt-0.5">
              {fmt(item.areaPlanejada)} m²
            </p>
          </div>
          <div className="rounded-lg border border-border p-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Volume planejado
            </p>
            <p className="text-sm font-bold mt-0.5">
              {fmt(item.volumePlanejado)} m³
            </p>
          </div>
        </div>

        {item.salvo && (
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
            <span className="text-xs font-semibold text-emerald-700">
              Realizado: {item.quantidadeRealizada || "0"} m³
            </span>
            <span className="text-xs font-bold text-emerald-700">
              {item.volumePlanejado > 0 ? `${pct}%` : "—"}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={onSelecionar}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold py-3 hover:bg-primary/90 transition-colors"
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

  const setField = <K extends keyof ApontamentoItem>(
    k: K,
    v: ApontamentoItem[K],
  ) => setForm((p) => ({ ...p, [k]: v }));

  const updateMaterial = (id: string, patch: Partial<MaterialRealizado>) =>
    setForm((p) => ({
      ...p,
      materiais: p.materiais.map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      ),
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
    setForm((p) => ({
      ...p,
      materiais: p.materiais.filter((m) => m.id !== id),
    }));

  const updateEquipamento = (
    id: string,
    patch: Partial<EquipamentoRealizado>,
  ) =>
    setForm((p) => ({
      ...p,
      equipamentos: p.equipamentos.map((e) =>
        e.id === id ? { ...e, ...patch } : e,
      ),
    }));

  const updateMaoObra = (id: string, patch: Partial<MaoObraRealizada>) =>
    setForm((p) => ({
      ...p,
      maoObra: p.maoObra.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));

  return (
    <div className="px-4 py-6 space-y-5 max-w-2xl mx-auto pb-24">
      <header className="flex items-center gap-3">
        <button
          onClick={onVoltar}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            {form.frente}
          </p>
          <h1 className="text-base font-bold leading-tight truncate">
            {form.descricao}
          </h1>
        </div>
      </header>

      {/* Referência planejada */}
      <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          📋 Referência do planejamento
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Comprimento", value: `${fmt(form.comprimento)} m` },
            { label: "Largura", value: `${fmt(form.largura)} m` },
            { label: "Espessura", value: `${fmt(form.espessura)} m` },
            { label: "Densidade", value: `${fmt(form.densidade)} t/m³` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-muted/50 p-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="text-xs font-semibold mt-0.5">{value}</p>
            </div>
          ))}
          <div className="rounded-lg border border-border p-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Área planejada
            </p>
            <p className="text-sm font-bold mt-0.5">
              {fmt(form.areaPlanejada)} m²
            </p>
          </div>
          <div className="rounded-lg border border-border p-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Volume planejado
            </p>
            <p className="text-sm font-bold mt-0.5">
              {fmt(form.volumePlanejado)} m³
            </p>
          </div>
        </div>
      </div>

      {/* Quantidade realizada */}
      <div className="rounded-2xl border-2 border-primary/30 bg-card p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          ✏️ Quantidade realizada
        </p>
        <Field label="Volume executado (m³)">
          <input
            type="number"
            value={form.quantidadeRealizada}
            onChange={(e) => setField("quantidadeRealizada", e.target.value)}
            placeholder="0"
            className="h-12 w-full rounded-xl border-2 border-primary px-3 text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
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
      <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          📦 Material utilizado
        </p>

        {form.materiais.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
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
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" /> Adicionar material
        </button>
      </div>

      {/* Equipamentos */}
      <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          🏗️ Equipamentos
        </p>
        {form.equipamentos.map((eq) => (
          <div
            key={eq.id}
            className="rounded-xl border border-border p-3 space-y-2"
          >
            <p className="text-xs font-semibold">
              {eq.prefixo} — {eq.descricao}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Horímetro inicial">
                <input
                  type="number"
                  value={eq.horimetroInicial}
                  onChange={(e) =>
                    updateEquipamento(eq.id, {
                      horimetroInicial: e.target.value,
                    })
                  }
                  placeholder="0"
                  className="h-11 w-full rounded-xl border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </Field>
              <Field label="Horímetro final">
                <input
                  type="number"
                  value={eq.horimetroFinal}
                  onChange={(e) =>
                    updateEquipamento(eq.id, {
                      horimetroFinal: e.target.value,
                    })
                  }
                  placeholder="0"
                  className="h-11 w-full rounded-xl border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </Field>
            </div>
          </div>
        ))}
        {form.equipamentos.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Nenhum equipamento cadastrado.
          </p>
        )}
      </div>

      {/* Mão de Obra */}
      <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          👷 Mão de obra
        </p>
        {form.maoObra.map((mo) => (
          <div
            key={mo.id}
            className="rounded-xl border border-border p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold">{mo.funcao}</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wide">
                {mo.categoria}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Horas normais">
                <input
                  type="number"
                  value={mo.horasNormais}
                  onChange={(e) =>
                    updateMaoObra(mo.id, { horasNormais: e.target.value })
                  }
                  placeholder="0"
                  className="h-11 w-full rounded-xl border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </Field>
              <Field label="Horas extras">
                <input
                  type="number"
                  value={mo.horasExtras}
                  onChange={(e) =>
                    updateMaoObra(mo.id, { horasExtras: e.target.value })
                  }
                  placeholder="0"
                  className="h-11 w-full rounded-xl border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </Field>
            </div>
          </div>
        ))}
        {form.maoObra.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Nenhuma função cadastrada.
          </p>
        )}
      </div>

      <button
        onClick={() => onSalvar(form)}
        className="h-14 w-full rounded-2xl bg-primary text-primary-foreground text-base font-bold flex items-center justify-center gap-2 shadow-md"
      >
        <CheckCircle2 className="h-5 w-5" /> Salvar apontamento
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card de material com frete
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
        {
          id: uid(),
          placa: "",
          horaDescarga: "",
          quantidade: "",
          fotoUrl: null,
        },
      ],
    });

  const updateCarga = (id: string, patch: Partial<Carga>) =>
    onChange({
      cargas: material.cargas.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    });

  const removeCarga = (id: string) =>
    onChange({ cargas: material.cargas.filter((c) => c.id !== id) });

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <div className="p-3 space-y-3">
        <div className="grid grid-cols-[1fr_80px_auto] gap-2 items-end">
          <Field label="Material">
            <input
              type="text"
              value={material.nome}
              onChange={(e) => onChange({ nome: e.target.value })}
              placeholder="Ex: Solo argiloso"
              className="h-10 w-full rounded-lg border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>
          <Field label="Unid.">
            <input
              type="text"
              value={material.unidade}
              onChange={(e) => onChange({ unidade: e.target.value })}
              placeholder="m³"
              className="h-10 w-full rounded-lg border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </Field>
          <button
            type="button"
            onClick={onRemove}
            className="grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {material.freteAtivo ? (
          <div className="flex items-center justify-between rounded-lg bg-indigo-50 p-2.5">
            <div>
              <p className="text-[11px] font-semibold text-indigo-900">
                Quantidade utilizada ({material.unidade || "—"})
              </p>
              <p className="text-[10px] text-indigo-700">
                Somado automaticamente pelo frete
              </p>
            </div>
            <span className="text-sm font-bold text-indigo-900">
              {totalFrete > 0 ? totalFrete.toFixed(2) : "0"} {material.unidade}
            </span>
          </div>
        ) : (
          <Field label={`Quantidade (${material.unidade || "—"})`}>
            <input
              type="number"
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
        className="w-full flex items-center justify-between px-3 py-2.5 bg-muted border-t border-border"
      >
        <span className="flex items-center gap-2 text-xs font-semibold">
          <Truck className="h-4 w-4 text-indigo-600" />
          Apontar frete
          <span className="text-[10px] text-muted-foreground font-normal">
            Opcional
          </span>
        </span>
        <span
          className={`relative inline-block h-5 w-9 rounded-full transition-colors ${
            material.freteAtivo ? "bg-indigo-600" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              material.freteAtivo ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </span>
      </button>

      {/* Cargas */}
      {material.freteAtivo && (
        <div className="p-3 space-y-2 bg-indigo-50/40 border-t border-border">
          <p className="text-[11px] font-semibold text-indigo-900">
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
            className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-indigo-300 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Plus className="h-4 w-4" /> Adicionar carga
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card de carga individual
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
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ fotoUrl: url });
  };

  return (
    <div className="rounded-lg border border-indigo-200 bg-white p-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-indigo-900">
          Carga {numero}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <Field label="Placa">
          <input
            type="text"
            value={carga.placa}
            onChange={(e) =>
              onChange({ placa: e.target.value.toUpperCase() })
            }
            placeholder="ABC1D23"
            maxLength={8}
            className="h-10 w-full rounded-lg border border-input px-2 text-xs uppercase font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </Field>
        <Field label="Hora">
          <input
            type="time"
            value={carga.horaDescarga}
            onChange={(e) => onChange({ horaDescarga: e.target.value })}
            className="h-10 w-full rounded-lg border border-input px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </Field>
        <Field label={`Qtd ${unidade || ""}`}>
          <input
            type="number"
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
        <div className="flex items-center gap-2 rounded-lg border border-indigo-200 p-2 bg-indigo-50">
          <img
            src={carga.fotoUrl}
            alt={`Ticket carga ${numero}`}
            className="h-10 w-10 rounded-md object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-indigo-900">
              Foto do ticket
            </p>
            <p className="text-[10px] text-indigo-700">Toque para substituir</p>
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
          className="w-full flex items-center gap-3 rounded-lg border border-dashed border-indigo-300 p-2.5 bg-indigo-50 hover:bg-indigo-100 transition-colors"
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-100 text-indigo-600">
            <Camera className="h-4 w-4" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[11px] font-semibold text-indigo-900">
              Tirar foto do ticket
            </p>
            <p className="text-[10px] text-indigo-700">
              Opcional · 1 foto por carga
            </p>
          </div>
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Formulário avulso
// ---------------------------------------------------------------------------
function FormAvulso({
  frentes,
  onVoltar,
  onSalvar,
}: {
  frentes: { id: string; nome: string }[];
  equipamentos: { id: string; prefixo: string; descricao: string }[];
  maoObra: { id: string; funcao: string; categoria: string }[];
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
    <div className="px-4 py-6 space-y-5 max-w-2xl mx-auto pb-24">
      <header className="flex items-center gap-3">
        <button
          onClick={onVoltar}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-bold leading-tight">
            Apontamento avulso
          </h1>
          <p className="text-xs text-muted-foreground">Serviço não planejado</p>
        </div>
      </header>

      <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-3">
        <Field label="Frente">
          <select
            value={frenteNome}
            onChange={(e) => setFrenteNome(e.target.value)}
            className="h-11 w-full rounded-xl border border-input px-3 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
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
            className="w-full rounded-xl border border-input px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </Field>
        <Field label="Quantidade realizada">
          <input
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            placeholder="0"
            className="h-11 w-full rounded-xl border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </Field>
      </div>

      <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-3">
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
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" /> Adicionar material
        </button>
      </div>

      <button
        onClick={onSalvar}
        className="h-14 w-full rounded-2xl bg-primary text-primary-foreground text-base font-bold flex items-center justify-center gap-2 shadow-md"
      >
        <CheckCircle2 className="h-5 w-5" /> Salvar apontamento
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Utilitário
// ---------------------------------------------------------------------------
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

// Suprimir aviso de import não usado: ChevronDown reservado para evoluções
void ChevronDown;
