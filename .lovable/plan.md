## Objetivo

Aplicar a versão colada de `src/routes/cadastros.tsx`, que adiciona um guard: se não houver obra selecionada, redireciona para `/`.

## Alterações

### `src/routes/cadastros.tsx`
- Adicionar imports: `useNavigate` de `@tanstack/react-router`, e `useObra`, `useHydrated` de `@/lib/obra-store` (somar aos imports atuais de `useObras`, `addObra`, `removeObra`).
- Em `CadastrosPage`, adicionar:
  ```ts
  const navigate = useNavigate();
  const obra = useObra();
  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated && !obra) navigate({ to: "/" });
  }, [hydrated, obra, navigate]);
  ```
- Adicionar `useEffect` ao import de `react` (já presente).
- Demais abas (`ObrasTab`, `EquipamentosTab`, `MaoObraTab`, `FrentesTab`, `ParametrosTab`) e auxiliares (`ListSection`, `ListItem`) permanecem como já estão no arquivo atual — o conteúdo colado é equivalente ao existente, então mantenho a versão atual e só insiro o guard.

### Demais arquivos
Nenhuma alteração. `obra-store.ts` já exporta `useObra` e `useHydrated`.

## Observação
O texto colado veio com JSX corrompido pela renderização do chat, então não vou copiá-lo literalmente — vou apenas adicionar o guard de redirecionamento ao arquivo atual, que é o efeito real da mudança.
