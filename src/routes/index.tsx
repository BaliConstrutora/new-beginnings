import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HardHat, ShieldCheck, HardHat as HardHatIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useObras, getObra, setObra } from "@/lib/obra-store";
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
  const obras = useObras();

  const [obraId, setObraId] = useState("");
  const [role, setRoleVal] = useState<"" | Role>("");

  useEffect(() => {
    const prev = getObra();
    if (prev) setObraId(prev);
    const r = getRole();
    if (r) setRoleVal(r);
  }, []);

  const handleEnter = () => {
    if (!obraId || !role) return;
    setObra(obraId);
    setRole(role as Role);
    navigate({ to: "/dashboard" });
  };

  const podeEntrar = !!obraId && !!role;

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

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Obra
          </Label>
          {obras.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border bg-background p-4 text-center">
              <p className="text-sm font-semibold text-foreground">
                Nenhuma obra cadastrada.
              </p>
              <Link
                to="/cadastros"
                className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Acesse Cadastros → Obras para adicionar
              </Link>
            </div>
          ) : (
            <Select value={obraId} onValueChange={setObraId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a obra" />
              </SelectTrigger>
              <SelectContent>
                {obras.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

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
