# Substituir `src/routes/apontamento.tsx` pela versão colada

A versão enviada chegou com o JSX achatado (várias `<div>` viraram linhas em branco por causa da colagem como HTML). O plano é reescrever o arquivo fielmente, preservando 100% da lógica, tipos, imports e textos já presentes, e reconstruindo apenas o markup que foi perdido.

## O que será preservado (exato como colado)

- Imports (TanStack Router, lucide-react, sonner, stores `obra-store`, `cadastros-store`, `planejamento-store`, `apontamento-store`).
- Tipos: `Carga`, `MaterialRealizado`, `EquipamentoRealizado`, `MaoObraRealizada`, `ApontamentoItem`, `Tela`.
- Helpers: `uid`, `hoje`, `fmt`, `somaCargas`.
- Toda a lógica de `ApontamentoPage`: estados (`tela`, `itemSelecionado`, `itensApontados`), `useMemo` de `hojeLabel` e `itensDoDia`, `handleSelecionarItem`, `handleSalvarItem` (com `saveApontamento`), redirecionamento quando não há obra.
- Toda a lógica de `FormRealizado`: `setField`, `updateMaterial/addMaterial/removeMaterial`, `updateEquipamento`, `updateMaoObra`, e os cálculos automáticos de área/volume/peso a cada alteração de comprimento/largura/espessura realizados.
- Toda a lógica de `MaterialCard` (`totalFrete`, `qtdExibida`, `addCarga`, `updateCarga`, `removeCarga`).
- Toda a lógica de `CargaCard` (`fileRef`, `handleFoto` com `URL.createObjectURL`).
- Toda a lógica de `FormAvulso` (estados `frenteNome`, `descricao`, `quantidade`, `materiais`, manipuladores).
- Componente `Field` exatamente como colado.

## O que será reconstruído (JSX perdido)

Reconstruir a árvore JSX seguindo as classes Tailwind, textos e ícones já visíveis no texto colado:

- **Tela início**: cabeçalho com `hojeLabel` + título "Apontamento Diário"; dois cards-botão grandes ("Selecionar item planejado" com `ClipboardList`, "Novo apontamento avulso" com `Plus`), ambos com `ChevronRight` à direita.
- **Tela lista**: header com botão voltar (`ArrowLeft`) + título "Itens planejados" + data; resumo em 2 cards ("Total planejado", "Apontados hoje"); empty state com `ClipboardList`; lista de `ItemPlanejadoCard`.
- **`ItemPlanejadoCard`**: badge de frente, badge de status ("Apontado"/"Pendente" com `CheckCircle2` quando salvo), descrição, intervalo `refIni → refFim`, grid 3-col com Comprimento/Largura/Espessura, linha Área planejada + Volume planejado, bloco de "Realizado" + percentual quando salvo, botão final "Lançar realizado" / "Editar apontamento".
- **`FormRealizado`**: header voltar; bloco "📋 Referência do planejamento" (grid 4 + área/volume); bloco "Quantidade realizada" com inputs de comprimento/largura/espessura realizados (preservando os `onChange` colados), bloco "Calculado automaticamente" (área/volume/peso), barra de aderência colorida (verde ≥90%, âmbar ≥60%, vermelho), inputs de estaca inicial/final; bloco "📦 Material utilizado" com lista de `MaterialCard` + botão adicionar; bloco "🏗️ Equipamentos" com inputs horímetro inicial/final por equipamento; bloco "👷 Mão de obra" com horas normais/extras por função; botão final "Salvar apontamento".
- **`MaterialCard`**: grid com inputs nome/unidade + botão remover (`Trash2`); bloco de quantidade (manual vs. somada por frete com `Truck`); toggle "Apontar frete" (`ChevronDown`/`ChevronUp`); lista de `CargaCard` numerada + botão adicionar carga.
- **`CargaCard`**: cabeçalho "Carga N" + botão remover (`X`); grid 3-col placa/hora/quantidade; input file oculto (`fileRef`, `accept="image/*"`, `capture="environment"`); preview da foto com botão substituir, ou placeholder "Tirar foto do ticket" com `Camera`.
- **`FormAvulso`**: header voltar + título; `Field` Frente (`<select>`), `Field` Descrição (`<textarea>`), `Field` Quantidade; bloco materiais com `MaterialCard` + botão adicionar; botão salvar.

## Estilo

Tailwind semântico (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, `bg-muted`). Mantém os tons indigo/emerald/amber/red usados pontualmente no texto colado (foto do ticket e barra de aderência).

## Escopo

Edita apenas `src/routes/apontamento.tsx`. Nenhuma alteração em stores, rotas ou outros componentes.
