import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

const API = "http://api.exemplo.com.br/v1";

export function calculateDose(weightKg: number) {
	return weightKg * 0.25;
}

export const strings = {
	about: "Lorem ipsum dolor sit amet",
	reports: "Em breve",
};

export async function signUp(email: string, password: string) {
	await GoogleSignin.signIn();
	return auth().createUserWithEmailAndPassword(email, password);
}
export { API };
