import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, Truck, Settings } from "lucide-react";

const items = [
  { to: "/", label: "Início", icon: Home },
  { to: "/apontamento", label: "Apontamento", icon: ClipboardList },
  { to: "/checklist", label: "Checklist", icon: Truck },
  { to: "/configuracoes", label: "Config", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t-2 border-border bg-card pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 min-h-[60px] text-xs font-semibold transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`h-1 w-8 rounded-full transition-colors ${
                    active ? "bg-primary" : "bg-transparent"
                  }`}
                />
                <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
