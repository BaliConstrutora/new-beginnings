import { useEffect, useState } from "react";

const KEY = "borabora.obra";

export const OBRAS = [
  { value: "contrato-pbh", label: "Contrato PBH" },
  { value: "rodovia-br-381", label: "Rodovia BR-381" },
  { value: "duplicacao-br-040", label: "Duplicação BR-040" },
  { value: "anel-rodoviario-bh", label: "Anel Rodoviário BH" },
] as const;

export function getObra(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function setObra(value: string) {
  window.localStorage.setItem(KEY, value);
  window.dispatchEvent(new Event("borabora:obra"));
}

export function clearObra() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("borabora:obra"));
}

export function obraLabel(value: string | null): string {
  if (!value) return "";
  return OBRAS.find((o) => o.value === value)?.label ?? value;
}

export function useObra(): string | null {
  const [obra, setState] = useState<string | null>(() => getObra());
  useEffect(() => {
    const update = () => setState(getObra());
    window.addEventListener("borabora:obra", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("borabora:obra", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return obra;
}
