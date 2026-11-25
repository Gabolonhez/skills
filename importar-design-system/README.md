# importar-design-system

Skill para o [Claude Code](https://claude.com/claude-code) que leva um design system feito no [Claude Design](https://claude.ai/design), ou exportado de outra ferramenta, para os tokens reais do projeto e documenta a identidade num `DESIGN.md`.

## O que ela faz

1. **Detecta o formato de tokens do projeto**: objeto de tema em TS/JS (React Native, Expo, styled-components), variáveis CSS, Tailwind v3 ou v4, Flutter, SwiftUI/UIKit, Android (Compose ou XML) ou arquivo JSON de tokens.
2. **Extrai os tokens** da fonte: integração com o Claude Design (se o ambiente tiver), export em pasta (HTML/CSS/JSON, Figma Variables, W3C Design Tokens) ou screenshots (com confirmação dos hex).
3. **Mapeia os valores sem mudar o contrato**: chaves e tipos ficam iguais, então os componentes continuam funcionando. Cores em claro e escuro; o que a fonte não define mantém o valor atual.
4. **Valida contraste** WCAG AA nos dois temas e propõe ajustes.
5. **Escreve o `DESIGN.md`**: âncora de identidade, paleta com o papel de cada cor, fontes, tom.
6. **Prova visual**: captura as telas principais nos dois temas, lado a lado com as referências.

## Instalação

```bash
git clone https://github.com/Gabolonhez/skills.git /tmp/skills
cp -r /tmp/skills/importar-design-system ~/.claude/skills/
```

## Uso

- "exportei o design system do Claude Design para a pasta ./export, aplica no app"
- "aplica essa paleta e essa tipografia no tema" (anexe os prints)
- "gera o DESIGN.md a partir dos tokens que já temos"

## Estrutura

```
SKILL.md                           fluxo principal
references/formatos-de-tokens.md   onde ficam os tokens em cada stack, como mapear e a fórmula de contraste
```

## Combina com

- [referencias-visuais](../referencias-visuais/): referências por tela antes de definir os tokens.
- [acabamento-de-tela](../acabamento-de-tela/): compara as telas com as referências depois da importação.

## Licença

MIT. Veja `LICENSE`.
