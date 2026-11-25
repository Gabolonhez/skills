# Formatos de tokens por stack

Onde procurar os tokens em cada stack e como mapear sem quebrar o contrato. Leia só a seção da stack do projeto.

## Como achar

Procure, nesta ordem:

1. Pastas `theme/`, `tokens/`, `styles/`, `design-system/`, `ui/` (dentro de `src/`, `app/`, `lib/` ou na raiz).
2. Arquivos com nomes como `colors.*`, `palette.*`, `typography.*`, `spacing.*`, `tokens.json`, `theme.*`.
3. Onde os componentes buscam cor: abra um botão ou card e siga o import.

Se houver tipos (`types/`, interfaces, `ThemeData`), eles são o contrato: não renomeie nem remova chaves.

## Objeto de tema em TypeScript/JavaScript (React Native, Expo, styled-components, Emotion, Tamagui, Restyle)

- Costuma haver `colors.light` e `colors.dark` (ou dois objetos de tema) com as mesmas chaves. Troque os valores nos dois.
- Tipografia: `fontFamily`, `fontSize`, `lineHeight`, `fontWeight` por estilo (title, body, caption). A família precisa ser carregada (por exemplo `expo-font` ou pacote `@expo-google-fonts/*`).
- Sombras em React Native: iOS usa `shadowColor/Offset/Opacity/Radius`, Android usa `elevation`. Mantenha os dois.
- Motion: durações e curvas ou configs de spring, se o projeto tiver um arquivo de animações.

## Variáveis CSS

- Tokens em `:root { --color-primary: ... }` e o tema escuro em `[data-theme="dark"]`, `.dark` ou `@media (prefers-color-scheme: dark)`. Troque nos dois blocos.
- Se o projeto usa cores em HSL ou OKLCH sem a função (`--primary: 222 47% 11%`, padrão do shadcn/ui), converta o hex para o mesmo formato.

## Tailwind

- v3: `tailwind.config.js|ts`, em `theme.extend.colors`, `fontFamily`, `spacing`, `borderRadius`, `boxShadow`. Muitas vezes as cores apontam para variáveis CSS (`'hsl(var(--primary))'`): nesse caso, mude as variáveis, não o config.
- v4: bloco `@theme { --color-primary: ...; }` no CSS principal.
- Não troque nomes de classes usados no código (`bg-primary`); só valores.

## Flutter

- `ThemeData` e `ColorScheme` (claro e escuro), `TextTheme`, e às vezes `ThemeExtension` com tokens próprios. Prefira `ColorScheme.fromSeed` só se o projeto já usa; senão preencha as cores explicitamente.
- Fontes em `pubspec.yaml` (assets) ou pelo pacote `google_fonts`.

## SwiftUI / UIKit

- Cores no Asset Catalog (`Assets.xcassets/*.colorset`, com variante Dark Appearance) ou em extensões `Color`/`UIColor`. No colorset, cada variante tem seu valor no `Contents.json`.
- Fontes registradas no `Info.plist` (`UIAppFonts`).

## Android (Compose / XML)

- Compose: `Color.kt`, `Theme.kt` (`lightColorScheme`/`darkColorScheme`), `Type.kt`.
- XML: `res/values/colors.xml` e `res/values-night/colors.xml`, `themes.xml`.

## Arquivo de tokens (JSON)

- Formatos como W3C Design Tokens (`$value`, `$type`) ou Tokens Studio, às vezes transformados por Style Dictionary. Atualize o JSON de origem e rode o build de tokens do projeto; não edite o arquivo gerado.

## Contraste (WCAG 2)

Para cada cor em hex, converta cada canal para 0 a 1 (`c = valor / 255`) e linearize: `c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ^ 2.4`. Luminância relativa `L = 0.2126 R + 0.7152 G + 0.0722 B`. Contraste = `(L_clara + 0.05) / (L_escura + 0.05)`.

Mínimos AA: 4,5:1 texto normal, 3:1 texto grande (a partir de 18pt, ou 14pt em negrito) e elementos gráficos de interface. Confira pelo menos: texto principal e secundário sobre o fundo, texto sobre a cor primária (botão), texto sobre as cores semânticas, nos dois temas.
