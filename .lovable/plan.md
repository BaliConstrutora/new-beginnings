## Objetivo
Substituir `src/routes/planejamento.tsx` pelo código colado, reconstruindo o JSX que se perdeu na colagem (a estrutura textual ficou sem tags) e mantendo todas as funções/lógica enviadas.

## Escopo
- Único arquivo alterado: `src/routes/planejamento.tsx`.
- Sem mudanças em stores, rotas, BottomNav ou outras telas.

## O que será preservado do código colado
- Imports (TanStack Router, lucide, sonner, stores `obra-store`, `cadastros-store`, `planejamento-store`).
- Tipos `ItemPlanejado`, `FormState` e constantes `STORAGE_KEY`, `FORM_VAZIO`.
- Helpers: `loadItens`, `saveItens`, `num`, `calcular`, `fmt`, `uid`.
- Hooks/estado: `useObra`, `useHydrated`, `useFrentes`, redirecionamento para `/` quando não há obra, persistência em localStorage, `filtroData`, `hojeLabel`, `openSections`.
- Lógica de `handleConfirmar` chamando `savePlanejamento` com o mesmo payload.
- Mock de importação de planilha (3 itens fictícios + toast de sucesso).
- Cálculos automáticos área/volume/peso e `qtdPlanejada = volume`.

## JSX a reconstruir (foi perdido na colagem)
- **Header**: título "Planejamento", `hojeLabel`, badge do nome da obra.
- **3 KPIs no topo**: Itens hoje, Área total (m²), Volume total (m³).
- **Seção 0 — Importar planilha**: `SectionHeader` + bloco com instruções e `<label>` estilizado contendo `<input type="file" accept=".xlsx,.csv" hidden>` que dispara o mock.
- **Seção 1 — Novo item**: `<FormNovoItem onSalvar={adicionarItem} frentesDisponiveis={frentesDisponiveis} />`.
- **Seção 2 — Itens do dia**: filtro por data (input `type="date"` com ícone `Calendar`), estado vazio com ícone, ou lista de `ItemPlanejadoCard` (header clicável com frente + KM, badge de quantidade, expandido mostra Ini/Fim/Pista, Área/Volume/Peso e botão Remover com `Trash2`).
- **Botão final** "Confirmar planejamento do dia" (laranja, `CheckCircle2`) só quando `itensDoDia.length > 0`.
- **SectionHeader**: número em círculo laranja, título, badge opcional, chevron up/down.
- **CampoCalculado**: ícone `Calculator`, label, valor formatado, unidade.
- **FormNovoItem**: duas subseções colapsáveis
  - A — Identificação: data (com ícone `Calendar`), select de Frente (alimentado por `frentesDisponiveis`, com fallback "Nenhuma frente cadastrada"), KM inicial/final, Faixa, Pista.
  - B — Controle geométrico: 4 inputs numéricos (Comprimento, Largura, Espessura, Densidade) + 3 `CampoCalculado` (Área, Volume, Peso) + ícone `Lock` indicando "Calculado automaticamente".
  - Botão "Adicionar ao planejamento" com `Plus`, desabilitado até `podeSalvar`.

## Estilo
Tailwind utilitário no padrão do arquivo atual (cantos arredondados `rounded-2xl`, foco laranja `focus:ring-orange-400`, botões laranja `bg-orange-500`). Sem novos tokens nem novas dependências.

## Validação
- Confirmar que o build passa (sem JSX desbalanceado nem imports não usados).
- Smoke manual no preview: abrir `/planejamento`, adicionar item, importar planilha mock, confirmar dia → toast.
