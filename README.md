# Skills para o Claude Code

Skills em português para o [Claude Code](https://claude.com/claude-code).

| Skill | O que faz |
|---|---|
| [app-store-aprovacao](app-store-aprovacao/) | Prepara um app iOS para passar na review da App Store sem rejeição (e cobre o básico do Google Play): auditoria do projeto, checklist por guideline, roteiro de teste no aparelho, pacote do revisor e veredito APROVADO ou BLOQUEADO. Também guia a resposta depois de uma rejeição. |
| [spec-de-app](spec-de-app/) | Transforma a ideia de um app num `SPEC.md` (PRD): detecta o que o projeto já tem e especifica só o que é novo, com telas, dados, API, gratuito vs. pago, analytics e riscos de review nas lojas. |
| [referencias-visuais](referencias-visuais/) | Junta uma referência em imagem por tela (emulador, App Store, galerias, vídeos, prints do usuário) e monta a pasta de referências com o que imitar e o que não imitar. |
| [importar-design-system](importar-design-system/) | Leva um design system do Claude Design (ou de outro export) para os tokens do projeto, em qualquer formato (TS, CSS, Tailwind, Flutter, SwiftUI, Android), e gera o `DESIGN.md`. |
| [acabamento-de-tela](acabamento-de-tela/) | Passe de acabamento numa tela: screenshot, comparação lado a lado com a referência, correção em loop e checklist de estados, modo escuro, acessibilidade, motion e sinais de "cara de IA". |

## Skills de terceiros

As skills das tabelas abaixo **não são minhas**: são de outros autores, cada uma com sua licença. As minhas são as da tabela acima (as pastas na raiz). Cada pasta copiada em [`terceiros/`](terceiros/) traz o `LICENSE` original e um `ORIGEM.md` com a fonte; o conteúdo é a cópia da versão que eu uso, sem alterações. Para a versão mais nova, instale direto da fonte.

### Copiadas (licença permite)

| Skill | Autor | Licença | Link |
|---|---|---|---|
| [`appllama-app-design-skill`](terceiros/appllama-app-design-skill/) | Antmind Ventures Private Limited (Appllama, appllama.io) | MIT | https://github.com/Appllama/appllama-skills |
| [`appllama-usage`](terceiros/appllama-usage/) | Antmind Ventures Private Limited (Appllama, appllama.io) | MIT | https://github.com/Appllama/appllama-skills |
| [`impeccable`](terceiros/impeccable/) | Paul Bakaus | Apache-2.0 | https://github.com/pbakaus/impeccable |
| [`hallmark`](terceiros/hallmark/) | Hallmark contributors (Nutlope) | MIT | https://github.com/Nutlope/hallmark |
| [`rossark-motion-skill`](terceiros/rossark-motion-skill/) | rossark0 | MIT | https://github.com/rossark0/rossark-motion-skill |
| [`superwall`](terceiros/superwall/) | Duncan Crawbuck (Superwall) | MIT | https://github.com/superwall/skills |
| [`superwall-editor`](terceiros/superwall-editor/) | Duncan Crawbuck (Superwall) | MIT | https://github.com/superwall/skills |
| [`app-store-screenshots`](terceiros/app-store-screenshots/) | Parth Jadhav | MIT | https://github.com/ParthJadhav/app-store-screenshots |
| [`android-cli`](terceiros/android-cli/) | Google LLC | Apache-2.0 | https://github.com/android/skills |
| [`context7-mcp`](terceiros/context7-mcp/) | Upstash, Inc. | MIT | https://github.com/upstash/context7 |
| [`stop-slop`](terceiros/stop-slop/) | Hardik Pandya | MIT | https://github.com/hardikpandya/stop-slop |
| [`emil-design-eng`](terceiros/emil-design-eng/) | Emil Kowalski | MIT | https://github.com/emilkowalski/skills |
| [`animate`](terceiros/animate/) | Emil Kowalski | MIT | https://github.com/emilkowalski/skills |
| [`review-animations`](terceiros/review-animations/) | Emil Kowalski | MIT | https://github.com/emilkowalski/skills |
| [`animation-performance`](terceiros/animation-performance/) | Emil Kowalski | MIT | https://github.com/emilkowalski/skills |
| [`mobile-native`](terceiros/mobile-native/) | Emil Kowalski | MIT | https://github.com/emilkowalski/skills |
| [`gestures`](terceiros/gestures/) | Emil Kowalski | MIT | https://github.com/emilkowalski/skills |
| [`break-ui`](terceiros/break-ui/) | Emil Kowalski | MIT | https://github.com/emilkowalski/skills |
| [`choreograph`](terceiros/choreograph/) | Emil Kowalski | MIT | https://github.com/emilkowalski/skills |
| [`dashboard-design`](terceiros/dashboard-design/) | Otabek Abdiraimov | MIT | https://github.com/abdiraimov-otabek/dashboard-design-skill |
| [`logo-design`](terceiros/logo-design/) | kaankiziltug | MIT | https://github.com/kaankiziltug/logo-design-skill |
| [`ui-ux-pro-max`](terceiros/ui-ux-pro-max/) | Next Level Builder | MIT | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill |

### Instalar da fonte

Não copiadas aqui: a licença não permite redistribuir ou o repositório não traz o texto da licença com o titular.

| Skill | Autor | Link | Comando |
|---|---|---|---|
| `app-store-compliance` | Mirza Iqbal (mjmirza) | https://github.com/mjmirza/app-store-compliance | `git clone https://github.com/mjmirza/app-store-compliance` (licença OpenRoots ORA 2.3, com royalty acima de US$ 20 mi de receita e treino de IA restrito; leia os termos antes de usar) |
| `vercel-react-best-practices` | Vercel | https://github.com/vercel-labs/agent-skills | `npx skills add vercel-labs/agent-skills --skill react-best-practices` |
| `vercel-react-native-skills` | Vercel | https://github.com/vercel-labs/agent-skills | `npx skills add vercel-labs/agent-skills --skill react-native-skills` |
| `vercel-composition-patterns` | Vercel | https://github.com/vercel-labs/agent-skills | `npx skills add vercel-labs/agent-skills --skill composition-patterns` |

## Instalação

Cada skill é uma pasta com um `SKILL.md`. Copie a pasta da skill para `~/.claude/skills/` (todos os projetos) ou para `<projeto>/.claude/skills/` (só um projeto):

```bash
git clone https://github.com/Gabolonhez/skills.git /tmp/skills
cp -r /tmp/skills/app-store-aprovacao ~/.claude/skills/
```

As skills de app formam um fluxo, mas cada uma funciona sozinha: `spec-de-app` → `referencias-visuais` → `importar-design-system` → `acabamento-de-tela` em cada tela → `app-store-aprovacao` antes de enviar.

O Claude Code carrega a skill sozinho quando o pedido combina com a descrição dela. Detalhes de uso e licença no README de cada pasta.
