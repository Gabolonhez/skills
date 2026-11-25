# Conta, exclusão e Sign in with Apple

Regras: 5.1.1(v) (exclusão de conta), 4.8 (login de terceiros) e a exigência de revogar tokens do Sign in with Apple na exclusão.

## 1. Exclusão de conta (5.1.1(v))

Texto oficial: *"If your app supports account creation, you must also offer account deletion within the app."*

O que a Apple espera (ver https://developer.apple.com/support/offering-account-deletion-in-your-app/):

- **Dentro do app** e fácil de achar (ex.: Ajustes > Conta > Excluir conta). Link para uma página web só vale se abrir direto na exclusão.
- **Excluir de verdade**: a conta e os dados pessoais associados. Desativar ou "suspender" não conta.
- Confirmação é permitida (uma etapa extra para evitar acidente); obstáculos não (ligar, mandar e-mail, falar com suporte), salvo setor regulado.
- Se a exclusão não é imediata, diga o prazo.
- **Assinatura**: avise que a cobrança é da Apple e que o usuário precisa cancelar em Ajustes do iPhone > Apple ID > Assinaturas (ofereça o link/atalho). Excluir a conta não cancela a assinatura na App Store.
- Vale também para conta criada por convidado/anônima que guarda dados.

Teste no aparelho: criar conta, excluir, tentar logar de novo (precisa falhar), conferir no backend que os dados sumiram.

## 2. Login de terceiros exige opção equivalente (4.8)

Se o app usa Google, Facebook, X, LinkedIn, Amazon ou WeChat para criar ou autenticar a **conta principal**, ofereça também um login que:

- limite os dados a nome e e-mail;
- permita ao usuário esconder o e-mail;
- não colete interações para anúncio sem consentimento.

Na prática, Sign in with Apple. Exceções da guideline: app que usa só a conta própria da empresa; educação, empresa ou negócio com conta existente; ID governamental ou setorial; cliente de serviço de terceiro específico (ex.: app de cliente de um provedor de e-mail). Botão da Apple com o mesmo destaque dos outros, seguindo o HIG.

## 3. Revogar o token do Sign in with Apple na exclusão

Ao excluir uma conta criada com Sign in with Apple, o servidor revoga o token pela REST API da Apple (https://developer.apple.com/documentation/sign_in_with_apple/revoke_tokens). Isso desfaz o vínculo do app nas configurações do Apple ID do usuário.

### Fluxo

1. No login com Apple, o app recebe `identityToken` e `authorizationCode`. O `authorizationCode` vale **5 minutos e uma vez só**.
2. O app manda o `authorizationCode` ao servidor logo no login. O servidor troca por um **refresh token** e guarda (cifrado) junto do usuário.
3. Na exclusão, o servidor revoga o refresh token. Se não tiver refresh token guardado (usuário antigo), o app pode pedir um novo login com Apple na tela de exclusão para obter um `authorizationCode` fresco e mandar junto do pedido de exclusão.

### Pseudo-código do servidor

```ts
// client_secret: JWT ES256 assinado com a chave .p8 do Sign in with Apple.
// header { alg: "ES256", kid: KEY_ID }
// payload { iss: TEAM_ID, iat: now, exp: now + 3600 (máx. 6 meses), aud: "https://appleid.apple.com", sub: CLIENT_ID }
// CLIENT_ID = bundle ID do app (ou o Services ID, no login web).

async function exchangeCode(authorizationCode: string): Promise<string | null> {
  const res = await post("https://appleid.apple.com/auth/token", form({
    client_id: CLIENT_ID,
    client_secret: makeClientSecret(),
    code: authorizationCode,
    grant_type: "authorization_code",
  }));
  return res.ok ? res.json().refresh_token : null;
}

async function revokeApple(refreshToken: string): Promise<void> {
  await post("https://appleid.apple.com/auth/revoke", form({
    client_id: CLIENT_ID,
    client_secret: makeClientSecret(),
    token: refreshToken,
    token_type_hint: "refresh_token",
  }));
}

async function deleteAccount(userId: string, authorizationCode?: string) {
  const user = await db.users.get(userId);
  if (user.appleSub) {
    try {
      const token = user.appleRefreshToken ?? (authorizationCode ? await exchangeCode(authorizationCode) : null);
      if (token) await revokeApple(token);
      else log.warn("apple revoke skipped: no refresh token or code", { userId });
    } catch (err) {
      log.error("apple revoke failed", { userId, err });   // registra e segue
    }
  }
  await db.deleteUserData(userId);                          // a exclusão acontece de qualquer jeito
  await auth.deleteUser(userId);
}
```

### Regra que não pode quebrar

Revogação que falha, código ausente ou expirado **nunca impedem a exclusão**. Isso acontece de verdade: login feito no Android, versão antiga do app que não mandava o código, código usado duas vezes, chave da Apple girada. Registre o erro, exclua a conta e investigue depois. Uma exclusão bloqueada é violação da 5.1.1(v) e é o que o revisor testa.

### Expo

`expo-apple-authentication` devolve `authorizationCode` em `AppleAuthentication.signInAsync()`. Mande-o ao servidor no login (e, se precisar, peça um novo `signInAsync` na tela de exclusão). Requer `"usesAppleSignIn": true` em `ios` no app.json.
