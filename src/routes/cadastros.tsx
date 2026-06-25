import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Trash2,
  Wrench,
  Users,
  Settings2,
  Map,
  Building2,
  ChevronDown,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  addEquipamento,
  addMaoObra,
  addFrente,
  removeEquipamento,
  removeMaoObra,
  removeFrente,
  useEquipamentos,
  useMaoObra,
  useFrentes,
} from "@/lib/cadastros-store";
import {
  useCentrosCusto,
  useObras,
  addCentroCusto,
  removeCentroCusto,
  addObra,
  removeObra,
  obraParaCC,
} from "@/lib/obra-store";
import {
  getParametros,
  setParametros,
  type ModeloPlanejamento,
} from "@/lib/parametros-store";

export const Route = createFileRoute("/cadastros")({
  head: () => ({
    meta: [
      { title: "Cadastros e Configurações da Obra — Bora Bora" },
      {
        name: "description",
        content:
          "Cadastre centros de custo, obras, equipamentos, funções e parâmetros.",
      },
    ],
  }),
  component: CadastrosPage,
});

function CadastrosPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-foreground">
          Cadastros e Configurações
        </h1>
        <p className="text-sm text-muted-foreground">
          Recursos e parâmetros da obra.
        </p>
      </header>

      <Tabs defaultValue="obras" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger value="obras" className="text-[11px] font-bold">
            <Building2 className="mr-1 h-4 w-4" /> Obras
          </TabsTrigger>
          <TabsTrigger value="equip" className="text-[11px] font-bold">
            <Wrench className="mr-1 h-4 w-4" /> Equip.
          </TabsTrigger>
          <TabsTrigger value="mo" className="text-[11px] font-bold">
            <Users className="mr-1 h-4 w-4" /> M.Obra
          </TabsTrigger>
          <TabsTrigger value="frente" className="text-[11px] font-bold">
            <Map className="mr-1 h-4 w-4" /> Frente
          </TabsTrigger>
          <TabsTrigger value="param" className="text-[11px] font-bold">
            <Settings2 className="mr-1 h-4 w-4" /> Param.
          </TabsTrigger>
        </TabsList>

        <TabsContent value="obras" className="mt-4">
          <ObrasTab />
        </TabsContent>
        <TabsContent value="equip" className="mt-4">
          <EquipamentosTab />
        </TabsContent>
        <TabsContent value="mo" className="mt-4">
          <MaoObraTab />
        </TabsContent>
        <TabsContent value="frente" className="mt-4">
          <FrentesTab />
        </TabsContent>
        <TabsContent value="param" className="mt-4">
          <ParametrosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Aba Obras ────────────────────────────────────────────────────────────────

function ObrasTab() {
  const centrosCusto = useCentrosCusto();
  const obras = useObras();

  const [ccCodigo, setCcCodigo] = useState("");
  const [ccNome, setCcNome] = useState("");

  const [obraNome, setObraNome] = useState("");
  const [obraCcId, setObraCcId] = useState("");

  const handleSaveCC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ccCodigo.trim()) {
      toast.error("Informe o código do centro de custo.");
      return;
    }
    if (!ccNome.trim()) {
      toast.error("Informe o nome do centro de custo.");
      return;
    }
    addCentroCusto(ccCodigo.trim().toUpperCase(), ccNome.trim());
    setCcCodigo("");
    setCcNome("");
    toast.success("Centro de custo cadastrado!");
  };

  const handleSaveObra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obraCcId) {
      toast.error("Selecione o centro de custo.");
      return;
    }
    if (!obraNome.trim()) {
      toast.error("Informe o nome da obra.");
      return;
    }
    addObra(obraNome.trim(), obraCcId);
    setObraNome("");
    setObraCcId("");
    toast.success("Obra cadastrada!");
  };

  return (
    <div className="space-y-5">
      {/* ── Passo 1: Centro de Custo ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            1
          </span>
          <h2 className="text-base font-bold text-foreground">
            Centro de Custo
          </h2>
        </div>

        <form
          onSubmit={handleSaveCC}
          className="space-y-3 rounded-2xl border-2 border-border bg-card p-4"
        >
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Código</Label>
            <Input
              value={ccCodigo}
              onChange={(e) => setCcCodigo(e.target.value)}
              placeholder="Ex: CC-2024-0312"
              className="h-12"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Nome descritivo</Label>
            <Input
              value={ccNome}
              onChange={(e) => setCcNome(e.target.value)}
              placeholder="Ex: Obras Federais São Paulo"
              className="h-12"
            />
          </div>
          <Button type="submit" className="h-12 w-full font-bold">
            Salvar Centro de Custo
          </Button>
        </form>

        <ListSection
          title="Centros de Custo Cadastrados"
          empty="Nenhum centro de custo cadastrado."
        >
          {centrosCusto.map((cc) => {
            const obraDoCC = obraParaCC(cc.id);
            return (
              <ListItem
                key={cc.id}
                title={cc.codigo}
                subtitle={cc.nome}
                badge={obraDoCC ? obraDoCC.nome : "Sem obra"}
                onRemove={() => {
                  removeCentroCusto(cc.id);
                  toast.success("Centro de custo e obra vinculada removidos.");
                }}
              />
            );
          })}
        </ListSection>
      </section>

      {/* Divisor */}
      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-border" />
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* ── Passo 2: Obra ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            2
          </span>
          <h2 className="text-base font-bold text-foreground">Obra</h2>
        </div>

        <form
          onSubmit={handleSaveObra}
          className="space-y-3 rounded-2xl border-2 border-border bg-card p-4"
        >
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Centro de Custo</Label>
            {centrosCusto.length === 0 ? (
              <p className="rounded-xl border-2 border-dashed border-border bg-background p-3 text-center text-sm text-muted-foreground">
                Cadastre um centro de custo no passo 1 primeiro.
              </p>
            ) : (
              <Select value={obraCcId} onValueChange={setObraCcId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione o CC" />
                </SelectTrigger>
                <SelectContent>
                  {centrosCusto.map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      <span className="font-semibold">{cc.codigo}</span>
                      <span className="ml-2 text-muted-foreground">
                        {cc.nome}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Nome da Obra</Label>
            <Input
              value={obraNome}
              onChange={(e) => setObraNome(e.target.value)}
              placeholder="Ex: Rodovia BR-381 Trecho KM 120–180"
              className="h-12"
              disabled={!obraCcId}
            />
          </div>
          <Button
            type="submit"
            className="h-12 w-full font-bold"
            disabled={centrosCusto.length === 0}
          >
            Salvar Obra
          </Button>
        </form>

        <ListSection title="Obras Cadastradas" empty="Nenhuma obra cadastrada.">
          {obras.map((o) => {
            const cc = centrosCusto.find((c) => c.id === o.centroCustoId);
            return (
              <ListItem
                key={o.id}
                title={o.nome}
                subtitle={cc ? `${cc.codigo} — ${cc.nome}` : "Sem CC"}
                onRemove={() => {
                  removeObra(o.id);
                  toast.success("Obra removida.");
                }}
              />
            );
          })}
        </ListSection>
      </section>
    </div>
  );
}

// ─── Aba Frentes ──────────────────────────────────────────────────────────────

function FrentesTab() {
  const frentes = useFrentes();
  const [nome, setNome] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Informe o nome da frente.");
      return;
    }
    addFrente(nome.trim());
    setNome("");
    toast.success("Frente cadastrada!");
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSave}
        className="space-y-3 rounded-2xl border-2 border-border bg-card p-4"
      >
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Nome da Frente</Label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Pavimentação, Fresagem, Drenagem"
            className="h-12"
          />
        </div>
        <Button type="submit" className="h-12 w-full font-bold">
          Salvar Frente
        </Button>
      </form>

      <ListSection
        title="Frentes Cadastradas"
        empty="Nenhuma frente cadastrada."
      >
        {frentes.map((f) => (
          <ListItem
            key={f.id}
            title={f.nome}
            subtitle="Frente de Serviço"
            onRemove={() => {
              removeFrente(f.id);
              toast.success("Frente removida.");
            }}
          />
        ))}
      </ListSection>
    </div>
  );
}

// ─── Aba Parâmetros ───────────────────────────────────────────────────────────

function ParametrosTab() {
  const [modelo, setModelo] = useState<ModeloPlanejamento>("descentralizado");
  const [horario, setHorario] = useState("18:00");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const p = getParametros();
    setModelo(p.modelo);
    setHorario(p.horarioLimite);
    setLoaded(true);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setParametros({ modelo, horarioLimite: horario });
    toast.success("Parâmetros salvos!");
  };

  if (!loaded) return null;

  return (
    <form
      onSubmit={handleSave}
      className="space-y-4 rounded-2xl border-2 border-border bg-card p-4"
    >
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Modelo de Planejamento</Label>
        <Select
          value={modelo}
          onValueChange={(v) => setModelo(v as ModeloPlanejamento)}
        >
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="centralizado">Centralizado na Sede</SelectItem>
            <SelectItem value="descentralizado">
              Descentralizado na Obra
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Centralizado: apenas perfil Sede pode editar o planejamento.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">
          Horário Limite para Planejamento (cut-off)
        </Label>
        <Input
          type="time"
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          className="h-12"
        />
      </div>
      <Button type="submit" className="h-12 w-full font-bold">
        Salvar Parâmetros
      </Button>
    </form>
  );
}

// ─── Aba Equipamentos ─────────────────────────────────────────────────────────

function EquipamentosTab() {
  const equipamentos = useEquipamentos();
  const [prefixo, setPrefixo] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefixo.trim() || !descricao) {
      toast.error("Preencha prefixo e descrição.");
      return;
    }
    addEquipamento(prefixo.trim(), descricao);
    setPrefixo("");
    setDescricao("");
    toast.success("Equipamento cadastrado!");
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSave}
        className="space-y-3 rounded-2xl border-2 border-border bg-card p-4"
      >
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Prefixo / Tag</Label>
          <Input
            value={prefixo}
            onChange={(e) => setPrefixo(e.target.value.toUpperCase())}
            placeholder="Ex: ESC-01"
            className="h-12"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">
            Descrição do Equipamento
          </Label>
          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Trator de Esteira D8"
            className="h-12"
          />
        </div>
        <Button type="submit" className="h-12 w-full font-bold">
          Salvar Equipamento
        </Button>
      </form>

      <ListSection
        title="Equipamentos Cadastrados"
        empty="Nenhum equipamento cadastrado."
      >
        {equipamentos.map((eq) => (
          <ListItem
            key={eq.id}
            title={eq.prefixo}
            subtitle={eq.descricao}
            onRemove={() => {
              removeEquipamento(eq.id);
              toast.success("Equipamento removido.");
            }}
          />
        ))}
      </ListSection>
    </div>
  );
}

// ─── Aba Mão de Obra ──────────────────────────────────────────────────────────

function MaoObraTab() {
  const funcoes = useMaoObra();
  const [funcao, setFuncao] = useState("");
  const [categoria, setCategoria] = useState<"direta" | "indireta" | "">("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!funcao.trim() || !categoria) {
      toast.error("Preencha função e categoria.");
      return;
    }
    addMaoObra(funcao.trim(), categoria);
    setFuncao("");
    setCategoria("");
    toast.success("Função cadastrada!");
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSave}
        className="space-y-3 rounded-2xl border-2 border-border bg-card p-4"
      >
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Função</Label>
          <Input
            value={funcao}
            onChange={(e) => setFuncao(e.target.value)}
            placeholder="Ex: Operador de Escavadeira"
            className="h-12"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Categoria</Label>
          <Select
            value={categoria}
            onValueChange={(v) => setCategoria(v as "direta" | "indireta")}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direta">Direta (Produção)</SelectItem>
              <SelectItem value="indireta">Indireta (Apoio)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="h-12 w-full font-bold">
          Salvar Função
        </Button>
      </form>

      <ListSection
        title="Funções Cadastradas"
        empty="Nenhuma função cadastrada."
      >
        {funcoes.map((m) => (
          <ListItem
            key={m.id}
            title={m.funcao}
            subtitle={
              m.categoria === "direta" ? "Direta (Produção)" : "Indireta (Apoio)"
            }
            onRemove={() => {
              removeMaoObra(m.id);
              toast.success("Função removida.");
            }}
          />
        ))}
      </ListSection>
    </div>
  );
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function ListSection({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.some(Boolean);
  return (
    <div className="space-y-2">
      <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {hasItems ? (
        <ul className="space-y-2">{children}</ul>
      ) : (
        <p className="rounded-xl border-2 border-dashed border-border bg-card p-4 text-center text-sm text-muted-foreground">
          {empty}
        </p>
      )}
    </div>
  );
}

function ListItem({
  title,
  subtitle,
  badge,
  onRemove,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-bold text-foreground">{title}</p>
          {badge && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {badge}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
        aria-label="Remover"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
