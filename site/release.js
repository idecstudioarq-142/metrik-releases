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
  const sha = String(r.body || '').match(/SHA-?256:?\s*([0-9a-f]{64})/i);
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
    sha256: sha ? sha[1].toLowerCase() : '',
    notesHtml: notesToHtml(r.body || ''),
  };
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

/**
 * Convierte el cuerpo (Markdown sencillo) de una release en HTML seguro.
 * Quita el título «**METRIK x.y.z** — fecha» y el pie «Instalador … SHA-256: …»,
 * que la página ya muestra por su cuenta. Todo el texto se escapa antes de
 * añadir las etiquetas propias, así que no entra HTML ajeno.
 */
export function notesToHtml(body) {
  const blocks = String(body).replace(/\r\n?/g, '\n').trim().split(/\n\s*\n/);
  const out = [];
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trimEnd()).filter((l) => l.trim());
    if (!lines.length) continue;
    const text = lines.join(' ').trim();
    if (/^\*\*METRIK\s+[\d.]+\*\*/i.test(text)) continue;
    if (/^Instalador de METRIK/i.test(text) || /SHA-?256:/i.test(text)) continue;

    const items = [];
    const paras = [];
    for (const line of lines) {
      const m = line.match(/^\s*[-*•]\s+(.*)$/);
      if (m) items.push(m[1]);
      else if (items.length && /^\s/.test(line)) items[items.length - 1] += ' ' + line.trim();
      else paras.push(line.trim());
    }
    if (items.length && !paras.length) {
      out.push('<ul>' + items.map((i) => `<li>${inline(i)}</li>`).join('') + '</ul>');
    } else if (/^#{1,6}\s+/.test(text)) {
      out.push(`<h4>${inline(text.replace(/^#{1,6}\s+/, ''))}</h4>`);
    } else {
      out.push(`<p>${inline([...paras, ...items].join(' '))}</p>`);
    }
  }
  return out.join('\n');
}
