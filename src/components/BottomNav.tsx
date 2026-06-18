import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardList,
  Database,
  FileBarChart2,
  CalendarRange,
} from "lucide-react";
import { useRole } from "@/lib/auth-store";

import type { Role } from "@/lib/auth-store";

const ALL: { to: string; label: string; icon: typeof LayoutDashboard; roles: Role[] }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["sede", "campo"] },
  { to: "/planejamento", label: "Planejar", icon: CalendarRange, roles: ["sede", "campo"] },
  { to: "/apontamento", label: "Apontar", icon: ClipboardList, roles: ["sede", "campo"] },
  { to: "/cadastros", label: "Cadastros", icon: Database, roles: ["sede"] },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart2, roles: ["sede"] },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = useRole();
  if (pathname === "/") return null;

  const items = ALL.filter((i) => (role ? i.roles.includes(role) : true));
  const cols = items.length;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t-2 border-border bg-card pb-[env(safe-area-inset-bottom)]">
      <ul
        className="mx-auto grid max-w-screen-sm"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 min-h-[60px] text-[11px] font-semibold transition-colors ${
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
