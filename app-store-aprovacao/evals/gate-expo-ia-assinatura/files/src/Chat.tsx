import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_KEY });
export async function ask(text: string) {
  return client.chat.completions.create({ model: "gpt-4o-mini", messages: [{ role: "user", content: text }] });
}
