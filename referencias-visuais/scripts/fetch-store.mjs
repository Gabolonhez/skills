#!/usr/bin/env node
// Baixa os prints da App Store de um app (API pública do iTunes, grátis, sem login).
// Uso: node fetch-store.mjs "<nome do app ou id numérico>" [--out <pasta>] [--country br] [--ipad]
// Saída: <out>/<slug>/NN.jpg + meta.json (nome, id, link, categoria, descrição).
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const query = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
if (!query) {
  console.error('Uso: node fetch-store.mjs "<nome ou id>" [--out pasta] [--country br] [--ipad]');
  process.exit(1);
}
const country = opt('country', 'br');
const outRoot = opt('out', 'design/references/_fontes/loja');

const getJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`iTunes respondeu ${res.status} para ${url}`);
  return res.json();
};

export const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

// mzstatic aceita outro tamanho no fim da URL; pede o maior e cai no original se falhar.
export const hiRes = (url) => url.replace(/\/[^/]+\.(jpg|png|webp)$/, '/1290x0w.jpg');

const download = async (url) => {
  for (const u of [hiRes(url), url]) {
    const res = await fetch(u);
    if (res.ok) return Buffer.from(await res.arrayBuffer());
  }
  throw new Error(`falhou ao baixar ${url}`);
};

const isId = /^\d+$/.test(query);
const data = await getJson(
  isId
    ? `https://itunes.apple.com/lookup?id=${query}&country=${country}`
    : `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&country=${country}&limit=5`,
);
if (!data.results?.length) {
  console.error(`Nenhum app encontrado para "${query}" na loja ${country}.`);
  process.exit(2);
}
const app = data.results[0];
if (!isId && data.results.length > 1) {
  console.log('Outros resultados (use o id para escolher):');
  for (const r of data.results.slice(1)) console.log(`  ${r.trackId}  ${r.trackName}`);
}

const shots = args.includes('--ipad') ? app.ipadScreenshotUrls : app.screenshotUrls;
const dir = join(outRoot, slugify(app.trackName));
await mkdir(dir, { recursive: true });

let n = 0;
for (const url of shots ?? []) {
  n += 1;
  await writeFile(join(dir, `${String(n).padStart(2, '0')}.jpg`), await download(url));
}
await writeFile(
  join(dir, 'meta.json'),
  JSON.stringify(
    {
      name: app.trackName,
      id: app.trackId,
      url: app.trackViewUrl,
      category: app.primaryGenreName,
      rating: app.averageUserRating,
      ratings: app.userRatingCount,
      seller: app.sellerName,
      fetchedAt: new Date().toISOString().slice(0, 10),
      country,
      description: app.description?.slice(0, 1500),
    },
    null,
    2,
  ),
);
console.log(`${app.trackName} (${app.trackId}): ${n} prints em ${dir}`);
