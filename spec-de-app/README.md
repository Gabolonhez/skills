# spec-de-app

Skill para o [Claude Code](https://claude.com/claude-code) que transforma a ideia de um app num `SPEC.md` (PRD) pronto para implementar.

## O que ela faz

1. **Lê o projeto** (se já houver código) e lista o que já está pronto: login, paywall, onboarding, idiomas, notificações, analytics. O spec especifica só o que é novo e segue as convenções do projeto.
2. **Entende a ideia**: problema, público, plataformas, monetização, apps de referência, áreas sensíveis.
3. **Pesquisa as referências** de estrutura e fluxo (nunca de identidade visual).
4. **Escreve o `SPEC.md`** com: visão, o que já existe, funcionalidades priorizadas (MVP / v1.1 / depois), telas com wireframe em texto e estados, modelo de dados, API, gratuito vs. pago, eventos de analytics, fora de escopo, riscos de review nas lojas e perguntas em aberto.
5. **Revisa com você** até a aprovação, antes de qualquer código.

A seção de riscos de review cobre os motivos de rejeição mais comuns para apps novos (dose de remédio, IA de terceiros sem consentimento, setor regulado, exclusão de conta, compras). Para o detalhe, ela usa a skill [app-store-aprovacao](../app-store-aprovacao/), se estiver instalada.

## Instalação

```bash
git clone https://github.com/Gabolonhez/skills.git /tmp/skills
cp -r /tmp/skills/spec-de-app ~/.claude/skills/
```

## Uso

- "tenho uma ideia de app de controle de hidratação com assinatura, me ajuda a especificar"
- "monta o PRD do MVP; as referências são o app X e o app Y"
- "quero adicionar um chat com IA no app, escreve o spec dessa funcionalidade"

## Combina com

- [referencias-visuais](../referencias-visuais/): uma referência por tela listada no spec.
- [acabamento-de-tela](../acabamento-de-tela/): fecha cada tela implementada.
- [app-store-aprovacao](../app-store-aprovacao/): antes de enviar às lojas.

## Licença

MIT. Veja `LICENSE`.
