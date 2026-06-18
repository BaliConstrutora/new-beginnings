import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { OBRAS, getObra, setObra } from "@/lib/obra-store";
import { ROLES, type Role, getRole, setRole } from "@/lib/auth-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bora Bora — Gestão de Custos e Apropriação" },
      {
        name: "description",
        content:
          "Selecione perfil e obra para acessar o sistema Bora Bora de Gestão de Custos e Apropriação.",
      },
    ],
  }),
  component: EntryScreen,
});

function EntryScreen() {
  const navigate = useNavigate();
  const [obra, setObraVal] = useState<string>("");
  const [role, setRoleVal] = useState<Role | "">("");

  useEffect(() => {
    const o = getObra();
    if (o) setObraVal(o);
    const r = getRole();
    if (r) setRoleVal(r);
  }, []);

  const handleEnter = () => {
    if (!obra || !role) return;
    setObra(obra);
    setRole(role);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-between gap-6 pb-4">
      <div className="flex flex-col items-center pt-8 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-lg">
          <HardHat className="h-10 w-10" />
        </div>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-foreground">
          Bora Bora
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Gestão de Custos e Apropriação
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2 rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
          <Label className="text-sm font-bold uppercase tracking-wider">
            Perfil de Acesso
          </Label>
          <div className="grid grid-cols-1 gap-2">
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
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
          <Label htmlFor="obra" className="text-sm font-bold uppercase tracking-wider">
            Obra Atual
          </Label>
          <Select value={obra} onValueChange={setObraVal}>
            <SelectTrigger id="obra" className="h-14 text-base">
              <SelectValue placeholder="Selecione a obra" />
            </SelectTrigger>
            <SelectContent>
              {OBRAS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-base">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleEnter}
            disabled={!obra || !role}
            className="mt-2 h-14 w-full text-base font-bold shadow-md"
          >
            Entrar
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Bora Bora · Uso em campo
      </p>
    </div>
  );
}
