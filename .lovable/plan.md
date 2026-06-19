## Diagnóstico

1. **Duplicação confirmada:** `src/routes/__root.tsx` já renderiza `<AppHeader />` e `<BottomNav />` globalmente (linhas 125 e 129). O arquivo `src/routes/relatorios.tsx` importa e renderiza os dois novamente (linhas 84 e 261), causando barras duplicadas e potencial remount/flicker apenas nessa rota.

2. **Filtro por role no BottomNav:** o código atual já inicializa `useState(() => getRole())`, então no SSR/primeiro client render o valor pode ser `null` e o filtro `role ? i.roles.includes(role) : true` mantém todos os itens — ok. Porém, se `getRole()` retornar um role válido somente após hidratação, há um re-render que pode parecer flicker. Para garantir estabilidade, tratamos `role === null` como "mostrar tudo" (já é o comportamento), e removemos qualquer fonte de remount.

## Plano de correção (mínimo e focado)

### 1. `src/routes/relatorios.tsx`
- Remover imports de `AppHeader` e `BottomNav`.
- Remover `<AppHeader />` (linha 84) e `<BottomNav />` (linha 261) do JSX.
- Ajustar o wrapper para usar o mesmo padding/layout que as outras rotas (já contemplado pelo `__root.tsx`).

### 2. `src/components/BottomNav.tsx`
- Manter `useState(() => getRole())` (inicialização síncrona via lazy initializer já evita o "null → role" flicker em ambientes client-only).
- Garantia adicional: durante hidratação, se `role` for `null`, manter o comportamento atual (mostrar todos os itens) — nenhuma mudança necessária aqui, já está correto.
- Nenhuma alteração extra se a duplicação for a real causa do sumiço; a remoção em `relatorios.tsx` resolve.

### 3. Verificação
- Conferir com Playwright em `/relatorios`: deve haver apenas um header e um bottom nav, com todos os ícones permitidos pelo role visíveis e estáveis.
- Conferir nas demais rotas (`/dashboard`, `/cadastros`, `/planejamento`, `/apontamento`) que nada mudou.

## Arquivos a editar
- `src/routes/relatorios.tsx` (remover header/nav duplicados)

Nenhuma outra rota importa `BottomNav`/`AppHeader` diretamente — verificado via grep.