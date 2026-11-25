# T002 — Dependencias y avisos npm

**Actualización T005**: SDK2.119.0, SecureStore58.0.3 y parche autorizado Expo58.0.25
instalados; [resultado actual](t005/patch-58.0.25/resultado.md). Check0/Doctor20 de20.
Audit posterior ocho moderados/tres sin dev, frente a nueve/tres previos; sin cambios
en rama ESLint del lock ni remediación acreditada. Web Chrome localhost comprobado;
T005 cerrada tras confirmación manual del usuario: Hermes/URL/URLSearchParams y
expo-crypto.getRandomValues true; sonda temporal retirada. expo-crypto58.0.8 instalado
previamente por el usuario y autorizado conservarlo; no polyfill global. El resto de este
documento conserva la línea base T002 anterior a esa instalación.

13/11/2026, America/Lima. Consultas ejecutadas por Codex, sin instalación ni cambios de lock.

## Comandos y resultados

| Comando | Código | Resultado |
| --- | --- | --- |
| npm audit --json | 1 | 9 moderados, 0 altos/críticos; audit-total.json |
| npm audit --omit=dev --json | 1 | 3 moderados; audit-produccion.json |
| npm explain minimatch --json | 0 | Rutas locales en minimatch-rutas.json |
| npm view @supabase/supabase-js@2.119.0 version engines dependencies dist.integrity --json | 0 | SDK existente en registro, Node >=22 |
| npm view expo-secure-store@58.0.3 version engines peerDependencies dist.integrity --json | 0 | Versión existente, peer Expo * |

Se usaron fetch-retries=0 y fetch-timeout=15000. Primer intento sin acceso de red falló
ENOTFOUND (códigos 1); conservado en intento-sin-red-*.json. Consultas repetidas con permiso
de red; consultas-codigos.json registra códigos reales, no se trata audit=1 como aprobación.

## Rutas y alcance

Los nueve son paquetes afectados/metavulnerabilidades, no nueve fallos independientes:

| Paquetes | Tipo | Ruta/observación |
| --- | --- | --- |
| expo | Directa de producción | expo → @expo/fingerprint → minimatch |
| @expo/fingerprint, minimatch | Transitivas de producción | Presentes también con omit=dev |
| eslint-config-expo | Directa dev | Dependencia declarada en devDependencies |
| @typescript-eslint/eslint-plugin, parser, type-utils, typescript-estree, utils | Transitivas dev | Herramientas lint/config Expo → parser/estree → minimatch |

Asociado: [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249),
amplificación de patrones glob, posible agotamiento de CPU/memoria; afectadas >=7 <11.0.1.
La instalación incluye minimatch 10.2.6 en fingerprint y rutas de herramientas.
Lectura de node_modules/@expo/fingerprint/build/utils/Path.js confirma uso de Minimatch
para patrones de rutas ignoradas. No se ejecutó exploit ni se demostró entrada desde
formulario/login al glob vulnerable. Clasificación npm producción no demuestra que código
de fingerprint entre al bundle o sea alcanzable en navegador/Android: análisis de bundle
y alcanzabilidad queda pendiente; tampoco puede descartarse riesgo de tooling/CI.

Frente a nueve reportados previamente: esta consulta vuelve a dar nueve; el antecedente
de ocho no acredita remediación. Bases de avisos/árbol/fecha pueden variar; no atribuir
causa exacta sin comparación histórica equivalente. No dependencias modificadas hoy.

## Remediaciones posibles, no ejecutadas

Audit propone Expo 52.0.49 y eslint-config-expo 6.0.0 con cambios mayores: incompatibles
con conservar SDK58, no recomendables como fix automático. Parser indica fixAvailable=true,
pero no justifica actualizar parcialmente toda la cadena sin resolver compatibilidad.
Investigar actualización oficial compatible de Expo/config y nuevas restricciones de
minimatch; override a 11 requiere pruebas de API y autorización, no imponerlo hoy.
Mientras tanto, evitar patrones no confiables en herramientas y conservar riesgo abierto.
No auditoría global aprobada ni aceptación formal del riesgo por el responsable.

## Base y nuevas necesidades

dependencias-locales.json acredita lock v3 coherente con dependencias raíz y versiones
instaladas de Expo58.0.24, Router58.0.31, Linking58.0.17, React19.3.0, RN0.88.1,
RNWeb0.21.4, TS6.0.3 y Supabase CLI3.1.0. Node24.21.0/npm11.19.0 verificados.

- SDK @supabase/supabase-js 2.119.0: propuesto para gestión oficial de sesión/eventos/PKCE;
  cinco módulos transitivos Supabase de esa versión. No instalado. Node actual satisface
  engines; eso no acredita compatibilidad Hermes/Web ni seguridad del árbol todavía ausente.
- SecureStore ~58.0.3: coincide con bundledNativeModules SDK58 y documentación; necesario
  Android, no Web. Sin fallback a almacenamiento plano; verificar tamaño/fallos reales después.
- expo-dev-client: necesidad adicional para la vía de development build con Metro prevista
  en quickstart; aún no instalado ni autorizado. Consultar versión SDK58 y árbol antes de
  añadirlo, según decisión de build. Un debug build sin dev-client tendría otro procedimiento.
- URL/crypto polyfills: no demostrados necesarios; no añadir por costumbre. Linking, Router,
  RNWeb, componentes UI y backend 002 se reutilizan. No SDK Google, BFF o librería UI.

SRI de metadatos es integridad publicada del paquete, no comprobación de un paquete
descargado ni aprobación de seguridad. Repetir análisis del diff del lock al autorizar T005.
