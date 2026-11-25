# Pacote do revisor

O revisor da Apple tem poucos minutos por app. Tudo que ele não consegue ver ou entender sozinho vira rejeição 2.1 ("Information Needed" ou "App Completeness"). As Notes vão em **inglês**, a língua em que o revisor lê.

Onde fica: App Store Connect > o app > a versão > **App Review Information** (Sign-in required, Notes, Attachment).

## Checklist antes de colar

- [ ] Conta demo criada **no ambiente de produção**, testada no dia do envio, sem 2FA.
- [ ] Conta demo com assinatura premium ativa e onboarding concluído, para o revisor chegar direto ao conteúdo pago.
- [ ] Conta demo **sem** consentimento de IA dado (o revisor precisa ver o pedido). Resete o consentimento antes de cada envio.
- [ ] Vídeo gravado em iPhone físico, na versão atual do iOS, começando na abertura do app.
- [ ] Toda função nova desta versão descrita com especificidade (descrição genérica é rejeitada pela 2.3.1).
- [ ] IAP/assinaturas anexados à mesma versão.
- [ ] Telefone de contato com código do país (ex.: +55).

## Roteiro do vídeo

Grave com a gravação de tela do iOS (Central de Controle). Sem cortes nem edição; pode acelerar trechos de espera. Suba em link sem login (Drive, Vimeo, YouTube não listado) ou anexe.

1. Tela de início do iPhone, tocar no ícone do app (mostra que é o app real).
2. Cadastro de uma conta nova.
3. Logout e login.
4. Se há IA: abrir a função de IA, mostrar o pedido de permissão (provedor e dados), tocar em "Agora não" e mostrar que o app segue; depois permitir e usar.
5. Paywall: preço, período, links de Termos e Privacidade; comprar no sandbox ou mostrar a conta premium.
6. Conteúdo pago funcionando.
7. Ajustes: "Restaurar compras" e o caminho até "Excluir conta".
8. Excluir a conta, confirmar e tentar logar de novo (falha).

## Modelo das Notes (inglês)

Preencha todo `<...>`. Apague a linha que não se aplica.

```
1) SCREEN RECORDING
A screen recording on a physical device (<iPhone model>, iOS <version>), starting at app launch, is available at: <URL>. It shows sign-up, login, in-app account deletion (Settings > Account > Delete account), the paid content (<subscription name>) and <the AI consent prompt before any data is sent to the AI provider>.

2) PURPOSE AND AUDIENCE
<App name> is <one-sentence purpose>. Target users: <audience, age range>. It is a consumer app, not for internal business distribution.
Core features: <feature 1>, <feature 2>, <feature 3>.
New in this version: <specific change 1 and where to find it>, <specific change 2>.

3) HOW TO ACCESS
Demo account (premium active, onboarding completed, production backend live during review):
  Email: <demo email>
  Password: <demo password>
No 2FA. <Path to any non-obvious feature: Tab > Screen > Action.>
The demo account has NOT yet granted AI consent, so the permission prompt appears the first time you open <feature>.

4) EXTERNAL SERVICES
- Backend/data: <provider>, stores <data types>.
- Authentication: email/password, Sign in with Apple<, Google Sign-In>. Deleting the account revokes the Sign in with Apple token.
- Payments: Apple In-App Purchase only. Products: <product names/IDs>, all submitted with this version. Restore Purchases: paywall and Settings > Subscription.
- AI: <provider(s)>. Data sent: <exact data types, e.g. the text the user types in the assistant and their logged symptoms>. Before any data is sent, the app shows a permission request naming the provider(s) and the data, with "Allow" and "Not now" equally prominent. Declining keeps the app usable without AI. Consent can be revoked in Settings > Privacy > AI. Disclosed in the Privacy Policy: <URL>.
- Analytics/crash reporting: <provider>, <data>. <Tracking: App Tracking Transparency prompt shown before any tracking.>

5) REGIONAL DIFFERENCES
None; the app behaves the same in all regions. Languages: <list>. Permission prompts are localized in every supported language.

6) REGULATED INDUSTRY / HEALTH
<Not a regulated service.>
<Health: the app does not diagnose, and it does not calculate, suggest or adjust medication doses. Users can only log the dose prescribed by their doctor. The app shows a reminder to consult a doctor before medical decisions.>

7) DEVICES
Tested on iPhone <model> and iPad <model> (iOS <version>), portrait and landscape.

Contact: <name>, <phone with country code>, <email>.
```

## Resposta no Resolution Center (modelo)

```
Hello App Review team,

Thank you for the feedback on guideline <number>. In build <version (build)> we:
- <change 1, where to see it: Screen > Action>
- <change 2>
We also checked <similar places> for the same issue.
Updated screen recording: <URL>. The demo account in the review notes was reset so <the prompt / the flow> is visible.

Best regards,
<name>
```

Tom curto, factual e educado. Uma frase por mudança. Não discuta a regra na mesma mensagem em que corrige; se discordar, explique com dados numa resposta separada.
