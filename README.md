# METRIK — Instaladores

Este repositorio aloja únicamente los instaladores de METRIK. No contiene el código fuente del programa.

**Página de descarga:** https://idecstudioarq-142.github.io/metrik-releases/

METRIK es un sistema profesional de presupuestos y análisis de precios unitarios para obra pública del Ecuador (normativa SERCOP), desarrollado por IDEC.

## Cómo instalar

Descarga el archivo `METRIK-Setup` de la última versión publicada, en la sección **Releases**, y ejecútalo. Sin licencia, METRIK funciona como prueba gratis durante 15 días.

Si Windows muestra «Windows protegió su PC», elige **Más información** y después **Ejecutar de todas formas**.

## Cómo actualizar

Si ya tienes METRIK instalado, no necesitas hacer nada: al abrirlo busca la versión nueva, la descarga en segundo plano y la instala cuando cierras el programa. Tus proyectos y tus bases de precios se conservan.

## Soporte

ventas@metrik-app.com

## Página web

La página de descarga vive en `site/` y se publica sola en GitHub Pages con `.github/workflows/pages.yml`: en cada release publicada, editada o borrada, y en cada cambio de `site/` en `main`. Al publicarse toma de la última release la versión, la fecha, el tamaño, el SHA-256 y las notas; si más tarde aparece una release más nueva, la página la muestra al abrirse.

Para probarla en la máquina: `node site/build.mjs` genera `dist/`.
