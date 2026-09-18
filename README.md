# METRIK — Instaladores

Este repositorio aloja únicamente los instaladores de METRIK. No contiene el código fuente del programa.

**Página de descarga:** https://idecstudioarq-142.github.io/metrik-releases/

METRIK es un sistema profesional de presupuestos y análisis de precios unitarios para obra pública del Ecuador (normativa SERCOP), desarrollado por IDEC.

## Requisitos

Windows 10 u 11 de 64 bits.

## Cómo instalar

1. Descarga el archivo `METRIK-Setup-<versión>.exe` de la última versión publicada, en la sección **Releases**.
2. Comprueba que el archivo es el auténtico (opcional, recomendado). En PowerShell, dentro de la carpeta de descargas:

   ```powershell
   Get-FileHash .\METRIK-Setup-*.exe -Algorithm SHA256
   ```

   El resultado debe coincidir con el SHA-256 publicado en la página de descarga o en las notas de esa versión. Si no coincide, no lo ejecutes y escríbenos.
3. Ejecútalo. Si Windows muestra «Windows protegió su PC», elige **Más información** y después **Ejecutar de todas formas**. Ese aviso aparece porque el instalador todavía no tiene reputación en SmartScreen; por eso conviene comprobar el SHA-256 antes.

Sin licencia, METRIK funciona como prueba gratis durante 15 días.

## Cómo actualizar

Si ya tienes METRIK instalado, no necesitas hacer nada: al abrirlo busca la versión nueva, la descarga en segundo plano y la instala cuando cierras el programa. Tus proyectos y tus bases de precios se conservan.

Descarga METRIK solo desde este repositorio o desde la página de descarga. Ninguna otra fuente es oficial.

## Soporte

ventas@metrik-app.com

Para reportar un problema de seguridad, lee [SECURITY.md](SECURITY.md).

## Página web

La página de descarga vive en `site/` y se publica sola en GitHub Pages con `.github/workflows/pages.yml`: en cada release publicada, editada o borrada, y en cada cambio de `site/` en `main`. Al publicarse toma de la última release la versión, la fecha, el tamaño, el SHA-256 y las notas; si más tarde aparece una release más nueva, la página la muestra al abrirse.

Para probarla en la máquina: `node site/build.mjs` genera `dist/`.

---

© 2026 IDEC. Todos los derechos reservados.
