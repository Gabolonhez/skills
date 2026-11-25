// Autoteste do audit.mjs. Rode: node scripts/audit.test.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { audit, detectLang, normLang, parsePlist, parseStrings } from "./audit.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) => path.join(here, "..", "tests", "fixtures", name);
const level = (report, id) => report.results.filter((r) => r.id === id).map((r) => r.level);
let passed = 0;
const test = (name, fn) => {
	fn();
	passed++;
	console.log(`ok - ${name}`);
};

test("detectLang reconhece pt, en, es e se abstém em texto curto", () => {
	assert.equal(detectLang("Precisamos acessar sua câmera para você fotografar a refeição."), "pt");
	assert.equal(detectLang("We use the camera so you can take a photo of your meal."), "en");
	assert.equal(detectLang("Usamos la cámara para que tomes una foto de tu comida."), "es");
	assert.equal(detectLang("Camera"), null);
	assert.equal(detectLang("Allow $(PRODUCT_NAME) to use Face ID to unlock your session."), "en");
});

test("normLang", () => {
	assert.equal(normLang("pt-BR"), "pt");
	assert.equal(normLang("en_US"), "en");
	assert.equal(normLang("$(DEVELOPMENT_LANGUAGE)"), null);
	assert.equal(normLang("Base"), null);
});

test("parsePlist e parseStrings", () => {
	const dict = parsePlist(
		"<plist><dict><key>A</key><string>x &amp; y</string><key>B</key><array><string>en</string></array><key>C</key><true/><key>D</key><integer>2</integer></dict></plist>",
	);
	assert.deepEqual(dict, { A: "x & y", B: ["en"], C: true, D: 2 });
	assert.deepEqual(parseStrings('/* c */\n"NSCameraUsageDescription" = "Use a \\"câmera\\"";\nNSFaceIDUsageDescription = "Face ID";'), {
		NSCameraUsageDescription: 'Use a "câmera"',
		NSFaceIDUsageDescription: "Face ID",
	});
});

test("fixture boa: nenhum FAIL", () => {
	const report = audit(fixture("good"));
	const fails = report.results.filter((r) => r.level === "FAIL");
	assert.deepEqual(fails, [], JSON.stringify(fails, null, 2));
	assert.deepEqual(level(report, "perm-locales"), ["OK"]);
	assert.deepEqual(level(report, "ai-consent"), ["WARN"]); // IA com consentimento ainda pede conferência manual
	assert.deepEqual(level(report, "ipad"), ["OK"]);
	assert.deepEqual(level(report, "encryption"), ["OK"]); // ios.config.usesNonExemptEncryption no app.json
});

test("fixture ruim: cada problema plantado vira FAIL ou WARN", () => {
	const report = audit(fixture("bad"));
	const expectFail = ["perm-base-lang", "perm-locales", "privacy-manifest", "ai-consent", "placeholder", "sign-in-with-apple", "account-deletion", "restore-purchases", "att"];
	for (const id of expectFail) assert.ok(level(report, id).includes("FAIL"), `esperava FAIL em ${id}`);
	const expectWarn = ["perm-vague", "ipad", "dose-calculator", "placeholder-soon", "paywall-legal", "http", "encryption"];
	for (const id of expectWarn) assert.ok(level(report, id).includes("WARN"), `esperava WARN em ${id}`);
	// O InfoPlist.strings em UTF-16 do pt-BR é lido: só o espanhol aparece como faltando.
	const locales = report.results.find((r) => r.id === "perm-locales");
	assert.ok(locales.details.some((d) => d.startsWith("es:")));
	assert.ok(!locales.details.some((d) => d.startsWith("pt:")));
	// Chave só no app.json com ios/ versionado: o Info.plist commitado não tem, continua WARN e explica.
	assert.ok(report.results.find((r) => r.id === "encryption").details.some((d) => d.includes("ios/ versionada")));
	assert.ok(!report.results.some((r) => r.id === "encryption" && r.level === "FAIL"));
});

test("encryption: chave no Info.plist nativo vira OK", () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "audit-enc-"));
	try {
		fs.mkdirSync(path.join(dir, "ios", "App"), { recursive: true });
		fs.writeFileSync(
			path.join(dir, "ios", "App", "Info.plist"),
			"<plist><dict><key>LSRequiresIPhoneOS</key><true/><key>ITSAppUsesNonExemptEncryption</key><false/></dict></plist>",
		);
		assert.deepEqual(level(audit(dir), "encryption"), ["OK"]);
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

console.log(`\n${passed} testes passaram.`);
