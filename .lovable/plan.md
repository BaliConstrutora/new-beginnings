## Reconstruir `src/components/AppHeader.tsx`

O conteúdo colado perdeu a estrutura JSX (tags achatadas em linhas em branco). Vou reconstruir o componente preservando 100% da lógica já existente.

### Preservar (sem alterações)
- Imports: `Link, useNavigate, useRouterState` de `@tanstack/react-router`, `useEffect/useState`, ícones `HardHat` e `ChevronDown`, e `useObra, obraLabel, clearObra` de `@/lib/obra-store`.
- Hooks: `pathname`, `obra`, `navigate`, `mounted` (hydration guard).
- Guard `if (pathname === "/") return null;`.
- `handleSwitch`: limpa a obra e navega para `/`.

### Reconstruir JSX
Header sticky no topo com duas áreas:

1. **Branding (esquerda)** — `<Link to="/">`:
   - Ícone `HardHat` dentro de um quadrado arredondado com fundo `bg-primary` e texto `text-primary-foreground`.
   - Título "Bora Bora" (font-bold) e subtítulo "Gestão de Produção" (text-xs, muted).

2. **Seletor de obra (direita)** — `<button onClick={handleSwitch}>`:
   - Label dinâmico: `mounted ? obraLabel(obra) || "Selecionar obra" : "Selecionar obra"`.
   - Ícone `ChevronDown` à direita.
   - Estilo de chip arredondado com borda e hover.

### Estilo
Usar exclusivamente tokens semânticos do design system (`bg-background`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`) — nada de cores hardcoded — para respeitar o tema do projeto.

### Fora de escopo
Nenhuma mudança em lógica, stores, rotas ou outros arquivos.
