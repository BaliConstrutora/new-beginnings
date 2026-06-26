## Objetivo

Adicionar gerenciamento de **Equipes** ao app: uma equipe tem nome e uma lista de membros escolhidos a partir da Mão de Obra já cadastrada.

## Mudanças

### 1. Novo arquivo: `src/lib/equipes-store.ts`

Criar exatamente o conteúdo colado pelo usuário:
- Tipos `MembroEquipe` e `Equipe`.
- Persistência em `localStorage` na chave `borabora.cadastros.equipes`.
- Dispara o mesmo evento `borabora:cadastros` já usado pelos outros stores, então o hook `useEquipes` reage junto com `useMaoObra`, `useEquipamentos`, etc.
- CRUD: `addEquipe`, `removeEquipe`, `getEquipes`, `getEquipe`.
- Hook `useEquipes`.

### 2. Nova aba "Equipes" em `src/routes/cadastros.tsx`

- Adicionar 6ª `TabsTrigger` com ícone `Users2` (ou `UsersRound`) de lucide-react, label curto "Equipes".
- Ajustar `TabsList` para `grid-cols-6` (mantendo `h-12` e `text-[11px]`).
- Novo `TabsContent value="equipes"` renderizando `<EquipesTab />`.

### 3. Componente `EquipesTab`

Formulário dentro do mesmo padrão visual dos outros (card `rounded-2xl border-2`):
- Campo **Nome da Equipe** (Input).
- Seção **Membros**: lista das funções vindas de `useMaoObra()`. Cada item tem um Checkbox + nome da função + badge da categoria (Direta/Indireta). Se não houver mão de obra cadastrada, mostrar mensagem orientando ir à aba M.Obra primeiro.
- Botão "Salvar Equipe" — valida nome preenchido e pelo menos 1 membro; chama `addEquipe(nome, membros)` onde `membros` mapeia cada selecionado para `{ maoObraId: m.id, nome: m.funcao, funcao: m.funcao }` (snapshot, como o tipo prevê — `nome` recebe a função já que o cadastro de M.Obra não tem nome próprio de pessoa).
- Toast de sucesso/erro seguindo o padrão das outras abas.

Lista de equipes cadastradas usando `ListSection` + `ListItem` existentes:
- `title`: nome da equipe.
- `subtitle`: "N membros — Fulano, Sicrano, …" (truncado).
- Botão remover chama `removeEquipe(id)`.

## Fora de escopo

- Edição de equipes (apenas criar/remover, igual aos outros cadastros).
- Uso da equipe em apontamento/planejamento — fica para passo futuro.
- Backend / Lovable Cloud — segue tudo em `localStorage` como o resto dos cadastros.
