# Google Play: o básico para não ser rejeitado

A review do Google é mais automatizada que a da Apple e as rejeições chegam por e-mail e no Play Console (Visão geral da publicação / Policy status). Rejeições repetidas escalam para suspensão do app e depois da conta, então nunca reenvie sem corrigir a causa citada.

Fonte principal: https://play.google.com/about/developer-content-policy/ e a Central de Ajuda do Play Console. Itens sem confirmação na fonte oficial nesta revisão estão marcados **(não confirmado)**.

## Checklist

| Tema | O que precisa ser verdade | Como validar |
|---|---|---|
| Data safety | O formulário descreve o que o app **e os SDKs** coletam e compartilham (analytics, crash, anúncios, IA). É a causa mais comum de rejeição. | Liste SDKs no `build.gradle`/`package.json` e compare com o formulário no Play Console > Conteúdo do app. |
| Política de privacidade | URL pública e funcionando no Play Console e acessível dentro do app. | Abrir os dois. |
| Exclusão de conta | App que permite criar conta permite excluí-la **no app** e também por um **link web** (informado no Data safety) que funciona sem reinstalar o app. | Testar os dois caminhos. |
| Divulgação em destaque | Coleta ou envio de dado pessoal que o usuário não esperaria (incluindo enviar conteúdo para IA de terceiros) exige aviso no app e consentimento antes, fora dos termos de uso. O mesmo portão de consentimento do iOS serve (`ia-de-terceiros.md`). | APARELHO: aviso antes do primeiro envio. |
| Conteúdo gerado por IA | App de IA generativa deixa o usuário denunciar conteúdo ofensivo dentro do app e evita gerar conteúdo proibido. | APARELHO: fluxo de denúncia. |
| Permissões | Só o necessário. Fotos e vídeos: `READ_MEDIA_IMAGES`/`READ_MEDIA_VIDEO` só para app cujo uso principal exige; os demais usam o seletor de fotos do Android. Localização em segundo plano, SMS, registro de chamadas, "todos os arquivos", alarme exato e foreground service pedem declaração no Play Console. | `AndroidManifest.xml` final (no Expo, `android.permissions` e `android.blockedPermissions` no app.json para remover o que bibliotecas adicionam). |
| Nível de API alvo | `targetSdkVersion` dentro do exigido pelo Google (atualizado todo ano, cerca de um ano após cada versão do Android). | O Play Console bloqueia o upload e mostra o nível exigido. |
| Teste fechado | Conta pessoal criada depois de novembro de 2023: teste fechado com pelo menos 12 testadores inscritos por 14 dias seguidos antes de liberar produção. Conta de organização não tem essa exigência. | Planejar os 14 dias no cronograma. |
| Pagamentos | Bem digital pelo Google Play Billing. Regras de link externo e billing alternativo variam por país e mudaram em 2025 **(não confirmado para o seu caso: leia a política de pagamentos vigente)**. | Código: nenhum checkout externo para conteúdo digital no build da Play. |
| Assinaturas | Termos claros (preço, período, renovação, trial), cancelamento fácil, sem trial enganoso. | APARELHO: paywall. |
| Saúde | Declaração de apps de saúde no Play Console; alegações médicas comprovadas; Health Connect só para os usos declarados. Exigências adicionais para algumas categorias de saúde (ex.: conta de organização) **(não confirmado)**. | Play Console > Conteúdo do app. |
| Classificação de conteúdo | Questionário IARC respondido com honestidade, incluindo o que a IA pode gerar. | Play Console. |
| Ficha da loja | Descrição fiel ao app, sem keyword stuffing, sem promessas que o app não cumpre; screenshots do app real. | Ler a ficha. |
| Estabilidade | App não trava; Android vitals sem picos de crash/ANR. | Teste interno no aparelho; Play Console > Android vitals. |

## Diferenças em relação à Apple que pegam quem vem do iOS

- Não há "Notes for Review" tão detalhadas; para app com login, informe a conta de teste em Play Console > Conteúdo do app > Acesso ao app.
- O Data safety é revisado contra o que o app faz de verdade, inclusive o tráfego dos SDKs.
- Exclusão de conta precisa **também** do link web.
- A primeira publicação em conta pessoal nova depende dos 14 dias de teste fechado.

## Fontes

- Políticas do programa para desenvolvedores: https://play.google.com/about/developer-content-policy/
- Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Exclusão de conta: https://support.google.com/googleplay/android-developer/answer/13327111
- Nível de API alvo: https://developer.android.com/google/play/requirements/target-sdk
- Teste para contas pessoais novas: https://support.google.com/googleplay/android-developer/answer/14151465
- Permissões de fotos e vídeos: https://support.google.com/googleplay/android-developer/answer/14115180
