# Plan: Refactor `/cadastros` to a step-based, polished layout

Rewrite `src/routes/cadastros.tsx` matching the structure implied by the pasted skeleton (numbered step cards, divider, shared list components). Keep all existing CRUD logic intact; only the JSX/layout and a couple of helpers change.

## Structure

- **Route + `CadastrosPage`**: restore `useNavigate` + `useObra` + `useHydrated` redirect to `/` when no obra is selected. (Note: this re-introduces the "can't reach cadastros from `/` without obra" issue — see Open question.) Header (h1 + subtitle) + `Tabs` with 5 triggers: `Obras` (default), `Equip.`, `M.Obra`, `Frente`, `Param.`. Each trigger shows its icon + label.

- **`ObrasTab`** (the main visual change):
  - **Passo 1 — Centro de Custo** card:
    - Numbered badge `1` + section title.
    - Form: `Código` (uppercased on change), `Nome descritivo`, button "Salvar Centro de Custo". Toasts on validation/success via `addCentroCusto`.
    - `ListSection` of CCs. Each row uses `ListItem` with `title=cc.codigo`, `subtitle=cc.nome`, optional `badge` showing the linked obra name from `obraParaCC(cc.id)` (or "Sem obra"), and `onRemove` calling `removeCentroCusto` with a toast warning that the linked obra is also removed.
  - **Divisor** (centered horizontal line + chevron / label).
  - **Passo 2 — Obra** card:
    - Numbered badge `2` + section title.
    - `Centro de Custo` `Select` (disabled-state copy when `centrosCusto.length === 0`: "Cadastre um centro de custo no passo 1 primeiro.").
    - `Nome da Obra` input, disabled until a CC is picked.
    - Button "Salvar Obra" calling `addObra`.
    - `ListSection` of obras. Each `ListItem` shows `title=obra.nome`, `subtitle=cc.codigo — cc.nome`, `onRemove=removeObra`.

- **`FrentesTab`, `EquipamentosTab`, `MaoObraTab`, `ParametrosTab`**: keep current behavior; just route their lists through the shared `ListSection` / `ListItem` so visuals match the new Obras tab.

- **Shared `ListSection` / `ListItem`** (extracted):
  - `ListSection({ title, empty, children })`: uppercase muted title; renders `<ul>` of children or an empty-state card with `empty` text.
  - `ListItem({ title, subtitle, badge?, onRemove })`: row with title + optional badge pill + subtitle, plus a destructive trash button.

## Styling

Use existing semantic tokens only (`bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `text-destructive`). Step badges use `bg-primary text-primary-foreground` rounded-full. Form cards use `rounded-2xl border-2 border-border bg-card p-4`.

## Out of scope

- No changes to `obra-store.ts`, `cadastros-store.ts`, `parametros-store.ts`, or any other route.
- No data migration.

## Open question (blocking the redirect choice)

Re-adding the `if (!obra) navigate("/")` guard in `CadastrosPage` will trap new users: the entry screen shows a link to `/cadastros` when no obras exist, but the guard bounces them back. Two options — I'll use **A** unless you say otherwise:

- **A (default)**: Keep `/cadastros` accessible without a selected obra (no guard), so first-time setup works. Drop `useNavigate`/`useObra`/`useHydrated` from the page wrapper.
- **B**: Keep the guard as in your paste, and instead change the entry screen's empty-state to surface CC/Obra creation inline (no navigation needed).
