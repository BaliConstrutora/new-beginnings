import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Wrench, Users, Settings2 } from "lucide-react";
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
  removeEquipamento,
  removeMaoObra,
  useEquipamentos,
  useMaoObra,
} from "@/lib/cadastros-store";
import { useObra, useHydrated } from "@/lib/obra-store";
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
  const navigate = useNavigate();
  const obra = useObra();
  useEffect(() => {
    if (typeof window !== "undefined" && !obra) navigate({ to: "/" });
  }, [obra, navigate]);

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">Cadastros e Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Recursos e parâmetros da obra.
        </p>
      </header>

      <Tabs defaultValue="equip" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="equip" className="text-xs font-bold">
            <Wrench className="mr-1.5 h-4 w-4" /> Equip.
          </TabsTrigger>
          <TabsTrigger value="mo" className="text-xs font-bold">
            <Users className="mr-1.5 h-4 w-4" /> Mão Obra
          </TabsTrigger>
          <TabsTrigger value="param" className="text-xs font-bold">
            <Settings2 className="mr-1.5 h-4 w-4" /> Parâmetros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equip" className="mt-4">
          <EquipamentosTab />
        </TabsContent>
        <TabsContent value="mo" className="mt-4">
          <MaoObraTab />
        </TabsContent>
        <TabsContent value="param" className="mt-4">
          <ParametrosTab />
        </TabsContent>
      </Tabs>
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
