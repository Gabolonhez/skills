---
name: importar-design-system
description: Converte um design system criado no Claude Design (claude.ai/design), ou exportado de outra ferramenta, nos tokens reais do projeto (cores claro e escuro, tipografia, espaçamento, raios, sombras, motion) e num DESIGN.md com a identidade visual, detectando o formato que o projeto usa (objeto de tema em TS/JS, variáveis CSS, Tailwind, Flutter, SwiftUI, Android) e preservando as chaves existentes para nada quebrar. Use sempre que o usuário quiser aplicar, importar ou trazer para o código um design feito no Claude Design, um export de HTML/CSS/JSON, tokens de design ou prints de uma paleta e tipografia, ou pedir para "trocar o tema", "aplicar a identidade" ou "gerar o DESIGN.md", mesmo que não fale em "tokens".
---

# Importar design system

Leva um design system (do Claude Design ou de outra fonte) para os tokens do projeto e documenta a identidade num `DESIGN.md`. A regra central: **mudam os valores, não o contrato**. As chaves e tipos do tema que o código já usa ficam iguais, então os componentes continuam funcionando e só trocam de aparência.

## Pré-requisitos

Tokens gerados antes das telas costumam dar paleta "segura" e cara de template. Antes de importar, confira (e, se faltar, pergunte ao usuário se quer seguir assim mesmo):

1. **Referências por tela**: existe uma referência visual para as telas principais (a skill `referencias-visuais`, da mesma coleção, monta isso, se estiver instalada).
2. **Âncora de identidade** decidida: uma coisa que torna o produto reconhecível (mascote ou ilustração, tipografia de display, cor-assinatura ou forma). Uma só.
3. **Telas-chave aprovadas** (por exemplo onboarding, home, paywall), desenhadas a partir das referências. Os tokens saem dessas telas, não de uma paleta solta.

## Fontes aceitas (em ordem de preferência)

1. **Integração direta com o Claude Design**, se o ambiente tiver ferramentas para listar e ler os projetos de design do usuário. Leia os arquivos do projeto indicado e extraia os tokens dos componentes e specs. Se a autorização falhar, peça ao usuário um export e vá para a fonte 2.
2. **Export em pasta**: HTML/CSS/JSON exportados do Claude Design (ou um arquivo de tokens de outra ferramenta, como Figma Variables ou o formato W3C Design Tokens), em qualquer pasta que o usuário indicar.
3. **Screenshots** do design system (paleta, tipografia, componentes). Extraia as cores por leitura visual e **confirme os hex com o usuário** antes de aplicar: leitura de imagem erra tom.

## Passos

1. **Descobrir o formato de tokens do projeto.** Procure onde ficam cores, tipografia, espaçamento, raios, sombras e durações, e qual o formato. `references/formatos-de-tokens.md` lista onde procurar em cada stack e como mapear em cada formato. Se o projeto não tem tokens centralizados, proponha criar no formato mais simples da stack e peça aprovação antes.
2. **Extrair os tokens brutos** da fonte: paleta (primária, neutras, semânticas de sucesso/erro/aviso), famílias e escala tipográfica, escala de espaçamento, raios, bordas, sombras e motion (durações, curvas).
3. **Salvar as referências visuais**: mockups de tela da fonte em `design/references/<tela>.png` (ou na pasta de referências que o projeto já usa), com um `_notes.md` do que imitar de cada uma. Assim o passe de acabamento consegue comparar tela a tela; referência que vive só no chat se perde.
4. **Mapear para o tema do projeto**, mantendo nomes e tipos:
   - Cores em **claro e escuro**. Se o design só tem claro, derive o escuro e apresente para aprovação.
   - Tipografia: a fonte precisa estar disponível na plataforma (Google Fonts, pacote de fontes, arquivo em assets); adicione o carregamento se faltar.
   - Espaçamento: mantenha uma escala fechada (por exemplo 4, 8, 12, 16, 24, 32), sem valores avulsos.
   - Onde a fonte não define algo, **mantenha o valor atual** do projeto. Não invente.
   - Se o projeto tem tokens de papel (cor de destaque, texto sobre a primária, sombra do botão principal), preencha-os a partir da cor-assinatura.
5. **Validar contraste**: os pares principais de texto e fundo precisam de AA (4,5:1 texto normal, 3:1 texto grande) nos dois temas. A fórmula está em `references/formatos-de-tokens.md`. Reporte os pares que falham e proponha um ajuste. Se o projeto tem teste de contraste, acrescente os pares novos nele.
6. **Atualizar o `DESIGN.md`** (crie na raiz do projeto se não existir): seção de identidade (âncora, paleta com hex e papel de cada cor, fontes, tom de voz) e as decisões de estilo que vieram do design. Se o projeto já tem um `DESIGN.md` com regras comuns, acrescente a identidade sem apagar as regras.
7. **Rodar as verificações do projeto**: tipagem, lint e testes (os testes de tema, se houver, validam o contrato).
8. **Prova visual**: rode o app ou site, capture as telas principais (e uma tela de vitrine do design system, se o projeto tiver) nos dois temas e mostre ao usuário lado a lado com as referências.

## Saída

Tokens do projeto atualizados, `DESIGN.md` com a identidade, referências salvas e screenshots de prova nos dois temas, com a lista de pares de contraste ajustados e o que foi derivado (por exemplo o tema escuro) para o usuário aprovar. Depois disso, as próximas telas usam esses tokens; o passe de acabamento (skill `acabamento-de-tela`, se instalada) compara cada tela com as referências.
