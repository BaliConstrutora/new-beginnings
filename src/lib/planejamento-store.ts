import { useEffect, useState } from "react";

const KEY = "borabora.planejamento";
const EVENT = "borabora:planejamento";

export type ServicoPlanejado = {
  id: string;
  servico: string;
  metaQuantidade: string;
  unidade: string;
};

export type EquipePrevista = { id: string; funcaoId: string; qtdPrevista: string };
export type EquipamentoPrevisto = { id: string; equipamentoId: string };

export type Planejamento = {
  data: string; // YYYY-MM-DD
  frente: string;
  servicos: ServicoPlanejado[];
  equipe: EquipePrevista[];
  equipamentos: EquipamentoPrevisto[];
};

type Store = Record<string, Planejamento>;

const planoKey = (data: string) => `${data}`;

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

export function getPlanejamento(data: string): Planejamento | null {
  return read()[planoKey(data)] ?? null;
}

export function savePlanejamento(p: Planejamento) {
  const s = read();
  s[planoKey(p.data)] = p;
  write(s);
}

export function usePlanejamento(data: string): Planejamento | null {
  const [p, setP] = useState<Planejamento | null>(null);
  useEffect(() => {
    const sync = () => setP(getPlanejamento(data));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [data]);
  return p;
}

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
