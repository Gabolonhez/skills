---
name: referencias-visuais
description: Junta uma referência visual em imagem para cada tela de um app ou site antes de implementar, buscando em apps conhecidos (telas reais no emulador, prints da App Store, galerias públicas de telas, vídeos de walkthrough, prints e links do usuário) e monta uma pasta de referências com notas do que imitar e do que não imitar. Use sempre que o usuário for desenhar ou implementar telas novas, pedir inspiração, benchmark ou "como o app X faz", quiser que o app não tenha cara de template ou de IA, ou listar apps de referência para um projeto, mesmo que não fale em "referência". Referência serve para estrutura, fluxo e densidade, nunca para copiar identidade visual.
---

# Referências visuais

Modelo que desenha sem imagem desenha a média, e a média é a "cara de IA". Esta skill garante que cada tela tenha **uma referência em imagem** escolhida antes de ser implementada, com notas do que aproveitar. Depois, a tela pode ser comparada lado a lado com a referência no acabamento (a skill `acabamento-de-tela`, da mesma coleção, faz isso, se estiver instalada).

## Pasta de referências

Antes de criar, procure se o projeto já tem uma pasta de referências (`design/references/`, `docs/design/`, `refs/`). Se não tiver, use esta convenção:

```
design/references/
├── <tela>.png        # 1 por tela; nome = rota ou tela (home.png, onboarding-3.png, paywall.png)
├── _notes.md         # por tela: fonte, IMITAR, NÃO IMITAR, ADAPTAR
└── _fontes/          # material bruto (prints da loja, quadros de vídeo); não versionar
```

Prints de outros apps são material de estudo, protegido por direito autoral. Mantenha-os em repositório privado ou fora do git (ponha `_fontes/` no `.gitignore`) e nunca os publique junto do app.

## Fontes, da mais fiel à menos

1. **Telas reais no emulador ou aparelho.** Instale o app de referência (emulador Android com Play Store, ou um aparelho de teste), percorra onboarding, paywall, home e telas-chave e capture cada uma. Grave o fluxo em vídeo se motion importar. Se houver uma ferramenta de controle de dispositivo instalada (por exemplo um MCP de mobile), use-a; senão, peça os prints ao usuário. Desinstale ao final. Se precisar de login na loja, peça ao usuário para entrar uma vez.
2. **Prints e links do usuário.** Salve sempre em disco. Link da App Store vai para a fonte 3; link de vídeo para a fonte 5; link de site vira screenshot com um navegador automatizado.
3. **Prints da App Store**, pela API pública do iTunes (sem login):
   ```bash
   node "<pasta desta skill>/scripts/fetch-store.mjs" "<nome ou id do app>" --out design/references/_fontes/loja --country br
   ```
   Baixa os prints e um `meta.json` (nome, id, categoria, nota, descrição). Use `--ipad` para os prints de iPad. São prints de **marketing** (mockup, slogan): bons para tom, paleta e para a ficha da loja do seu app; para estrutura de tela, prefira as fontes 1, 2, 4 ou 5. O Google Play não tem API pública equivalente.
4. **Galerias de telas e bibliotecas de design** às quais o usuário tenha acesso (galerias públicas de telas de apps reais, bibliotecas pagas do time, arquivos do Figma da empresa, uma ferramenta ou MCP de pesquisa de apps). Pergunte o que ele tem antes de buscar.
5. **Vídeos de walkthrough** ("nome-do-app onboarding", "nome-do-app review"). Se houver uma skill ou ferramenta que extraia quadros de vídeo, use-a; escolha os quadros que mostram cada tela inteira.

Antes de buscar fora, olhe o próprio projeto: se outro app ou tela do mesmo time já resolve aquela tela e já está em produção, ele é a primeira referência.

## Passos

1. **Listar as telas.** Leia a especificação do app (`SPEC.md`, PRD, issue) ou, sem ela, a ideia descrita pelo usuário, e liste as telas. Se não existir especificação, a skill `spec-de-app`, da mesma coleção, gera uma (se estiver instalada).
2. **Escolher a referência de cada tela**: **1 principal** (estrutura e hierarquia) e no máximo 1 secundária (um detalhe: motion, um componente). Prefira apps com o mesmo **tipo de uso** (registro diário, lista de tarefas, feed, checkout), não necessariamente do mesmo nicho. Apps grandes e bem avaliados da categoria costumam ser boas fontes, porque já foram testados com muita gente.
3. **Copiar** as escolhidas para `design/references/<tela>.png`.
4. **Escrever o `_notes.md`**, uma seção por tela:
   ```
   ## home (ref: app de hábitos X, _fontes/x/home.png)
   IMITAR: lista de cards com ícone à esquerda, ritmo de 12pt entre cards, saudação curta no topo
   NÃO IMITAR: paleta lilás, fonte serifada do título, mascote
   ADAPTAR: cards viram os registros do dia; ícone = tipo de registro
   ```
5. **Mostrar ao usuário** a grade de referências (uma linha por tela: tela, app de referência, o que imitar) e pedir aprovação **antes** de implementar. Sem referência aprovada, a tela não entra em implementação.

## Regras

- Referência orienta **estrutura, fluxo, densidade e motion**. Identidade (cores, fontes, ilustração, mascote, ícone, texto) vem do design do próprio projeto.
- Nunca copie marca, ícone, ilustração, personagem ou texto de outro app. Se a tela final for confundível com a do app de referência, mudou pouco.
- Cite a fonte de cada referência no `_notes.md`, para saber de onde veio e não reaproveitar por engano.
