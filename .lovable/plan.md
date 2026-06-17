## Diagnóstico

O erro 404 não vem de uma rota faltando — todas as 4 rotas existem (`/`, `/apontamento`, `/checklist`, `/configuracoes`). O erro real no console é:

```
Failed to fetch dynamically imported module: .../virtual:tanstack-start-client-entry
Invariant failed: Expected to find a match below the root match in SPA mode.
```

Isso acontece quando o navegador tem uma versão antiga do app em cache (chunks JS antigos) após o dev server ter reiniciado por causa das criações de rotas. O router tenta carregar um chunk que não existe mais e cai no boundary de 404.

## Correção

1. Reiniciar o dev server do preview para servir bundles novos e consistentes.
2. Nenhuma alteração de código é necessária — as rotas, o `BottomNav` e os `Link` do Dashboard já estão corretos.

Após reiniciar, basta dar um refresh forte (Ctrl/Cmd+Shift+R) no preview. Os botões "Apontamento", "Checklist" e "Config" passarão a navegar normalmente.

## Fora do escopo
Mudanças visuais ou de conteúdo nas telas Checklist / Configurações — continuam como placeholder até você pedir.