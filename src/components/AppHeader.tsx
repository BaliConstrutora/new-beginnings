import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HardHat, ChevronDown } from "lucide-react";
import { useObra, obraLabel, clearObra } from "@/lib/obra-store";

export function AppHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const obra = useObra();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (pathname === "/") return null;

  const handleSwitch = () => {
    clearObra();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HardHat size={18} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-foreground">Bora Bora</span>
            <span className="text-xs text-muted-foreground">
              Gestão de Produção
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleSwitch}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <span className="max-w-[140px] truncate">
            {mounted ? obraLabel(obra) || "Selecionar obra" : "Selecionar obra"}
          </span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
