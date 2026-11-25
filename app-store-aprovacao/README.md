# app-store-aprovacao

Skill para o [Claude Code](https://claude.com/claude-code) que ajuda a aprovar um app iOS na review da App Store sem rejeição, e cobre o básico do Google Play. Escrita em português, para quem publica apps React Native/Expo no Brasil, mas as regras valem para qualquer app iOS (os passos específicos de Expo vêm marcados).

## O que ela faz

Quando você pede para enviar um app, ou cola uma rejeição do Resolution Center, o Claude segue um fluxo em fases:

0. **Contexto**: stack, primeiro envio ou atualização, funções de risco (IA, saúde, compras, login, iPad).
1. **Auditoria automática**: `scripts/audit.mjs` lê o projeto e aponta riscos por guideline.
2. **Checklist de código** por guideline.
3. **Teste no aparelho**, passo a passo, com prints como evidência.
4. **Pacote do revisor**: Notes em inglês, roteiro do vídeo, conta demo, compras anexadas, export compliance. Se houver uma CLI do App Store Connect logada (como `asc` ou `superwall asc`), o Claude pode usá-la só para leitura e conferir App Privacy, informações de review, compras anexadas, status do build e screenshots; sem CLI, entrega o checklist para conferir à mão.
5. **Veredito**: APROVADO ou BLOQUEADO, com a lista de bloqueios.

E um fluxo para **depois de uma rejeição**: ler a mensagem, mapear a guideline, corrigir a causa (e o mesmo problema no resto do app), responder.

O conteúdo nasceu de rejeições reais de 2026 (permissões em idioma errado, IA de terceiros sem consentimento, calculadora de dose, "Information Needed"), generalizadas e sem dados dos apps.

## Instalação

Copie a pasta inteira para um destes lugares:

- Para todos os projetos: `~/.claude/skills/app-store-aprovacao/`
- Só para um projeto: `<projeto>/.claude/skills/app-store-aprovacao/`

```bash
git clone https://github.com/Gabolonhez/skills.git /tmp/skills
cp -r /tmp/skills/app-store-aprovacao ~/.claude/skills/
```

O nome da pasta pode ser outro; o que vale é o `SKILL.md` dentro dela.

## Uso

No Claude Code, dentro do projeto do app:

- "vou mandar o app pra review da Apple, confere tudo"
- "fui rejeitado na 5.1.2(i), segue a mensagem: ..."
- "adicionei um chat com IA, o que preciso para a Apple aprovar?"

O script também roda sozinho, sem o Claude (Node 18+, sem dependências, Windows/macOS/Linux):

```bash
node scripts/audit.mjs /caminho/do/app
```

Ele só lê arquivos, nunca altera o projeto. Sai com código 1 se houver algum `FAIL`. É uma busca por texto: aponta riscos prováveis e não substitui o teste no aparelho.

Autoteste do script:

```bash
node scripts/audit.test.mjs
```

## Estrutura

```
SKILL.md                         fluxo principal (o que o Claude lê)
references/
  catalogo-rejeicoes.md          catálogo por guideline: problema, prevenção, validação
  permissoes-ios.md              Info.plist, InfoPlist.strings, plugin de guarda para Expo
  ia-de-terceiros.md             tela de consentimento (pt/en/es), portão único, bloqueio por versão
  conta-e-apple-login.md         exclusão de conta e revogação do Sign in with Apple
  notas-revisor.md               modelo das Notes em inglês, roteiro do vídeo, resposta à Apple
  google-play.md                 o básico do Google Play
scripts/
  audit.mjs                      auditoria estática
  audit.test.mjs                 autoteste
tests/fixtures/                  projetos de exemplo (bom e ruim) usados no autoteste
evals/
  <caso>/                        casos de avaliação da skill: prompt.md, case.yaml, graders/
  trigger-queries.json           consultas que devem (e não devem) acionar a skill
```

Os casos em `evals/` seguem o formato do skill-creator e do `claude plugin eval`. Com o Claude Code, rode `claude plugin eval . --allow-tools Write,Edit,Bash --scaffold` na pasta da skill (são execuções reais do modelo, cobradas). O `trigger-queries.json` serve para o otimizador de descrição do skill-creator.

## Créditos

- Inspiração e referência: [mjmirza/app-store-compliance](https://github.com/mjmirza/app-store-compliance), uma skill de compliance mais ampla (em inglês, com scanner próprio e mapas de política). Nenhum trecho foi copiado; ela tem licença própria, consulte o repositório. As duas podem ser usadas juntas.
- Texto das regras: [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) e [Políticas do Google Play](https://play.google.com/about/developer-content-policy/).

## Licença

MIT. Veja `LICENSE`.

## Aviso

Quem decide é a Apple (e o Google), caso a caso, e as diretrizes mudam várias vezes por ano. Esta skill reduz o risco de rejeição; não garante aprovação nem é aconselhamento jurídico. Itens sem confirmação no texto oficial estão marcados "(não confirmado)". Confira sempre a versão atual das guidelines antes de citar uma regra.
