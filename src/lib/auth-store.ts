import { useEffect, useState } from "react";

const KEY = "borabora.role";
const EVENT = "borabora:role";

export type Role = "sede" | "campo";

export const ROLES: { value: Role; label: string; desc: string }[] = [
  {
    value: "sede",
    label: "Sede / Engenheiro",
    desc: "Acesso total: planejamento, custos e relatórios.",
  },
  {
    value: "campo",
    label: "Campo / Apontador",
    desc: "Apenas Dashboard, Planejamento e Apontamento.",
  },
];

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  return v === "sede" || v === "campo" ? v : null;
}

export function setRole(role: Role) {
  window.localStorage.setItem(KEY, role);
  window.dispatchEvent(new Event(EVENT));
}

export function clearRole() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function roleLabel(r: Role | null) {
  return ROLES.find((x) => x.value === r)?.label ?? "";
}

export function useRole(): Role | null {
  const [role, setState] = useState<Role | null>(() => getRole());
  useEffect(() => {
    const sync = () => setState(getRole());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return role;
}

export function canAccess(role: Role | null, path: string): boolean {
  if (role === "sede") return true;
  // campo: blocked from cadastros (parâmetros) e relatórios
  if (path.startsWith("/relatorios")) return false;
  if (path.startsWith("/cadastros")) return false;
  return true;
}
