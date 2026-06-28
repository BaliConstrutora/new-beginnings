import { useEffect, useState } from "react";

const KEY = "borabora.cadastros.carreteiros";
const EVENT = "borabora:cadastros";

// ─── Tipo ─────────────────────────────────────────────────────────────────────

export type Carreteiro = {
  id: string;
  placa: string;      // ex: ABC-1234
  motorista: string;  // ex: José Pereira
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function read(): Carreteiro[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Carreteiro[]) : [];
  } catch {
    return [];
  }
}

function write(list: Carreteiro[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function addCarreteiro(placa: string, motorista: string): Carreteiro {
  const list = read();
  const novo: Carreteiro = { id: uid(), placa: placa.toUpperCase(), motorista };
  list.push(novo);
  write(list);
  return novo;
}

export function removeCarreteiro(id: string) {
  write(read().filter((c) => c.id !== id));
}

export function getCarreteiros(): Carreteiro[] {
  return read();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCarreteiros(): Carreteiro[] {
  const [list, setList] = useState<Carreteiro[]>([]);
  useEffect(() => {
    const sync = () => setList(read());
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
