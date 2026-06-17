import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/relatorios")({
  component: RelatoriosPage,
});

const rdoMock = [
  { data: "12/06/2026", frente: "Terraplenagem KM 12", clima: "Ensolarado", mo: 14, equip: "TR-01, ESC-02" },
  { data: "13/06/2026", frente: "Drenagem KM 14", clima: "Nublado", mo: 9, equip: "RET-01" },
  { data: "14/06/2026", frente: "Pavimentação KM 10", clima: "Chuva fraca", mo: 18, equip: "RC-01, CB-03, CB-04" },
  { data: "15/06/2026", frente: "Terraplenagem KM 13", clima: "Ensolarado", mo: 12, equip: "TR-01, MN-01" },
];

const producaoMock = [
  { servico: "Escavação comum", un: "m³", ei: 100, ef: 150, qtd: 1250 },
  { servico: "Aterro compactado", un: "m³", ei: 100, ef: 150, qtd: 980 },
  { servico: "Imprimação", un: "m²", ei: 80, ef: 110, qtd: 3200 },
  { servico: "BGS - Base", un: "m³", ei: 80, ef: 110, qtd: 540 },
];

const frotaMock = [
  { equip: "TR-01 - Trator Esteira", ht: 42, hp: 6, diesel: 820 },
  { equip: "ESC-02 - Escavadeira", ht: 38, hp: 4, diesel: 690 },
  { equip: "RC-01 - Rolo Compactador", ht: 30, hp: 2, diesel: 410 },
  { equip: "CB-03 - Caminhão Basculante", ht: 45, hp: 3, diesel: 530 },
];

const moMock = [
  { cat: "Direta", funcao: "Operador de Escavadeira", hn: 176, he: 22 },
  { cat: "Direta", funcao: "Servente", hn: 352, he: 18 },
  { cat: "Direta", funcao: "Motorista Basculante", hn: 264, he: 31 },
  { cat: "Indireta", funcao: "Encarregado", hn: 176, he: 8 },
  { cat: "Indireta", funcao: "Apontador", hn: 176, he: 4 },
];

function exportCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename} exportado`);
}

function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
    >
      <Download className="h-4 w-4" />
      Exportar CSV
    </Button>
  );
}

function RelatoriosPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState(today);

  return (
    <div className="min-h-screen pb-24 bg-background">
      <AppHeader title="Relatórios" />
      <main className="mx-auto max-w-screen-sm px-4 py-4 space-y-4">
        <section className="rounded-xl border-2 border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide">Filtro</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="di" className="text-xs">Data Inicial</Label>
              <Input id="di" type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="df" className="text-xs">Data Final</Label>
              <Input id="df" type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} />
            </div>
          </div>
          <Button
            className="w-full h-11 font-bold"
            onClick={() => toast.success("Filtro aplicado")}
          >
            Filtrar
          </Button>
        </section>

        <Tabs defaultValue="rdo" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="rdo" className="text-xs py-2">RDO</TabsTrigger>
            <TabsTrigger value="prod" className="text-xs py-2">Produção</TabsTrigger>
            <TabsTrigger value="frota" className="text-xs py-2">Frota</TabsTrigger>
            <TabsTrigger value="mo" className="text-xs py-2">Mão Obra</TabsTrigger>
          </TabsList>

          <TabsContent value="rdo" className="space-y-3">
            <ExportButton
              onClick={() =>
                exportCSV("rdo-consolidado.csv", [
                  ["Data", "Frente de Serviço", "Clima", "Total MO", "Equipamentos"],
                  ...rdoMock.map((r) => [r.data, r.frente, r.clima, r.mo, r.equip]),
                ])
              }
            />
            <div className="rounded-xl border-2 border-border bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Data</TableHead>
                    <TableHead className="whitespace-nowrap">Frente</TableHead>
                    <TableHead className="whitespace-nowrap">Clima</TableHead>
                    <TableHead className="whitespace-nowrap text-right">MO</TableHead>
                    <TableHead className="whitespace-nowrap">Equipamentos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rdoMock.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap font-medium">{r.data}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.frente}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.clima}</TableCell>
                      <TableCell className="text-right">{r.mo}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.equip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="prod" className="space-y-3">
            <ExportButton
              onClick={() =>
                exportCSV("producao-fisica.csv", [
                  ["Serviço", "Unidade", "Estaca Inicial", "Estaca Final", "Qtd Acumulada"],
                  ...producaoMock.map((r) => [r.servico, r.un, r.ei, r.ef, r.qtd]),
                ])
              }
            />
            <div className="rounded-xl border-2 border-border bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Serviço</TableHead>
                    <TableHead className="whitespace-nowrap">Un.</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Est. Ini.</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Est. Fin.</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Qtd Acum.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {producaoMock.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap font-medium">{r.servico}</TableCell>
                      <TableCell>{r.un}</TableCell>
                      <TableCell className="text-right">{r.ei}</TableCell>
                      <TableCell className="text-right">{r.ef}</TableCell>
                      <TableCell className="text-right font-bold">{r.qtd.toLocaleString("pt-BR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="frota" className="space-y-3">
            <ExportButton
              onClick={() =>
                exportCSV("controle-frota.csv", [
                  ["Equipamento", "Horas Trabalhadas", "Horas Paradas", "Diesel (L)"],
                  ...frotaMock.map((r) => [r.equip, r.ht, r.hp, r.diesel]),
                ])
              }
            />
            <div className="rounded-xl border-2 border-border bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Equipamento</TableHead>
                    <TableHead className="whitespace-nowrap text-right">H. Trab.</TableHead>
                    <TableHead className="whitespace-nowrap text-right">H. Parad.</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Diesel (L)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {frotaMock.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap font-medium">{r.equip}</TableCell>
                      <TableCell className="text-right">{r.ht}</TableCell>
                      <TableCell className="text-right">{r.hp}</TableCell>
                      <TableCell className="text-right font-bold">{r.diesel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="mo" className="space-y-3">
            <ExportButton
              onClick={() =>
                exportCSV("mao-de-obra.csv", [
                  ["Categoria", "Função", "Horas Normais", "Horas Extras"],
                  ...moMock.map((r) => [r.cat, r.funcao, r.hn, r.he]),
                ])
              }
            />
            <div className="rounded-xl border-2 border-border bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Categoria</TableHead>
                    <TableHead className="whitespace-nowrap">Função</TableHead>
                    <TableHead className="whitespace-nowrap text-right">H. Normais</TableHead>
                    <TableHead className="whitespace-nowrap text-right">H. Extras</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moMock.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${
                            r.cat === "Direta"
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {r.cat}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium">{r.funcao}</TableCell>
                      <TableCell className="text-right">{r.hn}</TableCell>
                      <TableCell className="text-right font-bold">{r.he}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
}
