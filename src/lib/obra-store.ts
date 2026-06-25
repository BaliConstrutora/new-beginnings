import { useEffect, useState } from "react";

const CC_KEY = "borabora.centros-custo";
const OBRAS_KEY = "borabora.obras";
const OBRA_SELECIONADA_KEY = "borabora.obra";
const EVENT = "borabora:obra";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type CentroCusto = {
  id: string;
  codigo: string;
  nome: string;
};

export type Obra = {
  id: string;
  nome: string;
  centroCustoId: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function readCC(): CentroCusto[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CC_KEY);
    return raw ? (JSON.parse(raw) as CentroCusto[]) : [];
  } catch {
    return [];
  }
}

function writeCC(list: CentroCusto[]) {
  window.localStorage.setItem(CC_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

function readObras(): Obra[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(OBRAS_KEY);
    return raw ? (JSON.parse(raw) as Obra[]) : [];
  } catch {
    return [];
  }
}

function writeObras(list: Obra[]) {
  window.localStorage.setItem(OBRAS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

// ─── CRUD Centro de Custo ────────────────────────────────────────────────────

export function addCentroCusto(codigo: string, nome: string): CentroCusto {
  const list = readCC();
  const novo: CentroCusto = { id: uid(), codigo, nome };
  list.push(novo);
  writeCC(list);
  return novo;
}

export function removeCentroCusto(id: string) {
  writeCC(readCC().filter((c) => c.id !== id));
  writeObras(readObras().filter((o) => o.centroCustoId !== id));
}

export function getCentrosCusto(): CentroCusto[] {
  return readCC();
}

// ─── CRUD Obra ───────────────────────────────────────────────────────────────

export function addObra(nome: string, centroCustoId: string): Obra {
  const list = readObras();
  const nova: Obra = { id: uid(), nome, centroCustoId };
  const idx = list.findIndex((o) => o.centroCustoId === centroCustoId);
  if (idx >= 0) {
    list[idx] = nova;
  } else {
    list.push(nova);
  }
  writeObras(list);
  return nova;
}

export function removeObra(id: string) {
  writeObras(readObras().filter((o) => o.id !== id));
}

export function getObras(): Obra[] {
  return readObras();
}

export function obraParaCC(centroCustoId: string): Obra | null {
  return readObras().find((o) => o.centroCustoId === centroCustoId) ?? null;
}

// ─── Obra selecionada (por id da obra) ───────────────────────────────────────

export function getObra(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(OBRA_SELECIONADA_KEY);
}

export function setObra(obraId: string) {
  window.localStorage.setItem(OBRA_SELECIONADA_KEY, obraId);
  window.dispatchEvent(new Event(EVENT));
}

export function clearObra() {
  window.localStorage.removeItem(OBRA_SELECIONADA_KEY);
  window.dispatchEvent(new Event(EVENT));
}

/** Retorna o nome da obra selecionada para exibição no header */
export function obraLabel(obraId: string | null): string {
  if (!obraId) return "";
  const obra = readObras().find((o) => o.id === obraId);
  if (!obra) return "";
  const cc = readCC().find((c) => c.id === obra.centroCustoId);
  return cc ? `${cc.codigo} — ${obra.nome}` : obra.nome;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useCentrosCusto(): CentroCusto[] {
  const [list, setList] = useState<CentroCusto[]>([]);
  useEffect(() => {
    const sync = () => setList(readCC());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}

export function useObras(): Obra[] {
  const [list, setList] = useState<Obra[]>([]);
  useEffect(() => {
    const sync = () => setList(readObras());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}

export function useObra(): string | null {
  const [obra, setState] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setState(getObra());
    update();
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return obra;
}

export function useHydrated(): boolean {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
