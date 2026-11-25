# Textos de permissão no iOS (purpose strings)

Regras: 5.1.1(ii) ("Ensure your purpose strings clearly and completely describe your use of the data") e Guideline 4 (Design), usada pela Apple para rejeitar prompts de permissão em idioma diferente do app.

## 1. Como o iOS escolhe o idioma do prompt

- Cada permissão tem uma chave `NS…UsageDescription` no `Info.plist`. Esse é o **valor base**.
- Traduções ficam em `<idioma>.lproj/InfoPlist.strings` (ou num String Catalog `InfoPlist.xcstrings`).
- O iOS cruza os idiomas preferidos do aparelho com os idiomas que o app tem. Se acha uma tradução, usa. Se não acha, usa o idioma de **desenvolvimento** (`CFBundleDevelopmentRegion`), e o texto exibido é o valor base do `Info.plist`.

Consequência: o valor base precisa estar **no idioma do `CFBundleDevelopmentRegion`**. Um app com `CFBundleDevelopmentRegion = en` e valor base em português mostra português para um usuário com aparelho em alemão, mesmo que o app tenha tradução em inglês. Foi exatamente esse o caso de uma rejeição real por Guideline 4.

## 2. Regras

1. Valor base de todo `NS…UsageDescription` no idioma do `CFBundleDevelopmentRegion`.
2. Todo idioma que o app suporta (pastas `.lproj`, `CFBundleLocalizations`, `locales` do Expo) tem **todas** as chaves traduzidas.
3. App só em português: `CFBundleDevelopmentRegion` = `pt-BR` (ou `pt`) e valores base em português. Não deixe `en` "porque é o padrão".
4. Cada texto diz **para que** o dado é usado, com um exemplo concreto. Ruim: "Precisamos da câmera." Bom: "Usamos a câmera para você fotografar a refeição e registrar no diário."
5. Não declare permissão que o app não usa. Se uma biblioteca adiciona uma chave que o app nunca dispara, escreva um texto verdadeiro ("O app não acessa suas fotos; nenhuma foto é lida ou salva.") ou remova a chave pelo plugin/config da biblioteca.
6. Negar a permissão não pode travar o app (5.1.1(iv)); ofereça alternativa (digitar em vez de usar a câmera, escolher foto pelo picker).
7. ATT (`NSUserTrackingUsageDescription`) só se houver rastreamento entre apps, e o SDK só rastreia depois do "Permitir".

## 3. Projeto nativo (Xcode)

- Project > Info > Localizations: adicione cada idioma.
- Crie `InfoPlist.strings` (File > New > Strings File), localize para cada idioma e preencha:

```
/* pt-BR.lproj/InfoPlist.strings */
"NSCameraUsageDescription" = "Usamos a câmera para você fotografar a refeição e registrar no diário.";
"NSMicrophoneUsageDescription" = "Usamos o microfone para você descrever a refeição por voz.";
```

- Ou use `InfoPlist.xcstrings` (Xcode 15+), que mostra o que falta por idioma.
- Projetos com `GENERATE_INFOPLIST_FILE = YES` guardam o valor base em `INFOPLIST_KEY_NS…UsageDescription` nas build settings; a regra é a mesma.

## 4. Expo e React Native

### 4.1 Sem `ios/` no git (prebuild a cada build)

Valores base em `ios.infoPlist` (ou nas opções dos plugins: `cameraPermission`, `photosPermission`...) e traduções em `locales`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "CFBundleDevelopmentRegion": "en",
        "NSCameraUsageDescription": "We use the camera so you can photograph your meal and log it in your diary."
      }
    },
    "locales": {
      "pt-BR": "./locales/pt-BR.json",
      "es": "./locales/es.json"
    }
  }
}
```

```json
// locales/pt-BR.json
{ "ios": { "NSCameraUsageDescription": "Usamos a câmera para você fotografar a refeição e registrar no diário." } }
```

Para não depender de memória, adicione um plugin que **falha o prebuild** quando falta tradução (abaixo).

### 4.2 Com `ios/` no git (*Expo*)

Se a pasta `ios/` está versionada, o EAS Build compila o que está nela e **não roda os config plugins**. Mudar `app.json` ou o plugin não muda o app enviado. Corrija direto em `ios/<App>/Info.plist` e em `ios/<App>/<idioma>.lproj/InfoPlist.strings`, ou rode `npx expo prebuild` de novo e commite o resultado. O `audit.mjs` avisa quando `app.json` e o `Info.plist` commitado divergem.

### 4.3 Plugin de guarda (*Expo*)

Roda depois de todos os outros plugins, lê o `Info.plist` final e interrompe o prebuild se algum `NS…UsageDescription` não tiver tradução em todos os `locales`, ou se o valor base não for o texto do idioma de desenvolvimento.

```js
// plugins/withPermissionLanguageGuard.js
// Uso: em app.json, "plugins": ["./plugins/withPermissionLanguageGuard"]
const { withFinalizedMod } = require("@expo/config-plugins");
const plist = require("@expo/plist").default;
const fs = require("node:fs");
const path = require("node:path");

const USAGE_KEY = /^NS\w+UsageDescription$/;
const lang = (code) => String(code).toLowerCase().split(/[-_]/)[0];

module.exports = function withPermissionLanguageGuard(config) {
  return withFinalizedMod(config, [
    "ios",
    async (cfg) => {
      const { platformProjectRoot, projectName, projectRoot } = cfg.modRequest;
      const info = plist.parse(fs.readFileSync(path.join(platformProjectRoot, projectName, "Info.plist"), "utf8"));
      const dev = String(info.CFBundleDevelopmentRegion ?? "en").replace("$(DEVELOPMENT_LANGUAGE)", "en");
      const keys = Object.keys(info).filter((k) => USAGE_KEY.test(k));
      const load = (ref) => {
        const data = typeof ref === "string" ? JSON.parse(fs.readFileSync(path.resolve(projectRoot, ref), "utf8")) : ref;
        return data.ios ?? data;
      };
      const problems = [];
      for (const [locale, ref] of Object.entries(cfg.locales ?? {})) {
        const strings = load(ref);
        for (const key of keys) if (!strings[key]) problems.push(`${locale}: falta ${key}`);
        if (lang(locale) === lang(dev))
          for (const key of keys)
            if (strings[key] && info[key] !== strings[key]) problems.push(`${key}: valor base do Info.plist difere do texto em ${locale}`);
      }
      if (problems.length) {
        throw new Error(`[withPermissionLanguageGuard] Textos de permissão sem tradução (App Store Guideline 4 / 5.1.1(ii)):\n - ${problems.join("\n - ")}`);
      }
      return cfg;
    },
  ]);
};
```

Notas:

- Inclua um arquivo em `locales` também para o idioma de desenvolvimento (ex.: `"en": "./locales/en.json"`); é ele que a segunda checagem compara com o valor base.
- Chaves adicionadas por bibliotecas (câmera, fotos, HealthKit, localização, Face ID) aparecem no `Info.plist` final, então a guarda pega também as que você não escreveu.
- `@expo/plist` e `@expo/config-plugins` já vêm com o Expo.
- Com `ios/` versionado este plugin não roda no EAS (seção 4.2): rode `npx expo prebuild --platform ios` localmente para disparar a checagem.

## 5. Como testar no aparelho

1. Ajustes > Geral > Idioma e Região: coloque o aparelho em cada idioma suportado e em um **não** suportado (ex.: alemão). Ou, com o app tendo mais de um idioma, Ajustes > <App> > Idioma.
2. Apague e reinstale o app entre trocas, para os prompts voltarem a aparecer.
3. Dispare cada permissão e tire print: o texto está no idioma do aparelho (ou no idioma de desenvolvimento, para o não suportado)?
4. Repita no iPad se o app roda nativo nele.

## 6. Chaves mais comuns

| Chave | Quando |
|---|---|
| `NSCameraUsageDescription` | câmera |
| `NSPhotoLibraryUsageDescription` / `NSPhotoLibraryAddUsageDescription` | ler / salvar fotos (prefira o picker do sistema, que não precisa de permissão para ler) |
| `NSMicrophoneUsageDescription` / `NSSpeechRecognitionUsageDescription` | áudio / transcrição |
| `NSLocationWhenInUseUsageDescription` / `NSLocationAlwaysAndWhenInUseUsageDescription` | localização |
| `NSHealthShareUsageDescription` / `NSHealthUpdateUsageDescription` | ler / escrever no app Saúde |
| `NSFaceIDUsageDescription` | Face ID |
| `NSContactsUsageDescription`, `NSCalendarsUsageDescription` | contatos, calendário |
| `NSUserTrackingUsageDescription` | ATT |
| `NSBluetoothAlwaysUsageDescription`, `NSMotionUsageDescription` | Bluetooth, movimento |
