## Objetivo

Atualizar `src/lib/planejamento-store.ts` para adicionar os campos opcionais `equipeId` e `equipeNome` ao tipo `ServicoPlanejado`.

## Mudança

Substituir o conteúdo de `src/lib/planejamento-store.ts` pelo código enviado. A única diferença em relação ao arquivo atual é a adição destes dois campos opcionais em `ServicoPlanejado`:

```ts
equipeId?: string;
equipeNome?: string;
```

Nenhuma outra parte do arquivo muda (KEY, EVENT, demais tipos, funções `read`/`write`/`getPlanejamento`/`savePlanejamento`, hook `usePlanejamento`, `uid`).

## Fora de escopo

- Não alterar `cadastros.tsx`, `planejamento.tsx`, `apontamento.tsx` ou qualquer outro arquivo.
- Não consumir ainda os novos campos na UI — isso fica para um passo futuro quando você enviar o `planejamento.tsx` atualizado.
