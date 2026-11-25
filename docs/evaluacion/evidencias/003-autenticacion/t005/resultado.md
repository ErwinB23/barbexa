# T005 — Instalación autorizada, aceptación pendiente

**Continuación**: [parche autorizado Expo58.0.25](patch-58.0.25/resultado.md) resolvió
Check/Doctor (0 y 20/20). Auditoría nueva ocho moderados/tres sin dev, sin remediación
acreditada; capacidades Chrome localhost aprobadas. T005 sigue pendiente solo de Hermes.
El resto de este archivo conserva resultados históricos anteriores al parche.

13/11/2026, America/Lima. Ejecución por Codex. Inicio main/0ccd33c, con cambios
documentales autorizados previos y log activo 002; staging vacío, sin commit/push.

## Comandos y códigos reales

| Comando | Código | Resultado |
| --- | --- | --- |
| npm.cmd install --save-exact @supabase/supabase-js@2.119.0 expo-secure-store@58.0.3 | 0 | Añadidos 10 paquetes, auditoría de instalación reporta nueve moderados. |
| npm.cmd ls --depth=0 | 0 | Árbol directo sin errores, versiones exactas instaladas. |
| npx.cmd --no-install expo install --check | 1 | Expo 58.0.24, versión esperada ~58.0.25. |
| npx.cmd --yes expo-doctor@1.21.8 | 1 | 19/20; único fallo de versión de Expo, mismo diagnóstico. |
| npm.cmd audit --json | 1 | Nueve moderados; no auditoría aprobada. |
| npm.cmd audit --omit=dev --json | 1 | Tres moderados. |
| Prueba de capacidades/importación en Node | 0 | URL/URLSearchParams/getRandomValues/subtle disponibles; SDK importa sin crear cliente ni conectar servicios. |

Expo check/Doctor se ejecutaron con CI=1 para impedir correcciones interactivas. Doctor
se descargó temporalmente mediante npx, sin paquete global ni dependencia del proyecto.
No se ejecutaron sugerencias audit fix/force ni se actualizaron frameworks por iniciativa.

## Cambios revisados

package.json solo añade las dos dependencias exactas. Lock v3 añade esas dos y ocho
transitivas: @supabase/auth-js, functions-js, postgrest-js, realtime-js, storage-js (2.119.0),
@supabase/phoenix 0.4.5, iceberg-js 0.8.1 y tslib 2.8.1. Son ramas del SDK autorizado:
phoenix depende de realtime-js, iceberg-js de storage-js y tslib de módulos Supabase.
No removidos ni cambios en entradas anteriores; solo dependencias del objeto raíz
cambiaron. Sin app.json, código de aplicación, configuración Cloud ni plugins modificados.
lock-diff.json registra comparación con copias previas ignoradas fuera de evidencia pública.

## Auditoría antes/después

audit-comparison.json compara informes anteriores T002 y posteriores T005: nueve totales
y tres omit=dev, mismos paquetes, rangos, avisos y propuestas de fix; cero avisos agregados,
retirados o modificados en estos informes. No remediación ni aceptación formal del riesgo.
Los nuevos módulos no tienen avisos reportados en esta consulta, lo cual no demuestra
ausencia de vulnerabilidades. No análisis de explotación ni seguridad global aprobada.

## Compatibilidad y límites

SecureStore 58.0.3 coincide con bundledNativeModules del Expo instalado; su almacenamiento
nativo no está disponible en Web, donde se adaptará persistencia según el plan. Node24.21.0
cumple engines >=22 del SDK. React19.3.0, RN0.88.1, RNWeb0.21.4 y Router58.0.31 quedaron
sin cambios; npm no reportó conflicto de dependencias. Esto no acredita ejecución Hermes
o navegador. Expo check y Doctor requieren un parche más reciente del propio Expo y fallan:
no se actualizó 58.0.24 ni se añadió expo.install.exclude para ocultarlo.

node-capabilities.json corresponde exclusivamente a Node, no a Hermes ni navegador real.
No se abrió dispositivo, Metro, app, build ni emulador para una sonda de capacidades.
URL/URLSearchParams y criptografía segura en Hermes siguen sin acreditar; no se añadieron
polyfills ni herramientas adicionales. Tampoco se implementó persistencia de T007.

## Estado y desbloqueo

T005 sigue [ ]: instalación correcta, pero Expo check/Doctor no pasan y falta prueba Hermes.
Detener antes de T006–T009. Una actualización de Expo a un parche compatible requiere
autorización concreta nueva, revisión de su diff y repetición de controles afectados.
La prueba Hermes requiere runtime Android disponible y procedimiento técnico autorizado;
Node no la sustituye. No build EAS/APK ni datos ficticios ni Google en esta ejecución.

Evidencias: install.log, npm-ls.log, expo-check.log, expo-doctor.log, expo-codes.json,
audit-total.json, audit-produccion.json, audit-codes.json, audit-comparison.json,
lock-diff.json y node-capabilities.json. Resultados iniciales se conservan sin convertirlos
en aprobaciones. El log activo de 002 permanece intacto y excluido de cualquier staging.
La copia pública de expo-doctor.log elimina solo espacios al final de dos líneas de su
tabla; conserva diagnóstico/código, con salida original en .artifacts/t005 ignorado.
