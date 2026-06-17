import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HardHat } from "lucide-react";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bora Bora — Gestão de Custos e Apropriação" },
      {
        name: "description",
        content:
          "Selecione a obra atual e acesse o sistema Bora Bora de Gestão de Custos e Apropriação de Obras de Infraestrutura.",
      },
    ],
  }),
  component: EntryScreen,
});

function EntryScreen() {
  const navigate = useNavigate();
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    const current = getObra();
    if (current) setValue(current);
  }, []);

  const handleEnter = () => {
    if (!value) return;
    setObra(value);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-between gap-8">
      <div className="flex flex-col items-center pt-10 text-center">
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

      <div className="space-y-3 rounded-2xl border-2 border-border bg-card p-5 shadow-sm">
        <Label htmlFor="obra" className="text-sm font-bold uppercase tracking-wider">
          Obra Atual
        </Label>
        <Select value={value} onValueChange={setValue}>
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
          disabled={!value}
          className="mt-2 h-14 w-full text-base font-bold shadow-md"
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
