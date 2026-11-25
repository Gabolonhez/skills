import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import Purchases from "react-native-purchases";
import { useAiConsent } from "./useAiConsent";

export const TERMS_URL = "https://exemplo.app/terms";
export const PRIVACY_URL = "https://exemplo.app/privacy";

export async function askTracking() {
	await requestTrackingPermissionsAsync();
}

export async function restorePurchases() {
	return Purchases.restorePurchases();
}

export async function deleteAccount(api: { del: (p: string) => Promise<void> }) {
	// O servidor apaga os dados e faz o revoke do token da Apple.
	await api.del("/me");
}

export function useAssistant() {
	const { granted, ask } = useAiConsent();
	return { granted, ask };
}
