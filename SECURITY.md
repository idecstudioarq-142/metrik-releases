# Política de seguridad

## Versiones con soporte

Solo la última versión publicada en **Releases** recibe correcciones. METRIK se actualiza solo al abrirse, así que basta con tenerlo instalado y abrirlo con conexión a internet.

## Cómo reportar una vulnerabilidad

Escribe a **ventas@metrik-app.com** con el asunto «Seguridad METRIK». No publiques el detalle en un lugar público hasta que te confirmemos que está corregido.

Incluye, si puedes:

- la versión de METRIK (está en «Acerca de», dentro del programa);
- los pasos para reproducir el problema;
- qué impacto tiene (por ejemplo, acceso a archivos, ejecución de código o fuga de datos).

Te confirmaremos la recepción y te mantendremos al tanto hasta cerrar el caso.

## Cómo comprobar que un instalador es auténtico

- Descárgalo solo desde este repositorio o desde la página de descarga oficial. Ninguna otra fuente es oficial.
- Compara el SHA-256 del archivo con el publicado en la página de descarga o en las notas de la versión. En PowerShell, dentro de la carpeta de descargas: `Get-FileHash .\METRIK-Setup-*.exe -Algorithm SHA256`.
- Si el hash no coincide, no lo ejecutes y avísanos.

Las actualizaciones automáticas se descargan de este mismo repositorio por HTTPS, y METRIK comprueba el hash SHA-512 publicado en `latest.yml` antes de instalarlas.

## Qué no cubre esta política

Este repositorio solo aloja instaladores. Los problemas de uso del programa (errores, funciones, licencias) van por el correo de soporte normal: ventas@metrik-app.com.
