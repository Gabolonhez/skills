# referencias-visuais

Skill para o [Claude Code](https://claude.com/claude-code) que junta uma referência visual para cada tela de um app ou site antes de implementar, com notas do que imitar e do que não imitar.

## Por quê

Sem imagem de referência, o modelo desenha a média, e a média tem "cara de IA". Com uma referência por tela, a estrutura, a hierarquia e a densidade saem de apps que já foram testados com muita gente, e a tela pode ser comparada lado a lado no acabamento.

## O que ela faz

1. Lista as telas a partir do spec ou da ideia.
2. Busca referências, da fonte mais fiel à menos: telas reais capturadas no emulador ou aparelho, prints e links do usuário, prints da App Store, galerias e bibliotecas de design às quais o usuário tem acesso, vídeos de walkthrough.
3. Escolhe 1 referência principal (e no máximo 1 secundária) por tela.
4. Monta `design/references/` com um `_notes.md` por tela: fonte, IMITAR, NÃO IMITAR, ADAPTAR.
5. Pede aprovação antes de qualquer tela ser implementada.

Referência serve para estrutura, fluxo, densidade e motion. Cores, fontes, ilustrações, ícones e textos de outros apps nunca são copiados, e os prints de terceiros ficam fora do git.

## Script: prints da App Store

Baixa os prints de um app pela API pública do iTunes (sem login, sem dependências, Node 18+):

```bash
node scripts/fetch-store.mjs "nome do app" --out design/references/_fontes/loja --country br
node scripts/fetch-store.mjs 123456789 --ipad
```

Salva `NN.jpg` e um `meta.json` (nome, id, categoria, nota, descrição) numa pasta com o nome do app. Quando a busca por nome acha vários apps, ele lista os outros ids para você escolher.

## Instalação

```bash
git clone https://github.com/Gabolonhez/skills.git /tmp/skills
cp -r /tmp/skills/referencias-visuais ~/.claude/skills/
```

## Uso

- "antes de fazer as telas, junta referências de apps de hábitos"
- "quero que o onboarding pareça com o do app X, monta as referências"
- "baixa os prints da App Store desses três concorrentes"

## Combina com

- [spec-de-app](../spec-de-app/): gera a lista de telas.
- [acabamento-de-tela](../acabamento-de-tela/): compara cada tela pronta com a referência.

## Licença

MIT. Veja `LICENSE`. Os prints baixados pertencem aos donos dos apps; use-os só como estudo.
