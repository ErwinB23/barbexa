# Cierre de T013 y T015

Fecha local: 2026-11-12. Rama main, HEAD eb2d605; cambios previos de T012–T014 conservados.
Comprobaciones nuevas ejecutadas por Codex. Este registro actualiza el bloqueo histórico
de [t012-t015.md](t012-t015.md), sin borrar sus resultados.

## Destino y diagnóstico

Proyecto exclusivo app-barberia-002-local. Antes de SQL se verificaron nombre/ID del
contenedor, volumen supabase_db_app-barberia-002-local, red propia y puertos DB 54422/API
54421. Sin redes ni volúmenes compartidos con barberia-app. Estado y metadatos sin variables
de entorno en [t013-docker-reference.json](t013-docker-reference.json).
PostgreSQL 17.11 respondió; Auth health y REST raíz devolvieron HTTP 200 sin credenciales.
[Conectividad](t013-conectividad.log). Inicialmente había cero perfiles y cero auth.users.

Edge nuevo: exited/255, OOMKilled=false. Sus últimos logs solo muestran el arranque y
runtime v1.78.1; no contienen causa fatal suficiente para atribuir el cierre a OOM, handler
o configuración. [Lectura de logs](t013-edge-diagnostico.log). No se reinició: las suites SQL
y PostgREST funcionan independientemente; el handler pertenece a T017. No se diagnostican
ni operan los servicios antiguos a partir del comportamiento del nuevo.

## T013 completada: expectativas y RED funcional

Pruebas preparadas antes de habilitar acceso en supabase/tests/profiles.test.sql y
tests/integration/tenant-foundation/profiles.test.mjs. Casos: propiedad/columnas, PK/FK,
anonimato, perfil ajeno y metadata de administrador inventada, INSERT/DELETE directo,
RPC restringida y contratos JWT/body/metadata previstos.

El primer intento SQL abortó al consultar sin SELECT: diez assertions ejecutadas y tres
fallidas; [log inicial](t013-sql-red-inicial.log). Un intento intermedio con CASE tampoco
evitó la comprobación de permisos de las subconsultas. Se corrigió el harness con una
función temporal SECURITY INVOKER que captura excepciones como assertions fallidas.
No concede permisos ni cambia las expectativas de seguridad; desaparece con rollback.

RED final: **23 assertions terminadas, 12 fallos funcionales esperados, exit 1**; RPC/políticas
y permisos aún ausentes. Sin fallo de conexión ni TAP incompleto.
[Log RED](t013-t015-red.log). Comando: CLI fijada `test db supabase/tests/profiles.test.sql
--workdir <raíz absoluta>`, precedido de comprobación de identidad y aislamiento.

HTTP real: `node --test tests/integration/tenant-foundation/profiles.test.mjs`, exit 1;
[resultado](t013-http-restaurado.log). Tres denegaciones anónimas directas REST (lectura,
INSERT y DELETE) pasaron con HTTP 401. Las dos expectativas Edge 401 recibieron 503 por
runtime detenido; no son denegaciones de autenticación acreditadas. Falta además la
composición cliente de T018. La suite usa el guard assertLocalTarget aprobado y ninguna
credencial de montaje. El runner global aún falla cerrado por escenarios futuros ausentes;
no se declara que su integración completa se ejecutó.

T013 acredita preparación y RED, no seguridad HTTP completa. JWT válidos/expirados/ajenos,
body adversario autenticado y metadata real permanecen expectativas para T017–T019.
Los tres contratos unitarios HTTP anticipados de T012 siguen RED por handler ausente,
sin afirmar que una respuesta 503 de infraestructura satisface esos contratos.

## T015 completada: acceso y aprovisionamiento mínimos

CLI generó y aplicó exclusivamente
`supabase/migrations/20261113035717_profile_access_and_provisioning.sql`.
Timestamp UTC del 13/11, fecha local 12/11. `migration new` y `migration up`, ambos exit 0;
[generación](t013-t015-new.log), [aplicación](t013-t015-apply.log).
No se usó db reset, remoto ni se reescribió una migración aplicada.

- SELECT propio; UPDATE únicamente display_name/phone, con USING y WITH CHECK de auth.uid().
- Wrapper public.ensure_own_profile invoker y función privada definer, ambos search_path vacío,
  referencias calificadas, EXECUTE solo service_role y revocación PUBLIC en la transacción.
- SQL comprueba actor existente/no anónimo, valida nombre y normaliza teléfono. PK con
  ON CONFLICT DO NOTHING conserva el perfil existente y una consulta posterior lo devuelve.
- Sin INSERT/DELETE ordinario, UPDATE de id ni acceso directo service_role a tablas propias.
  El parámetro actor solo es válido a través de la frontera servidor restringida; no acredita
  una sesión por sí mismo. Auth verification/handler todavía no se implementaron.

Primera repetición posterior a migración: 29 assertions pasaron antes de un error de sintaxis
en delimitadores de pruebas nuevas. [Registro](t015-sql-green-inicial.log), exit 1. Se corrigió
solo el test; no se alteró la migración aplicada. Perfiles final: **39/39, exit 0** en
[t013-t015-green.log](t013-t015-green.log): incluye normalización, repetición sin sobrescritura,
actor nulo/inexistente, nombre inválido, ACL de funciones y tabla denegada al servicio.

La suite schema anterior falló una assertion de 118 porque exigía cero políticas en profiles;
[resultado conservado](t013-t015-schema-inicial.log). Se actualizó únicamente esa expectativa
para exigir exactamente profiles_select_own/profiles_update_own. Barberías y membresías
siguen sin políticas; se conservan todas las restricciones y assertions de grants.

`supabase test db --workdir <raíz absoluta>`: **157/157**, exit 0;
[ambas suites](t013-t015-all.log). `db lint --fail-on warning`, `db advisors` y `migration list`:
exit 0, sin hallazgos; logs t013-t015-lint.log, t013-t015-advisors.log y t013-t015-list.log.
El campo CLI denominado remote corresponde aquí al catálogo local 127.0.0.1:54422, no a un
proyecto remoto. Advisors sin hallazgos no equivale a auditoría de seguridad aprobada.

## Calidad, conservación y límites

[t015-calidad.log](t015-calidad.log): tipos cliente/core y server-core, ambos checkers,
lint/formato del HTTP test modificado, todos exit 0. No se modificó el núcleo T014 ni se
repitió su cobertura: sus resultados 73/73 cliente y 3/3 reglas servidor son evidencia previa.
No se declara npm run check completo aprobado mientras falten handlers/adaptadores.

[t015-conservacion.log](t015-conservacion.log): metadatos estables de los 12 contenedores
antiguos y ocho nuevos idénticos antes/después. Los estados cambiantes del vector antiguo
no se interpretan como reconfiguración. Ninguna operación de modificación o SQL contra
el entorno anterior. Consulta final nueva: cero perfiles y cero auth.users tras rollback.
No es un checksum de datos antiguos; no se leyeron sus bases.

T013 y T015 se marcan completadas. Siguiente: T016, sin ejecutar en este bloque.
C1 concurrente, integración JWT/Auth/Edge, remoto y seguridad multitenant completa siguen
pendientes. Nueve avisos npm moderados sin remediación. Sin dependencias nuevas, cambios
en Constitución/001, operaciones de contenedores, commit o push.

Fuentes consultadas: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[funciones PostgreSQL 17](https://www.postgresql.org/docs/17/sql-createfunction.html) y
[changelog](https://supabase.com/changelog.md). El comportamiento se verificó con CLI 3.1.0
local, no se aplicaron actualizaciones anunciadas allí.

Revisi?n final: git diff --check exit 0; 15 enlaces locales comprobados y sin hallazgos
de secretos en archivos nuevos. main/eb2d605 conservados. Los cambios previos de T012?T014
permanecen; los ?nicos archivos versionados modificados son informe.md, casillas de tasks.md
y la expectativa de pol?ticas de schema.test.sql descrita arriba.
