#!/usr/bin/env node
// Genera dist/ a partir de site/ con los datos de la última release publicada en GitHub.
//
//   node site/build.mjs
//
// Variables opcionales:
//   GITHUB_TOKEN       token para la API (en GitHub Actions evita el límite de peticiones)
//   GITHUB_REPOSITORY  «dueño/repo» (por defecto, el de release.js)
//   SITE_URL           URL pública de la página, para canonical y og:* (por defecto, la de GitHub Pages)
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REPO, escapeHtml, fromGithubRelease } from './release.js';

const raiz = dirname(fileURLToPath(import.meta.url));
const salida = join(raiz, '..', 'dist');
const repo = process.env.GITHUB_REPOSITORY || REPO;
const [dueno, nombre] = repo.split('/');
const urlPorDefecto = `https://${dueno}.github.io/${nombre}/`;
const siteUrl = (process.env.SITE_URL || urlPorDefecto).replace(/\/?$/, '/');

const cabeceras = { accept: 'application/vnd.github+json', 'user-agent': 'metrik-releases-site' };
if (process.env.GITHUB_TOKEN) cabeceras.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: cabeceras });
if (!res.ok) throw new Error(`No se pudo leer la última release de ${repo}: HTTP ${res.status} ${await res.text()}`);
const vm = fromGithubRelease(await res.json());
if (!vm.tag) throw new Error('La release no tiene etiqueta (tag_name).');
if (!vm.installer) console.warn(`aviso: la release ${vm.tag} no tiene instalador .exe; el botón llevará a la página de la release.`);

let html = await readFile(join(raiz, 'index.html'), 'utf8');

function texto(clave, valor) {
  const re = new RegExp(`(<(\\w+)\\b[^>]*\\bdata-release="${clave}"[^>]*>)[^<]*(</\\2>)`, 'g');
  let n = 0;
  html = html.replace(re, (_, abre, _tag, cierra) => { n++; return abre + escapeHtml(valor) + cierra; });
  if (!n) console.warn(`aviso: index.html no tiene data-release="${clave}"`);
}
function atributo(clave, attr, valor) {
  const re = new RegExp(`(\\bdata-release="${clave}"[^>]*\\b${attr}=")[^"]*(")`, 'g');
  let n = 0;
  html = html.replace(re, (_, abre, cierra) => { n++; return abre + escapeHtml(valor) + cierra; });
  if (!n) console.warn(`aviso: index.html no tiene data-release="${clave}" con ${attr}`);
}

texto('version', vm.version);
texto('date', vm.dateText);
atributo('date', 'datetime', vm.publishedAt);
texto('size', vm.installer ? vm.installer.sizeText : '');
texto('installer-name', vm.installer ? vm.installer.name : 'METRIK-Setup.exe');
texto('sha256', vm.sha256);
atributo('download', 'href', vm.installer ? vm.installer.url : vm.releaseUrl);
atributo('release-url', 'href', vm.releaseUrl);
atributo('releases-url', 'href', vm.releasesUrl);

// Notas de la versión: el bloque entero se reemplaza; si no hay notas, se muestra el aviso.
html = html.replace(
  /(<div\b[^>]*\bdata-release="notes"[^>]*>)[\s\S]*?(<\/div>)/,
  (_, abre, cierra) => `${vm.notesHtml ? abre : abre.replace(/>$/, ' hidden>')}\n          ${vm.notesHtml}\n        ${cierra}`,
);
if (!vm.notesHtml) html = html.replace(/(\bdata-release="notes-empty")\s+hidden\b/, '$1');

// Datos de la release para app.js, y URL pública para canonical/og.
const json = JSON.stringify(vm).replace(/</g, '\\u003c');
html = html.replace(/(<script id="release-data" type="application\/json">)[\s\S]*?(<\/script>)/, `$1${json}$2`);
html = html.replaceAll(urlPorDefecto, siteUrl);

await rm(salida, { recursive: true, force: true });
await mkdir(salida, { recursive: true });
await writeFile(join(salida, 'index.html'), html);
await writeFile(join(salida, 'latest.json'), JSON.stringify(vm, null, 2) + '\n');
for (const f of ['styles.css', 'app.js', 'release.js']) await cp(join(raiz, f), join(salida, f));
await cp(join(raiz, 'icons'), join(salida, 'icons'), { recursive: true });
await writeFile(join(salida, '.nojekyll'), '');

console.log(`Página generada en dist/ con METRIK ${vm.version} (${vm.dateText}${vm.installer ? `, ${vm.installer.sizeText}` : ''}) → ${siteUrl}`);
