import { writeFileSync } from 'node:fs';

const REPO = 'RagnarokManifests/games';
const TOKEN = process.env.GITHUB_TOKEN;
const EXE_REGEX = /\.exe$/i;
const ZIP_REGEX = /\.zip$/i;

// La página solo muestra la última versión; unas pocas bastan por si la última
// no tuviera instalador.
const KEEP_RELEASES = 5;

const headers = {
  Accept: 'application/vnd.github+json',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

const [latest, all] = await Promise.all([
  fetchJson(`https://api.github.com/repos/${REPO}/releases/latest`),
  fetchJson(`https://api.github.com/repos/${REPO}/releases?per_page=100`),
]);

const isInstaller = (a) => EXE_REGEX.test(a.name) || ZIP_REGEX.test(a.name);
const hasInstaller = (release) => release.assets?.some(isInstaller);

// Solo los campos que usa app.js. Sin download_count ni fechas de
// actualización: cambian solos y hacían un commit en cada corrida.
const slim = (release) => ({
  id: release.id,
  tag_name: release.tag_name,
  name: release.name,
  published_at: release.published_at,
  html_url: release.html_url,
  assets: (release.assets ?? [])
    .filter(isInstaller)
    .map((a) => ({ name: a.name, size: a.size, browser_download_url: a.browser_download_url })),
});

const valid = all.filter(hasInstaller);

const latestIndex = valid.findIndex((r) => r.id === latest.id);
if (latestIndex > 0) {
  valid.splice(latestIndex, 1);
  valid.unshift(latest);
} else if (latestIndex === -1 && hasInstaller(latest)) {
  valid.unshift(latest);
}

if (!valid.length) {
  throw new Error('No se encontró ningún release con un instalador');
}

const out = valid.slice(0, KEEP_RELEASES).map(slim);
writeFileSync('releases.json', JSON.stringify(out, null, 2) + '\n');
console.log(`releases.json generado con ${out.length} release(s). Última: ${out[0].tag_name}`);
