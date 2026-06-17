## Diagnóstico

A tela de entrada do "Bora Bora" está correta no código (Select de obra + botão Entrar), mas o preview não carrega o módulo do app — runtime error `Failed to fetch dynamically imported module: virtual:tanstack-start-client-entry`.

A causa está nos logs do Vite: quando removi `checklist.tsx` e `configuracoes.tsx`, o gerador de rotas do TanStack travou em estado inconsistente (`Failed to load url /src/routes/configuracoes.tsx ... Does the file exist?`). O `routeTree.gen.ts` já foi regenerado corretamente (sem essas rotas), mas o dev server continua servindo bundles antigos que tentam importar os arquivos deletados, então a página inicial nunca termina de hidratar e o dropdown nunca aparece.

## Correção

1. Reiniciar o dev server para forçar o Vite a descartar o cache de módulos e o plugin do TanStack Router a reler o `routeTree.gen.ts` limpo.
2. Pedir um refresh forte (Ctrl/Cmd+Shift+R) no preview para baixar os novos chunks.

Nenhuma alteração de código é necessária — a tela de seleção de obra, o dashboard e o apontamento já estão implementados corretamente.