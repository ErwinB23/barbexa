# T005–T008 — núcleo y almacenamiento, alcance real

**Estado actualizado**: [T007 completada con evidencia manual Android](t007-android-manual.md),
sonda retirada, y [T008 completada](../t008/resultado.md). Total 8/36. Lo siguiente conserva
el histórico del primer bloque, cuando faltaba esa confirmación; no es el estado actual.

13/11/2026, America/Lima. Rama main/0ccd33c, cambios previos conservados, sin commit/push.
No dependencias instaladas, builds, Cloud, usuarios o fixtures de negocio creados.

| Tarea | Estado |
| --- | --- |
| T005 | Completada: confirmación Android del usuario en t005/hermes-probe.md y retirada total de sonda. Se conservan Expo58.0.25, SDK2.119.0, SecureStore58.0.3 y crypto58.0.8. Reutilizados Check0/Doctor20 de20 de la ejecución anterior; no repetidos. |
| T006 | Completada: identidad/estados/errores/puerto propios, invariantes verificadas; tipos y arquitectura pasan. |
| T007 | Parcial: adaptadores Web/native y diez pruebas automatizadas; Web real aprobado. Falta SecureStore Android real con roundtrip y valor extenso. No marcar completa con dobles. |
| T008 | No ejecutada: espera T007 verificada según secuencia aprobada. No adaptador SDK/proveedor/composición Auth anticipados. |

Total 6/36. T009 y posteriores no ejecutadas. Sin rol global, contraseñas persistidas,
claves administrativas o Math.random. No polyfill global; expo-crypto disponible no
equivale todavía a integración criptográfica con SDK/PKCE, que deberá verificarse al integrarlo.

## TDD, fallos y correcciones conservados

- T006 RED: compilación de tests (código 2) por módulos aún ausentes, t006-red.log.
- T007 RED: node:test (1), módulo storage aún ausente, t007-red.log.
- Auditoría inicial (1) detectó tres importaciones entre módulos de dominio/aplicación
  distintos, architecture.log. Lectura de permitted() confirmó restricción por feature.
  Se retiraron imports cruzados, manteniendo proyecciones propias estructurales para
  futuras conexiones por composición a 002. No checker alterado ni RPC duplicada.
- GREEN: cuatro pruebas agrupadas de identidad/ready/contexto/errores (0) y diez casos
  de almacenamiento con backends controlados (0), logs *green-final.log.

Las pruebas nativas controladas NO son acceso a SecureStore Android real. Verifican
el adaptador y su contrato, no el módulo nativo subyacente ni límites del dispositivo.

## Comprobaciones finales ejecutadas por Codex

| Comando | Código / alcance |
| --- | --- |
| node node_modules/typescript/bin/tsc --noEmit | 0, cliente y retirada de sonda |
| node node_modules/typescript/bin/tsc -p tsconfig.core.json --noEmit | 0, núcleo independiente |
| node node_modules/typescript/bin/tsc -p tsconfig.tests.json --pretty false | 0, compila tests existentes; solo los nuevos se ejecutaron |
| node --test .test-build/tests/unit/authentication/session-state.test.js | 0, 4/4 |
| node --test tests/integration/authentication/session-storage.test.mjs | 0, 10/10 |
| ESLint src/features/authentication, app-provider.tsx y dos archivos de pruebas nuevos, --max-warnings 0 | 0 |
| Prettier --check mismos archivos | 0 |
| node scripts/check-architecture.mjs | 0, 37 módulos/15 core/67 aristas, architecture-green.log |
| Sonda adaptador Web en Chrome headless/localhost | 0, t007-web-real.json |

Sonda Web usa los módulos TypeScript nuevos transpildos para diagnóstico, almacenamiento
localStorage real, perfil aislado y servidor efímero cerrado al terminar. Roundtrip de
valor técnico extenso y verifier, aislamiento namespace, corrupción rechazada y limpieza:
todos true. No cuenta Auth ni datos personales. Código diagnóstico en web-probe-source.txt;
no es build de Expo ni aceptación de flujos de autenticación. No auditoría XSS.

## Diseño de almacenamiento y límites

Namespace barberia.entorno.proyecto.clave con segmentos validados, get/set/remove async;
Web localStorage, Android exclusivamente SecureStore. Sobre JSON versionado detecta
formato corrupto/incompleto, no cifra Web ni acredita autenticidad/integridad criptográfica:
no protege contra XSS. Fallos de lectura/cuota/borrado se traducen a persistence-failed
sin detalles internos, sin éxito aparente ni limpieza amplia de otras claves.

No se introduce fragmentación: aún no existe evidencia de límite nativo que la exija.
Si el valor extenso falla realmente, medir límite y resolver antes de cerrar T007 sin
fallback a almacenamiento plano. Datos de sesión/verifier permanecen fuera del núcleo.
La prueba pendiente puede hacerse en Expo Go compatible, sin APK, pero requiere evidencia
real del usuario del adaptador nativo y limpieza posterior; crypto no prueba SecureStore.

No se reutiliza la autorización de crear fixtures de negocio: solo valores técnicos en
dobles/browser aislados, eliminados al concluir. Último audit reutilizado ocho moderados
totales/tres sin dev, sin remediación acreditada; no nueva auditoría en este bloque.
