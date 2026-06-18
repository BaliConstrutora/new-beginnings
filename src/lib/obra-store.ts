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
  const [obra, setState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const update = () => setState(getObra());
    update();
    setReady(true);
    window.addEventListener("borabora:obra", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("borabora:obra", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  // Sinaliza "ainda não hidratado" para que guards não redirecionem antes do mount
  return ready ? obra : (typeof window !== "undefined" ? obra : null);
}
