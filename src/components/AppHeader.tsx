import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { HardHat, ChevronDown } from "lucide-react";
import { useObra, obraLabel, clearObra } from "@/lib/obra-store";

export function AppHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const obra = useObra();
  const navigate = useNavigate();

  if (pathname === "/") return null;

  const handleSwitch = () => {
    clearObra();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex max-w-screen-sm items-center justify-between gap-3 px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <HardHat className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-black leading-tight">Bora Bora</p>
            <p className="text-[10px] font-semibold uppercase leading-tight tracking-wider text-sidebar-foreground/70">
              Custos & Apropriação
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={clearObra}
          className="flex max-w-[45%] items-center gap-1.5 rounded-lg border border-sidebar-foreground/20 bg-sidebar-foreground/5 px-2.5 py-1.5 text-xs font-bold transition-colors hover:bg-sidebar-foreground/10"
          aria-label="Trocar obra"
        >
          <span className="truncate">{obraLabel(obra) || "Selecionar obra"}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        </button>
      </div>
    </header>
  );
}
