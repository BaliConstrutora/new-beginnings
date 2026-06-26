import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Wrench, Users, Settings2, Map, Building2, HardHat, X, Plus } from "lucide-react";
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
import { useObra, useHydrated, useObras, addObra, removeObra } from "@/lib/obra-store";
import {
  getParametros,
  setParametros,
  type ModeloPlanejamento,
} from "@/lib/parametros-store";
import {
  addEquipe,
  removeEquipe,
  useEquipes,
  type MembroEquipe,
} from "@/lib/equipe-store";

export const Route = createFileRoute("/cadastros")({
  head: () => ({
    meta: [
      { title: "Cadastros e Configurações — Bora Bora" },
      { name: "description", content: "Cadastre obras, equipes, equipamentos e parâmetros." },
    ],
  }),
  component: CadastrosPage,
});

function CadastrosPage() {
  const navigate = useNavigate();
  const obra = useObra();
  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated && !obra) navigate({ to: "/" });
  }, [hydrated, obra, navigate]);

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">Cadastros e Configurações</h1>
        <p className="text-sm text-muted-foreground">Recursos e parâmetros da obra.</p>
      </header>

      <Tabs defaultValue="obras" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-12">
          <TabsTrigger value="obras" className="text-[10px] font-bold px-1">
            <Building2 className="mr-0.5 h-3.5 w-3.5" /> Obras
          </TabsTrigger>
          <TabsTrigger value="equip" className="text-[10px] font-bold px-1">
            <Wrench className="mr-0.5 h-3.5 w-3.5" /> Equip.
          </TabsTrigger>
          <TabsTrigger value="mo" className="text-[10px] font-bold px-1">
            <Users className="mr-0.5 h-3.5 w-3.5" /> M.Obra
          </TabsTrigger>
          <TabsTrigger value="frente" className="text-[10px] font-bold px-1">
            <Map className="mr-0.5 h-3.5 w-3.5" /> Frente
          </TabsTrigger>
          <TabsTrigger value="equipe" className="text-[10px] font-bold px-1">
            <HardHat className="mr-0.5 h-3.5 w-3.5" /> Equipe
          </TabsTrigger>
          <TabsTrigger value="param" className="text-[10px] font-bold px-1">
            <Settings2 className="mr-0.5 h-3.5 w-3.5" /> Param.
          </TabsTrigger>
        </TabsList>

        <TabsContent value="obras" className="mt-4"><ObrasTab /></TabsContent>
        <TabsContent value="equip" className="mt-4"><EquipamentosTab /></TabsContent>
        <TabsContent value="mo" className="mt-4"><MaoObraTab /></TabsContent>
        <TabsContent value="frente" className="mt-4"><FrentesTab /></TabsContent>
        <TabsContent value="equipe" className="mt-4"><EquipesTab /></TabsContent>
        <TabsContent value="param" className="mt-4"><ParametrosTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Aba Obras ────────────────────────────────────────────────────────────────

function ObrasTab() {
  const obras = useObras();
  const [nome, setNome] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { toast.error("Informe o nome da obra."); return; }
    addObra(nome.trim());
    setNome("");
    toast.success("Obra cadastrada!");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSave} className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Nome da Obra</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Rodovia BR-381 Trecho KM 120–180" className="h-12" />
        </div>
        <Button type="submit" className="h-12 w-full font-bold">Cadastrar Obra</Button>
      </form>
      <ListSection title="Obras Cadastradas" empty="Nenhuma obra cadastrada.">
        {obras.map((o) => (
          <ListItem key={o.id} title={o.nome} onRemove={() => { removeObra(o.id); toast.success("Obra removida."); }} />
        ))}
      </ListSection>
    </div>
  );
}

// ─── Aba Equipes ──────────────────────────────────────────────────────────────

function EquipesTab() {
  const equipes = useEquipes();
  const funcoes = useMaoObra();
  const [nome, setNome] = useState("");
  const [membros, setMembros] = useState<MembroEquipe[]>([]);
  const [moSelecionadoId, setMoSelecionadoId] = useState("");

  // Funções ainda não adicionadas à equipe
  const disponiveis = funcoes.filter(
    (f) => !membros.some((m) => m.maoObraId === f.id)
  );

  const handleAddMembro = () => {
    const mo = funcoes.find((f) => f.id === moSelecionadoId);
    if (!mo) return;
    setMembros((p) => [
      ...p,
      { maoObraId: mo.id, nome: mo.nome, funcao: mo.funcao },
    ]);
    setMoSelecionadoId("");
  };

  const handleRemoveMembro = (maoObraId: string) =>
    setMembros((p) => p.filter((m) => m.maoObraId !== maoObraId));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { toast.error("Informe o nome da equipe."); return; }
    if (membros.length === 0) { toast.error("Adicione ao menos um membro."); return; }
    addEquipe(nome.trim(), membros);
    setNome("");
    setMembros([]);
    toast.success("Equipe cadastrada!");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSave} className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Nome da Equipe</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Equipe Alpha" className="h-12" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Adicionar membro</Label>
          {funcoes.length === 0 ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Cadastre funções em Mão de Obra primeiro.
            </p>
          ) : disponiveis.length === 0 ? (
            <p className="rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Todas as funções já foram adicionadas.
            </p>
          ) : (
            <div className="flex gap-2">
              <Select value={moSelecionadoId} onValueChange={setMoSelecionadoId}>
                <SelectTrigger className="h-11 flex-1">
                  <SelectValue placeholder="Selecionar do cadastro M.Obra" />
                </SelectTrigger>
                <SelectContent>
                  {disponiveis.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.nome}
                      <span className="ml-2 text-xs text-muted-foreground">{f.funcao}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleAddMembro}
                disabled={!moSelecionadoId}
                className="h-11 px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Lista de membros adicionados */}
        {membros.length > 0 && (
          <ul className="space-y-1.5">
            {membros.map((m) => (
              <li
                key={m.maoObraId}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{m.nome}</p>
                  <p className="text-xs text-muted-foreground">{m.funcao}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMembro(m.maoObraId)}
                  className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <Button type="submit" className="h-12 w-full font-bold">
          Salvar Equipe
        </Button>
      </form>

      <ListSection title="Equipes Cadastradas" empty="Nenhuma equipe cadastrada.">
        {equipes.map((eq) => (
          <ListItem
            key={eq.id}
            title={eq.nome}
            subtitle={`${eq.membros.length} membro${eq.membros.length !== 1 ? "s" : ""} · ${eq.membros.map((m) => `${m.nome} (${m.funcao})`).join(", ")}`}
            onRemove={() => { removeEquipe(eq.id); toast.success("Equipe removida."); }}
          />
        ))}
      </ListSection>
    </div>
  );
}

// ─── Aba Equipamentos ─────────────────────────────────────────────────────────

function EquipamentosTab() {
  const equipamentos = useEquipamentos();
  const [prefixo, setPrefixo] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefixo.trim() || !descricao) { toast.error("Preencha prefixo e descrição."); return; }
    addEquipamento(prefixo.trim(), descricao);
    setPrefixo("");
    setDescricao("");
    toast.success("Equipamento cadastrado!");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSave} className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Prefixo / Tag</Label>
          <Input value={prefixo} onChange={(e) => setPrefixo(e.target.value.toUpperCase())} placeholder="Ex: ESC-01" className="h-12" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Descrição do Equipamento</Label>
          <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Trator de Esteira D8" className="h-12" />
        </div>
        <Button type="submit" className="h-12 w-full font-bold">Salvar Equipamento</Button>
      </form>
      <ListSection title="Equipamentos Cadastrados" empty="Nenhum equipamento cadastrado.">
        {equipamentos.map((eq) => (
          <ListItem key={eq.id} title={eq.prefixo} subtitle={eq.descricao} onRemove={() => { removeEquipamento(eq.id); toast.success("Equipamento removido."); }} />
        ))}
      </ListSection>
    </div>
  );
}

// ─── Aba Mão de Obra ──────────────────────────────────────────────────────────

function MaoObraTab() {
  const profissionais = useMaoObra();
  const [nome, setNome] = useState("");
  const [funcao, setFuncao] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { toast.error("Informe o nome do profissional."); return; }
    if (!funcao.trim()) { toast.error("Informe a função."); return; }
    addMaoObra(nome.trim(), funcao.trim());
    setNome("");
    setFuncao("");
    toast.success("Profissional cadastrado!");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSave} className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Nome</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Matheus Cunha"
              className="h-12"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Função</Label>
            <Input
              value={funcao}
              onChange={(e) => setFuncao(e.target.value)}
              placeholder="Ex: Ajudante"
              className="h-12"
            />
          </div>
        </div>
        <Button type="submit" className="h-12 w-full font-bold">Cadastrar Profissional</Button>
      </form>
      <ListSection title="Profissionais Cadastrados" empty="Nenhum profissional cadastrado.">
        {profissionais.map((m) => (
          <ListItem
            key={m.id}
            title={m.nome}
            subtitle={m.funcao}
            onRemove={() => { removeMaoObra(m.id); toast.success("Profissional removido."); }}
          />
        ))}
      </ListSection>
    </div>
  );
}

// ─── Aba Frentes ──────────────────────────────────────────────────────────────

function FrentesTab() {
  const frentes = useFrentes();
  const [nome, setNome] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { toast.error("Informe o nome da frente."); return; }
    addFrente(nome.trim());
    setNome("");
    toast.success("Frente cadastrada!");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSave} className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Nome da Frente</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Pavimentação, Fresagem, Drenagem" className="h-12" />
        </div>
        <Button type="submit" className="h-12 w-full font-bold">Salvar Frente</Button>
      </form>
      <ListSection title="Frentes Cadastradas" empty="Nenhuma frente cadastrada.">
        {frentes.map((f) => (
          <ListItem key={f.id} title={f.nome} subtitle="Frente de Serviço" onRemove={() => { removeFrente(f.id); toast.success("Frente removida."); }} />
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
    <form onSubmit={handleSave} className="space-y-3 rounded-2xl border-2 border-border bg-card p-4">
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Modelo de Planejamento</Label>
        <Select value={modelo} onValueChange={(v) => setModelo(v as ModeloPlanejamento)}>
          <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="centralizado">Centralizado na Sede</SelectItem>
            <SelectItem value="descentralizado">Descentralizado na Obra</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Centralizado: apenas perfil Sede pode editar o planejamento.</p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Horário Limite para Planejamento (cut-off)</Label>
        <Input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} className="h-12" />
      </div>
      <Button type="submit" className="h-12 w-full font-bold">Salvar Parâmetros</Button>
    </form>
  );
}

// ─── Auxiliares ───────────────────────────────────────────────────────────────

function ListSection({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.some(Boolean);
  return (
    <div className="space-y-2">
      <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">{title}</p>
      {hasItems ? <ul className="space-y-2">{children}</ul> : (
        <p className="rounded-xl border-2 border-dashed border-border bg-card p-4 text-center text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

function ListItem({ title, subtitle, onRemove }: { title: string; subtitle?: string; onRemove: () => void }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
      <div className="min-w-0">
        <p className="truncate font-bold text-foreground">{title}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <button type="button" onClick={onRemove} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-destructive hover:bg-destructive/10" aria-label="Remover">
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
