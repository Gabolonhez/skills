# Skills para o Claude Code

Skills em português para o [Claude Code](https://claude.com/claude-code).

| Skill | O que faz |
|---|---|
| [app-store-aprovacao](app-store-aprovacao/) | Prepara um app iOS para passar na review da App Store sem rejeição (e cobre o básico do Google Play): auditoria do projeto, checklist por guideline, roteiro de teste no aparelho, pacote do revisor e veredito APROVADO ou BLOQUEADO. Também guia a resposta depois de uma rejeição. |

## Instalação

Cada skill é uma pasta com um `SKILL.md`. Copie a pasta da skill para `~/.claude/skills/` (todos os projetos) ou para `<projeto>/.claude/skills/` (só um projeto):

```bash
git clone https://github.com/Gabolonhez/skills.git /tmp/skills
cp -r /tmp/skills/app-store-aprovacao ~/.claude/skills/
```

O Claude Code carrega a skill sozinho quando o pedido combina com a descrição dela. Detalhes de uso e licença no README de cada pasta.
