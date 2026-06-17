import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

export const Route = createFileRoute("/apontamento")({
  head: () => ({
    meta: [
      { title: "Apontamento Diário — Gestão de Obras" },
      { name: "description", content: "Registro diário de condições, localização, equipamentos e produção." },
    ],
  }),
  component: Apontamento,
});

type Equipamento = {
  id: number;
  tipo: string;
  horInicial: string;
  horFinal: string;
  diesel: string;
};

const novoEquip = (id: number): Equipamento => ({
  id,
  tipo: "",
  horInicial: "",
  horFinal: "",
  diesel: "",
});

function Apontamento() {
  const hoje = new Date().toISOString().slice(0, 10);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([novoEquip(1)]);

  const addEquip = () =>
    setEquipamentos((prev) => [...prev, novoEquip(Date.now())]);
  const removeEquip = (id: number) =>
    setEquipamentos((prev) =>
      prev.length > 1 ? prev.filter((e) => e.id !== id) : prev,
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Apontamento salvo com sucesso!", {
      description: "Os dados do dia foram registrados.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold">Apontamento Diário</h1>
        <p className="text-sm text-muted-foreground">
          Preencha as 4 etapas e salve no final.
        </p>
      </header>

      <Accordion
        type="single"
        collapsible
        defaultValue="condicoes"
        className="space-y-3"
      >
        <AccordionItem
          value="condicoes"
          className="rounded-2xl border-2 border-border bg-card px-4"
        >
          <AccordionTrigger className="text-base font-bold hover:no-underline">
            <span className="flex items-center gap-3">
              <Badge n={1} /> Condições
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <Field label="Data">
              <Input type="date" value={hoje} readOnly className="h-12" />
            </Field>
            <Field label="Clima">
              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ensolarado">Ensolarado</SelectItem>
                  <SelectItem value="nublado">Nublado</SelectItem>
                  <SelectItem value="chuva-fraca">Chuva fraca</SelectItem>
                  <SelectItem value="chuva-forte">Chuva forte</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Frente de Serviço">
              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terraplenagem">Terraplenagem</SelectItem>
                  <SelectItem value="drenagem">Drenagem</SelectItem>
                  <SelectItem value="pavimentacao">Pavimentação</SelectItem>
                  <SelectItem value="obras-arte">Obras de arte</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="localizacao"
          className="rounded-2xl border-2 border-border bg-card px-4"
        >
          <AccordionTrigger className="text-base font-bold hover:no-underline">
            <span className="flex items-center gap-3">
              <Badge n={2} /> Localização
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <Field label="Estaca Inicial">
              <Input type="number" inputMode="decimal" placeholder="0" className="h-12" />
            </Field>
            <Field label="Estaca Final">
              <Input type="number" inputMode="decimal" placeholder="0" className="h-12" />
            </Field>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="equipamentos"
          className="rounded-2xl border-2 border-border bg-card px-4"
        >
          <AccordionTrigger className="text-base font-bold hover:no-underline">
            <span className="flex items-center gap-3">
              <Badge n={3} /> Equipamentos
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {equipamentos.map((eq, idx) => (
              <div
                key={eq.id}
                className="space-y-3 rounded-xl border border-border bg-background p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-muted-foreground">
                    Equipamento {idx + 1}
                  </p>
                  {equipamentos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEquip(eq.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                      aria-label="Remover equipamento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Field label="Equipamento">
                  <Select>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="escavadeira">Escavadeira</SelectItem>
                      <SelectItem value="motoniveladora">Motoniveladora</SelectItem>
                      <SelectItem value="rolo">Rolo Compactador</SelectItem>
                      <SelectItem value="caminhao">Caminhão Basculante</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Horímetro Inicial">
                  <Input type="number" inputMode="decimal" placeholder="0" className="h-12" />
                </Field>
                <Field label="Horímetro Final">
                  <Input type="number" inputMode="decimal" placeholder="0" className="h-12" />
                </Field>
                <Field label="Diesel (L)">
                  <Input type="number" inputMode="decimal" placeholder="0" className="h-12" />
                </Field>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addEquip}
              className="h-12 w-full border-2 border-dashed border-primary text-primary hover:bg-primary/10"
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar mais um equipamento
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="producao"
          className="rounded-2xl border-2 border-border bg-card px-4"
        >
          <AccordionTrigger className="text-base font-bold hover:no-underline">
            <span className="flex items-center gap-3">
              <Badge n={4} /> Produção
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <Field label="Serviço Executado">
              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corte">Corte</SelectItem>
                  <SelectItem value="aterro">Aterro</SelectItem>
                  <SelectItem value="bota-fora">Bota-fora</SelectItem>
                  <SelectItem value="compactacao">Compactação</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Quantidade">
              <Input type="number" inputMode="decimal" placeholder="0" className="h-12" />
            </Field>
            <Field label="Unidade">
              <Select>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m3">m³</SelectItem>
                  <SelectItem value="m2">m²</SelectItem>
                  <SelectItem value="m">m</SelectItem>
                  <SelectItem value="t">t</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button
        type="submit"
        className="h-14 w-full text-base font-bold shadow-md"
      >
        Salvar Apontamento
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">{label}</Label>
      {children}
    </div>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
      {n}
    </span>
  );
}
