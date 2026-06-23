## Reconstruir `src/routes/dashboard.tsx`

O JSX colado está achatado. Vou reconstruir o arquivo mantendo toda a lógica e corrigindo, no mesmo passo, o erro de hidratação visível no preview (a data renderizada no servidor difere da data no cliente).

### Preservar
- Imports, definição da `Route` (com `head`/meta).
- Hooks `useObra`, `useHydrated`, `usePlanejamento`, `useApontamento`.
- Redirect via `useEffect` quando não há obra.
- Cálculo de `aderencia` com `useMemo` e `calcularAderencia`.

### Corrigir hidratação
O servidor pré-renderiza `new Date()` em outro fuso/dia e o cliente renderiza o dia atual, gerando mismatch (`segunda-feira, 22 de junho` vs `terça-feira, 23 de junho`). Solução: só exibir a string de data depois de `hydrated` (renderizar um placeholder vazio/invisível no SSR), seguindo o mesmo padrão já usado pelo `AppHeader`.

### Reconstruir JSX
- **Header**: kicker "Resumo do dia", `<h1>Dashboard</h1>`, parágrafo com a data formatada em pt-BR (capitalizada, só após hidratar).
- **`AderenciaCard`**: card colorido por faixa (>=90 verde, >=60 âmbar, senão vermelho; cinza quando `pct === null`), com ícone `Target`, título, valor `{pct}%` ou mensagem de fallback, e barra de progresso.
- **Ações rápidas**: seção com dois `<Link>` em formato de card:
  1. **Novo Apontamento** → `/apontamento`, ícone `ClipboardList`.
  2. **Planejamento** → `/planejamento`, ícone `CalendarRange`, com contagem `plano.servicos.length` ou "Nenhum planejamento para hoje".

### Estilo
Apenas tokens semânticos (`bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary`, etc.) — exceto as cores semafóricas de aderência (emerald/amber/red), que já estavam no código original e são intencionais para sinalização.

### Fora de escopo
Nenhuma mudança em stores, rotas ou outros componentes.
