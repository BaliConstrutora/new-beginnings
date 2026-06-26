import { useEffect, useState } from "react";

const EQUIPES_KEY = "borabora.cadastros.equipes";
const EVENT = "borabora:cadastros";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type MembroEquipe = {
  maoObraId: string; // FK para MaoObraCadastro.id
  nome: string;      // snapshot do nome no momento do cadastro
  funcao: string;    // snapshot da função
};

export type Equipe = {
  id: string;
  nome: string;
  membros: MembroEquipe[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function readEquipes(): Equipe[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EQUIPES_KEY);
    return raw ? (JSON.parse(raw) as Equipe[]) : [];
  } catch {
    return [];
  }
}

function writeEquipes(list: Equipe[]) {
  window.localStorage.setItem(EQUIPES_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function addEquipe(nome: string, membros: MembroEquipe[]): Equipe {
  const list = readEquipes();
  const nova: Equipe = { id: uid(), nome, membros };
  list.push(nova);
  writeEquipes(list);
  return nova;
}

export function removeEquipe(id: string) {
  writeEquipes(readEquipes().filter((e) => e.id !== id));
}

export function getEquipes(): Equipe[] {
  return readEquipes();
}

export function getEquipe(id: string): Equipe | null {
  return readEquipes().find((e) => e.id === id) ?? null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useEquipes(): Equipe[] {
  const [list, setList] = useState<Equipe[]>([]);
  useEffect(() => {
    const sync = () => setList(readEquipes());
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
