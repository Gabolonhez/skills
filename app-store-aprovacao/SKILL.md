---
name: app-store-aprovacao
description: Prepara um app iOS para passar na review da App Store sem rejeição (e cobre o básico do Google Play). Roda uma auditoria estática do projeto, um checklist de código por guideline, um roteiro de teste no aparelho com prints, monta as notas e o vídeo para o revisor e fecha com veredito APROVADO ou BLOQUEADO. Use sempre que o usuário for enviar, submeter, publicar ou atualizar um app na App Store ou no Google Play; depois de uma rejeição (Resolution Center, "Guideline 2.1", "4.8", "5.1.1", "5.1.2", "Information Needed"); quando um build fica em "Missing Compliance" (criptografia); e quando ele adicionar IA de terceiros, funções de saúde ou remédio, assinaturas e compras, login social, exclusão de conta, permissões ou novos idiomas, mesmo que não fale em "review". Vale para qualquer app iOS; passos de Expo/React Native vêm marcados.
---

# Aprovação na App Store

Objetivo: não mandar para a review o que vai ser rejeitado. O resultado é um veredito, **APROVADO** ou **BLOQUEADO**, com a lista do que falta. "Aprovado com ressalvas" não existe: um item aplicável e não validado já bloqueia, porque cada rejeição custa dias de fila e rejeições repetidas pesam no histórico da conta.

A Apple decide e as guidelines mudam. Esta skill reduz o risco, não garante aprovação. Na dúvida sobre o texto de uma regra, abra a fonte oficial: https://developer.apple.com/app-store/review/guidelines/

## Arquivos desta skill

| Arquivo | Quando ler |
|---|---|
| `scripts/audit.mjs` | Fase 1. Scanner estático, somente leitura, Node 18+, sem dependências |
| `references/catalogo-rejeicoes.md` | Fase 2 e depois de uma rejeição: catálogo por guideline com prevenção e validação |
| `references/permissoes-ios.md` | App com permissões (câmera, fotos, saúde, localização, ATT...) ou com mais de um idioma |
| `references/ia-de-terceiros.md` | App que manda qualquer dado do usuário para OpenAI, Anthropic, Google ou outro provedor de IA, direto ou pelo servidor |
| `references/conta-e-apple-login.md` | App com cadastro/login, login social ou Sign in with Apple |
| `references/notas-revisor.md` | Fase 4: modelo das Notes (em inglês), roteiro do vídeo, conta demo |
| `references/google-play.md` | Se o app também vai para o Google Play |

## Fase 0: contexto

Antes de auditar, descubra (lendo o projeto e, se faltar, perguntando):

1. **Stack**: Swift/Objective-C nativo, React Native puro, Expo com prebuild (sem `ios/` no git) ou Expo com `ios/` versionado. *Expo:* se `ios/` está no git, o EAS Build usa aquela pasta e **não roda os config plugins**; o que vale é o `Info.plist` commitado.
2. **Primeiro envio ou atualização.** Primeiro envio exige pacote completo do revisor (Fase 4). Em atualização, tudo que é novo precisa estar descrito nas Notes.
3. **Funções de risco**, cada uma puxa um bloco do checklist:
   - IA de terceiros (chat, resumo, análise de foto, transcrição) → 5.1.1(i), 5.1.2(i)
   - Saúde, remédio, dose, sintomas → 1.4.1, 1.4.2, 5.1.3
   - Assinatura ou compra → 3.1.1, 3.1.2
   - Login (e-mail, Google, Facebook, Apple) → 4.8, 5.1.1(v)
   - Rastreamento/atribuição de anúncio (Meta, AppsFlyer, Adjust, TikTok) → 5.1.2(i) ATT
   - Conteúdo gerado por usuário ou por IA visível a outros → 1.2
   - Público infantil → 1.3, 5.1.4
   - iPad habilitado (`supportsTablet` ou `TARGETED_DEVICE_FAMILY` com 2) → 2.4.1
4. **Rejeição anterior?** Se sim, vá também para "Depois de uma rejeição", no fim.

## Fase 1: auditoria automática

```bash
node "<pasta desta skill>/scripts/audit.mjs" "<pasta do app>"
```

O script só lê arquivos. Ele confere: idioma dos textos de permissão contra o `CFBundleDevelopmentRegion` e traduções faltando por idioma (Info.plist, InfoPlist.strings/.xcstrings, app.json/app.config, `locales` do Expo), privacy manifest, iPad, uso de IA de terceiros e sinais de consentimento, termos de calculadora de dose, placeholders e dados de teste, Sign in with Apple junto de login social, exclusão de conta e revogação do token Apple, restaurar compras e links legais do paywall, ATT com SDK de rastreamento, `http://` e `NSAllowsArbitraryLoads`, `console.log` esquecido, declaração de criptografia (`ITSAppUsesNonExemptEncryption`).

- `FAIL` = bloqueio até corrigir ou provar que não se aplica (anote o motivo em uma frase).
- `WARN` = conferir à mão ou no aparelho; o script não enxerga servidor, painel de paywall remoto nem App Store Connect.
- Código de saída 1 se houver FAIL.

É busca por texto: pode errar para os dois lados. Um OK não substitui as fases 2 e 3. Se outra skill de compliance estiver instalada (por exemplo `app-store-compliance`), rode também e junte os achados.

## Fase 2: checklist de código

Confira cada linha aplicável no código **e** marque o que precisa ser visto no aparelho (Fase 3). Detalhe e outras guidelines em `references/catalogo-rejeicoes.md`.

| Guideline | O que precisa ser verdade | Referência |
|---|---|---|
| 4 / 5.1.1(ii) | Todo `NS…UsageDescription` explica o uso com clareza; o valor base do Info.plist está no idioma do `CFBundleDevelopmentRegion`; **cada idioma do app** tem `InfoPlist.strings` (ou `locales` no Expo) com todas as chaves. O app continua usável se o usuário negar | `permissoes-ios.md` |
| 5.1.1(i) / 5.1.2(i) | Antes de mandar dado pessoal para IA de terceiros: tela cujo título é um pedido de permissão, nomeando o provedor e os dados; "Permitir" e "Agora não" com o mesmo destaque; revogável em Ajustes; política de privacidade nomeia o provedor. **Todo** ponto de entrada de IA passa por ela, inclusive resumos e tarefas em segundo plano | `ia-de-terceiros.md` |
| 1.4.2 | Nada calcula, sugere ou ajusta dose de remédio, a menos que o publicador seja fabricante, hospital, universidade, plano de saúde, farmácia, entidade aprovada, ou haja aprovação regulatória. Registrar a dose que o médico prescreveu é permitido. Tirar a função do iOS no build é aceitável; esconder durante a review e ligar depois por flag remota é funcionalidade oculta (2.5.19) | catálogo |
| 5.1.1(v) | Quem cria conta no app consegue excluir a conta dentro do app, fácil de achar. Com Sign in with Apple, o servidor revoga o token; revogação que falha ou código ausente nunca impede a exclusão | `conta-e-apple-login.md` |
| 4.8 | Login com Google/Facebook/etc. como conta principal → oferecer Sign in with Apple (ou login equivalente com os requisitos da 4.8) | `conta-e-apple-login.md` |
| 3.1.1 | Mecanismo de restaurar compras; prática recomendada: visível também fora do paywall (Ajustes) | catálogo |
| 3.1.2 | Paywall com o que o usuário recebe, preço, período, renovação automática, link de Termos de Uso (EULA) e de Política de Privacidade | catálogo |
| 2.4.1 | Se o app roda nativo no iPad, todo fluxo funciona no iPad (o revisor pode usar só iPad). Depois de publicado com iPad, uma atualização não remove o iPad | catálogo |
| 5.1.1 / 5.1.2 | Privacy manifest (`PrivacyInfo.xcprivacy`; *Expo:* `ios.privacyManifests`) com as razões das required reason APIs e os tipos de dado coletados (saúde, conteúdo do usuário, rastreamento se houver ATT), coerente com o App Privacy do App Store Connect | catálogo |
| 5.1.2(i) | SDK que rastreia entre apps → `NSUserTrackingUsageDescription` e prompt do ATT antes de rastrear | `permissoes-ios.md` |
| 2.1(a) | Nenhum placeholder alcançável ("em breve", "coming soon", lorem ipsum, tela vazia, botão sem ação, dado de teste) | catálogo |
| 2.5.19 / 2.3.1 | Nada oculto ou dormente: o que existe no build está descrito nas Notes; flags remotas não ligam função que a review não viu | catálogo |
| Export compliance | `ITSAppUsesNonExemptEncryption` declarado no `Info.plist` (*Expo:* `ios.config.usesNonExemptEncryption`): `false` se o app e as bibliotecas só usam HTTPS/criptografia do sistema; `true` com documentação de exportação se há criptografia própria. Sem a chave o build trava em "Missing Compliance" | catálogo |

## Fase 3: teste no aparelho

Use o **build de release** (TestFlight ou build de preview apontando para produção), nunca o modo de desenvolvimento. Simulador ajuda, mas pelo menos um iPhone físico é obrigatório; se o app roda nativo no iPad, também um iPad (físico ou simulador). Salve um print por passo em `release-evidence/<AAAA-MM-DD>/` dentro do app (`01-instalacao.png`, `02-onboarding.png`...). Se você controla um dispositivo por ferramenta (por exemplo um MCP de mobile), faça você; senão entregue o roteiro ao usuário e peça os prints.

Marque cada passo ✅ ou ❌:

1. **Instalação limpa** (apague o app antes). Abre sem crash, sem tela branca.
2. **Onboarding** inteiro, até o fim.
3. **Cadastro e login**: e-mail, Google, Apple (Apple no iPhone). Depois, login com a **conta demo** que vai nas Notes.
4. **Permissões**: com o aparelho em cada idioma suportado (Ajustes > Geral > Idioma; reinstale entre trocas), dispare cada prompt e confira que o texto está no idioma do aparelho. Negue cada permissão: o app continua usável. Depois aceite.
5. **IA**: com uma conta sem consentimento, entre por **cada** ponto de entrada de IA (chat, resumo, análise de foto, notificação que abre uma análise). O pedido de permissão aparece antes de qualquer envio. "Agora não" funciona e o app segue. Revogue em Ajustes e confirme que a IA para.
6. **Telas principais**: todo botão leva a algum lugar; nenhum placeholder; estados vazios e de erro com texto real.
7. **Paywall**: abre e fecha; mostra preço, período, renovação automática, Termos e Privacidade (toque nos dois links). Compra no sandbox. "Restaurar compras" no paywall **e** em Ajustes responde.
8. **Saúde** (se houver): nenhuma tela calcula ou sugere dose; aviso de consultar um médico onde há informação de saúde.
9. **Sem internet** (modo avião): mensagem clara, sem crash nem carregamento infinito; volta ao reconectar.
10. **Fechar à força e reabrir**: sessão mantida.
11. **iPad** (se habilitado): passos 1 a 7 no iPad, em retrato e paisagem. Nada cortado, nenhum botão fora da tela, sheets e paywall utilizáveis.
12. **Acessibilidade básica**: modo escuro e fonte grande do sistema sem texto cortado.
13. **Links**: Política de Privacidade, Termos e Suporte abrem e carregam.
14. **Exclusão de conta**: logout, login, excluir conta (com conta Apple também), tentar logar de novo: a conta não existe mais.
15. **Crash**: nenhum crash no período (Xcode Organizer, TestFlight ou ferramenta de crash).

Bug achado: corrija, gere build novo e repita desde o passo 1.

## Fase 4: pacote do revisor

A maior parte das rejeições é 2.1 (app incompleto ou informação faltando). Leia `references/notas-revisor.md` e entregue:

1. **Notes for Review** em inglês, preenchidas (modelo no arquivo), descrevendo também cada função nova da versão.
2. **Conta demo**: assinatura premium ativa, onboarding já concluído, sem 2FA, backend de produção no ar durante toda a review, e **consentimento de IA ainda não dado** (senão o revisor nunca vê o pedido e a Apple rejeita por achar que ele não existe). Recrie ou resete a conta antes de cada envio.
3. **Vídeo** gravado em iPhone físico (gravação de tela do iOS), começando na abertura do app e mostrando cadastro, login, exclusão de conta, conteúdo pago e, se houver IA, o pedido de permissão. O agente escreve o roteiro; o usuário grava.
4. **Compras**: assinaturas e IAP no status "pronto para envio" e anexadas **à mesma versão**, cada uma com print de review.
5. **App Store Connect**: App Privacy igual ao que o app e os SDKs coletam de verdade (bate com o privacy manifest); URL de privacidade e de suporte funcionando; screenshots com o app em uso (nada de só splash ou login); classificação etária respondida considerando conteúdo gerado por IA.
6. **Export compliance**: o build escolhido não está em "Missing Compliance". Se estiver, responda o questionário de criptografia no App Store Connect e ponha `ITSAppUsesNonExemptEncryption` no projeto para os próximos builds. Com criptografia não isenta, a documentação aprovada e o `ITSEncryptionExportComplianceCode` no `Info.plist`.

### Conferência no App Store Connect por CLI (opcional)

Se o usuário tem uma CLI do App Store Connect instalada e logada (por exemplo `asc`, ou o proxy `superwall asc` da CLI da Superwall), use-a **só para leitura** e confira: App Privacy preenchido, informações de App Review (conta demo, Notes), compras e assinaturas anexadas à versão, status de export compliance do build e screenshots de todos os tamanhos exigidos. Não altere nada pela CLI sem o usuário pedir. Sem CLI, ou sem login, entregue esses mesmos itens como checklist manual. Não é requisito para o veredito: o que vale é cada item conferido, por CLI ou à mão.

## Fase 5: veredito

Responda neste formato:

```
VEREDITO: APROVADO | BLOQUEADO

Bloqueios (corrigir antes de enviar):
1. [guideline] o problema, onde (arquivo ou tela), a correção

Fase 1 (audit.mjs): X FAIL, Y WARN; o que cada FAIL/WARN virou
Fase 2: tabela guideline ✅/❌/não se aplica (com motivo)
Fase 3: roteiro ✅/❌ por aparelho, pasta dos prints, o que ficou sem testar
Fase 4: Notes prontas para colar, roteiro do vídeo, pendências no App Store Connect
```

Só é APROVADO com as fases 1 a 4 sem item aberto. Passo de aparelho não executado conta como aberto: diga qual falta, em vez de supor que funciona.

## Depois de uma rejeição

1. **Leia a mensagem inteira** no Resolution Center (App Store Connect > o app > App Review). Copie o texto, o número da guideline, o aparelho usado pelo revisor (por exemplo "iPad Air") e prints anexados.
2. **Mapeie** cada guideline citada em `references/catalogo-rejeicoes.md`. Uma rejeição pode citar várias; trate todas. Leia o texto oficial da guideline, não só o resumo.
3. **Ache a causa no build enviado**, não no código atual: confira o commit/tag daquela versão. Reproduza no mesmo tipo de aparelho do revisor.
4. **Corrija a causa e procure o mesmo problema no resto do app.** Exemplo real: um app corrigiu o consentimento de IA no chat e foi rejeitado de novo porque um resumo semanal também chamava a IA sem passar pelo pedido.
5. **Rode as fases 1 a 4 de novo** e gere build novo. Reenviar o mesmo build sem mudança tende a gerar a mesma rejeição.
6. **Responda no Resolution Center** em inglês, curto e factual: o que mudou, onde ver (caminho na tela), build novo e link do vídeo. Se a rejeição for por "Information Needed", responda às perguntas uma a uma e atualize as Notes.
7. **Se você discorda**, explique com educação na resposta; se não resolver, há o recurso ao App Review Board (https://developer.apple.com/contact/app-store/?topic=appeal). Não recorra sem ter corrigido o que é claramente procedente.
8. Acrescente o caso ao seu histórico interno (data, guideline, causa, prevenção) para virar regra no próximo envio.
