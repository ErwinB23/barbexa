# Sonda temporal Android/Hermes — resultado manual confirmado y sonda retirada

El 13/11/2026 el usuario confirmó desde Android/Expo Go y React Native DevTools:
Hermes=true, URL=true, URLSearchParams=true, expoCryptoGetRandomValues=true.
Origen: prueba manual declarada por el usuario; no ejecutada automáticamente por Codex.
No se deducen versiones nuevas de dispositivo/Expo Go de esta confirmación.

Codex retiró completamente la instrumentación y el import useEffect exclusivo en
app-provider.tsx, que volvió al contenido versionado original. expo-crypto58.0.8 se
conserva como dependencia autorizada. No hay polyfill global; su disponibilidad no se
confunde con globalThis.crypto.getRandomValues. T005 queda acreditada con estos resultados,
las dependencias/control Expo anteriores y comprobaciones de tipos/lint tras retirar sonda.

## Procedimiento histórico preparado (ya no instrumentado)

Preparada el 13/11/2026 en src/composition/app-provider.tsx, dentro de useEffect y __DEV__.
Importa expo-crypto dinámicamente y llama getRandomValues(new Uint8Array(16)); imprime
solo booleanos bajo etiqueta [T005 expo-crypto], sin bytes, credenciales ni errores internos.
No modifica globalThis.crypto ni introduce polyfill. expo-crypto58.0.8 ya estaba instalado
al iniciar esta petición; Codex solo comprobó package.json/paquete, sin instalar nada.

Comprobaciones ejecutadas por Codex: tsc --noEmit del cliente (0); ESLint del archivo
app-provider.tsx con --max-warnings 0 (0). No se ejecutó runtime Android por Codex.

Usuario: abrir App Barbería en Expo Go conectada al Metro de este repositorio y recargar
(Reload). Cualquier pantalla monta el proveedor raíz. Buscar [T005 expo-crypto] en consola
JavaScript de la app; si Metro no reenvía logs, usar consola de React Native DevTools
conectada al dispositivo. Deben observarse Hermes, URL, URLSearchParams y
expoCryptoGetRandomValues; comunicar sus booleanos reales, incluso si alguno falla.

En ese momento T005 seguía pendiente. El resultado positivo ahora confirmado solo
acredita esta API de expo-crypto en ese runtime, no instala ni demuestra un polyfill global
ni verifica todavía integración PKCE del SDK o las funcionalidades de T006+.
