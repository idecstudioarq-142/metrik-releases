// Funciones puras compartidas por site/build.mjs (Node) y site/app.js (navegador).
// Convierten una release de la API de GitHub en los datos que muestra la página.

export const REPO = 'idecstudioarq-142/metrik-releases';
export const API_LATEST = `https://api.github.com/repos/${REPO}/releases/latest`;
export const RELEASES_URL = `https://github.com/${REPO}/releases`;

/** @param {any} r Objeto release de la API de GitHub. */
export function fromGithubRelease(r) {
  const tag = String(r.tag_name || '');
  const version = tag.replace(/^v/i, '') || String(r.name || '').replace(/^METRIK\s+/i, '');
  const assets = Array.isArray(r.assets) ? r.assets : [];
  const installer =
    assets.find((a) => /^METRIK-Setup-.*\.exe$/i.test(a.name)) ||
    assets.find((a) => /\.exe$/i.test(a.name));
  return {
    tag,
    version,
    releaseUrl: r.html_url || `${RELEASES_URL}/tag/${tag}`,
    releasesUrl: RELEASES_URL,
    publishedAt: r.published_at || '',
    dateText: formatDate(r.published_at),
    installer: installer
      ? { name: installer.name, url: installer.browser_download_url, size: installer.size, sizeText: formatSize(installer.size) }
      : null,
    sha256: sha256De(r.body, installer),
    notesHtml: notesToHtml(r.body || ''),
  };
}

/**
 * SHA-256 del instalador: el que dicen las notas de la versión y, si no lo
 * traen (desde la 1.5.157 las notas van en texto plano sin esa línea), el
 * «digest» que GitHub calcula del propio archivo subido.
 */
export function sha256De(body, installer) {
  const enNotas = String(body || '').match(/SHA-?256:?\s*([0-9a-f]{64})/i);
  if (enNotas) return enNotas[1].toLowerCase();
  const digest = String((installer && installer.digest) || '').match(/^sha256:([0-9a-f]{64})$/i);
  return digest ? digest[1].toLowerCase() : '';
}

/** Fecha en español y en hora del Ecuador: «14 de septiembre de 2026». */
export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('es-EC', { timeZone: 'America/Guayaquil', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/** Tamaño redondeado en megabytes decimales, como lo muestra el navegador al descargar. */
export function formatSize(bytes) {
  const n = Number(bytes);
  if (!n || n <= 0) return '';
  return `${Math.round(n / 1e6)} MB`;
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function inline(s) {
  return escapeHtml(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/** Línea que solo es una regla («=====» o «-----») del formato de texto plano. */
function esRegla(line) {
  return /^\s*[=\-_]{3,}\s*$/.test(line);
}

/** Título escrito todo en mayúsculas («PDF APAISADO»): sin minúsculas y con letras de verdad. */
function esTituloEnMayusculas(line) {
  const t = line.trim();
  return t.length >= 4 && t.length <= 120 && !/\p{Ll}/u.test(t) && (t.match(/\p{Lu}/gu) || []).length >= 3;
}

/**
 * Convierte el cuerpo de una release en HTML seguro. Entiende los dos formatos
 * usados hasta hoy: el Markdown sencillo (viñetas con «**título.** texto») y el
 * texto plano de la 1.5.157 en adelante (reglas de «====», títulos en
 * mayúsculas subrayados con «----», viñetas con «·»).
 * Quita la cabecera «METRIK x.y.z — fecha» y el pie «Instalador … SHA-256: …»,
 * que la página ya muestra por su cuenta. Todo el texto se escapa antes de
 * añadir las etiquetas propias, así que no entra HTML ajeno.
 */
export function notesToHtml(body) {
  const blocks = String(body).replace(/\r\n?/g, '\n').trim().split(/\n\s*\n/);
  const out = [];
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trimEnd()).filter((l) => l.trim() && !esRegla(l));
    if (!lines.length) continue;
    const text = lines.join(' ').trim();
    if (/^\*{0,2}METRIK\s+[\d.]+\*{0,2}/i.test(text)) continue;
    if (/^Instalador de METRIK/i.test(text) || /SHA-?256:/i.test(text)) continue;

    // Formato de texto plano: la primera línea en mayúsculas es el título del bloque.
    if (esTituloEnMayusculas(lines[0]) && !/^\s*[-*•·]\s+/.test(lines[0])) {
      out.push(`<h4>${inline(lines.shift().trim())}</h4>`);
      if (!lines.length) continue;
    }

    const items = [];
    const paras = [];
    for (const line of lines) {
      const m = line.match(/^\s*[-*•·]\s+(.*)$/);
      if (m) items.push(m[1]);
      else if (items.length && /^\s/.test(line)) items[items.length - 1] += ' ' + line.trim();
      else paras.push(line.trim());
    }
    const resto = lines.join(' ').trim();
    if (items.length && !paras.length) {
      out.push('<ul>' + items.map((i) => `<li>${inline(i)}</li>`).join('') + '</ul>');
    } else if (/^#{1,6}\s+/.test(resto)) {
      out.push(`<h4>${inline(resto.replace(/^#{1,6}\s+/, ''))}</h4>`);
    } else {
      out.push(`<p>${inline([...paras, ...items].join(' '))}</p>`);
    }
  }
  return out.join('\n');
}
