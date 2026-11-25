import OpenAI from "openai";

export function useAiConsent() {
	return { granted: false, ask: async () => false };
}

export const client = (key: string) => new OpenAI({ apiKey: key });
