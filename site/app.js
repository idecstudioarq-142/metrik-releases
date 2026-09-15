// Comportamiento de la página en el navegador:
//  1. Si GitHub tiene una release más nueva que la publicada con la página, actualiza los datos.
//  2. Botón «Copiar» del SHA-256.
import { API_LATEST, fromGithubRelease } from './release.js';

const todos = (sel) => Array.from(document.querySelectorAll(sel));

function render(vm) {
  const texto = (clave, valor) => todos(`[data-release="${clave}"]`).forEach((el) => { el.textContent = valor; });
  const enlace = (clave, valor) => todos(`a[data-release="${clave}"]`).forEach((el) => { el.href = valor; });

  texto('version', vm.version);
  texto('date', vm.dateText);
  todos('time[data-release="date"]').forEach((el) => { el.dateTime = vm.publishedAt || ''; });
  texto('size', vm.installer ? vm.installer.sizeText : '');
  texto('installer-name', vm.installer ? vm.installer.name : 'METRIK-Setup.exe');
  texto('sha256', vm.sha256 || '');
  enlace('download', vm.installer ? vm.installer.url : vm.releaseUrl);
  enlace('release-url', vm.releaseUrl);
  enlace('releases-url', vm.releasesUrl);
  todos('[data-release="notes"]').forEach((el) => { el.innerHTML = vm.notesHtml; el.hidden = !vm.notesHtml; });
  todos('[data-release="notes-empty"]').forEach((el) => { el.hidden = !!vm.notesHtml; });
}

function publicado() {
  try {
    const datos = JSON.parse(document.getElementById('release-data')?.textContent || 'null');
    return datos && datos.tag ? datos : null;
  } catch {
    return null;
  }
}

async function refrescar() {
  const base = publicado();
  try {
    const res = await fetch(API_LATEST, { headers: { accept: 'application/vnd.github+json' } });
    if (!res.ok) return; // sin permiso o límite de la API: se queda lo publicado
    const vm = fromGithubRelease(await res.json());
    if (!vm.tag || (base && base.tag === vm.tag)) return;
    render(vm);
  } catch {
    // sin red: se queda lo publicado
  }
}

function botonesCopiar() {
  todos('button[data-copiar]').forEach((btn) => {
    const etiqueta = btn.querySelector('span');
    btn.addEventListener('click', async () => {
      const valor = document.querySelector(`[data-release="${btn.dataset.copiar}"]`)?.textContent?.trim() || '';
      if (!valor) return;
      try {
        await navigator.clipboard.writeText(valor);
        btn.classList.add('listo');
        if (etiqueta) etiqueta.textContent = 'Copiado';
        setTimeout(() => { btn.classList.remove('listo'); if (etiqueta) etiqueta.textContent = 'Copiar'; }, 1600);
      } catch {
        if (etiqueta) etiqueta.textContent = 'No se pudo';
        setTimeout(() => { if (etiqueta) etiqueta.textContent = 'Copiar'; }, 1600);
      }
    });
  });
}

botonesCopiar();
refrescar();
