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

// ---------------------------------------------------------------------------
// Tipos de serviço (mock — pode virar cadastro futuramente)
// ---------------------------------------------------------------------------
type TipoServico = {
  id: string;
  frenteNome: string;
  nome: string;
  unidade: "m²" | "m³" | "ton" | "m";
};

const TIPOS_SERVICO: TipoServico[] = [
  { id: "ts1", frenteNome: "Pavimentação", nome: "Fresagem de revestimento", unidade: "m²" },
  { id: "ts2", frenteNome: "Pavimentação", nome: "Imprimação betuminosa", unidade: "m²" },
  { id: "ts3", frenteNome: "Pavimentação", nome: "CBUQ — camada de rolamento", unidade: "ton" },
  { id: "ts4", frenteNome: "Drenagem", nome: "Escavação de valeta lateral", unidade: "m³" },
  { id: "ts5", frenteNome: "Drenagem", nome: "Assentamento de tubulação", unidade: "m" },
  { id: "ts6", frenteNome: "Terraplenagem", nome: "Corte de material de 1ª cat.", unidade: "m³" },
  { id: "ts7", frenteNome: "Terraplenagem", nome: "Aterro compactado", unidade: "m³" },
  { id: "ts8", frenteNome: "Sinalização", nome: "Pintura de faixa longitudinal", unidade: "m" },
];

type ItemPlanejado = {
  id: string;
  frente: string;
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
  const C = num(c), L = num(l), E = num(e), D = num(d);
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

  const frentesDisponiveis = useMemo(() => {
    const fromCad = frentesCad.map((f) => f.nome);
    const fromTipos = Array.from(new Set(TIPOS_SERVICO.map((t) => t.frenteNome)));
    return Array.from(new Set([...fromCad, ...fromTipos]));
  }, [frentesCad]);

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
        servico: i.servico,
        metaQuantidade: String(i.qtdPlanejada),
        unidade: i.unidade,
      })),
      equipe: [],
      equipamentos: [],
    });
    toast.success("Planejamento do dia confirmado!");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white border-b border-gray-200 px-4 pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Planejamento</h1>
            <p className="text-sm text-gray-400 mt-0.5 capitalize">{hojeLabel}</p>
          </div>
          {obra && (
            <span className="text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full">
              {obra}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Itens hoje", value: String(itensDoDia.length) },
            { label: "Área total", value: `${itensDoDia.reduce((s, i) => s + i.area, 0).toFixed(0)} m²` },
            { label: "Volume total", value: `${itensDoDia.reduce((s, i) => s + i.volume, 0).toFixed(1)} m³` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-gray-50 rounded-xl px-3 py-2 text-center border border-gray-100"
            >
              <p className="text-base font-semibold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <SectionHeader
            number="1"
            title="Importar planilha"
            isOpen={openSections.includes(0)}
            onToggle={() => toggleSection(0)}
          />
          {openSections.includes(0) && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mt-3 mb-3 leading-relaxed">
                Envie um arquivo <strong>.xlsx</strong> ou <strong>.csv</strong> com as colunas:
                frente, serviço, data, km_ini, km_fim, comprimento, largura, espessura, densidade.
              </p>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-orange-200 rounded-xl py-5 cursor-pointer hover:bg-orange-50 transition-colors">
                <Upload size={22} className="text-orange-400" />
                <span className="text-sm text-orange-600 font-medium">Selecionar arquivo</span>
                <span className="text-xs text-gray-400">Excel ou CSV</span>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const mock: ItemPlanejado[] = [1, 2, 3].map((n) => ({
                      id: `mock-${Date.now()}-${n}`,
                      frente: "Pavimentação",
                      servico: "CBUQ — camada de rolamento",
                      unidade: "ton",
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
                      qtdPlanejada: 250 * 3.5 * 0.05 * 2.4,
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
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <SectionHeader
            number="2"
            title="Novo item de planejamento"
            isOpen={openSections.includes(1)}
            onToggle={() => toggleSection(1)}
          />
          {openSections.includes(1) && (
            <div className="px-3 py-3 border-t border-gray-100">
              <FormNovoItem
                onSalvar={adicionarItem}
                frentesDisponiveis={frentesDisponiveis}
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <SectionHeader
            number="3"
            title="Itens planejados"
            isOpen={openSections.includes(2)}
            onToggle={() => toggleSection(2)}
            badge={itensDoDia.length}
          />
          {openSections.includes(2) && (
            <div className="px-3 pb-3 border-t border-gray-100">
              <div className="mt-3 mb-3">
                <label className="text-xs text-gray-500 block mb-1">
                  Filtrar por data
                </label>
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
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
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                  <Calendar size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Nenhum item planejado para esta data.
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Use o formulário acima para adicionar.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
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
        </div>

        {itensDoDia.length > 0 && (
          <button
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-2xl text-base transition-all"
            onClick={handleConfirmar}
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
      className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
          {number}
        </span>
        <span className="font-medium text-gray-900 text-sm truncate">{title}</span>
        {badge != null && (
          <span className="ml-1 text-xs font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex-shrink-0">
            {badge}
          </span>
        )}
      </div>
      {isOpen ? (
        <ChevronUp size={16} className="text-gray-400 flex-shrink-0 ml-2" />
      ) : (
        <ChevronDown size={16} className="text-gray-400 flex-shrink-0 ml-2" />
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
    <div>
      <div className="flex items-center gap-1 mb-1">
        <Lock size={10} className="text-gray-300" />
        <label className="text-xs text-gray-400">{label}</label>
      </div>
      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
        <span className="text-sm font-semibold text-gray-700 flex-1">
          {valor > 0 ? valor.toFixed(2) : "—"}
        </span>
        <span className="text-xs text-gray-400">{unidade}</span>
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
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-start justify-between px-3 py-2.5 bg-gray-50 border-b border-gray-100 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-xs text-gray-400">{item.frente}</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5 leading-snug">
            {item.servico}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
            {item.qtdPlanejada} {item.unidade}
          </span>
          {expanded ? (
            <ChevronUp size={14} className="text-gray-400" />
          ) : (
            <ChevronDown size={14} className="text-gray-400" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-3 py-2.5">
          <div className="grid grid-cols-3 gap-1.5 mb-2.5">
            <div className="bg-gray-50 rounded-lg px-2 py-1.5">
              <p className="text-xs text-gray-400">Ini.</p>
              <p className="text-xs font-medium text-gray-600">{item.refIni}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-2 py-1.5">
              <p className="text-xs text-gray-400">Fim</p>
              <p className="text-xs font-medium text-gray-600">{item.refFim}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-2 py-1.5">
              <p className="text-xs text-gray-400">Pista</p>
              <p className="text-xs font-medium text-gray-600">{item.pista}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <div className="bg-orange-50 rounded-lg px-2 py-1.5 text-center">
              <p className="text-xs text-orange-500">Área</p>
              <p className="text-xs font-semibold text-orange-800">
                {fmt(item.area)} m²
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg px-2 py-1.5 text-center">
              <p className="text-xs text-orange-500">Volume</p>
              <p className="text-xs font-semibold text-orange-800">
                {fmt(item.volume)} m³
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg px-2 py-1.5 text-center">
              <p className="text-xs text-orange-500">Peso</p>
              <p className="text-xs font-semibold text-orange-800">
                {fmt(item.peso)} t
              </p>
            </div>
          </div>
          <button
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
  tipoServicoId: string;
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
  tipoServicoId: "",
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

  const tiposFiltrados = TIPOS_SERVICO.filter(
    (t) => t.frenteNome === form.frenteNome,
  );
  const tipoSelecionado = TIPOS_SERVICO.find((t) => t.id === form.tipoServicoId);

  const { area, volume, peso } = useMemo(
    () =>
      calcular(form.comprimento, form.largura, form.espessura, form.densidade),
    [form.comprimento, form.largura, form.espessura, form.densidade],
  );

  const qtdCalculada = useMemo(() => {
    if (!tipoSelecionado) return 0;
    switch (tipoSelecionado.unidade) {
      case "m²":
        return area;
      case "m³":
        return volume;
      case "ton":
        return peso;
      case "m":
        return num(form.comprimento);
      default:
        return 0;
    }
  }, [tipoSelecionado, area, volume, peso, form.comprimento]);

  const podeSalvar =
    !!form.data &&
    !!form.frenteNome &&
    !!form.tipoServicoId &&
    !!form.refIni &&
    !!form.refFim &&
    num(form.comprimento) > 0;

  const handleSalvar = () => {
    if (!tipoSelecionado) return;
    const novoItem: ItemPlanejado = {
      id: uid(),
      frente: form.frenteNome,
      servico: tipoSelecionado.nome,
      unidade: tipoSelecionado.unidade,
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
      qtdPlanejada: parseFloat(qtdCalculada.toFixed(3)),
      status: "planejado",
    };
    onSalvar(novoItem);
    setForm({ ...FORM_VAZIO, data: form.data });
    toast.success("Item adicionado ao planejamento.");
  };

  return (
    <div className="space-y-2.5">
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-3 py-3 bg-gray-50 text-left"
          onClick={() => toggleSec(0)}
        >
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            A — Identificação e localização
          </span>
          {openSections.includes(0) ? (
            <ChevronUp size={14} className="text-gray-400" />
          ) : (
            <ChevronDown size={14} className="text-gray-400" />
          )}
        </button>
        {openSections.includes(0) && (
          <div className="px-3 pb-3 pt-2 space-y-2.5">
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Data de execução
              </label>
              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => set("data", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Frente de serviço
                </label>
                <select
                  value={form.frenteNome}
                  onChange={(e) => {
                    set("frenteNome", e.target.value);
                    set("tipoServicoId", "");
                  }}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900"
                >
                  <option value="">Selecionar frente</option>
                  {frentesDisponiveis.map((nome) => (
                    <option key={nome} value={nome}>
                      {nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Tipo de serviço
                </label>
                <select
                  value={form.tipoServicoId}
                  onChange={(e) => set("tipoServicoId", e.target.value)}
                  disabled={!form.frenteNome}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Selecionar serviço</option>
                  {tiposFiltrados.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  KM / Estaca inicial
                </label>
                <input
                  type="text"
                  placeholder="Ex: KM 12+400"
                  value={form.refIni}
                  onChange={(e) => set("refIni", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  KM / Estaca final
                </label>
                <input
                  type="text"
                  placeholder="Ex: KM 13+100"
                  value={form.refFim}
                  onChange={(e) => set("refFim", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Faixa</label>
                <select
                  value={form.faixa}
                  onChange={(e) => set("faixa", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900"
                >
                  <option value="">—</option>
                  <option>Faixa 1</option>
                  <option>Faixa 2</option>
                  <option>Faixa 3</option>
                  <option>Acostamento</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Pista</label>
                <select
                  value={form.pista}
                  onChange={(e) => set("pista", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 text-gray-900"
                >
                  <option value="">—</option>
                  <option>Norte</option>
                  <option>Sul</option>
                  <option>Leste</option>
                  <option>Oeste</option>
                  <option>Única</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-3 py-3 bg-gray-50 text-left"
          onClick={() => toggleSec(1)}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              B — Controle geométrico
            </span>
            <Calculator size={13} className="text-orange-400" />
          </div>
          {openSections.includes(1) ? (
            <ChevronUp size={14} className="text-gray-400" />
          ) : (
            <ChevronDown size={14} className="text-gray-400" />
          )}
        </button>
        {openSections.includes(1) && (
          <div className="px-3 pb-3 pt-2">
            <p className="text-xs text-gray-400 mb-2">Parâmetros de entrada</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {(
                [
                  { field: "comprimento", label: "Comprimento", unit: "m", placeholder: "0.00" },
                  { field: "largura", label: "Largura", unit: "m", placeholder: "0.00" },
                  { field: "espessura", label: "Espessura", unit: "m", placeholder: "0.00" },
                  { field: "densidade", label: "Densidade", unit: "t/m³", placeholder: "2.40" },
                ] as const
              ).map(({ field, label, unit, placeholder }) => (
                <div key={field}>
                  <label className="text-xs text-gray-500 block mb-1">{label}</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={placeholder}
                      value={form[field]}
                      onChange={(e) => set(field, e.target.value)}
                      className="w-full text-sm border-2 border-orange-200 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:border-orange-500 text-gray-900 placeholder-gray-300"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-orange-200 pt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Lock size={11} className="text-orange-300" />
                <p className="text-xs text-orange-500 font-medium">
                  Calculado automaticamente
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <CampoCalculado label="Área" valor={area} unidade="m²" />
                <CampoCalculado label="Volume" valor={volume} unidade="m³" />
                <CampoCalculado label="Peso" valor={peso} unidade="t" />
              </div>
            </div>

            {tipoSelecionado && qtdCalculada > 0 && (
              <div className="mt-3 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-orange-500 font-medium">
                      Quantidade planejada
                    </p>
                    <p className="text-xs text-orange-400 mt-0.5">
                      Derivado automaticamente para "{tipoSelecionado.unidade}"
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-700">
                      {qtdCalculada.toFixed(2)}
                    </p>
                    <p className="text-xs text-orange-500">
                      {tipoSelecionado.unidade}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleSalvar}
        disabled={!podeSalvar}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-all"
      >
        <Plus size={16} />
        Adicionar ao planejamento
      </button>
    </div>
  );
}
