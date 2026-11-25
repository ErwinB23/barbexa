# T012–T016 — resultado del bloque

14/11/2026. **15/34**: T012,T014,T015,T016 verificadas; **T013 pendiente**. No T017+.
Spec/plan/contratos coherentes con cancelación120min configurable, invitación consentida,
admin profesional explícito y exclusión de persona entre tenants. Checklist documental16/16
solo leído. SpecKit resolvió004 mediante override temporal; sin hooks registrados.

## T012 y T013

Cliente compartido: aplicación/puerto de gestión, adaptador HTTP, composición explícita y
contexto React. Reutiliza Auth/SecureStore003, creación de barbería002 y Edge/RPC de oferta
existentes. Formularios/rutas barbershop-admin,staff,services,schedules; enlace desde Mi
cuenta. Crear barbería sin membresías es válido; configuración solo con contexto admin.
Invitaciones propias permiten aceptar/rechazar sin conceder autoridad por su estado pendiente.
El servidor sigue siendo la autoridad. No se instala una nueva biblioteca UI.

Token solo dentro de composición/adaptador, se valida usuario con Auth. HTTP LAN solo bajo
la excepción Development existente; producción no la hereda. No rol global. Mutación duplicada
bloqueada, respuestas descartadas tras cambio de cuenta/generación/contexto; la ruta remonta
su formulario al cambiar ese alcance. Controles AppTextField/AppButton/Screen existentes,
48dp/roles/labels/scroll/zonas seguras conservados; no se atribuye TalkBack nuevo.

Pruebas:4 de aplicación,4 de adaptador,6 de presentación con dobles Web/Android; más9
regresiones directamente afectadas de registro/navegación/sesión: **23/23**, exit0.
El runner unitario se ejecutó porque el nuevo núcleo entra automáticamente en su gate:
**137/137**,100% líneas/funciones y94,38% ramas globales del núcleo. No cobertura atribuida
al SQL, SDK, UI ni Hermes. Los tests con dobles no son pruebas funcionales en dispositivos.

API pública de oferta comprobada sin usuarios ni escrituras: OPTIONS204 para localhost:8081,
POST sin sesión401 con CORS de ese origen y origen ajeno403 sin cabecera coincidente ni `*`.
[Resultado](offering-cors.json). El primer operador exigía erróneamente ausencia total de
ACAO ante origen rechazado; recibió la cabecera fija del origen permitido, que no autoriza
al origen ajeno. Se corrigió solo esa expectativa y se repitieron esas tres consultas,
exit0; [historial inicial](offering-cors-initial.json). No cambió Kong, JWT o el handler.
Fundamento de comparación: [Fetch/CORS](https://fetch.spec.whatwg.org/#cors-check).

T013 requiere preparar/publicar oferta, invitación/aceptación y admin-profesional desde
Web e inmediatamente Android, incluyendo ajeno/vacío/error. No se hizo ese recorrido ni
se creó un segundo conjunto de datos. [Web](../operation-web.md), [Android](../operation-android.md).

## T014–T016 y controles

Ver [motor atómico](../atomic.md), que conserva el fallo inicial, corrección de expectativa,
pruebas SQL/RLS, diez pares reales y limpieza. Las8 pruebas de aplicación cliente/servidor
de T014 siguen **RED previsto** (exit1) hasta T017; contienen las aserciones de comportamiento
que deberán volverse GREEN allí, no se cambió el checker ni se simuló una Edge de reservas.

| Comando ejecutado | Resultado/código |
| --- | --- |
| `supabase migration new booking_atomic` por CLI local | archivo20261114224344,0 |
| `npx.cmd --no-install supabase db push --dry-run --skip-vault` | solo nueva migración/127.0.0.1:54422,0 |
| `npx.cmd --no-install supabase db push --skip-vault` | aplicación local única,0 |
| `node scripts/booking-atomic-sql.mjs` | RED13/18 fallan previsto/1; GREEN18/18,0 |
| `node --test tests/unit/reservations/confirmation.red.mjs tests/server/reservations/confirmation.red.mjs` |8 RED previstos para T017,1 |
| `node tests/integration/booking/concurrency.mjs` con entorno local explícito |14 escenarios y10 pares pasan; expectativa HTTP incorrecta al final,1; limpieza completada |
| `node tests/integration/booking/atomic-followup.mjs` durante el mismo conjunto | P0002/500,17 cabeceras sin parciales,0 |
| `node --test` archivos operation-client,operation-http,booking/operation y tres UI afectadas |23/23,0; [log](tests.log) |
| `node scripts/run-unit-tests.mjs` |137/137 y gate de cobertura,0; [log](unit-coverage.log) |
| `npm.cmd run typecheck` |0; [log](types.log) |
| checkers cliente/servidor |88/24 módulos, sin infracciones,0; logs architecture-*.log |
| ESLint y Prettier, archivos afectados |0; logs lint.log/format.log |

[Postcheck de solo lectura](postcheck.json):9 migraciones, owners/ACL/search_path de7
funciones nuevas,2 usuarios/perfiles anteriores y0 reservas/items/eventos/huérfanos.
No se inició ninguna operación sobre Cloud. Los logs nuevos normalizan solo espacios
al final de línea; no se editó ningún registro histórico ni el log activo.

Fallos de preparación: pgTAP ausente en el primer intento transaccional; setup corregido.
Tipos señalaron una unión de filas de horario y StatusMessage sin onRetry; corregidos sin
cambiar tipos/reglas. Lint detectó actualización síncrona desde efecto; petición inicial
asíncrona tras commit y callback de respuesta. La lectura de membresías usa user_id real,
traducido a tipo propio, cubierto por regresión. No se debilitaron expectativas de negocio.

Se preservan cambios anteriores, log activo, cuentas previas y entornos antiguo/reproducción.
No Cloud, dependencias, APK, correos, commits ni push. Nueve avisos npm sin remediación.
003 permanece24/36 y recuperación obligatoria antes de evaluación. Próximo backend T017,
después T018 para crear desde Android y T020–T023 para consulta de agenda en Web.

Revisión final:65 archivos examinados inicialmente, sin hallazgos de literales JWT/claves
privadas/URLs firmadas ni enlaces locales rotos; [metadatos actualizados](revision-final.json).
`git diff --check` global2 únicamente por el log activo; excluyendo solo ese archivo0.
Git main/0ccd33c, ningún archivo staged, sin commit/push. Los archivos nuevos también se
revisaron, aunque Git no los incluye en el diff sin seguimiento.
