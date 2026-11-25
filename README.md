# Skills para o Claude Code

Skills em português para o [Claude Code](https://claude.com/claude-code).

| Skill | O que faz |
|---|---|
| [app-store-aprovacao](app-store-aprovacao/) | Prepara um app iOS para passar na review da App Store sem rejeição (e cobre o básico do Google Play): auditoria do projeto, checklist por guideline, roteiro de teste no aparelho, pacote do revisor e veredito APROVADO ou BLOQUEADO. Também guia a resposta depois de uma rejeição. |
| [spec-de-app](spec-de-app/) | Transforma a ideia de um app num `SPEC.md` (PRD): detecta o que o projeto já tem e especifica só o que é novo, com telas, dados, API, gratuito vs. pago, analytics e riscos de review nas lojas. |
| [referencias-visuais](referencias-visuais/) | Junta uma referência em imagem por tela (emulador, App Store, galerias, vídeos, prints do usuário) e monta a pasta de referências com o que imitar e o que não imitar. |
| [importar-design-system](importar-design-system/) | Leva um design system do Claude Design (ou de outro export) para os tokens do projeto, em qualquer formato (TS, CSS, Tailwind, Flutter, SwiftUI, Android), e gera o `DESIGN.md`. |
| [acabamento-de-tela](acabamento-de-tela/) | Passe de acabamento numa tela: screenshot, comparação lado a lado com a referência, correção em loop e checklist de estados, modo escuro, acessibilidade, motion e sinais de "cara de IA". |

## Instalação

Cada skill é uma pasta com um `SKILL.md`. Copie a pasta da skill para `~/.claude/skills/` (todos os projetos) ou para `<projeto>/.claude/skills/` (só um projeto):

```bash
git clone https://github.com/Gabolonhez/skills.git /tmp/skills
cp -r /tmp/skills/app-store-aprovacao ~/.claude/skills/
```

As skills de app formam um fluxo, mas cada uma funciona sozinha: `spec-de-app` → `referencias-visuais` → `importar-design-system` → `acabamento-de-tela` em cada tela → `app-store-aprovacao` antes de enviar.

O Claude Code carrega a skill sozinho quando o pedido combina com a descrição dela. Detalhes de uso e licença no README de cada pasta.
