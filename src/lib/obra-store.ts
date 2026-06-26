import { useEffect, useState } from "react";

const OBRAS_KEY = "borabora.obras";
const OBRA_KEY = "borabora.obra";
const EVENT = "borabora:obra";

// ─── Tipo ─────────────────────────────────────────────────────────────────────

export type Obra = {
  id: string;
  nome: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

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

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function addObra(nome: string): Obra {
  const list = readObras();
  const nova: Obra = { id: uid(), nome };
  list.push(nova);
  writeObras(list);
  return nova;
}

export function removeObra(id: string) {
  writeObras(readObras().filter((o) => o.id !== id));
}

export function getObras(): Obra[] {
  return readObras();
}

// ─── Obra selecionada ─────────────────────────────────────────────────────────

export function getObra(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(OBRA_KEY);
}

export function setObra(id: string) {
  window.localStorage.setItem(OBRA_KEY, id);
  window.dispatchEvent(new Event(EVENT));
}

export function clearObra() {
  window.localStorage.removeItem(OBRA_KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function obraLabel(id: string | null): string {
  if (!id) return "";
  return readObras().find((o) => o.id === id)?.nome ?? "";
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

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
