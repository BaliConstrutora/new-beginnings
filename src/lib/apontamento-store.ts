import { useEffect, useState } from "react";

const KEY = "borabora.apontamento";
const EVENT = "borabora:apontamento";

export type ServicoRealizado = {
  id: string;
  servico: string;
  unidade: string;
  metaQuantidade?: string;
  realizado: string;
  estacaInicial: string;
  estacaFinal: string;
  extraPlano?: boolean;
};

export type Apontamento = {
  data: string;
  frente: string;
  servicos: ServicoRealizado[];
};

type Store = Record<string, Apontamento>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(s: Store) {
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(EVENT));
}

export function getApontamento(data: string): Apontamento | null {
  return read()[data] ?? null;
}

export function saveApontamento(a: Apontamento) {
  const s = read();
  s[a.data] = a;
  write(s);
}

export function useApontamento(data: string): Apontamento | null {
  const [a, setA] = useState<Apontamento | null>(null);
  useEffect(() => {
    const sync = () => setA(getApontamento(data));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [data]);
  return a;
}

/** Aderência: média ponderada de min(realizado/meta, 1) entre serviços planejados */
export function calcularAderencia(
  planejado: { id: string; metaQuantidade: string }[],
  realizado: { id: string; realizado: string; metaQuantidade?: string }[],
): number | null {
  if (!planejado.length) return null;
  let soma = 0;
  let count = 0;
  for (const p of planejado) {
    const meta = parseFloat(p.metaQuantidade);
    if (!meta || isNaN(meta)) continue;
    const r = realizado.find((x) => x.id === p.id);
    const real = r ? parseFloat(r.realizado) : 0;
    const pct = Math.min((isNaN(real) ? 0 : real) / meta, 1);
    soma += pct;
    count += 1;
  }
  if (!count) return null;
  return Math.round((soma / count) * 100);
}
