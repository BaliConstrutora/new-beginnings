import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Lock,
  Calculator,
  Upload,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Inbox,
} from "lucide-react";
import { useObra, useHydrated } from "@/lib/obra-store";
import { useFrentes } from "@/lib/cadastros-store";
import { savePlanejamento, uid } from "@/lib/planejamento-store";

export const Route = createFileRoute("/planejamento")({
  head: () => ({
    meta: [
      { title: "Planejamento — Bora Bora" },
      {
        name: "description",
        content: "Planeje serviços, áreas, volumes e quantidades por frente.",
      },
    ],
  }),
  component: PlanejamentoPage,
});

type ItemPlanejado = {
  id: string;
  frente: string;
  descricao: string;
  servico: string;
  unidade: string;
  data: string;
  refIni: string;
  refFim: string;
  faixa: string;
  pista: string;
  comprimento: number;
  largura: number;
  espessura: number;
  densidade: number;
  area: number;
  volume: number;
  peso: number;
  qtdPlanejada: number;
  status: string;
};

const STORAGE_KEY = "borabora.planejamento.itens";

function loadItens(): ItemPlanejado[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ItemPlanejado[]) : [];
  } catch {
    return [];
  }
}
function saveItens(itens: ItemPlanejado[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
}

const num = (v: string | number) => parseFloat(String(v)) || 0;

function calcular(c: string, l: string, e: string, d: string) {
  const C = num(c),
    L = num(l),
    E = num(e),
    D = num(d);
  return { area: C * L, volume: C * L * E, peso: C * L * E * D };
}

function fmt(v: number, decimais = 2) {
  return v > 0 ? v.toFixed(decimais) : "—";
}

function PlanejamentoPage() {
  const navigate = useNavigate();
  const obra = useObra();
  const hydrated = useHydrated();
  const frentesCad = useFrentes();

  useEffect(() => {
    if (hydrated && !obra) navigate({ to: "/" });
  }, [hydrated, obra, navigate]);

  const [openSections, setOpenSections] = useState<number[]>([0, 1, 2]);
  const [itens, setItens] = useState<ItemPlanejado[]>([]);
  const [filtroData, setFiltroData] = useState("");
  const [hojeLabel, setHojeLabel] = useState("");

  useEffect(() => {
    setItens(loadItens());
    setFiltroData(new Date().toISOString().split("T")[0]);
    setHojeLabel(
      new Date().toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    );
  }, []);

  useEffect(() => {
    if (hydrated) saveItens(itens);
  }, [itens, hydrated]);

  const toggleSection = (i: number) =>
    setOpenSections((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));

  const adicionarItem = (item: ItemPlanejado) => setItens((p) => [item, ...p]);
  const removerItem = (id: string) => setItens((p) => p.filter((i) => i.id !== id));

  const itensDoDia = itens.filter((i) => i.data === filtroData);

  const frentesDisponiveis = useMemo(
    () => frentesCad.map((f) => f.nome),
    [frentesCad],
  );

  const handleConfirmar = () => {
    if (itensDoDia.length === 0) return;
    const frente = itensDoDia[0].frente;
    savePlanejamento({
      data: filtroData,
      frente,
      servicos: itensDoDia.map((i) => ({
        id: i.id,
        data: i.data,
        kmInicial: i.refIni,
        kmFinal: i.refFim,
        faixa: i.faixa,
        pista: i.pista,
        comprimento: String(i.comprimento),
        largura: String(i.largura),
        espessura: String(i.espessura),
        densidade: String(i.densidade),
        servico: i.frente,
        metaQuantidade: String(i.qtdPlanejada),
        unidade: i.unidade,
      })),
      equipe: [],
      equipamentos: [],
    });
    toast.success("Planejamento do dia confirmado!");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="px-4 pt-6 pb-4 bg-white border-b border-gray-100">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Planejamento</h1>
            <p className="text-xs text-gray-500 capitalize">{hojeLabel}</p>
          </div>
          {obra && (
            <span className="text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">
              {obra}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Itens hoje", value: String(itensDoDia.length) },
            {
              label: "Área total",
              value: `${itensDoDia.reduce((s, i) => s + i.area, 0).toFixed(0)} m²`,
            },
            {
              label: "Volume total",
              value: `${itensDoDia.reduce((s, i) => s + i.volume, 0).toFixed(1)} m³`,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
            >
              <div className="text-sm font-semibold text-gray-900">{value}</div>
              <div className="text-[11px] text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Seção 0 — Importar planilha */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <SectionHeader
            number="0"
            title="Importar planilha"
            isOpen={openSections.includes(0)}
            onToggle={() => toggleSection(0)}
          />
          {openSections.includes(0) && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                Envie um arquivo .xlsx ou .csv com as colunas: frente, data,
                km_ini, km_fim, comprimento, largura, espessura, densidade.
              </p>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-orange-300 bg-orange-50/50 rounded-2xl py-6 cursor-pointer hover:bg-orange-50 transition-colors">
                <FileSpreadsheet className="text-orange-500" size={28} />
                <span className="text-sm font-semibold text-orange-700">
                  Selecionar arquivo
                </span>
                <span className="text-[11px] text-gray-500">Excel ou CSV</span>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const frenteNome = frentesDisponiveis[0] ?? "Frente 1";
                    const mock: ItemPlanejado[] = [1, 2, 3].map((n) => ({
                      id: `mock-${Date.now()}-${n}`,
                      frente: frenteNome,
                      descricao: `Item importado ${n}`,
                      servico: frenteNome,
                      unidade: "m³",
                      data: filtroData,
                      refIni: `KM 0+${n * 250}`,
                      refFim: `KM 0+${(n + 1) * 250}`,
                      faixa: "Faixa 1",
                      pista: "Norte",
                      comprimento: 250,
                      largura: 3.5,
                      espessura: 0.05,
                      densidade: 2.4,
                      area: 250 * 3.5,
                      volume: 250 * 3.5 * 0.05,
                      peso: 250 * 3.5 * 0.05 * 2.4,
                      qtdPlanejada: 250 * 3.5 * 0.05,
                      status: "planejado",
                    }));
                    setItens((p) => [...mock, ...p]);
                    toast.success("Planejamento importado com sucesso!");
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          )}
        </section>

        {/* Seção 1 — Novo item */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <SectionHeader
            number="1"
            title="Adicionar item planejado"
            isOpen={openSections.includes(1)}
            onToggle={() => toggleSection(1)}
          />
          {openSections.includes(1) && (
            <div className="px-4 pb-4">
              <FormNovoItem
                onSalvar={adicionarItem}
                frentesDisponiveis={frentesDisponiveis}
              />
            </div>
          )}
        </section>

        {/* Seção 2 — Itens do dia */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <SectionHeader
            number="2"
            title="Itens planejados"
            isOpen={openSections.includes(2)}
            onToggle={() => toggleSection(2)}
            badge={itensDoDia.length}
          />
          {openSections.includes(2) && (
            <div className="px-4 pb-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Filtrar por data
                </label>
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="date"
                    value={filtroData}
                    onChange={(e) => setFiltroData(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900"
                  />
                </div>
              </div>

              {itensDoDia.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Inbox className="text-gray-300 mb-2" size={32} />
                  <p className="text-sm text-gray-500">
                    Nenhum item planejado para esta data.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Use o formulário acima para adicionar.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {itensDoDia.map((item) => (
                    <ItemPlanejadoCard
                      key={item.id}
                      item={item}
                      onRemover={removerItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {itensDoDia.length > 0 && (
          <button
            type="button"
            onClick={handleConfirmar}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-semibold py-4 rounded-2xl text-base transition-all"
          >
            <CheckCircle2 size={18} />
            Confirmar planejamento do dia
          </button>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  number,
  title,
  isOpen,
  onToggle,
  badge,
}: {
  number: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
          {number}
        </span>
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        {badge != null && (
          <span className="text-[11px] font-medium bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {isOpen ? (
        <ChevronUp size={18} className="text-gray-400" />
      ) : (
        <ChevronDown size={18} className="text-gray-400" />
      )}
    </button>
  );
}

function CampoCalculado({
  label,
  valor,
  unidade,
}: {
  label: string;
  valor: number;
  unidade: string;
}) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-0.5">
        <Calculator size={11} />
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-semibold text-gray-900">
          {valor > 0 ? valor.toFixed(2) : "—"}
        </span>
        <span className="text-[11px] text-gray-500">{unidade}</span>
      </div>
    </div>
  );
}

function ItemPlanejadoCard({
  item,
  onRemover,
}: {
  item: ItemPlanejado;
  onRemover: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
      >
        <div>
          <div className="text-sm font-semibold text-gray-900">{item.frente}</div>
          <div className="text-[11px] text-gray-500">
            {item.descricao || `${item.refIni} → ${item.refFim}`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
            {item.qtdPlanejada} {item.unidade}
          </span>
          {expanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-2 bg-gray-50/50">
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <div className="text-gray-500">Ini.</div>
              <div className="font-medium text-gray-900">{item.refIni}</div>
            </div>
            <div>
              <div className="text-gray-500">Fim</div>
              <div className="font-medium text-gray-900">{item.refFim}</div>
            </div>
            <div>
              <div className="text-gray-500">Pista</div>
              <div className="font-medium text-gray-900">{item.pista}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <div className="text-gray-500">Área</div>
              <div className="font-medium text-gray-900">{fmt(item.area)} m²</div>
            </div>
            <div>
              <div className="text-gray-500">Volume</div>
              <div className="font-medium text-gray-900">{fmt(item.volume)} m³</div>
            </div>
            <div>
              <div className="text-gray-500">Peso</div>
              <div className="font-medium text-gray-900">{fmt(item.peso)} t</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemover(item.id)}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={12} /> Remover item
          </button>
        </div>
      )}
    </div>
  );
}

type FormState = {
  data: string;
  frenteNome: string;
  descricao: string;
  refIni: string;
  refFim: string;
  faixa: string;
  pista: string;
  comprimento: string;
  largura: string;
  espessura: string;
  densidade: string;
};

const FORM_VAZIO: FormState = {
  data: "",
  frenteNome: "",
  descricao: "",
  refIni: "",
  refFim: "",
  faixa: "",
  pista: "",
  comprimento: "",
  largura: "",
  espessura: "",
  densidade: "",
};

function FormNovoItem({
  onSalvar,
  frentesDisponiveis,
}: {
  onSalvar: (item: ItemPlanejado) => void;
  frentesDisponiveis: string[];
}) {
  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [openSections, setOpenSections] = useState<number[]>([0, 1]);

  useEffect(() => {
    setForm((f) =>
      f.data ? f : { ...f, data: new Date().toISOString().split("T")[0] },
    );
  }, []);

  const toggleSec = (i: number) =>
    setOpenSections((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [field]: value }));

  const { area, volume, peso } = useMemo(
    () => calcular(form.comprimento, form.largura, form.espessura, form.densidade),
    [form.comprimento, form.largura, form.espessura, form.densidade],
  );

  const podeSalvar =
    !!form.data &&
    !!form.frenteNome &&
    !!form.descricao.trim() &&
    !!form.refIni &&
    !!form.refFim &&
    num(form.comprimento) > 0;

  const handleSalvar = () => {
    const novoItem: ItemPlanejado = {
      id: uid(),
      frente: form.frenteNome,
      descricao: form.descricao.trim(),
      servico: form.frenteNome,
      unidade: "m³",
      data: form.data,
      refIni: form.refIni,
      refFim: form.refFim,
      faixa: form.faixa || "—",
      pista: form.pista || "—",
      comprimento: num(form.comprimento),
      largura: num(form.largura),
      espessura: num(form.espessura),
      densidade: num(form.densidade),
      area,
      volume,
      peso,
      qtdPlanejada: parseFloat(volume.toFixed(3)),
      status: "planejado",
    };
    onSalvar(novoItem);
    setForm({ ...FORM_VAZIO, data: form.data });
    toast.success("Item adicionado ao planejamento.");
  };

  return (
    <div className="space-y-3">
      {/* A — Identificação */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSec(0)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-xs font-semibold text-gray-700">
            A — Identificação e localização
          </span>
          {openSections.includes(0) ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </button>
        {openSections.includes(0) && (
          <div className="p-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Data de execução
              </label>
              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => set("data", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Frente de serviço
              </label>
              {frentesDisponiveis.length === 0 ? (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  Nenhuma frente cadastrada — vá em Cadastros → Frente para adicionar.
                </p>
              ) : (
                <select
                  value={form.frenteNome}
                  onChange={(e) => set("frenteNome", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900"
                >
                  <option value="">Selecionar frente</option>
                  {frentesDisponiveis.map((nome) => (
                    <option key={nome} value={nome}>
                      {nome}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Descrição do item
              </label>
              <textarea
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                placeholder="Descreva o item planejado..."
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900 placeholder-gray-300 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  KM / Estaca inicial
                </label>
                <input
                  type="text"
                  value={form.refIni}
                  onChange={(e) => set("refIni", e.target.value)}
                  placeholder="0+000"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  KM / Estaca final
                </label>
                <input
                  type="text"
                  value={form.refFim}
                  onChange={(e) => set("refFim", e.target.value)}
                  placeholder="0+250"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Faixa
                </label>
                <select
                  value={form.faixa}
                  onChange={(e) => set("faixa", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900"
                >
                  <option value="">—</option>
                  <option value="Faixa 1">Faixa 1</option>
                  <option value="Faixa 2">Faixa 2</option>
                  <option value="Faixa 3">Faixa 3</option>
                  <option value="Acostamento">Acostamento</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Pista
                </label>
                <select
                  value={form.pista}
                  onChange={(e) => set("pista", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900"
                >
                  <option value="">—</option>
                  <option value="Norte">Norte</option>
                  <option value="Sul">Sul</option>
                  <option value="Leste">Leste</option>
                  <option value="Oeste">Oeste</option>
                  <option value="Única">Única</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* B — Controle geométrico */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSec(1)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-xs font-semibold text-gray-700">
            B — Controle geométrico
          </span>
          {openSections.includes(1) ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </button>
        {openSections.includes(1) && (
          <div className="p-3 space-y-3">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
              Parâmetros de entrada
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { field: "comprimento", label: "Comprimento", unit: "m", placeholder: "0.00" },
                  { field: "largura", label: "Largura", unit: "m", placeholder: "0.00" },
                  { field: "espessura", label: "Espessura", unit: "m", placeholder: "0.00" },
                  { field: "densidade", label: "Densidade", unit: "t/m³", placeholder: "2.40" },
                ] as const
              ).map(({ field, label, unit, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={form[field]}
                      placeholder={placeholder}
                      onChange={(e) => set(field, e.target.value)}
                      className="w-full text-sm border-2 border-orange-200 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:border-orange-500 text-gray-900 placeholder-gray-300"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                      {unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <Lock size={11} className="text-gray-400" />
              <span className="text-[11px] text-gray-500">
                Calculado automaticamente
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <CampoCalculado label="Área" valor={area} unidade="m²" />
              <CampoCalculado label="Volume" valor={volume} unidade="m³" />
              <CampoCalculado label="Peso" valor={peso} unidade="t" />
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!podeSalvar}
        onClick={handleSalvar}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 active:scale-[0.98] text-white font-semibold py-3 rounded-2xl text-sm transition-all"
      >
        <Plus size={16} />
        Adicionar ao planejamento
      </button>
    </div>
  );
}
