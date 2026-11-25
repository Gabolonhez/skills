# IA de terceiros: consentimento que passa na review

Regras: 5.1.1(i) (política de privacidade) e 5.1.2(i). Texto oficial da 5.1.2(i): *"You must clearly disclose where personal data will be shared with third parties, including with third-party AI, and obtain explicit permission before doing so."*

Vale para qualquer envio de dado pessoal a OpenAI, Anthropic, Google (Gemini/Vertex), Mistral, Groq, DeepSeek, OpenRouter etc., **chamando direto do app ou pelo seu servidor**. Dado pessoal inclui texto que o usuário digita, foto, áudio, registros de saúde, nome, e-mail, histórico.

Termos de uso e política de privacidade sozinhos não bastam: o pedido tem de estar no app, antes do primeiro envio.

## Sumário

1. Anatomia da tela de permissão
2. Textos prontos (pt, en, es)
3. Um portão só para todos os pontos de entrada
4. Revogar e guardar o consentimento
5. Bloqueio no servidor por versão do app
6. Política de privacidade, App Privacy e review
7. Erros que já causaram rejeição

## 1. Anatomia da tela de permissão

Uma sheet ou tela cheia, mostrada na primeira vez que o usuário entra numa função de IA:

- **Título é um pedido de permissão**, não um anúncio: "Permitir que o assistente use IA de terceiros?" e não "Conheça nossa IA!".
- **Nomeia cada provedor** ("OpenAI", "Anthropic", "Google").
- **Lista os dados** que saem do aparelho, em linguagem concreta ("o que você escreve no chat e os sintomas que você registrou").
- Diz **para quê** e se o provedor usa o dado para treinar modelos (conforme o contrato com o provedor).
- **"Permitir" e "Agora não" com o mesmo destaque**: mesmo tamanho, mesmo peso; nada de recusa em link cinza.
- Link para a política de privacidade.
- Diz onde revogar depois ("Ajustes > Privacidade > IA").
- Recusar mantém o app usável; só a função de IA fica indisponível, com explicação e caminho para permitir depois.

## 2. Textos prontos

Troque `<Provedor>` e a lista de dados pelo que o app envia de verdade.

**Português**

> **Permitir o uso de IA de terceiros?**
> Para responder, o assistente envia para a **<Provedor>** o que você escreve no chat e os registros que você escolher compartilhar (por exemplo, sintomas e humor). Seu nome e seu e-mail não são enviados. A <Provedor> processa esses dados só para gerar a resposta e não os usa para treinar modelos.
> Você pode mudar isso quando quiser em Ajustes > Privacidade > IA. Veja a Política de Privacidade.
> [ Permitir ]  [ Agora não ]

**English**

> **Allow third-party AI?**
> To answer you, the assistant sends to **<Provider>** what you type in the chat and the entries you choose to share (for example, symptoms and mood). Your name and email are not sent. <Provider> processes this data only to generate the answer and does not use it to train models.
> You can change this anytime in Settings > Privacy > AI. See the Privacy Policy.
> [ Allow ]  [ Not now ]

**Español**

> **¿Permitir el uso de IA de terceros?**
> Para responderte, el asistente envía a **<Proveedor>** lo que escribes en el chat y los registros que elijas compartir (por ejemplo, síntomas y estado de ánimo). Tu nombre y tu correo no se envían. <Proveedor> procesa estos datos solo para generar la respuesta y no los usa para entrenar modelos.
> Puedes cambiarlo cuando quieras en Ajustes > Privacidad > IA. Consulta la Política de Privacidad.
> [ Permitir ]  [ Ahora no ]

Tela de recusa (função de IA aberta sem consentimento): "A IA está desligada. Para usar o assistente, permita o envio dos dados para a <Provedor>." + botão "Revisar permissão".

## 3. Um portão só para todos os pontos de entrada

O erro mais comum é proteger o chat e esquecer o resto. Liste **todo** lugar onde dado do usuário chega a um modelo:

- chat/assistente;
- resumos (diário, semanal), insights, "dica do dia";
- análise de foto (refeição, pele, documento), OCR;
- transcrição de voz;
- tarefas em segundo plano, notificações geradas por IA, jobs do servidor que rodam sozinhos;
- importação que passa texto por um modelo.

Todas chamam a mesma função antes de enviar:

```ts
// Pseudo-código: único portão de IA do app.
async function ensureAiConsent(feature: string): Promise<boolean> {
  const status = await consentStore.get("ai");          // "granted" | "denied" | "unknown"
  if (status === "granted") return true;
  if (!isForeground()) return false;                     // sem tela: não envia, não pergunta
  const answer = await showAiConsentSheet({ feature });  // a sheet da seção 1
  await consentStore.set("ai", answer);                  // grava local e no servidor
  return answer === "granted";
}

// Em cada ponto de entrada:
if (!(await ensureAiConsent("weekly-summary"))) return showAiDisabledState();
```

Busca para auditar (ajuste aos nomes do projeto): chamadas ao endpoint de IA do seu servidor, imports de SDK de IA, rotas do servidor que chamam o provedor. Cada uma precisa de um `ensureAiConsent` (no app) ou de uma checagem de consentimento (no servidor) no caminho.

## 4. Revogar e guardar o consentimento

- Item em Ajustes (ex.: "Privacidade > IA") com o estado atual e um interruptor. Desligar para de enviar na hora.
- Grave no servidor: usuário, estado, data, versão do texto mostrado. Se o texto mudar de forma relevante (novo provedor, novos dados), peça de novo.
- Exclusão de conta apaga também esse registro.

## 5. Bloqueio no servidor por versão do app

Checar o consentimento também no servidor é uma boa defesa: o servidor recusa (`403`) a chamada de IA de quem não consentiu. Mas **ligar isso para todo mundo de uma vez quebra versões já publicadas** que não sabem tratar o 403: o usuário dessas versões vê erro genérico ou tela travada.

Padrão seguro:

1. O app manda a própria versão em todo request (ex.: header `X-App-Version: 1.4.0`).
2. O servidor só exige consentimento a partir da versão que tem o portão.
3. Versões antigas continuam funcionando até você subir a versão mínima obrigatória (tela de "atualize o app").

```ts
// Pseudo-código do middleware das rotas de IA.
const AI_CONSENT_REQUIRED_FROM = "1.4.0";   // primeira versão com a sheet de consentimento

function aiConsentGuard(req, res, next) {
  const version = req.header("X-App-Version");
  const enforce = version && semverGte(version, AI_CONSENT_REQUIRED_FROM);
  if (!enforce) return next();                       // versão antiga: comportamento anterior
  if (consents.has(req.user.id, "ai")) return next();
  return res.status(403).json({ code: "AI_CONSENT_REQUIRED" });  // o app novo abre a sheet
}
```

Quando a versão nova virar a mínima (forçando atualização), ative o bloqueio para todos. Nesse meio tempo, jobs do servidor que usam IA sozinhos (resumos agendados) devem checar o consentimento sempre, independente da versão, porque nenhum app está na frente deles.

## 6. Política de privacidade, App Privacy e review

- **Política**: seção "Inteligência artificial de terceiros" com o nome de cada provedor, os dados enviados, a finalidade, retenção pelo provedor, se há treino, e como revogar.
- **App Privacy (App Store Connect)** e **privacy manifest**: declare os tipos de dado enviados (ex.: "Other User Content", "Health & Fitness") com a finalidade "App Functionality".
- **Classificação etária**: considere o que a IA pode gerar.
- **Conta demo**: sem consentimento dado. Se o revisor já entra com IA liberada, ele não vê o pedido e a Apple tende a concluir que não existe.
- **Notes e vídeo**: mostrar o pedido, a recusa funcionando e o caminho de revogação (modelo em `notas-revisor.md`).

## 7. Erros que já causaram rejeição

- Consentimento só nos termos de uso, aceito no cadastro junto com o resto.
- Sheet com título promocional e recusa escondida.
- Provedor não nomeado ("parceiros de IA").
- Chat protegido, mas resumo semanal ou análise em segundo plano mandando dado sem pedir.
- Conta demo com consentimento já dado.
- Servidor passando a exigir consentimento para todos e derrubando a IA das versões antigas publicadas.
