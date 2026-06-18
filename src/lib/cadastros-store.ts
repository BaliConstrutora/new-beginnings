import { useEffect, useState } from "react";

const EQUIP_KEY = "borabora.cadastros.equipamentos";
const MO_KEY = "borabora.cadastros.maoobra";
const FRENTE_KEY = "borabora.cadastros.frentes";
const EVENT = "borabora:cadastros";

export type EquipamentoCadastro = {
  id: string;
  prefixo: string;
  descricao: string;
};

export type MaoObraCadastro = {
  id: string;
  funcao: string;
  categoria: "direta" | "indireta";
};

export const DESCRICOES_EQUIPAMENTO = [
  "Escavadeira Hidráulica",
  "Motoniveladora",
  "Rolo Compactador",
  "Caminhão Basculante",
  "Pá Carregadeira",
  "Retroescavadeira",
  "Trator de Esteira",
  "Caminhão Pipa",
] as const;

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function useEquipamentos() {
  const [list, setList] = useState<EquipamentoCadastro[]>([]);
  useEffect(() => {
    const sync = () => setList(read<EquipamentoCadastro>(EQUIP_KEY));
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

export function addEquipamento(prefixo: string, descricao: string) {
  const list = read<EquipamentoCadastro>(EQUIP_KEY);
  list.push({ id: uid(), prefixo, descricao });
  write(EQUIP_KEY, list);
}

export function removeEquipamento(id: string) {
  write(
    EQUIP_KEY,
    read<EquipamentoCadastro>(EQUIP_KEY).filter((e) => e.id !== id),
  );
}

export function useMaoObra() {
  const [list, setList] = useState<MaoObraCadastro[]>([]);
  useEffect(() => {
    const sync = () => setList(read<MaoObraCadastro>(MO_KEY));
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

export function addMaoObra(funcao: string, categoria: "direta" | "indireta") {
  const list = read<MaoObraCadastro>(MO_KEY);
  list.push({ id: uid(), funcao, categoria });
  write(MO_KEY, list);
}

export function removeMaoObra(id: string) {
  write(MO_KEY, read<MaoObraCadastro>(MO_KEY).filter((m) => m.id !== id));
}

export type FrenteCadastro = { id: string; nome: string };

export function useFrentes() {
  const [list, setList] = useState<FrenteCadastro[]>([]);
  useEffect(() => {
    const sync = () => setList(read<FrenteCadastro>(FRENTE_KEY));
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

export function addFrente(nome: string) {
  const list = read<FrenteCadastro>(FRENTE_KEY);
  list.push({ id: uid(), nome });
  write(FRENTE_KEY, list);
}

export function removeFrente(id: string) {
  write(FRENTE_KEY, read<FrenteCadastro>(FRENTE_KEY).filter((f) => f.id !== id));
}
