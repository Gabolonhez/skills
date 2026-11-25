#!/usr/bin/env node
/**
 * audit.mjs: auditoria estática de um projeto iOS (nativo, React Native ou Expo) antes do envio à App Store.
 *
 * Somente leitura: nunca grava, move ou apaga arquivos do projeto.
 * Sem dependências. Node 18+. Windows, macOS e Linux.
 *
 * Uso:   node audit.mjs <pasta-do-projeto>
 * Saída: relatório [ OK ] / [WARN] / [FAIL] por guideline. Código de saída 1 se houver algum FAIL.
 *
 * É uma varredura por texto: aponta riscos prováveis, não prova conformidade. FAIL = corrigir ou
 * justificar antes de enviar; WARN = conferir à mão ou no aparelho.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SKIP_DIRS = new Set([
	"node_modules", "Pods", "build", "dist", "DerivedData", "coverage", "web-build", "vendor",
	"__tests__", "__mocks__", "__snapshots__", "test", "tests", "e2e", "fixtures", "docs",
]);
const MAX_FILE_BYTES = 1_500_000;
const CODE_EXT = /\.(jsx?|tsx?|mjs|cjs|swift|mm?|kt|java|dart|json|strings|xcstrings)$/i;
const NOT_CODE = /(^|\/)(package-lock\.json|package\.json|tsconfig[^/]*\.json|eas\.json|google-services\.json|Contents\.json|[^/]*\.(test|spec|stories)\.[^/]+)$/i;

// ---------- leitura ----------

function walk(root) {
	const out = [];
	const stack = [""];
	while (stack.length) {
		const rel = stack.pop();
		let entries;
		try {
			entries = fs.readdirSync(path.join(root, rel), { withFileTypes: true });
		} catch {
			continue;
		}
		for (const e of entries) {
			const r = rel ? `${rel}/${e.name}` : e.name;
			if (e.isDirectory()) {
				if (!e.name.startsWith(".") && !SKIP_DIRS.has(e.name)) stack.push(r);
			} else if (e.isFile()) out.push(r);
		}
	}
	return out.sort();
}

function readText(abs) {
	let buf;
	try {
		if (fs.statSync(abs).size > MAX_FILE_BYTES) return "";
		buf = fs.readFileSync(abs);
	} catch {
		return "";
	}
	// .strings do Xcode às vezes vêm em UTF-16.
	if (buf[0] === 0xff && buf[1] === 0xfe) return buf.toString("utf16le").slice(1);
	if (buf[0] === 0xfe && buf[1] === 0xff) {
		const sw = Buffer.from(buf);
		sw.swap16();
		return sw.toString("utf16le").slice(1);
	}
	return buf.toString("utf8").replace(/^﻿/, "");
}

function readJson(abs) {
	try {
		return JSON.parse(readText(abs));
	} catch {
		return null;
	}
}

const decodeXml = (s) =>
	s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

// Parser mínimo de plist XML (dict, array, string, number, bool, date, data).
export function parsePlist(xml) {
	const tokens = xml.replace(/<!--[\s\S]*?-->/g, "").match(/<[^>]+>|[^<]+/g) ?? [];
	let i = tokens.findIndex((t) => /^<(dict|array)\b/.test(t));
	if (i < 0) return null;
	const next = () => {
		while (i < tokens.length && !tokens[i].startsWith("<")) i++;
		return tokens[i++];
	};
	const textUntil = (close) => {
		let s = "";
		while (i < tokens.length && tokens[i] !== close) s += tokens[i++];
		i++;
		return decodeXml(s);
	};
	const value = (tag) => {
		if (tag === "<dict/>") return {};
		if (tag === "<array/>") return [];
		if (tag === "<string/>") return "";
		if (tag === "<true/>") return true;
		if (tag === "<false/>") return false;
		if (tag === "<dict>") {
			const obj = {};
			for (let t = next(); t && t !== "</dict>"; t = next()) {
				if (t === "<key>") {
					const k = textUntil("</key>");
					obj[k] = value(next());
				} else if (t === "<key/>") obj[""] = value(next());
			}
			return obj;
		}
		if (tag === "<array>") {
			const arr = [];
			for (let t = next(); t && t !== "</array>"; t = next()) arr.push(value(t));
			return arr;
		}
		const m = /^<(string|integer|real|date|data)>$/.exec(tag ?? "");
		if (!m) return null;
		const s = textUntil(`</${m[1]}>`);
		return m[1] === "integer" || m[1] === "real" ? Number(s) : s;
	};
	return value(next());
}

// Arquivo .strings: "chave" = "valor"; (aceita chave sem aspas e comentários).
export function parseStrings(text) {
	const clean = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
	const out = {};
	const re = /(?:"((?:[^"\\]|\\.)*)"|([A-Za-z_][\w.]*))\s*=\s*"((?:[^"\\]|\\.)*)"\s*;/g;
	for (let m = re.exec(clean); m; m = re.exec(clean)) {
		out[m[1] ?? m[2]] = m[3].replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\");
	}
	return out;
}

// ---------- idioma ----------

const LANG_HINTS = {
	en: "the to your you we and for of this with our is are can will be allow access use used when need needs so only",
	pt: "você voce seu sua seus suas do da dos das em na nas nos ao e precisamos acessar permita apenas quando nós sem",
	es: "tu tus el la los las del usted en al y necesitamos acceder solo cuando nosotros sin",
};
const LANG_SETS = Object.fromEntries(Object.entries(LANG_HINTS).map(([k, v]) => [k, new Set(v.split(" "))]));

// Retorna "en" | "pt" | "es" ou null quando não dá para afirmar (textos curtos ou outros idiomas).
export function detectLang(text) {
	const t = String(text).replace(/\$\([A-Z_]+\)/g, " ").toLowerCase();
	const words = t.match(/[a-zà-ÿ]+/g) ?? [];
	const score = { en: 0, pt: 0, es: 0 };
	for (const w of words) for (const l of Object.keys(score)) if (LANG_SETS[l].has(w)) score[l]++;
	if (/[ãõç]|ção|ções/.test(t)) score.pt += 2;
	if (/[ñ¿¡]|ción|ciones/.test(t)) score.es += 2;
	const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);
	const [[best, s1], [, s2]] = ranked;
	return s1 >= 2 && s1 >= 2 * s2 ? best : null;
}

export function normLang(code) {
	if (!code) return null;
	const c = String(code).trim().toLowerCase().replace(/_/g, "-");
	const named = { english: "en", portuguese: "pt", spanish: "es", french: "fr", german: "de", italian: "it" };
	if (named[c]) return named[c];
	if (c === "base" || c.startsWith("$(")) return null;
	return c.split("-")[0];
}

// Opções de plugins do Expo que viram chaves do Info.plist.
const EXPO_PLUGIN_KEYS = {
	cameraPermission: "NSCameraUsageDescription",
	microphonePermission: "NSMicrophoneUsageDescription",
	photosPermission: "NSPhotoLibraryUsageDescription",
	savePhotosPermission: "NSPhotoLibraryAddUsageDescription",
	locationWhenInUsePermission: "NSLocationWhenInUseUsageDescription",
	locationAlwaysAndWhenInUsePermission: "NSLocationAlwaysAndWhenInUseUsageDescription",
	locationAlwaysPermission: "NSLocationAlwaysUsageDescription",
	faceIDPermission: "NSFaceIDUsageDescription",
	contactsPermission: "NSContactsUsageDescription",
	calendarPermission: "NSCalendarsUsageDescription",
	remindersPermission: "NSRemindersUsageDescription",
	userTrackingPermission: "NSUserTrackingUsageDescription",
	motionPermission: "NSMotionUsageDescription",
	speechRecognitionPermission: "NSSpeechRecognitionUsageDescription",
	bluetoothAlwaysPermission: "NSBluetoothAlwaysUsageDescription",
};
const USAGE_KEY = /^NS\w+UsageDescription$/;

// ---------- auditoria ----------

export function audit(rootDir) {
	const root = path.resolve(rootDir);
	if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error(`Pasta não encontrada: ${root}`);
	const files = walk(root);
	const abs = (rel) => path.join(root, rel);
	const has = (rel) => fs.existsSync(abs(rel));
	const results = [];
	const add = (level, guideline, id, title, details = []) => results.push({ level, guideline, id, title, details });

	// --- fontes ---
	const appJson = has("app.json") ? readJson(abs("app.json")) : null;
	const expo = appJson ? (appJson.expo ?? appJson) : null;
	const appConfigFile = files.find((f) => /^app\.config\.(js|ts|mjs|cjs)$/.test(f));
	const appConfigText = appConfigFile ? readText(abs(appConfigFile)) : "";
	const isExpo = Boolean(expo || appConfigFile);
	const pkg = has("package.json") ? readJson(abs("package.json")) ?? {} : {};
	const depNames = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
	const nativeDepsText = ["ios/Podfile", "ios/Podfile.lock", "Podfile", "Podfile.lock", "pubspec.yaml"]
		.concat(files.filter((f) => f.endsWith("Package.resolved")))
		.filter(has)
		.map((f) => readText(abs(f)))
		.join("\n");
	const depsText = `${depNames.join("\n")}\n${nativeDepsText}`;

	const gitignore = has(".gitignore") ? readText(abs(".gitignore")) : "";
	const iosIgnored = /^\/?ios\/?\s*$/m.test(gitignore);

	const pbxFiles = files.filter((f) => f.endsWith(".xcodeproj/project.pbxproj"));
	const pbxText = pbxFiles.map((f) => readText(abs(f))).join("\n");
	const pbxDevRegion = /developmentRegion\s*=\s*"?([\w-]+)"?;/.exec(pbxText)?.[1];
	const pbxInfoKeys = {};
	for (const m of pbxText.matchAll(/INFOPLIST_KEY_(NS\w+UsageDescription)\s*=\s*"((?:[^"\\]|\\.)*)"/g)) pbxInfoKeys[m[1]] = m[2];

	const mainPlists = files
		.filter((f) => /(^|\/)Info\.plist$/.test(f))
		.map((f) => ({ file: f, dict: parsePlist(readText(abs(f))) }))
		.filter(
			({ dict }) =>
				dict &&
				!dict.NSExtension &&
				!dict.WKApplication &&
				(dict.UILaunchStoryboardName || dict.LSRequiresIPhoneOS || dict.UIApplicationSceneManifest || dict.UISupportedInterfaceOrientations),
		);
	const hasNative = mainPlists.length > 0 || Object.keys(pbxInfoKeys).length > 0;
	const nativeIsTruth = hasNative && (!isExpo || !iosIgnored);

	if (!hasNative && !isExpo) {
		add("WARN", "-", "ios-not-found", "Nenhum projeto iOS encontrado (Info.plist, .xcodeproj, app.json ou app.config). Rode na raiz do app.");
	}

	// Arquivos de código para as buscas por texto.
	const codeFiles = files.filter((f) => CODE_EXT.test(f) && !NOT_CODE.test(f));
	const texts = new Map(codeFiles.map((f) => [f, readText(abs(f))]));
	const grep = (re, { skipComments = true, filter = () => true } = {}) => {
		const hits = [];
		for (const [f, text] of texts) {
			if (!filter(f)) continue;
			const lines = text.split(/\r?\n/);
			for (let n = 0; n < lines.length; n++) {
				let line = lines[n];
				if (skipComments) {
					if (/^\s*(\/\/|\/\*|\*|#)/.test(line)) continue;
					line = line.replace(/\s\/\/\s.*$/, ""); // comentário no fim da linha (URLs não têm espaço antes de //)
				}
				re.lastIndex = 0;
				if (re.test(line)) hits.push(`${f}:${n + 1}: ${line.trim().slice(0, 140)}`);
			}
		}
		return hits;
	};
	const anyCode = (re) => grep(re, { skipComments: false }).length > 0;
	const sample = (hits, max = 5) => (hits.length > max ? [...hits.slice(0, max), `... e mais ${hits.length - max}`] : hits);

	// --- 4 / 5.1.1(ii): textos de permissão ---
	const permSources = []; // { label, devLang, entries: [{key, value}] }
	if (nativeIsTruth) {
		for (const { file, dict } of mainPlists) {
			const dev = normLang(dict.CFBundleDevelopmentRegion) ?? normLang(pbxDevRegion) ?? "en";
			const entries = Object.entries(dict).filter(([k, v]) => USAGE_KEY.test(k) && typeof v === "string").map(([key, value]) => ({ key, value }));
			permSources.push({ label: file, dir: path.posix.dirname(file), dict, devLang: dev, entries });
		}
		if (Object.keys(pbxInfoKeys).length) {
			const dev = normLang(pbxDevRegion) ?? "en";
			permSources.push({ label: "project.pbxproj (INFOPLIST_KEY_*)", dir: null, dict: {}, devLang: dev, entries: Object.entries(pbxInfoKeys).map(([key, value]) => ({ key, value })) });
		}
	}
	const expoEntries = [];
	if (expo) {
		for (const [key, value] of Object.entries(expo.ios?.infoPlist ?? {})) if (USAGE_KEY.test(key) && typeof value === "string") expoEntries.push({ key, value, where: "ios.infoPlist" });
		const visit = (node, where) => {
			if (Array.isArray(node)) node.forEach((n) => visit(n, where));
			else if (node && typeof node === "object")
				for (const [k, v] of Object.entries(node)) {
					if (typeof v === "string" && (USAGE_KEY.test(k) || EXPO_PLUGIN_KEYS[k])) expoEntries.push({ key: USAGE_KEY.test(k) ? k : EXPO_PLUGIN_KEYS[k], value: v, where });
					else visit(v, where);
				}
		};
		for (const p of expo.plugins ?? []) if (Array.isArray(p)) visit(p[1], `plugin ${p[0]}`);
	}
	for (const m of appConfigText.matchAll(/(NS\w+UsageDescription)\s*:\s*(["'`])((?:(?!\2)[^\\]|\\.)*)\2/g)) expoEntries.push({ key: m[1], value: m[3], where: appConfigFile });
	const expoDevLang = normLang(expo?.ios?.infoPlist?.CFBundleDevelopmentRegion) ?? "en";
	if (isExpo && !nativeIsTruth) permSources.push({ label: "config do Expo", dir: null, dict: expo?.ios?.infoPlist ?? {}, devLang: expoDevLang, entries: expoEntries, expo: true });

	if (isExpo && nativeIsTruth) {
		const diffs = [];
		const plist = mainPlists[0]?.dict ?? {};
		for (const e of expoEntries) {
			if (!(e.key in plist)) diffs.push(`${e.key} está no ${e.where} mas não no ${mainPlists[0]?.file}`);
			else if (plist[e.key] !== e.value) diffs.push(`${e.key}: ${e.where} diz "${e.value.slice(0, 60)}", o Info.plist diz "${String(plist[e.key]).slice(0, 60)}"`);
		}
		add(
			diffs.length ? "WARN" : "OK",
			"4 / 5.1.1(ii)",
			"ios-committed",
			"Pasta ios/ versionada: o EAS Build usa esses arquivos e NÃO roda os config plugins. O Info.plist do ios/ é o que vai para a loja.",
			diffs.length ? sample(diffs) : [],
		);
	}

	const wrongBase = [];
	const emptyPerm = [];
	const shortPerm = [];
	for (const src of permSources) {
		for (const { key, value, where } of src.entries) {
			const label = where ?? src.label;
			if (!value.trim()) emptyPerm.push(`${label}: ${key} vazio`);
			else if (value.replace(/\$\([A-Z_]+\)/g, "").trim().length < 25) shortPerm.push(`${label}: ${key} = "${value}"`);
			const lang = detectLang(value);
			if (lang && lang !== src.devLang) wrongBase.push(`${label}: ${key} está em "${lang}", idioma de desenvolvimento é "${src.devLang}": "${value.slice(0, 70)}"`);
		}
	}
	const totalPerms = permSources.reduce((n, s) => n + s.entries.length, 0);
	if (wrongBase.length)
		add("FAIL", "4 / 5.1.1(ii)", "perm-base-lang", "Texto padrão de permissão em idioma diferente do CFBundleDevelopmentRegion (aparece quando o idioma do aparelho não tem tradução).", sample(wrongBase));
	else if (totalPerms) add("OK", "4 / 5.1.1(ii)", "perm-base-lang", `Textos padrão de permissão no idioma de desenvolvimento (${totalPerms} encontrados).`);
	if (emptyPerm.length) add("FAIL", "5.1.1(ii)", "perm-empty", "Texto de permissão vazio.", sample(emptyPerm));
	if (shortPerm.length) add("WARN", "5.1.1(ii)", "perm-vague", "Texto de permissão curto demais: diga para que o dado é usado, com um exemplo.", sample(shortPerm));

	// Traduções por idioma.
	for (const src of permSources) {
		const required = [...new Set(src.entries.map((e) => e.key))];
		if (!required.length) continue;
		const translations = new Map(); // lang -> { label, keys }
		const addT = (locale, label, obj) => {
			const lang = normLang(locale);
			if (!lang) return;
			const cur = translations.get(lang) ?? { labels: [], strings: {} };
			cur.labels.push(label);
			Object.assign(cur.strings, obj);
			translations.set(lang, cur);
		};
		const declared = new Set((src.dict.CFBundleLocalizations ?? []).map(normLang).filter(Boolean));
		if (src.expo) {
			for (const [locale, ref] of Object.entries(expo?.locales ?? {})) {
				const obj = typeof ref === "string" ? readJson(abs(ref)) ?? {} : ref ?? {};
				addT(locale, typeof ref === "string" ? ref : `locales.${locale}`, obj.ios ?? obj);
				declared.add(normLang(locale));
			}
		} else {
			const prefix = src.dir ? `${src.dir}/` : "";
			for (const f of files) {
				const m = /([^/]+)\.lproj\/(InfoPlist\.strings|[^/]+)$/.exec(f);
				if (!m || (src.dir && !f.startsWith(prefix)) || (!src.dir && !f.startsWith("ios/") && hasNative)) continue;
				if (normLang(m[1])) declared.add(normLang(m[1]));
				if (m[2] === "InfoPlist.strings") addT(m[1], f, parseStrings(readText(abs(f))));
			}
			for (const f of files.filter((x) => x.endsWith("InfoPlist.xcstrings"))) {
				const cat = readJson(abs(f))?.strings ?? {};
				for (const [key, entry] of Object.entries(cat))
					for (const [locale, loc] of Object.entries(entry?.localizations ?? {})) {
						const v = loc?.stringUnit?.value;
						if (v) addT(locale, f, { [key]: v });
						declared.add(normLang(locale));
					}
			}
		}
		declared.delete(src.devLang);
		const missing = [];
		const wrongLang = [];
		for (const lang of [...declared].sort()) {
			const t = translations.get(lang);
			const lacking = required.filter((k) => !t?.strings[k]);
			if (lacking.length) missing.push(`${lang}: falta ${lacking.join(", ")}${t ? ` (em ${t.labels[0]})` : " (nenhum InfoPlist.strings/locales para este idioma)"}`);
			for (const k of required) {
				const v = t?.strings[k];
				const got = v && detectLang(v);
				if (got && got !== lang && ["en", "pt", "es"].includes(lang)) wrongLang.push(`${lang}: ${k} parece estar em "${got}": "${v.slice(0, 60)}"`);
			}
		}
		if (missing.length) add("FAIL", "4 / 5.1.1(ii)", "perm-locales", `Idiomas do app sem tradução dos textos de permissão (${src.label}).`, sample(missing, 8));
		else if (declared.size) add("OK", "4 / 5.1.1(ii)", "perm-locales", `Textos de permissão traduzidos em ${[...declared].join(", ")} (${src.label}).`);
		else add("OK", "4 / 5.1.1(ii)", "perm-locales", `Um idioma só (${src.devLang}). Confirme que a interface do app também está em "${src.devLang}"; se não, os prompts de permissão sairão em outro idioma.`);
		if (wrongLang.length) add("WARN", "4 / 5.1.1(ii)", "perm-locale-lang", "Tradução de permissão que parece estar no idioma errado.", sample(wrongLang));
	}

	// --- Privacy manifest ---
	const manifestFiles = files.filter((f) => f.endsWith("PrivacyInfo.xcprivacy") && (!nativeIsTruth || f.startsWith("ios/") || !isExpo));
	const manifest = manifestFiles.length ? parsePlist(readText(abs(manifestFiles[0]))) ?? {} : (expo?.ios?.privacyManifests ?? null);
	const health = /react-native-health|healthkit|expo-health|react-native-google-fit|health-connect|HealthKit/i.test(depsText) || Boolean(expo?.ios?.entitlements?.["com.apple.developer.healthkit"]) || /com\.apple\.developer\.healthkit/.test(files.filter((f) => f.endsWith(".entitlements")).map((f) => readText(abs(f))).join(""));
	const trackingRe = /react-native-fbsdk-next|appsflyer|react-native-adjust|^adjust|react-native-branch|tiktok|react-native-google-mobile-ads|applovin|ironsource|unity-ads|singular|kochava|FBSDKCoreKit|FBAudienceNetwork|Google-Mobile-Ads-SDK|AppsFlyerFramework/im;
	const trackingSdk = depsText.match(trackingRe)?.[0];
	const attTexts = [...permSources.flatMap((s) => s.entries), ...expoEntries].filter((e) => e.key === "NSUserTrackingUsageDescription");
	const hasAtt = attTexts.length > 0 || /expo-tracking-transparency/.test(depsText) && /userTrackingPermission/.test(JSON.stringify(expo ?? {}));

	// IA de terceiros (usado também no manifest).
	const aiDep = depNames.find((d) => /^(openai|@anthropic-ai\/|@google\/generative-ai|@google\/genai|@google-cloud\/vertexai|@ai-sdk\/|ai$|groq-sdk|@mistralai\/|cohere-ai|replicate|langchain|@langchain\/|@huggingface\/|together-ai|@fal-ai\/|elevenlabs)/.test(d));
	const aiNative = /\b(OpenAI|GoogleGenerativeAI|FirebaseVertexAI|FirebaseAI)\b/.exec(nativeDepsText)?.[0];
	const aiCode = grep(/api\.openai\.com|api\.anthropic\.com|generativelanguage\.googleapis\.com|aiplatform\.googleapis\.com|api\.groq\.com|api\.mistral\.ai|api\.cohere\.|api\.deepseek\.com|openrouter\.ai|api\.x\.ai|api\.perplexity\.ai|["'`](gpt-4o?(-mini)?|gpt-4\.1[\w-]*|gpt-5[\w-]*|o[34]-mini|claude-(3|sonnet|opus|haiku)[\w.-]*|gemini-[12][\w.-]*|whisper-1)["'`]|from\s+["']firebase\/(vertexai|ai)["']|getGenerativeModel\(/);
	const usesAi = Boolean(aiDep || aiNative || aiCode.length);

	if (manifest === null && (hasNative || isExpo)) {
		add(
			nativeIsTruth ? "FAIL" : "WARN",
			"5.1.1 / 2.5.1",
			"privacy-manifest",
			nativeIsTruth
				? "Sem PrivacyInfo.xcprivacy no app. Desde maio de 2024 o upload exige razões declaradas para as \"required reason APIs\"."
				: "Sem ios.privacyManifests no app.json. O prebuild gera um manifest básico; declare as razões e os dados coletados (Expo).",
		);
	} else if (manifest) {
		const where = manifestFiles[0] ?? "app.json ios.privacyManifests";
		const issues = [];
		const accessed = manifest.NSPrivacyAccessedAPITypes ?? [];
		const collected = (manifest.NSPrivacyCollectedDataTypes ?? []).map((d) => d?.NSPrivacyCollectedDataType);
		if (!accessed.length) issues.push("NSPrivacyAccessedAPITypes vazio (React Native e a maioria dos apps usam UserDefaults e timestamps de arquivo)");
		if (health && !collected.some((c) => /Health|Fitness/.test(c ?? ""))) issues.push("app usa dados de saúde e o manifest não declara NSPrivacyCollectedDataTypeHealth/Fitness");
		if (usesAi && !collected.some((c) => /OtherUserContent|CustomerSupport|Health/.test(c ?? ""))) issues.push("app envia conteúdo a IA e o manifest não declara conteúdo do usuário (ex.: NSPrivacyCollectedDataTypeOtherUserContent)");
		if ((trackingSdk || hasAtt) && manifest.NSPrivacyTracking !== true) issues.push(`há rastreamento/ATT (${trackingSdk ?? "NSUserTrackingUsageDescription"}) e NSPrivacyTracking não é true`);
		add(issues.length ? "WARN" : "OK", "5.1.1 / 5.1.2", "privacy-manifest", `Privacy manifest encontrado (${where}).${issues.length ? " Conferir:" : ""}`, issues);
	}

	// --- 2.4.1: iPad ---
	const tabletExpo = expo?.ios?.supportsTablet === true || expo?.ios?.isTabletOnly === true;
	const tabletNative = nativeIsTruth && /TARGETED_DEVICE_FAMILY\s*=\s*"?[\d,]*2/.test(pbxText);
	if (tabletExpo || tabletNative)
		add("WARN", "2.4.1 / 4", "ipad", "App roda nativamente no iPad: o revisor pode testar só no iPad. Teste o fluxo inteiro no iPad (paywall, login, exclusão). Depois de publicado com iPad, não dá para remover o iPad numa atualização.");
	else if (hasNative || isExpo) add("OK", "2.4.1", "ipad", "Só iPhone (no iPad roda em modo de compatibilidade). Ainda assim abra no iPad uma vez.");

	// --- 5.1.2(i): IA de terceiros ---
	const consent = [
		...grep(/(Ai|AI|ai|Ia|IA)([A-Z][a-z]+){0,2}[Cc]onsent|\b(ai|ia)_\w{0,12}consent|consent\w{0,4}_(ai|ia)\b/),
		...grep(/consentimento.{0,30}(\bia\b|intelig)|third[- ]party ai|ia de terceiros|ia de terceros|share .{0,40}with (openai|anthropic|google gemini)/i),
	];
	const consentEvidence = sample(consent, 3).map((c) => `consentimento: ${c}`);
	const checkEntryPoints = "Confira que TODO ponto de entrada (chat, resumos, análises em segundo plano) passa pelo pedido de permissão, e que a conta demo do revisor NÃO tem o consentimento já dado.";
	if (usesAi) {
		const evidence = [aiDep && `dependência: ${aiDep}`, aiNative && `pod/pacote nativo: ${aiNative}`, ...sample(aiCode, 3)].filter(Boolean);
		if (consent.length) add("WARN", "5.1.1(i) / 5.1.2(i)", "ai-consent", `IA de terceiros detectada e há sinais de consentimento. ${checkEntryPoints}`, [...evidence, ...consentEvidence]);
		else add("FAIL", "5.1.1(i) / 5.1.2(i)", "ai-consent", "IA de terceiros detectada e nenhum pedido de consentimento encontrado. Antes de enviar dado pessoal, peça permissão nomeando o provedor e os dados.", evidence);
	} else {
		const aiMention = grep(/artificial intelligence|intelig[eê]ncia artificial|inteligencia artificial|\b(AI|IA)[- ](assistant|assistente|asistente|chat|coach|summary|resumo|resumen|insights?|powered)\b|powered by (ai|gpt|openai|gemini|claude)/i);
		if (aiMention.length)
			add("WARN", "5.1.1(i) / 5.1.2(i)", "ai-consent", `O app fala em IA mas não chama provedor direto (provavelmente via seu servidor). A 5.1.2(i) vale igual. ${consent.length ? "" : "Nenhum sinal de consentimento de IA encontrado. "}${checkEntryPoints}`, [...sample(aiMention, 3), ...consentEvidence]);
		else add("OK", "5.1.2(i)", "ai-consent", "Nenhum sinal de IA de terceiros no app. Se o servidor usa IA com dados do usuário, a regra vale igual: confira à mão.");
	}

	// --- 1.4.2: calculadora de dose ---
	const dose = grep(/calculadora de dos[ei]s?|calcul\w* (a |da |de )?dos(e|agem)|dose calculat|dosage calculat|calculat\w* (the |your )?dos(e|age)|calcularDose|calculateDose|doseCalc|dosisCalc|calculadora de dosis|titula[çc][ãa]o|titration|dose (recomendada|sugerida)|recommended dose|suggested dose|sugest[ãa]o de dose/i);
	if (dose.length)
		add("WARN", "1.4.2", "dose-calculator", "Termos de cálculo/sugestão de dose de medicamento. Só fabricante, hospital, universidade, plano de saúde, farmácia ou entidade aprovada pode publicar isso; registrar a dose prescrita é permitido. Se a função fica fora do iOS, a exclusão tem de ser no build: esconder na review e ligar depois por flag remota é funcionalidade oculta (2.5.19).", sample(dose));
	else add("OK", "1.4.2", "dose-calculator", "Nenhum termo de calculadora de dose encontrado.");

	// --- 2.1(a): placeholders e dados de teste ---
	const lorem = grep(/lorem ipsum/i);
	if (lorem.length) add("FAIL", "2.1(a)", "placeholder", "Texto lorem ipsum no app.", sample(lorem));
	// Só o texto que É o placeholder ("Em breve", "Coming soon {{x}}") ou "disponível em breve"; "retornaremos em breve" passa.
	const soonWord = "(coming soon|em breve|pr[óo]ximamente|bient[ôo]t|under construction|em constru[çc][ãa]o|not implemented|n[ãa]o implementad[oa])";
	const soon = grep(new RegExp(`["'\`>]\\s*${soonWord}|(available|dispon[íi]vel|disponible|will be|estar[áa]|chegando|ser[áa] lan[çc]ad[oa])[^"'\`<]{0,30}\\b${soonWord}`, "i"));
	if (soon.length) add("WARN", "2.1(a)", "placeholder-soon", "Textos de \"em breve\" / \"coming soon\": se o revisor alcança a tela, é rejeição por app incompleto.", sample(soon));
	const testData = grep(/\b(test|teste|foo|asdf|fake)@(test|teste|example|bar|mail|fake)\.com\b|\b(John Doe|Jane Doe|Fulano de Tal)\b|["'](senha|password)123["']/i);
	if (testData.length) add("WARN", "2.1(a)", "test-data", "Dados de teste no código (e-mails, nomes, senhas fictícias). Confira que não aparecem para o revisor.", sample(testData));
	if (!lorem.length && !soon.length && !testData.length) add("OK", "2.1(a)", "placeholder", "Nenhum placeholder ou dado de teste óbvio.");
	const consoleLogs = grep(/^(?!.*__DEV__).*\bconsole\.log\(/, { filter: (f) => /\.(jsx?|tsx?)$/.test(f) && !/(^|\/)scripts\//.test(f) });
	const babel = files.filter((f) => /^babel\.config\.|^\.babelrc/.test(f)).map((f) => readText(abs(f))).join("");
	if (consoleLogs.length && !/transform-remove-console/.test(babel))
		add("WARN", "2.1 / 1.6", "console-log", `${consoleLogs.length} console.log no código: podem vazar dado pessoal ou de teste em produção. Remova ou use babel-plugin-transform-remove-console.`, sample(consoleLogs, 3));

	// --- 4.8: login social exige Sign in with Apple (ou equivalente) ---
	const google = /@react-native-google-signin|google-signin|GoogleSignIn/i.test(depsText) || anyCode(/GoogleAuthProvider|Google\.useAuthRequest|useIdTokenAuthRequest/);
	const facebook = anyCode(/LoginManager\.logInWithPermissions|FacebookAuthProvider|FBSDKLoginKit|FBLoginButton/);
	const apple = /expo-apple-authentication|react-native-apple-authentication|apple-signin/i.test(depsText) || Boolean(expo?.ios?.usesAppleSignIn) || anyCode(/ASAuthorizationAppleIDProvider|AppleAuthProvider|appleAuth\.|AppleAuthentication\.signInAsync|com\.apple\.developer\.applesignin/) || /com\.apple\.developer\.applesignin/.test(JSON.stringify(expo ?? {}));
	if ((google || facebook) && !apple) add("FAIL", "4.8", "sign-in-with-apple", `Login com ${[google && "Google", facebook && "Facebook"].filter(Boolean).join(" e ")} sem Sign in with Apple (ou login equivalente que limite dados a nome e e-mail e permita ocultar o e-mail).`);
	else if (google || facebook) add("OK", "4.8", "sign-in-with-apple", "Login social acompanhado de Sign in with Apple.");

	// --- 5.1.1(v): exclusão de conta ---
	const hasAuth = google || facebook || apple || /@react-native-firebase\/auth|firebase|@supabase|@clerk|aws-amplify|@auth0|expo-auth-session/i.test(depsText) || anyCode(/createUserWithEmailAndPassword|signUp\(|signUpWithEmail|createAccount\(|registerUser\(/);
	if (hasAuth) {
		const deletion = grep(/delete[_-]?account|deleteAccount|delete[_-]?user|deleteUser|account[_-]?deletion|excluir[_ -]?(minha[_ -])?conta|excluirConta|apagar[_ -]?(minha[_ -])?conta|eliminar[_ -]?(mi[_ -])?cuenta|user\.delete\(|currentUser\.delete\(/i);
		if (!deletion.length) add("FAIL", "5.1.1(v)", "account-deletion", "App com login e nenhum sinal de exclusão de conta dentro do app.");
		else add("OK", "5.1.1(v)", "account-deletion", "Há fluxo de exclusão de conta. Teste no aparelho: excluir e tentar logar de novo.", sample(deletion, 2));
		if (apple && !anyCode(/auth\/revoke|revokeToken|revoke_token|revokeApple|appleRevoke|revoke/i))
			add("WARN", "5.1.1(v) / 4.8", "apple-revoke", "Sign in with Apple sem sinal de revogação do token neste projeto. Se a exclusão roda no servidor, confirme lá a troca do authorizationCode por refresh token e o POST em /auth/revoke.");
	}

	// --- 3.1.1 / 3.1.2: compras ---
	const iap = depsText.match(/react-native-purchases|react-native-iap|expo-iap|expo-in-app-purchases|superwall|adapty|qonversion|revenuecat|glassfy|apphud|in_app_purchase|purchases_flutter/i)?.[0] || (anyCode(/\bimport StoreKit\b|Product\.products\(|SKPaymentQueue/) ? "StoreKit" : null);
	if (iap) {
		const restore = grep(/restorePurchases|restore_purchases|restore purchases|restaurar compras?|restaurar compra|restaurar mis compras|AppStore\.sync\(|restoreCompletedTransactions|syncPurchases/i);
		if (!restore.length) add("FAIL", "3.1.1", "restore-purchases", `Compras no app (${iap}) sem "Restaurar compras" no código. Deixe o botão visível também fora do paywall (Ajustes).`);
		else add("OK", "3.1.1", "restore-purchases", "Há restaurar compras. Confira que aparece fora do paywall (ex.: Ajustes) e que responde no sandbox.", sample(restore, 2));
		const terms = anyCode(/terms|termos|eula|t[ée]rminos/i);
		const privacy = anyCode(/privacy|privacidade|privacidad/i);
		if (!terms || !privacy) add("WARN", "3.1.2", "paywall-legal", `Assinatura sem link de ${[!terms && "Termos de Uso (EULA)", !privacy && "Política de Privacidade"].filter(Boolean).join(" e ")} no código. O paywall precisa de preço, período, renovação automática e os dois links (se o paywall é remoto, confira no painel).`);
	}

	// --- 5.1.2(i): ATT ---
	if (trackingSdk && !hasAtt) add("FAIL", "5.1.2(i)", "att", `SDK de rastreamento/atribuição (${trackingSdk}) sem NSUserTrackingUsageDescription. Rastrear entre apps exige o prompt do App Tracking Transparency.`);
	else if (hasAtt) {
		const asks = anyCode(/requestTrackingPermissions?Async|requestTrackingAuthorization|ATTrackingManager|APP_TRACKING_TRANSPARENCY|requestTrackingPermission/);
		add(asks ? "OK" : "WARN", "5.1.2(i)", "att", asks ? "ATT declarado e solicitado. O SDK só pode rastrear depois do \"Permitir\"." : "NSUserTrackingUsageDescription existe, mas nenhuma chamada ao prompt do ATT foi encontrada (o revisor procura o prompt).");
	}

	// --- 1.6 / ATS: http:// ---
	const http = grep(/http:\/\/(?!localhost|127\.0\.0\.1|10\.0\.2\.2|0\.0\.0\.0|192\.168\.|schemas\.|www\.w3\.org|ns\.adobe\.com|xml\.apache\.org|purl\.org|example\.|www\.apple\.com\/DTDs)[\w.-]+/i);
	const arbitrary = /NSAllowsArbitraryLoads<\/key>\s*<true\/>/.test(mainPlists.map((p) => readText(abs(p.file))).join("")) || expo?.ios?.infoPlist?.NSAppTransportSecurity?.NSAllowsArbitraryLoads === true;
	if (http.length || arbitrary)
		add("WARN", "1.6 / 2.5", "http", "Tráfego sem TLS: use https. NSAllowsArbitraryLoads exige justificativa.", [...(arbitrary ? ["NSAllowsArbitraryLoads = true"] : []), ...sample(http)]);
	else add("OK", "1.6", "http", "Nenhuma URL http:// no código.");

	// --- Export compliance (criptografia): sem a chave, o ASC pergunta a cada build ---
	const ENC_KEY = "ITSAppUsesNonExemptEncryption";
	const plistEnc = mainPlists.find(({ dict }) => ENC_KEY in dict)?.dict[ENC_KEY];
	const expoEnc = expo?.ios?.config?.usesNonExemptEncryption ?? expo?.ios?.infoPlist?.[ENC_KEY] ?? (/usesNonExemptEncryption|ITSAppUsesNonExemptEncryption/.test(appConfigText) ? "app.config" : undefined);
	const enc = nativeIsTruth ? plistEnc : expoEnc;
	if (enc === undefined && (hasNative || isExpo)) {
		const details = nativeIsTruth && expoEnc !== undefined ? ["A chave está no app.json/app.config, mas a pasta ios/ versionada não tem: o Info.plist commitado é o que vale."] : [];
		add("WARN", "Export compliance", "encryption", `Sem ${ENC_KEY} (Expo: ios.config.usesNonExemptEncryption). O App Store Connect faz as perguntas de criptografia a cada build e o build fica em "Missing Compliance" até responder. Só HTTPS/criptografia do sistema: em geral false. Criptografia própria ou não isenta: true e documentação de exportação.`, details);
	} else if (enc !== undefined) {
		add("OK", "Export compliance", "encryption", `${ENC_KEY} declarado (${enc === true ? "true: envie a documentação de exportação e preencha ITSEncryptionExportComplianceCode" : enc === false ? "false: confirme que o app e as bibliotecas só usam criptografia isenta" : "em app.config"}).`);
	}

	return { root, results };
}

// ---------- CLI ----------

export function formatReport({ root, results }) {
	const order = { FAIL: 0, WARN: 1, OK: 2 };
	const tag = { FAIL: "[FAIL]", WARN: "[WARN]", OK: "[ OK ]" };
	const lines = [`Auditoria App Store (estática, somente leitura): ${root}`, ""];
	for (const r of [...results].sort((a, b) => order[a.level] - order[b.level])) {
		lines.push(`${tag[r.level]} ${r.guideline.padEnd(20)} ${r.id}: ${r.title}`);
		for (const d of r.details) lines.push(`         - ${d}`);
	}
	const count = (l) => results.filter((r) => r.level === l).length;
	lines.push("", `Resumo: ${count("FAIL")} FAIL, ${count("WARN")} WARN, ${count("OK")} OK.`);
	lines.push(count("FAIL") ? "Resultado: BLOQUEADO pela auditoria estática (corrija os FAIL)." : "Resultado: sem bloqueio estático. Continue com o checklist e o teste no aparelho.");
	return lines.join("\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
	const dir = process.argv[2];
	if (!dir) {
		console.error("Uso: node audit.mjs <pasta-do-projeto>");
		process.exit(2);
	}
	try {
		const report = audit(dir);
		console.log(formatReport(report));
		process.exit(report.results.some((r) => r.level === "FAIL") ? 1 : 0);
	} catch (err) {
		console.error(String(err?.message ?? err));
		process.exit(2);
	}
}
