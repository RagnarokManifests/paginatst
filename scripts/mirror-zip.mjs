import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const TOKEN = process.env.GITHUB_TOKEN;
const OWN_REPO = process.env.GITHUB_REPOSITORY; // ej: "RagnarokManifests/paginatst"
const EXE_REGEX = /\.exe$/i;

const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${TOKEN}`,
};

async function api(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
  return res;
}

const releases = JSON.parse(readFileSync('releases.json', 'utf8'));
const latest = releases[0];
const exeAsset = latest.assets.find((a) => EXE_REGEX.test(a.name));

if (!exeAsset) {
  console.log('El último release no tiene .exe, nada que espejar.');
  process.exit(0);
}

const mirrorTag = `zip-${latest.tag_name}`;
// Sin el prefijo "ragnarok-": los gestores de descarga (FDM, IDM, etc.) leen el nombre
// del header Content-Disposition que manda GitHub, no del atributo download del HTML,
// así que el nombre final tiene que quedar bien desde el propio asset subido acá.
const zipName = exeAsset.name.replace(EXE_REGEX, '.zip').replace(/^ragnarok-/i, '');

// ¿Ya espejamos esta versión antes? Si sí, reutilizamos el release/asset existente.
let uploadUrl = null;
const existing = await api(`https://api.github.com/repos/${OWN_REPO}/releases/tags/${mirrorTag}`);
if (existing.ok) {
  const rel = await existing.json();
  const zipAsset = rel.assets?.find((a) => a.name === zipName);
  if (zipAsset) {
    console.log(`Ya existe el espejo .zip de ${latest.tag_name}, se reutiliza.`);
    latest.assets.push({
      name: zipAsset.name,
      size: zipAsset.size,
      browser_download_url: zipAsset.browser_download_url,
    });
    writeFileSync('releases.json', JSON.stringify(releases, null, 2) + '\n');
    process.exit(0);
  }
  // Borrar assets .zip viejos (ej. con el nombre "ragnarok-..." de una corrida anterior).
  for (const oldAsset of rel.assets?.filter((a) => a.name.endsWith('.zip')) ?? []) {
    await api(`https://api.github.com/repos/${OWN_REPO}/releases/assets/${oldAsset.id}`, { method: 'DELETE' });
  }
  // El release espejo existe pero sin el asset actual: reutilizarlo.
  uploadUrl = rel.upload_url.replace('{?name,label}', `?name=${encodeURIComponent(zipName)}`);
}

console.log(`Descargando ${exeAsset.name}...`);
const exeRes = await fetch(exeAsset.browser_download_url, { headers });
if (!exeRes.ok) throw new Error(`No se pudo descargar el .exe -> HTTP ${exeRes.status}`);
writeFileSync('/tmp/setup.exe', Buffer.from(await exeRes.arrayBuffer()));

console.log('Comprimiendo a .zip...');
execFileSync('zip', ['-j', '/tmp/setup.zip', '/tmp/setup.exe'], { stdio: 'inherit' });
execFileSync('mv', ['/tmp/setup.zip', `/tmp/${zipName}`]);

if (!uploadUrl) {
  console.log('Creando release espejo...');
  const createRes = await api(`https://api.github.com/repos/${OWN_REPO}/releases`, {
    method: 'POST',
    body: JSON.stringify({
      tag_name: mirrorTag,
      name: `${latest.tag_name} (ZIP)`,
      body: 'Espejo automático en .zip del instalador de Windows. Generado por scripts/mirror-zip.mjs.',
      prerelease: true,
    }),
  });
  if (!createRes.ok) throw new Error(`No se pudo crear el release espejo -> HTTP ${createRes.status}: ${await createRes.text()}`);
  const created = await createRes.json();
  uploadUrl = created.upload_url.replace('{?name,label}', `?name=${encodeURIComponent(zipName)}`);
}

console.log('Subiendo el .zip como asset...');
const zipBytes = readFileSync(`/tmp/${zipName}`);
const uploadRes = await api(uploadUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/zip' },
  body: zipBytes,
});
if (!uploadRes.ok) throw new Error(`No se pudo subir el .zip -> HTTP ${uploadRes.status}: ${await uploadRes.text()}`);
const uploadedAsset = await uploadRes.json();

latest.assets.push({
  name: uploadedAsset.name,
  size: uploadedAsset.size,
  browser_download_url: uploadedAsset.browser_download_url,
});

writeFileSync('releases.json', JSON.stringify(releases, null, 2) + '\n');
console.log(`Listo: ${zipName} espejado y agregado a releases.json`);
