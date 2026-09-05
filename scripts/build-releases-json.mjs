import { writeFileSync } from 'node:fs';

const REPO = 'RagnarokManifests/games';
const TOKEN = process.env.GITHUB_TOKEN;
const EXE_REGEX = /\.exe$/i;
const APPIMAGE_REGEX = /\.AppImage$/i;
const ZIP_REGEX = /\.zip$/i;

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

const hasInstaller = (release) => release.assets?.some((a) => EXE_REGEX.test(a.name) || APPIMAGE_REGEX.test(a.name) || ZIP_REGEX.test(a.name));

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

writeFileSync('releases.json', JSON.stringify(valid, null, 2) + '\n');
console.log(`releases.json generado con ${valid.length} release(s). Última: ${valid[0].tag_name}`);
