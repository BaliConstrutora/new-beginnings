# Plano: App de Gestão de Obras de Infraestrutura

App web mobile-first com navegação por **Bottom Tabs** (ideal para uso em campo, com uma mão) e 4 telas principais. Sem backend nesta etapa — apenas estrutura, navegação e UI funcional com toast de sucesso ao salvar.

## Stack e design
- TanStack Router (já no template) para as rotas.
- Tailwind v4 + tokens semânticos em `src/styles.css` (sem cores hardcoded).
- Paleta utilitária de alto contraste, pensada para sol/canteiro de obra: fundo claro neutro, primária laranja-construção forte, texto quase-preto, bordas marcadas. Botões e inputs grandes (alvos de toque ≥ 44px).
- Componentes shadcn já existentes: `button`, `input`, `select`, `accordion`, `card`, `label`, `sonner` (toast).

## Navegação
- **Bottom Tab Bar** fixa, sempre visível, 4 ícones + labels curtos:
  - Início (`/`)
  - Apontamento (`/apontamento`)
  - Checklist (`/checklist`)
  - Configurações (`/configuracoes`)
- Tab ativa destacada com cor primária e barra superior. Conteúdo rola acima da barra.

## Telas

### 1. Dashboard (`/`)
- Saudação ("Bom dia, equipe") + data atual.
- 3 cards de atalho grandes (Apontamento Diário, Checklist de Frota, Configurações), cada um com ícone, título e descrição curta.

### 2. Apontamento Diário (`/apontamento`)
Formulário em **Accordion** com 4 seções, abrindo uma de cada vez:

1. **Condições** — Data (readonly, hoje), Clima (Ensolarado / Nublado / Chuva fraca / Chuva forte), Frente de Serviço (Terraplenagem / Drenagem / Pavimentação / Obras de arte).
2. **Localização** — Estaca Inicial e Estaca Final (numéricos).
3. **Equipamentos** — Lista dinâmica de cards. Cada card: Equipamento (Escavadeira / Motoniveladora / Rolo Compactador / Caminhão Basculante), Horímetro Inicial, Horímetro Final, Diesel (L). Botão **+ Adicionar equipamento** e botão remover por card.
4. **Produção** — Serviço Executado (Corte / Aterro / Bota-fora / Compactação), Quantidade, Unidade (m³ / m² / m / t).

Rodapé com botão grande **Salvar Apontamento** (full-width, alto, primário) que dispara `toast.success("Apontamento salvo com sucesso")` e reseta o formulário.

### 3. Checklist de Frota (`/checklist`) e 4. Configurações (`/configuracoes`)
Telas placeholder com título e texto "Em breve" — estrutura pronta para iterações futuras.

## Arquivos a criar/modificar
- `src/styles.css` — tokens da paleta utilitária.
- `src/routes/__root.tsx` — wrap com bottom nav.
- `src/components/BottomNav.tsx` — barra inferior.
- `src/routes/index.tsx` — Dashboard.
- `src/routes/apontamento.tsx` — formulário em accordion.
- `src/routes/checklist.tsx`, `src/routes/configuracoes.tsx` — placeholders.

## Fora do escopo (confirmar se quer depois)
- Persistência (Lovable Cloud / banco).
- Autenticação.
- Conteúdo real das telas Checklist e Configurações.
