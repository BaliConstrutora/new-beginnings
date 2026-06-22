## Objetivo

Substituir `src/routes/apontamento.tsx` pela nova versão colada, que reformula completamente o fluxo de Apontamento Diário com 4 telas (início, lista, formulário de item planejado, formulário avulso) e suporte a materiais com frete por carga.

## Problema da colagem

O texto colado teve o JSX achatado (vários blocos aparecem apenas como linhas em branco). Vou reconstruir o JSX fielmente à intenção do arquivo, mantendo 100% da lógica, tipos, helpers e props já definidos no texto colado — só recompondo as marcações visuais.

## Conteúdo do arquivo a escrever

**Preservar exatamente como colado:**
- Imports (TanStack, lucide, sonner, stores `useObra`, `useHydrated`, `useEquipamentos`, `useMaoObra`, `useFrentes`, `usePlanejamento`, `saveApontamento`, `getApontamento`).
- Tipos `Carga`, `MaterialRealizado`, `EquipamentoRealizado`, `MaoObraRealizada`, `ApontamentoItem`, `Tela`.
- Helpers `uid`, `hoje`, `fmt`, `somaCargas`.
- Estado e lógica de `ApontamentoPage`: `useEffect` de guard, `tela`/`itemSelecionado`/`itensApontados`, `hojeLabel`, `itensDoDia` (useMemo), `apontados`, `handleSelecionarItem`, `handleSalvarItem` (com `saveApontamento` e toast).
- Lógica do `FormRealizado`: `setField`, `updateMaterial`/`addMaterial`/`removeMaterial`, `updateEquipamento`, `updateMaoObra`.
- Lógica de `MaterialCard`: `totalFrete`, `qtdExibida`, `addCarga`/`updateCarga`/`removeCarga`, toggle `freteAtivo`.
- Lógica de `CargaCard`: `fileRef`, `handleFoto` com `URL.createObjectURL`.
- Lógica de `FormAvulso`: estados `frenteNome`/`descricao`/`quantidade`/`materiais`, `addMaterial`/`updateMaterial`/`removeMaterial`.
- Componente utilitário `Field`.

**Reconstruir o JSX dos blocos achatados:**

1. **Tela início**: container vertical com header (`hojeLabel` em caps + título "Apontamento Diário") e dois cards-botão grandes:
   - "Selecionar item planejado" — ícone `ClipboardList` em quadrado primário, texto secundário com contagem de itens ou "Nenhum planejamento para hoje", `ChevronRight`.
   - "Novo apontamento avulso" — ícone `Plus` em quadrado neutro, "Serviço não planejado", `ChevronRight`.

2. **Tela lista**: header com botão voltar (`ArrowLeft`) + título "Itens planejados" + `hojeLabel`; bloco de resumo com dois cards lado-a-lado ("Total planejado" / "Apontados hoje"); estado vazio (`ClipboardList` cinza + texto) ou lista de `ItemPlanejadoCard`.

3. **`ItemPlanejadoCard`**: card com badge da frente, badge de status (Apontado/Pendente em cores), descrição, faixa "refIni → refFim", grid 3 colunas com Comprimento/Largura/Espessura, duas linhas Área/Volume planejados, bloco condicional se `salvo` com Realizado x % atingido, e botão final "Editar apontamento" ou "Lançar realizado".

4. **`FormRealizado`**: header voltar; bloco "📋 Referência do planejamento" (grid 4 col + área/volume); bloco "Quantidade realizada" com input principal grande + 2 inputs (estaca inicial/final); bloco "📦 Material utilizado" com lista de `MaterialCard` + botão "Adicionar material"; bloco "🏗️ Equipamentos" com linhas prefixo/descrição + 2 inputs (horímetro inicial/final); bloco "👷 Mão de obra" com função/categoria + horas normais/extras; botão final "Salvar apontamento".

5. **`MaterialCard`**: header grid com inputs nome/unidade + botão remover (`X`); área de quantidade que alterna entre input manual e exibição calculada do frete; toggle "Apontar frete" com switch visual; quando ativo, lista de `CargaCard` numerada + botão "Adicionar carga".

6. **`CargaCard`**: header "Carga N" + remover; grid 3 colunas (placa/hora/quantidade); input file oculto com `fileRef`; se `fotoUrl` mostra thumb + botão trocar (`Camera`), senão botão tracejado "Tirar foto do ticket".

7. **`FormAvulso`**: header voltar + título; bloco com `Field` para frente (`<select>` populado por `frentes`), descrição (textarea), quantidade (input); bloco "📦 Material utilizado" igual ao do `FormRealizado`; botão final "Salvar apontamento".

**Estilo:** Tailwind utilitário com tokens semânticos (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`) já usados no projeto — sem cores hardcoded fora dos detalhes já presentes no texto colado (indigo para área de frete, cores de status no badge).

## Validação

- Verificar exports/assinaturas reais de `usePlanejamento`, `saveApontamento`, `getApontamento` e dos hooks de cadastro antes de escrever, para confirmar que os campos acessados (`plano.servicos`, `s.servico`, `s.kmInicial`, `s.comprimento`, etc.) batem com o store atual; se não baterem, ajustar o mapeamento em `itensDoDia` mantendo a UX.
- Build automático do harness valida JSX/TS.
- Smoke manual no preview: abrir `/apontamento`, navegar pelas 4 telas, salvar 1 item planejado e 1 avulso.

## Escopo

Edita somente `src/routes/apontamento.tsx`. Nenhuma alteração em stores, rotas ou outros componentes.