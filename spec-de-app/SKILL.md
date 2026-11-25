---
name: spec-de-app
description: Transforma a ideia de um app (ou de uma funcionalidade grande) num SPEC.md acionável, um PRD com visão, funcionalidades priorizadas, telas com wireframe em texto e estados, modelo de dados, API, gratuito vs. pago, eventos de analytics, fora de escopo e riscos de review nas lojas, usando apps conhecidos como referência de estrutura e fluxo. Detecta o que o projeto já tem (login, paywall, onboarding, idiomas, notificações) e especifica só o que é novo. Use sempre que o usuário descrever uma ideia de app, pedir PRD, spec, escopo, MVP, documento de requisitos ou "o que preciso construir", ou quiser planejar um app antes de codar, mesmo que não fale em "spec".
---

# Spec de app

Transforma a ideia do usuário num PRD acionável (`SPEC.md` na raiz do app), usando apps conhecidos como referência **de estrutura e fluxo, nunca de identidade visual**. O spec existe para que a implementação não precise adivinhar: cada tela tem propósito, hierarquia e estados; cada dado tem lugar; cada risco de review aparece antes do código.

## Passo 1: o que o projeto já tem

Se já existe código, leia o projeto antes de escrever (manifesto de pacotes, rotas/telas, pasta de serviços, schema do banco, README, `CLAUDE.md` ou `AGENTS.md`). Monte uma lista curta do que **já está pronto**, por exemplo:

- autenticação (quais provedores), exclusão de conta
- onboarding, paywall/assinaturas (qual SDK), restaurar compras
- idiomas suportados, tema claro/escuro
- notificações, analytics, tracking, crash reporting
- ajustes, perfil, atualização forçada, consentimentos de privacidade

O spec **não re-especifica** o que já existe; só aponta customizações ("onboarding com 4 passos: X, Y, Z, W"). Se o projeto está vazio, o spec cobre tudo, mas marque o que é infraestrutura comum (login, paywall) para o usuário decidir se usa um template ou uma biblioteca pronta.

Também anote as **convenções** do projeto (padrão de rotas da API, ORM e formato do schema, estrutura de pastas), para que as seções de dados e API saiam no formato que o time já usa.

## Passo 2: entender a ideia

Descubra (perguntando o que faltar, em uma rodada só):

- Problema que resolve e para quem (público-alvo concreto).
- Plataformas: iOS, Android, web.
- Monetização: grátis, assinatura, compra única, anúncios. O que é grátis e o que é pago.
- Apps de referência que o usuário admira ou que são concorrentes.
- Se a ideia toca **área sensível**: saúde, remédio, finanças, crianças, IA de terceiros, conteúdo gerado por usuário.

## Passo 3: pesquisar as referências

Para cada app de referência, levante os padrões de UX relevantes: estrutura de navegação, fluxo principal, como o onboarding leva ao paywall, mecânicas de engajamento e retenção. Aproveite estrutura e fluxo; a identidade visual do app vem do design próprio.

Depois de listar as telas (passo 4), cada tela deveria ter uma referência em imagem. Se a skill `referencias-visuais` (mesma coleção) estiver instalada, sugira rodá-la; senão, peça ao usuário prints das telas de referência.

## Passo 4: escrever o SPEC.md

Use estas seções, nesta ordem:

1. **Visão**: 2 a 3 frases. Público-alvo. Referências usadas e o que foi aproveitado de cada uma.
2. **O que já existe**: a lista do passo 1, em uma linha cada, com a customização necessária (ou "sem mudança").
3. **Funcionalidades** (só o que é novo): tabela com nome, descrição, prioridade (MVP / v1.1 / depois) e telas envolvidas.
4. **Telas**: para cada tela nova, o propósito, um wireframe em texto (elementos de cima para baixo, na ordem de hierarquia), os estados (carregando, vazio, erro, sucesso), de onde se chega e para onde se vai. Cite a referência visual quando houver.
5. **Modelo de dados**: entidades novas (campos, tipos, relações) e o que muda no schema existente, no formato do ORM/banco do projeto.
6. **API**: endpoints novos (método, rota, payload, resposta, erros), seguindo as convenções do projeto. Se não houver backend, diga onde os dados ficam (local, serviço gerenciado).
7. **Gratuito vs. pago**: o que fica atrás do paywall, limites da versão grátis, período de teste.
8. **Eventos de analytics**: eventos novos por funcionalidade (nome, quando dispara, propriedades).
9. **Fora de escopo**: o que explicitamente não entra no MVP.
10. **Riscos de review**: ver abaixo.
11. **Perguntas em aberto**: decisões que dependem do usuário.

### Riscos de review

Cruze cada funcionalidade com as regras das lojas antes de aprovar o spec. Se a skill `app-store-aprovacao` (mesma coleção) estiver instalada, use o catálogo de rejeições dela (`references/catalogo-rejeicoes.md`) como fonte; senão, consulte as [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) e as políticas do Google Play. Os riscos que mais derrubam apps novos:

- **Saúde e remédio (Apple 1.4.2)**: nada que calcule, sugira ou ajuste dose de remédio, a menos que o publicador seja fabricante, instituição de saúde ou tenha aprovação regulatória. Registrar a dose que o médico prescreveu (o usuário digita) é permitido, com aviso de que o app não substitui orientação médica.
- **IA de terceiros (Apple 5.1.1(i) e 5.1.2(i))**: liste o provedor (por exemplo OpenAI) e quais dados do usuário vão para ele. Toda funcionalidade assim precisa de um pedido de consentimento antes do primeiro envio, que nomeie o provedor e os dados, e de um jeito de revogar.
- **Setor regulado (Apple 2.1 e 5.1.3)**: se o app trata saúde, finanças ou remédio, anote que documentação a Apple pode pedir.
- **Conta (Apple 5.1.1(v) e 4.8)**: quem cria conta precisa conseguir excluí-la dentro do app; login social como conta principal pede Sign in with Apple (ou equivalente).
- **Compras (Apple 3.1.1 e 3.1.2)**: conteúdo digital pago passa pela compra da loja; paywall mostra preço, período, renovação, termos e privacidade, e há restaurar compras.

Para cada risco que se aplica, escreva no spec: a funcionalidade, a regra e como o design evita o problema.

## Passo 5: revisar com o usuário

Apresente o spec e itere até a aprovação. **Não comece a implementar sem aprovação explícita**: mudar o spec custa minutos; mudar o código, dias.

## Saída

`SPEC.md` aprovado na raiz do app. Próximos passos sugeridos ao usuário:

- implementar na ordem de prioridade do spec, uma funcionalidade por vez;
- juntar referências por tela antes de desenhar (skill `referencias-visuais`, se instalada);
- fechar cada tela com um passe de acabamento (skill `acabamento-de-tela`, se instalada);
- antes de enviar às lojas, rodar a skill `app-store-aprovacao`, se instalada.
