## Reconstruir `src/routes/index.tsx`

O JSX colado está achatado. Vou reconstruir mantendo lógica, tipagem e a `Route` (com `head`/meta) intactas.

### Preservar
- Imports e definição da `Route` com `meta` (title/description).
- Estado local `obra` e `role` + hidratação via `useEffect` lendo `getObra()` / `getRole()`.
- `handleEnter`: persiste obra/role e navega para `/dashboard` (com `setRole(role as Role)` para satisfazer o tipo).

### Reconstruir JSX
- **Cabeçalho da tela**: bloco centralizado com ícone `HardHat` em um quadrado arredondado `bg-primary`, título "Bora Bora" e subtítulo "Gestão de Produção".
- **Card principal** (`rounded-2xl border bg-card p-5 space-y-6`):
  1. **Perfil de Acesso**: `<Label>` + grid de 2 botões a partir de `ROLES.map`. Cada botão usa `ShieldCheck` para `sede` e `HardHatIcon` para os demais, destaca o ativo com `border-primary bg-primary/10`, e mostra `r.label` + `r.desc`.
  2. **Obra Atual**: `<Label>` + `<Select value={obra} onValueChange={setObraVal}>` com `SelectTrigger`/`SelectValue placeholder="Selecione a obra"` e `SelectItem` para cada `OBRAS`.
  3. **Botão `<Button>` Entrar**: full-width, `disabled={!obra || !role}`, chama `handleEnter`.
- **Rodapé**: `© {new Date().getFullYear()} Bora Bora · Uso em campo` em texto pequeno e silenciado.

### Estilo
Apenas tokens semânticos (`bg-background`, `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`). Layout mobile-first centralizado verticalmente com `max-w-md` e `min-h-[calc(100vh-…)]` adequado ao header existente.

### Fora de escopo
Nenhuma mudança em stores, rotas ou componentes UI.
