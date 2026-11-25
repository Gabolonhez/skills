---
name: acabamento-de-tela
description: Passe de acabamento profissional numa tela de app ou site, com loop visual (screenshot da tela rodando, comparação lado a lado com uma referência, correção e nova captura) e checklist de estados, modo escuro, acessibilidade, motion, performance percebida e sinais de "cara de IA". Use sempre que o usuário pedir para polir, caprichar, refinar, deixar profissional ou fiel à referência uma tela já implementada; quando disser que a tela "está com cara de template", "está estranha" ou "não parece com o print"; e antes de considerar pronta qualquer tela nova, mesmo que ele não fale em "acabamento". Vale para mobile (iOS, Android, React Native, Flutter, nativo) e web.
---

# Acabamento de tela

Roda um loop visual e um checklist numa tela até ela ficar em nível de produção. É o passo que separa "funciona" de "parece produto de verdade". Quem constrói a tela tende a aprovar o que fez, então o método se apoia em evidência (screenshots, comparação, lista de desvios), não em impressão.

## Modos

A skill escolhe o modo sozinha:

- **Com referência** (preferido): existe uma imagem do que a tela deve parecer (print de outro app, mockup, design aprovado). A fidelidade vira critério verificável.
- **Sem referência**: o loop usa as diretrizes de design do projeto e o checklist. Se a tela é nova e não tem referência nenhuma, sugira juntar uma antes (a skill `referencias-visuais`, da mesma coleção, faz isso, se estiver instalada).

## Passo 0: descobrir o projeto

Antes de capturar qualquer coisa, leia o projeto para saber contra o que comparar:

1. **Diretrizes de design**: procure `DESIGN.md`, `docs/design*`, guia de estilo, README de design system. Se existir uma seção de identidade (cores, fontes, tom) ou de padrões proibidos, ela manda.
2. **Tokens e tema**: ache onde ficam cores, espaçamento, tipografia, raios, sombras e durações de animação (objeto de tema em TS/JS, variáveis CSS, `tailwind.config`, `@theme` do Tailwind v4, `ThemeData` do Flutter, assets de cor do Xcode). Todo valor da tela deve vir daí.
3. **Biblioteca de componentes**: botões, cards, listas, sheets, skeletons, toasts que o projeto já tem. Corrigir com componente existente vem antes de criar estilo novo.
4. **Referências**: procure uma pasta de referências (convenção sugerida: `design/references/<tela>.png` com um `_notes.md` dizendo o que imitar de cada uma). Se o usuário anexar um print no chat, salve-o nessa pasta: referência que vive só no chat se perde na próxima sessão.
5. **Idiomas suportados** (arquivos de i18n), para revisar os textos em cada um.

Se o projeto não tiver diretrizes nem tokens, avise o usuário e use o checklist abaixo como régua; não invente um design system no meio do acabamento.

## O loop visual

1. **Rodar a tela de verdade** e capturar:
   - Mobile: simulador iOS ou emulador Android (build de desenvolvimento). Se houver uma ferramenta de controle de dispositivo instalada (por exemplo um MCP de mobile), use-a para screenshot e gravação de tela; senão, peça os prints ao usuário ou use o comando da plataforma (`xcrun simctl io booted screenshot`, `adb exec-out screencap -p`).
   - Web: navegador automatizado (Playwright ou similar) na largura de celular e de desktop.
   - Versão web de um app mobile (por exemplo Expo web) serve só como atalho para layout: não mostra sheet nativo, teclado, blur, haptic nem transição nativa.
2. **Capturar em tema claro e escuro** (e, em web, nas larguras que o projeto suporta).
3. **Avaliar**:
   - **Com referência**: abra screenshot e referência lado a lado e audite as dimensões da tabela abaixo. Cada desvio vira item corrigível e mensurável ("espaço entre cards: ~24px na ref, 16px na tela"), nunca impressão vaga ("está diferente").
   - **Sem referência**: autocrítica contra as diretrizes do projeto. A hierarquia está clara? O espaçamento segue os tokens? Algo parece template genérico?
   - **Sempre**: passe a lista "Sinais de cara de IA" (abaixo) e as regras proibidas do próprio projeto. Cada sinal encontrado é desvio a corrigir.
4. **Corrigir e capturar de novo.** Faça no mínimo 2 iterações. Pare quando uma iteração não gerar mais correções (sem referência) ou quando os desvios restantes forem imperceptíveis ou justificados (com referência).
5. **Revisão de olhos frescos**: se o ambiente permitir subagentes, peça a um que não construiu a tela para revisar só com os screenshots finais, a referência, as notas e as diretrizes, devolvendo os desvios em ordem de gravidade. Sem subagente, peça ao usuário para olhar o lado a lado final. Corrija o que for confirmado.

### Dimensões de fidelidade (modo com referência)

| Dimensão | O que comparar |
| --- | --- |
| Ritmo de espaçamento | espaço entre blocos, cards e seções; a proporção importa mais que o pixel exato |
| Escala tipográfica | relação título/corpo/legenda; pesos usados |
| Hierarquia | o que domina o primeiro olhar é o mesmo elemento da referência? |
| Densidade | quantidade de informação por tela; respiro nas bordas |
| Forma | raios, sombras, bordas ("arredondado e flutuante" ou "chapado") |
| Cor | o papel de cada cor (ação principal, fundo, destaque), mapeado para os tokens do projeto, nunca os hex da referência |
| Motion | entrada e transição com a mesma intenção (quando a referência for vídeo ou app real) |

Desvios **justificados** são aceitáveis e devem ser anotados: "a referência não tem modo escuro, derivamos"; "a referência usa 4 pesos de fonte, as diretrizes limitam a 2, mantivemos 2". A referência inspira estrutura; a identidade visual e os tokens vêm do projeto. Nunca copie marca, ilustração, ícone ou texto do app de referência.

## Checklist (vale nos dois modos)

Marque cada item ✅, ❌ ou "não se aplica". Itens só de mobile ou só de web vêm marcados.

### Estados

- [ ] Primeira carga com skeleton (ou placeholder com a forma do conteúdo), não um spinner solto
- [ ] Estado vazio desenhado (ícone ou ilustração, texto e ação), nunca tela em branco
- [ ] Erro com mensagem humana e botão de tentar de novo
- [ ] Puxar para atualizar onde há lista ou feed (mobile)

### Interação

- [ ] Todo elemento tocável ou clicável tem estado pressionado/hover/foco visível
- [ ] Área de toque de pelo menos 44pt (iOS) / 48dp (Android); em web, alvo de clique confortável e foco por teclado
- [ ] O teclado não cobre o campo em foco (mobile)
- [ ] Botão de ação assíncrona mostra carregando e fica desabilitado (sem clique duplo)

### Visual

- [ ] Modo escuro íntegro: nada ilegível nem "vazado" do tema claro
- [ ] Áreas seguras respeitadas (notch, barra de gestos) em mobile; sem rolagem horizontal em web estreita
- [ ] Nenhum valor solto no estilo da tela: cor, espaço, tamanho e raio vêm dos tokens (procure números mágicos)
- [ ] Poucos pesos de fonte (2 costuma bastar) e uma única ação principal por tela
- [ ] Contraste AA (4,5:1 texto normal, 3:1 texto grande) nos dois temas

### Motion

- [ ] Durações e curvas vêm dos tokens de animação do projeto, se houver; nada inventado na tela
- [ ] Microfeedback nos momentos-chave (sucesso, adição, conclusão)
- [ ] Saída mais curta que a entrada (cerca de 70% do tempo) em sheet, modal e toast
- [ ] Resposta a toque nunca usa ease-in; use spring ou ease-out
- [ ] Nenhum movimento sem causa: nada pulsando ou flutuando sozinho, lista em cascata não repete a cada visita
- [ ] Toast com texto longo fica tempo suficiente para ser lido
- [ ] Respeita "reduzir movimento" do sistema

### Performance percebida

- [ ] Imagens com cache e placeholder (sem "piscar branco")
- [ ] Lista que cresce sem limite é virtualizada (FlatList/FlashList, RecyclerView, LazyColumn, virtualização em web)
- [ ] Ações do dia a dia (marcar, curtir, registrar) usam atualização otimista: aparece na hora e desfaz se der erro
- [ ] Dados independentes carregam em paralelo, não em cascata

### Conteúdo e acessibilidade

- [ ] Texto natural em cada idioma suportado: nenhuma chave de tradução aparecendo, nada de tradução literal robótica
- [ ] Rótulo de acessibilidade em todo controle sem texto (ícones); ordem de leitura faz sentido
- [ ] Texto com fonte grande do sistema não corta nem sobrepõe

## Sinais de cara de IA

Se a tela tem algum destes, ainda não está pronta:

- Gradiente roxo/azul ou "aurora" de fundo sem motivo de marca; brilho em tudo.
- Emoji no lugar de ícone na interface (ícone vem do conjunto de ícones do projeto).
- Card dentro de card; todo conteúdo em card com sombra; borda, sombra e fundo juntos no mesmo elemento.
- Tudo centralizado; grade de blocos de mesmo peso sem hierarquia.
- Fonte padrão sem decisão em tudo e título sem contraste de escala com o corpo.
- O mesmo ícone em círculo colorido repetido em todas as linhas da lista.
- Números inventados com cara de mock ("12.345 usuários", "98%") em vez de dado real ou estado vazio.
- Texto genérico ("Desbloqueie seu potencial", "Sua jornada começa aqui", "Bem-vindo de volta!" em toda tela), frases com travessão e listas de três adjetivos. Se houver uma skill de revisão de texto instalada (por exemplo `stop-slop`), passe-a nas strings da tela.
- Nenhum momento próprio: nada de motion com intenção, haptic, celebração ou microcópia com a voz do produto.

## Ferramentas opcionais

Nenhuma é obrigatória. Se estiver instalada, aproveite:

- Uma skill de design de app mobile (por exemplo `appllama-app-design-skill`) ou de interface web (por exemplo `impeccable`): use o checklist dela no passo 3 do loop, sem passar por cima das diretrizes do projeto.
- Skills de animação (por exemplo `review-animations`) para revisar o motion em detalhe.

## Saída

Entregue ao usuário:

1. Screenshots antes e depois (no modo com referência, o lado a lado final tela × referência), nos dois temas.
2. Desvios corrigidos e desvios justificados (com o motivo).
3. Checklist marcado.
4. O que só dá para validar em aparelho físico (haptic, teclado real, desempenho em aparelho fraco).
