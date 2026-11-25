# Catálogo de rejeições da App Store

Revisado em novembro de 2026 contra https://developer.apple.com/app-store/review/guidelines/. A Apple renumera e reescreve itens: confira a numeração no texto oficial antes de citar numa resposta. O que não foi confirmado no texto oficial está marcado **(não confirmado)**.

Legenda da validação: **CÓDIGO** (revisão no repositório), **ASC** (App Store Connect), **APARELHO** (teste no build de release).

## Sumário

1. Casos reais (anonimizados)
2. Safety (1.x)
3. Performance (2.x)
4. Business (3.x)
5. Design (4.x)
6. Legal (5.x)
7. Fontes

Como usar: percorra só as seções que batem com o app (Fase 0 da skill). Cada linha aplicável precisa de uma validação feita; linha que não se aplica ganha uma frase dizendo por quê.

## 1. Casos reais (anonimizados)

Rejeições que aconteceram com apps React Native/Expo publicados no Brasil em 2026. Viraram as regras da Fase 2.

| Guideline | O que aconteceu | Prevenção |
|---|---|---|
| 2.1 Information Needed | App de bem-estar, primeiro envio. A Apple pediu: gravação de tela em aparelho físico desde a abertura do app (cadastro, login, exclusão de conta, conteúdo pago), propósito e público, conta demo, serviços externos (dados, autenticação, pagamento, IA), diferenças por região e documentação de setor regulado. | Notes completas (`notas-revisor.md`) e vídeo anexado em todo primeiro envio. |
| 5.1.1(i) e 5.1.2(i) | Dois apps de saúde mandavam texto do usuário para IA de terceiros. Termos e política citavam a IA, mas o app não pedia permissão antes. | Tela de permissão dentro do app, antes do primeiro envio, nomeando provedor e dados (`ia-de-terceiros.md`). |
| 5.1.1(i) e 5.1.2(i), de novo | O mesmo app voltou rejeitado já com a tela de permissão: um resumo semanal chamava a IA sem passar por ela, e a conta demo já tinha o consentimento dado, então o revisor não viu o pedido. | Um único portão de consentimento usado por todo ponto de entrada de IA; conta demo sem consentimento. |
| 4 Design | App com interface em português e com traduções dos textos de permissão, mas o valor base do `Info.plist` estava em português com `CFBundleDevelopmentRegion` = `en`. Num aparelho em idioma sem tradução, o prompt saiu no idioma "errado". A pasta `ios/` estava no git, então o plugin do Expo que corrigia isso não rodava no EAS. A mensagem lembrou também que app que roda no iPad precisa funcionar no iPad. | Valor base no idioma de desenvolvimento, `InfoPlist.strings` em todo idioma, conferir o `Info.plist` commitado (`permissoes-ios.md`). Testar tudo no iPad. |
| 1.4.2 | App de acompanhamento de tratamento rejeitado por ter calculadora de dose de medicamento, publicado por desenvolvedor independente. Revisado num iPad Air. | Remover o cálculo do build iOS ou publicar pela entidade habilitada. Registrar a dose prescrita continua permitido. |

## 2. Safety (1.x)

| Guideline | Problema | Prevenção | Como validar |
|---|---|---|---|
| 1.1 | Conteúdo ofensivo, perturbador ou de mau gosto (inclusive gerado por IA). | Revisar textos, imagens e saídas de IA; filtro na saída do modelo. | APARELHO: percorrer telas e conteúdo de exemplo. |
| 1.2 | Conteúdo gerado por usuário (ou por IA, compartilhado) sem filtro, denúncia, bloqueio de usuário e contato publicado. | Filtro, botão de denunciar, bloquear, contato visível, remoção rápida. | APARELHO: postar, denunciar e bloquear com duas contas. |
| 1.3 | Categoria Kids com link externo, compra ou SDK de terceiros sem portão parental. | Não usar Kids sem necessidade; se usar, sem analytics/anúncio de terceiros. | CÓDIGO: lista de SDKs. ASC: categoria e idade. |
| 1.4.1 | App médico com dado impreciso, medição que o aparelho não consegue validar, sem lembrete de consultar médico. | Divulgar metodologia; "consulte um médico antes de decisões médicas"; documentação regulatória nas Notes, se houver. | CÓDIGO: buscar "diagnostica", "detecta", "mede". APARELHO: aviso visível. |
| 1.4.2 | Calculadora de dose de remédio que não vem de fabricante, hospital, universidade, plano de saúde, farmácia ou entidade aprovada, nem tem aprovação do FDA ou equivalente. | Não calcular, sugerir nem titular dose. Registrar a dose prescrita, lembrete de horário e histórico são permitidos. Excluir a função do iOS **no build** é aceitável; escondê-la na review e ligar depois por flag remota é funcionalidade oculta (2.5.19), caminho para remoção do programa. | CÓDIGO: buscar dose, dosagem, titulação, "calcular". APARELHO: nenhuma tela produz um número de dose a partir de peso, glicemia etc. |
| 1.5 | Sem forma fácil de contato; URL de suporte quebrada. | Contato no app e Support URL funcionando. | APARELHO e ASC: abrir os links. |
| 1.6 | Segurança fraca dos dados. | Token no Keychain/SecureStore, TLS, nenhum segredo no bundle. | CÓDIGO: `http://`, chaves de API no app. |

## 3. Performance (2.x)

| Guideline | Problema | Prevenção | Como validar |
|---|---|---|---|
| 2.1(a) crash e bugs | Crash ou problema técnico evidente. | Testar o build de release em aparelho físico. | APARELHO: roteiro completo em iPhone e, se habilitado, iPad. |
| 2.1(a) conta demo | Login sem conta demo ou com backend desligado. | Conta demo funcional, sem 2FA, backend no ar durante toda a review. Sem conta possível: modo demo, só com aprovação prévia da Apple. | APARELHO: logar com a conta das Notes no dia do envio. |
| 2.1(a) placeholder | Texto provisório, "em breve", lorem ipsum, URL vazia, tela vazia. | Remover ou esconder **no build** o que não está pronto. | CÓDIGO: `audit.mjs`. APARELHO: percorrer tudo. |
| 2.1 Information Needed | A Apple não conseguiu revisar e pede informação. | Notes completas e vídeo (`notas-revisor.md`). | ASC: Notes e anexo. |
| 2.1(b) IAP | Compra incompleta, não visível ao revisor ou não funcional. | Produtos prontos e anexados à mesma versão; explicar nas Notes produto que não aparece. | ASC: status dos produtos. APARELHO: compra e restauração no sandbox. |
| 2.2 | Beta, demo ou trial na loja. | TestFlight para beta. | CÓDIGO: "beta" na interface. |
| 2.3.1 | Função nova não descrita nas Notes; marketing enganoso ou preço falso. | Descrever cada mudança com especificidade (descrição genérica é rejeitada). Desonestidade grave ou repetida leva à remoção do programa (2.3.1(b)). | ASC: Notes contra a lista de mudanças. |
| 2.3.2 | Descrição e screenshots não indicam o que exige compra. | Deixar claro o que é pago. | ASC. |
| 2.3.3 | Screenshots só com arte, login ou splash. | Mostrar o app em uso. | ASC: todos os tamanhos. |
| 2.3.6 | Classificação etária respondida errado (inclusive conteúdo de IA). | Responder considerando o que a IA pode gerar. | ASC. |
| 2.3.7 | Nome com mais de 30 caracteres ou cheio de palavras-chave. | Nome curto e único. | ASC. |
| 2.3.10 | Citar outras plataformas (Android, Google Play) no app ou nos metadados. | Remover do build iOS e da ficha. | CÓDIGO: buscar "Android", "Google Play" em textos de interface. |
| 2.4.1 | App que roda no iPad e quebra no iPad. | Testar o fluxo inteiro no iPad, retrato e paisagem. Com `supportsTablet: true` (Expo) ou família 1,2, o revisor pode usar só um iPad. Depois de publicado com iPad, não é possível remover o iPad numa atualização (restrição do App Store Connect; não está no texto das guidelines) **(não confirmado na documentação oficial)**. | APARELHO: iPad físico ou simulador. |
| 2.4.2 | Consumo de bateria ou processo em segundo plano sem motivo. | Sem trabalho contínuo em background. | APARELHO: Instruments (Energy). |
| 2.5.1 | API privada ou framework obsoleto. | Só APIs públicas; SDK atual do Xcode. | Resultado do upload. |
| 2.5.2 | Baixar ou executar código que muda funcionalidades. | Atualização remota (OTA) só para correção e dado; nada de função nova que a review não viu. | CÓDIGO: uso de OTA (*Expo:* EAS Update). |
| 2.5.4 | Background mode declarado sem uso. | Declarar só o que usa. | CÓDIGO: `UIBackgroundModes`. |
| 2.5.14 | Gravar tela, áudio ou atividade sem consentimento e indicação. | Consentimento explícito e indicador visível. | CÓDIGO: replay de sessão, gravação. |
| 2.5.19 | Funcionalidade oculta, dormente ou não documentada; tentar esconder no binário leva à remoção do app e encerramento da conta. Em versões antigas das guidelines esse texto ficava na 2.3.1, e algumas mensagens ainda citam 2.3.1. | Tudo que existe no build está descrito nas Notes e acessível. Flag remota não liga função que a review não viu. | CÓDIGO: revisar feature flags remotas. |

## 4. Business (3.x)

| Guideline | Problema | Prevenção | Como validar |
|---|---|---|---|
| 3.1.1 | Desbloquear conteúdo digital fora do IAP (link de pagamento, chave, cripto). | Todo bem digital pelo IAP (regras de link externo variam por região; confira a 3.1.1(a) e a 3.1.3). | CÓDIGO: checkout externo no app. |
| 3.1.1 restaurar | Sem mecanismo de restaurar compras restauráveis. | Botão "Restaurar compras". Deixá-lo visível também fora do paywall (Ajustes) é prática recomendada, não texto literal da guideline. | APARELHO: instalar limpo e restaurar no sandbox. |
| 3.1.1 créditos | Crédito ou moeda comprada que expira; loot box sem odds. | Créditos não expiram; mostrar odds antes. | APARELHO: tela de compra. |
| 3.1.2(a) | Assinatura sem valor contínuo ou com período menor que 7 dias. | Valor recorrente, período mínimo de 7 dias, disponível em todos os aparelhos do usuário. | ASC: duração. |
| 3.1.2(c) | Paywall não diz claramente o que o usuário recebe pelo preço. | Antes do botão: o que inclui, preço cobrado, período, renovação automática e como cancelar; preço cobrado tão visível quanto qualquer "equivalente mensal". | APARELHO: paywall em telas pequenas e no iPad, sem texto cortado. |
| 3.1.2 links legais | Sem link funcional de Termos de Uso (EULA) e Política de Privacidade no app e nos metadados. A 3.1.2(c) remete ao Schedule 2 do contrato do Apple Developer Program, de onde vem essa exigência; as mensagens de rejeição costumam citar 3.1.2 **(não confirmado no texto das guidelines; vem do Schedule 2)**. | Links no paywall; EULA padrão da Apple ou próprio no campo de EULA do ASC; link de Termos na descrição. | APARELHO: tocar nos links. ASC: descrição e EULA. |
| 3.2 | App para uso interno de empresa enviado à loja pública; doação sem ser ONG aprovada; forçar avaliação para liberar função (3.2.2). | Deixar claro nas Notes o público consumidor. | ASC e Notes. |

## 5. Design (4.x)

| Guideline | Problema | Prevenção | Como validar |
|---|---|---|---|
| 4 (introdução) | Interface abaixo do padrão; prompts de permissão em idioma diferente do app (caso real acima). | HIG; textos de permissão por idioma (`permissoes-ios.md`). | APARELHO: cada prompt em cada idioma, também no iPad. |
| 4.1 | Cópia de app, ícone, marca ou nome de terceiros. | Identidade própria. | ASC. |
| 4.2 | Site embrulhado, pouca funcionalidade. | Recursos nativos reais; descrever o valor nas Notes. | APARELHO. |
| 4.3 | Spam: várias cópias do mesmo app, categoria saturada sem diferencial. | Um app por conceito; diferencial claro nas Notes. | ASC: apps da conta. |
| 4.5.4 | Push obrigatório para usar o app, ou promocional sem opt-in. | Push opcional; opt-in e opt-out para promoção. | APARELHO: negar notificações. |
| 4.7 | Mini apps, chatbots ou plugins sem moderação. | Moderação como na 1.2. | APARELHO. |
| 4.8 | Login com terceiro (Google, Facebook, X, LinkedIn, Amazon, WeChat) como conta principal sem oferecer outro login que limite dados a nome e e-mail, permita esconder o e-mail e não colete interações para anúncio sem consentimento. Há exceções (só conta própria da empresa, educação/empresa com conta existente, ID governamental, cliente de serviço específico). | Sign in with Apple junto do login social (`conta-e-apple-login.md`). | APARELHO: login com Apple ponta a ponta, com e-mail oculto. |

## 6. Legal (5.x)

| Guideline | Problema | Prevenção | Como validar |
|---|---|---|---|
| 5.1.1(i) | Política de privacidade ausente no ASC ou no app, ou incompleta. | Link no ASC e dentro do app. A política diz o que coleta, como, para quê; confirma que terceiros (analytics, anúncios, SDKs, **provedores de IA**) dão proteção equivalente; explica retenção, exclusão e como revogar consentimento. | ASC: URL. APARELHO: link no app. |
| 5.1.1(ii) | Coleta sem consentimento; purpose string vaga; função paga que depende de liberar dados. | Consentimento antes de coletar; purpose string que descreve o uso com clareza; forma fácil de retirar o consentimento. | CÓDIGO: `audit.mjs`. APARELHO: cada prompt. |
| 5.1.1(iii)/(iv) | Pedir dado ou permissão desnecessária; não ter alternativa quando o usuário nega. | Mínimo necessário; picker em vez de acesso total a Fotos/Contatos; alternativa manual. | APARELHO: negar tudo e usar o app. |
| 5.1.1(v) | Conta criada no app sem exclusão dentro do app; só desativação; exigir e-mail ou ligação (fora de setor regulado). Login exigido sem necessidade. | Exclusão completa e fácil de achar; Sign in with Apple com revogação do token; app sem funções de conta funciona sem login. | APARELHO: criar, excluir, tentar logar. |
| 5.1.1(ix) | Serviço regulado (banco, saúde, jogo, cripto) publicado por pessoa física em vez da entidade. | Publicar pela entidade; documentos nas Notes. | ASC: tipo de conta. |
| 5.1.2(i) | Usar ou compartilhar dado pessoal sem permissão. Desde novembro de 2025 o texto cita **IA de terceiros**: deixar claro onde o dado será compartilhado e obter permissão explícita **antes**. Rastreamento exige ATT. Não exigir ligar push, localização ou rastreamento para usar o app. | `ia-de-terceiros.md`; ATT antes de rastrear. | APARELHO: nenhuma chamada à IA antes do aceite (proxy ou log do servidor). ASC: App Privacy batendo com o comportamento. |
| 5.1.2(ii)-(iv) | Reaproveitar dado para outro fim; perfil oculto; base de contatos. | Consentimento por finalidade. | CÓDIGO. |
| 5.1.3 | Dado de saúde (HealthKit, registros clínicos) usado para anúncio ou mineração, enviado sem permissão, guardado no iCloud; dado falso escrito no HealthKit; pesquisa sem consentimento informado e comitê de ética. | Saúde só para o propósito declarado; declarar no privacy manifest e no App Privacy. | CÓDIGO: o que sai do aparelho (analytics, IA, logs). |
| 5.1.4 | Dados de crianças; analytics/anúncio de terceiros em app infantil. | Seguir COPPA/LGPD/GDPR. | CÓDIGO: SDKs. |
| 5.2 | Marca, obra ou conteúdo de terceiros sem permissão. | Licença por escrito. | Notes. |
| 5.3 | Apostas e sorteios sem licença ou restrição geográfica. | Licença por território. | ASC. |
| 5.6 | Avaliações manipuladas, pedido de avaliação fora da API oficial, informação falsa. | `SKStoreReviewController`/`StoreKit` para avaliação. | CÓDIGO. |
| Privacy manifest | Falta `PrivacyInfo.xcprivacy` ou razão para required reason API (categorias: File timestamp, System boot time, Disk space, Active keyboards, User defaults); SDK de terceiros sem manifest. Exigido no upload desde 1º de maio de 2024. | Manifest do app com razões aprovadas e tipos de dado coletados (saúde, conteúdo do usuário, `NSPrivacyTracking` se houver ATT); SDKs atualizados. *Expo:* `ios.privacyManifests` no app.json. | CÓDIGO: `audit.mjs`. E-mail de aviso da Apple após o upload. |
| Export compliance (criptografia) | Sem `ITSAppUsesNonExemptEncryption` no `Info.plist`, o App Store Connect faz o questionário de criptografia a cada upload, e o build fica no status "Missing Compliance" ("ação necessária") até ser respondido: não entra em teste nem em review. Não é rejeição de guideline, mas trava o envio. Todo app enviado sai de um servidor nos EUA e está sujeito às regras de exportação americanas, mesmo que a empresa seja de fora. | `ITSAppUsesNonExemptEncryption` = `NO` (false) quando o app **e todas as bibliotecas** não usam criptografia ou só usam a isenta; em geral, a criptografia do sistema (HTTPS com `URLSession`, por exemplo) é isenta e a proprietária não. Criptografia não isenta: `YES`, enviar a documentação no App Store Connect e pôr o código que a Apple devolve em `ITSEncryptionExportComplianceCode`. Com criptografia isenta pode haver ainda o relatório anual de autoclassificação ao governo americano. *Expo:* `ios.config.usesNonExemptEncryption` no app.json/app.config; com `ios/` versionado, a chave tem de estar no `Info.plist` commitado. O `fetch` do React Native/Expo usa o `URLSession` no iOS, então HTTPS comum cai no caso isento **(não confirmado na documentação oficial da Apple)**; biblioteca de criptografia própria (cifra de ponta a ponta, VPN, criptografia de banco local fora do sistema) exige análise. | CÓDIGO: `audit.mjs` (WARN sem a chave). ASC: status do build em TestFlight sem "Missing Compliance". |

## 7. Fontes

- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Review (problemas comuns, recurso): https://developer.apple.com/distribute/app-review/
- Exclusão de conta no app: https://developer.apple.com/support/offering-account-deletion-in-your-app/
- Revogar tokens do Sign in with Apple: https://developer.apple.com/documentation/sign_in_with_apple/revoke_tokens
- Privacy manifest: https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
- Required reason APIs: https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api
- Exportação de criptografia: https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations
- Chave `ITSAppUsesNonExemptEncryption`: https://developer.apple.com/documentation/bundleresources/information-property-list/itsappusesnonexemptencryption
- Status de build no App Store Connect: https://developer.apple.com/help/app-store-connect/reference/app-uploads/app-build-statuses/
- Recurso ao App Review Board: https://developer.apple.com/contact/app-store/?topic=appeal
- Histórico de mudanças das guidelines (não oficial): https://www.appstorereviewguidelineshistory.com/
