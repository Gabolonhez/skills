# acabamento-de-tela

Skill para o [Claude Code](https://claude.com/claude-code) que dá o passe de acabamento numa tela já implementada, de app ou site, até ela ficar com cara de produto e não de template.

## O que ela faz

1. **Lê o projeto**: diretrizes de design (`DESIGN.md` ou similar), arquivo de tokens/tema, biblioteca de componentes e pasta de referências.
2. **Loop visual**: roda a tela (simulador, emulador ou navegador), captura em tema claro e escuro, compara lado a lado com a referência (ou com as diretrizes, se não houver referência), lista cada desvio de forma mensurável, corrige e captura de novo. No mínimo duas voltas.
3. **Revisão de olhos frescos**: um subagente que não construiu a tela (ou o próprio usuário) revisa o resultado final.
4. **Checklist**: estados (carregando, vazio, erro), interação, modo escuro, áreas seguras, tokens, contraste, motion, performance percebida, textos e acessibilidade.
5. **Sinais de cara de IA**: uma lista de padrões genéricos que denunciam tela gerada sem decisão.

Funciona em mobile (iOS, Android, React Native, Flutter, nativo) e web. Ferramentas como um MCP de controle de dispositivo ou outras skills de design são opcionais: se estiverem instaladas, ela usa.

## Instalação

```bash
git clone https://github.com/Gabolonhez/skills.git /tmp/skills
cp -r /tmp/skills/acabamento-de-tela ~/.claude/skills/
```

Ou copie a pasta para `<projeto>/.claude/skills/` para valer só num projeto.

## Uso

No Claude Code, dentro do projeto:

- "dá um acabamento na tela de perfil"
- "a home está com cara de template, deixa profissional"
- "compara a tela de paywall com este print e deixa igual" (anexe o print)

## Combina com

- [referencias-visuais](../referencias-visuais/): junta a referência de cada tela antes de desenhar.
- [importar-design-system](../importar-design-system/): leva o design system para os tokens do projeto.

## Licença

MIT. Veja `LICENSE`.
