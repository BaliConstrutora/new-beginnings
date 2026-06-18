import { useEffect, useState } from "react";

const KEY = "borabora.parametros";
const EVENT = "borabora:parametros";

export type ModeloPlanejamento = "centralizado" | "descentralizado";

export type Parametros = {
  modelo: ModeloPlanejamento;
  horarioLimite: string; // HH:MM
};

const DEFAULT: Parametros = { modelo: "descentralizado", horarioLimite: "18:00" };

export function getParametros(): Parametros {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function setParametros(p: Parametros) {
  window.localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event(EVENT));
}

export function useParametros(): Parametros {
  const [p, setP] = useState<Parametros>(DEFAULT);
  useEffect(() => {
    const sync = () => setP(getParametros());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return p;
}
