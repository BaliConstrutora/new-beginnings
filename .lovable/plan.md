# Plan: Replace obra-store with CentroCusto + Obra model

## What changes

Replace `src/lib/obra-store.ts` entirely with the pasted version. The new shape:

- Two entities in localStorage: `CentroCusto` (codigo, nome) and `Obra` (nome, centroCustoId). 1 obra per CC enforced in `addObra`.
- Selected obra is stored by `obra.id` (not a slug from a static list).
- New API: `addCentroCusto`, `removeCentroCusto`, `getCentrosCusto`, `useCentrosCusto`, `addObra`, `removeObra`, `getObras`, `useObras`, `obraParaCC`, `getObra`, `setObra`, `clearObra`, `obraLabel`, `useObra`, `useHydrated`.
- Removed: the static `OBRAS` array and the old `Obra` slug union type.

## Call sites to update

The current store exports `OBRAS` and a slug-based `Obra` type used elsewhere. I'll update each consumer:

1. **`src/routes/index.tsx`** (entry screen)
   - Replace the static `OBRAS` `<Select>` with options from `useObras()`, showing `obraLabel(obra.id)` (codigo — nome).
   - If `useObras()` is empty, show a hint linking to `/cadastros` to create a Centro de Custo + Obra first; disable Entrar.
   - `setObra(obra)` now receives `obra.id` (string), not a slug.

2. **`src/components/AppHeader.tsx`**
   - Use `useObra()` + `obraLabel(obraId)` to display the current obra label (instead of looking up in `OBRAS`).

3. **`src/routes/dashboard.tsx`** and any other route reading the obra
   - `useObra()` now returns the obra id string (or null). Redirect logic to `/` when null stays the same.
   - Anywhere previously typed as the slug `Obra` union, switch to `string` (obra id).

4. **`src/routes/cadastros.tsx`**
   - Wire up CRUD UI for Centros de Custo and Obras using the new functions (`addCentroCusto`, `removeCentroCusto`, `addObra`, `removeObra`, `useCentrosCusto`, `useObras`). I'll read the current file first and adapt its sections; if it currently manages a different cadastro, I'll add a new section for CC/Obras without removing existing ones.

5. **Stores keyed by obra** (`planejamento-store`, `apontamento-store`, etc.)
   - These already key data by the selected obra string. Since the key changes from slug to obra id, existing local data won't migrate — acceptable for a localStorage prototype. No code changes needed beyond the type (string).

## Out of scope

- No backend/Cloud migration. Data stays in localStorage.
- No changes to `planejamento-store` / `apontamento-store` internals.
- No data migration from old slug keys.

## Technical notes

- The new `Obra` type conflicts with the previous slug-union `Obra` type. All imports of `Obra` from `@/lib/obra-store` will now refer to the object type; I'll fix any type mismatches at call sites.
- `obraLabel` accepts `string | null` so headers can call it directly with `useObra()`.
