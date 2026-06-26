## Reverter: remover Centro de Custo do fluxo

Voltar ao modelo simples onde uma **Obra** tem apenas `id` e `nome`, sem vínculo a Centro de Custo.

### 1. `src/lib/obra-store.ts`
Substituir pelo conteúdo colado: tipo `Obra = { id, nome }`, CRUD `addObra(nome)` / `removeObra` / `getObras`, seleção `getObra/setObra/clearObra/obraLabel`, hooks `useObras/useObra/useHydrated`. Remove `CentroCusto`, `obraParaCC`, chave `borabora.centros-custo`.

### 2. `src/routes/cadastros.tsx` — aba Obras
- Remover imports `useCentrosCusto, addCentroCusto, removeCentroCusto, obraParaCC` e ícones `ChevronDown, Building2` (manter os ainda usados).
- Substituir `ObrasTab` por um formulário único: input `Nome da Obra` + botão Salvar → `addObra(nome)`; abaixo, `ListSection` com `obras.map` mostrando `o.nome` e botão remover.
- Remover passos numerados 1/2 e o divisor.
- `addObra(...)` passa a receber só `nome`.

### 3. `src/routes/index.tsx` — tela de entrada
- Remover bloco "Centro de Custo" e o bloco condicional "Obra vinculada".
- Substituir por um único `Select` de Obras (`useObras()`): valor = `obraId`. Empty-state se `obras.length === 0` apontando para Cadastros.
- `handleEnter`: `setObra(obraId)` + `setRole(role)` + navigate `/dashboard`. `podeEntrar = !!obraId && !!role`.
- `useEffect` restaura `obraId` via `getObra()` direto (sem buscar `centroCustoId`).
- Remover imports `useCentrosCusto, obraParaCC, CheckCircle2, AlertCircle, Label` (Label se não usado em outro lugar — manter se sim).

### 4. Nenhuma mudança em
`AppHeader.tsx` (já usa `obraLabel(obra)` simples), `auth-store.ts`, demais rotas, stores de planejamento/apontamento/cadastros/parâmetros.

### Observação
LocalStorage de centros de custo (`borabora.centros-custo`) fica órfão no navegador do usuário — inofensivo, não precisa migração.
