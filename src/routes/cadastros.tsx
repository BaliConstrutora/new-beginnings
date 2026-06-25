import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Wrench, Users, Settings2, Map, Building2 } from "lucide-react";
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
  useObra,
  useHydrated,
  useCentrosCusto,
  useObras,
  addCentroCusto,
  removeCentroCusto,
  addObra,
  removeObra,
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
          "Cadastre equipamentos, funções de mão de obra e configure parâmetros de planejamento da obra.",
      },
    ],
  }),
  component: CadastrosPage,
});

function CadastrosPage() {
  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">Cadastros e Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Recursos e parâmetros da obra.
        </p>
      </header>

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">Cadastros e Configurações</h1>
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

function ObrasTab() {
  const centros = useCentrosCusto();
  const obras = useObras();
  const [codigo, setCodigo] = useState("");
  const [nomeCC, setNomeCC] = useState("");
  const [nomeObra, setNomeObra] = useState("");
  const [ccSelecionado, setCcSelecionado] = useState("");

  const handleSaveCC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !nomeCC.trim()) {
      toast.error("Preencha código e nome do centro de custo.");
      return;
    }
    addCentroCusto(codigo.trim(), nomeCC.trim());
    setCodigo("");
    setNomeCC("");
    toast.success("Centro de Custo cadastrado!");
  };

  const handleSaveObra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeObra.trim() || !ccSelecionado) {
      toast.error("Preencha nome da obra e selecione o centro de custo.");
      return;
    }
    addObra(nomeObra.trim(), ccSelecionado);
    setNomeObra("");
    setCcSelecionado("");
    toast.success("Obra cadastrada!");
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSaveCC}
        className="space-y-3 rounded-2xl border-2 border-border bg-card p-4"
      >
        <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          Novo Centro de Custo
        </p>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Código</Label>
          <Input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="Ex: CC-2024-0312"
            className="h-12"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Nome</Label>
          <Input
            value={nomeCC}
            onChange={(e) => setNomeCC(e.target.value)}
            placeholder="Ex: Obras Federais SP"
            className="h-12"
          />
        </div>
        <Button type="submit" className="h-12 w-full font-bold">
          Salvar Centro de Custo
        </Button>
      </form>

      <form
        onSubmit={handleSaveObra}
        className="space-y-3 rounded-2xl border-2 border-border bg-card p-4"
      >
        <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          Nova Obra (1 por Centro de Custo)
        </p>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Centro de Custo</Label>
          <Select value={ccSelecionado} onValueChange={setCcSelecionado}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o CC" />
            </SelectTrigger>
            <SelectContent>
              {centros.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.codigo} — {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {centros.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Cadastre um Centro de Custo primeiro.
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Nome da Obra</Label>
          <Input
            value={nomeObra}
            onChange={(e) => setNomeObra(e.target.value)}
            placeholder="Ex: Duplicação BR-040 Lote 3"
            className="h-12"
          />
        </div>
        <Button
          type="submit"
          className="h-12 w-full font-bold"
          disabled={centros.length === 0}
        >
          Salvar Obra
        </Button>
      </form>

      <ListSection
        title="Centros de Custo e Obras"
        empty="Nenhum centro de custo cadastrado."
      >
        {centros.map((c) => {
          const obra = obras.find((o) => o.centroCustoId === c.id);
          return (
            <li
              key={c.id}
              className="space-y-2 rounded-xl border border-border bg-card p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">
                    {c.codigo}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.nome}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeCentroCusto(c.id);
                    toast.success("Centro de Custo removido.");
                  }}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                  aria-label="Remover CC"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {obra ? (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">
                      Obra: {obra.nome}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeObra(obra.id);
                      toast.success("Obra removida.");
                    }}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                    aria-label="Remover obra"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                  Sem obra vinculada.
                </p>
              )}
            </li>
          );
        })}
      </ListSection>
    </div>
  );
}

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

      <ListSection title="Frentes Cadastradas" empty="Nenhuma frente cadastrada.">
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
      className="space-y-3 rounded-2xl border-2 border-border bg-card p-4"
    >
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Modelo de Planejamento</Label>
        <Select value={modelo} onValueChange={(v) => setModelo(v as ModeloPlanejamento)}>
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="centralizado">Centralizado na Sede</SelectItem>
            <SelectItem value="descentralizado">Descentralizado na Obra</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Centralizado: apenas perfil Sede pode editar o planejamento. Apontador fica
          em modo leitura.
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
          <Label className="text-sm font-semibold">Descrição do Equipamento</Label>
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

      <ListSection title="Equipamentos Cadastrados" empty="Nenhum equipamento cadastrado.">
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

      <ListSection title="Funções Cadastradas" empty="Nenhuma função cadastrada.">
        {funcoes.map((m) => (
          <ListItem
            key={m.id}
            title={m.funcao}
            subtitle={m.categoria === "direta" ? "Direta (Produção)" : "Indireta (Apoio)"}
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
  onRemove,
}: {
  title: string;
  subtitle: string;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
      <div className="min-w-0">
        <p className="truncate font-bold text-foreground">{title}</p>
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
