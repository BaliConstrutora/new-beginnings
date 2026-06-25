import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  HardHat,
  ShieldCheck,
  HardHat as HardHatIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCentrosCusto,
  useObras,
  getObra,
  setObra,
  obraParaCC,
} from "@/lib/obra-store";
import { ROLES, type Role, getRole, setRole } from "@/lib/auth-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bora Bora — Gestão de Produção" },
      {
        name: "description",
        content:
          "Selecione perfil e obra para acessar o sistema Bora Bora de Gestão de Produção.",
      },
    ],
  }),
  component: EntryScreen,
});

function EntryScreen() {
  const navigate = useNavigate();
  const centrosCusto = useCentrosCusto();
  const obras = useObras();

  const [ccId, setCcId] = useState("");
  const [role, setRoleVal] = useState<"" | Role>("");

  const obraVinculada = ccId ? obraParaCC(ccId) : null;

  useEffect(() => {
    const obraId = getObra();
    if (obraId) {
      const obra = obras.find((o) => o.id === obraId);
      if (obra) setCcId(obra.centroCustoId);
    }
    const r = getRole();
    if (r) setRoleVal(r);
  }, [obras]);

  const handleEnter = () => {
    if (!obraVinculada || !role) return;
    setObra(obraVinculada.id);
    setRole(role as Role);
    navigate({ to: "/dashboard" });
  };

  const ccSelecionado = centrosCusto.find((c) => c.id === ccId);
  const podeEntrar = !!obraVinculada && !!role;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center gap-6 px-4 py-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <HardHat size={28} />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-foreground">Bora Bora</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestão de Produção</p>
      </div>

      <div className="space-y-6 rounded-2xl border border-border bg-card p-5">
        {/* Perfil de Acesso */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Perfil de Acesso
          </Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ROLES.map((r) => {
              const Icon = r.value === "sede" ? ShieldCheck : HardHatIcon;
              const active = role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRoleVal(r.value)}
                  className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {r.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {r.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Centro de Custo */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Centro de Custo
          </Label>
          {centrosCusto.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border bg-background p-4 text-center">
              <p className="text-sm font-semibold text-foreground">
                Nenhum centro de custo cadastrado.
              </p>
              <Link
                to="/cadastros"
                className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Acesse Cadastros → Obras para adicionar
              </Link>
            </div>
          ) : (
            <Select value={ccId} onValueChange={setCcId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o centro de custo" />
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

        {/* Obra vinculada */}
        {ccId && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Obra
            </Label>
            {obraVinculada ? (
              <div className="flex items-start gap-3 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 p-3">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {obraVinculada.nome}
                  </p>
                  {ccSelecionado && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ccSelecionado.codigo} — {ccSelecionado.nome}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border-2 border-dashed border-border bg-background p-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-muted-foreground"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Nenhuma obra vinculada a este centro de custo.
                  </p>
                  <Link
                    to="/cadastros"
                    className="mt-1 inline-block text-xs font-semibold text-primary hover:underline"
                  >
                    Acesse Cadastros → Obras para cadastrar
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleEnter}
          disabled={!podeEntrar}
          className="w-full"
          size="lg"
        >
          Entrar
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Bora Bora · Uso em campo
      </p>
    </div>
  );
}
