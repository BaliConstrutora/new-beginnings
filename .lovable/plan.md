# Plan: Rewrite entry screen with CC → Obra auto-selection

Replace `src/routes/index.tsx` with the new flow: user picks a **Centro de Custo**, the linked **Obra** appears automatically (1 obra per CC).

## Structure

- Imports: `useCentrosCusto`, `useObras`, `getObra`, `setObra`, `obraParaCC` from `@/lib/obra-store`; `ROLES`, `Role`, `getRole`, `setRole` from `@/lib/auth-store`; `CheckCircle2` added to lucide imports.
- State: `ccId` (string), `role` (`"" | Role`). Derived: `obraVinculada = ccId ? obraParaCC(ccId) : null`, `ccSelecionado`, `podeEntrar`.
- `useEffect([obras])`: restores prior selection — `getObra()` → find obra in `obras` → set `ccId` to its `centroCustoId`; restores `role` via `getRole()`.
- `handleEnter`: guards on `obraVinculada && role`, then `setObra(obraVinculada.id)`, `setRole(role)`, navigate to `/dashboard`.

## JSX layout (centered card, max-w-md)

1. **Header**: `HardHat` in `bg-primary` rounded square, "Bora Bora" title, "Gestão de Produção" subtitle.
2. **Card** (`rounded-2xl border bg-card p-5`) with three blocks:
   - **Perfil de Acesso**: `ROLES.map` grid of 2 buttons (ShieldCheck for `sede`, HardHatIcon for others), active state `border-primary bg-primary/10`.
   - **Centro de Custo**: empty-state card with link to `/cadastros` when `centrosCusto.length === 0`; otherwise a `<Select>` listing `cc.codigo` (bold) + `cc.nome` (muted).
   - **Obra (conditional on `ccId`)**: when `obraVinculada` exists, a success row with `CheckCircle2` icon, obra name, and `ccSelecionado` codigo/nome subtitle (green/emerald accent or `bg-primary/5`). When not, an empty-state card pointing to Cadastros.
   - **Entrar** button: `disabled={!podeEntrar}`, full-width, `size="lg"`.
3. **Footer**: `© {year} Bora Bora · Uso em campo`.

## Styling

Semantic tokens only (`bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `bg-primary/10`). Success state on Obra block uses `border-emerald-500/40 bg-emerald-500/10` with `text-emerald-700 dark:text-emerald-400` for the check icon, matching the dashboard's adherence palette.

## Out of scope

- No changes to stores, AppHeader, or other routes.
- No backend wiring.
