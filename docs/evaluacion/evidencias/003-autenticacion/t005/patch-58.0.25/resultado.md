# T005 — Parche Expo autorizado y comprobación Web

13/11/2026, America/Lima. Continuación por Codex en main/0ccd33c, conservando cambios
documentales y dependencias de la ejecución anterior. Sin commit/push ni T006+.

## Resultados nuevos

| Comando | Código | Resultado |
| --- | --- | --- |
| npm.cmd install --save-exact expo@58.0.25 | 0 | Un paquete cambiado; sin añadidos/removidos. |
| npm.cmd ls --depth=0 | 0 | Árbol directo correcto; Expo58.0.25, SDK Supabase2.119.0 y SecureStore58.0.3. |
| npx.cmd --no-install expo install --check | 0 | Dependencies are up to date. |
| npx.cmd --yes expo-doctor@1.21.8 | 0 | 20/20 checks passed. |
| npm.cmd audit --json | 1 | Ocho moderados, sin altos/críticos; no auditoría aprobada. |
| npm.cmd audit --omit=dev --json | 1 | Tres moderados. |
| node .artifacts/t005-patch/browser-probe.cjs (Chrome headless) | 0 | Capacidades Web descritas abajo. |

CI=1 para Check/Doctor, sin fixes interactivos. Doctor temporal, sin instalación global.
Logs anteriores 19/20 y Expo58.0.24 se conservan en directorio padre, sin reescribirlos.

## Revisión package/lock

Respecto del estado inmediatamente anterior: package.json solo cambia expo de ~58.0.24
a 58.0.25 exacta. Lock: solo objeto raíz y entrada node_modules/expo (version/resolved/
integrity). Cero paquetes transitivos añadidos, eliminados o modificados. React19.3.0,
RN0.88.1, RNWeb0.21.4, Router58.0.31, SDK2.119.0 y SecureStore58.0.3 no cambiaron.
lock-diff.json documenta ese cotejo; no app.json, código funcional ni Cloud modificados.

## Auditoría comparada

La instalación reportó nueve moderados, mientras la consulta audit posterior reportó ocho;
omit=dev mantuvo tres. Comparación con la ejecución T005 anterior en audit-comparison.json:
eslint-config-expo deja de aparecer y cambia propagación/metadatos de cuatro paquetes
typescript-eslint, sin avisos nuevos; la rama de producción conserva los tres y mismos datos.
El lock no cambió esa rama ESLint. No atribuir reducción a actualización de esos paquetes
ni concluir remediación: es diferencia entre respuestas de auditoría en momentos distintos.
Permanece riesgo pendiente de análisis/remediación o aceptación formal; no se aplicaron
audit fix, force, overrides ni exclusiones para hacer pasar controles.

## Web real, alcance limitado

Se lanzó Chrome instalado en modo headless, perfil separado bajo .artifacts/t005-patch,
servidor HTTP efímero en 127.0.0.1 cerrado al terminar, sin tocar pestañas del usuario.
No descargas de navegador, Cloud, credenciales, datos ficticios, builds ni bundles Expo.
probe-source.txt contiene el diagnóstico reproducible; no es implementación Auth de 003.
Primer intento restringido terminó sin resultado (proceso Chrome 2147483651, operador 1);
repetición con permiso fuera del sandbox completó código 0. No se deshabilitó seguridad
del navegador. Perfil temporal/cachés quedan ignorados, fuera de evidencias versionables.

web-capabilities.json acredita contexto seguro localhost, URL y URLSearchParams con
roundtrip, crypto.getRandomValues invocado y crypto.subtle.digest SHA-256 con salida de
32 bytes, en Chrome157 headless Windows. Solo flags, no valores aleatorios ni secretos.
No es prueba de login, sesión o SDK en Expo Web ni auditoría XSS. No valida otros orígenes,
políticas de hosting ni navegadores; no es evidencia Hermes. La prueba Node anterior
permanece etiquetada exclusivamente Node.

## Estado T005

Instalación y controles de dependencias aprobados; T005 continúa sin marcar únicamente
porque URL/URLSearchParams y criptografía segura en Hermes no se probaron en runtime
Android real. No runtime Android accedido ni APK/EAS/adb/herramientas añadidos; seguir
restricciones antes de preparar esa comprobación. No polyfills por suposición.
Total completado 4/36. T006–T009 no ejecutadas. Log activo 002 no editado ni detenido.
