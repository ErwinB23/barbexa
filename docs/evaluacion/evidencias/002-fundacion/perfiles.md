# Perfiles — T016–T019

Fecha local: 2026-11-12. Rama main/eb2d605. Cambios previos de T012–T015 conservados.
Trabajo ejecutado por Codex. Sin commits, push, dependencias, migraciones ni remoto nuevos.
Checklist documental 002 aprobado previamente (16/16); sin hooks de implementación instalados.
Skills: Spec Kit, TDD, Supabase, depuración, networking Expo y verificación antes del cierre.

## Estado y componentes

T016, T017, T018 y T019 completadas, en ese orden de dependencias.

- Servidor: infrastructure/auth-verification-adapter.ts verifica Bearer contra Auth /user,
  exige id válido e identidad no anónima; ignora metadata. postgres-foundation-adapter.ts
  separa el transporte de servicio y convierte RPC/DTO/errores/timeout a contratos propios.
- Handler ensure-profile: actor exclusivamente verificado, validación estricta, body de
  máximo 8192 bytes leído por stream antes de JSON, 413/405/OPTIONS, CORS con allowlist
  por entorno (denegación si está vacía), correlación propia y logs solo requestId/status.
- Composición servidor e index: ensambla dependencias privadas por servicio; no secretos en
  cliente ni imports cruzados entre núcleos. Config ensure-profile.enabled=true; conserva
  verify_jwt=true. create-barbershop sigue deshabilitada y sin implementación.
- Cliente: tenant-foundation-http-adapter.ts y tenant-foundation-composition.ts. El runner
  consume la composición compilada real. Obtiene token inyectado, verifica identidad propia
  con Auth, usa Edge para ensure y PostgREST para GET/PATCH con proyección mínima. Rechaza
  claves privilegiadas en configuración pública, DTO inesperado y cardinalidad incorrecta;
  cero filas implica ausencia/no disponible, nunca éxito de una actualización inexistente.
- Runner: modo explícito --profiles; modo general conserva sus gates de escenarios futuros.
  Fixtures privilegiadas se aíslan en profile-environment.mjs; comprueba destino solicitado
  exacto, contenedor/red/volumen/puerto y ausencia de recursos antiguos compartidos antes de
  crear identidades. La composición recibe solo URL, clave pública y proveedor del JWT de
  usuario. No recibe claves de servicio ni el entorno completo.

## Edge: diagnóstico y recuperación limitada

[t017-docker-reference.json](t017-docker-reference.json) registra metadatos iniciales sin env.
DB 54422 y API 54421 comprobados: PostgreSQL 17.11, Auth health/REST raíz HTTP 200.
[t017-conectividad.log](t017-conectividad.log). Edge estaba exited/255, sin error Docker
explícito ni OOM; sus logs solo mostraban arranque. La causa original no puede afirmarse a
partir de esos datos. No se atribuye a un bug de handler que todavía no existía.

Se consultó ayuda CLI 3.1.0: functions serve es local y sirve las entradas habilitadas.
Tras verificar el ID/red del Edge nuevo se ejecutó `supabase functions serve --workdir
<raíz absoluta App-Barberia>`, sin --no-verify-jwt. Solo se reemplazó/levantó el runtime Edge
nuevo; no se reinició el stack. [t017-serve.log](t017-serve.log) registra arranque y correlación
sin tokens/body. Es un proceso de servicio activo, no un comando finalizado con exit 0.

[t019-conservacion.json](t019-conservacion.json): Edge final running y configuración efectiva
ensure-profile.verifyJWT=true; siete contenedores nuevos ajenos a Edge idénticos; 12 antiguos
idénticos en IDs/imágenes/montajes/redes/puertos. Ningún volumen/red antiguo compartido.
No se leyeron ni modificaron datos antiguos. No es checksum lógico de sus bases.

## Pruebas y códigos de salida

| Grupo | Resultado nuevo | Evidencia |
| --- | --- | --- |
| T016 anticipado | RED exit 1 por adaptadores ausentes | t016-red.log |
| T016 adaptadores | 4/4 grupos, exit 0 | t016-green.log |
| T017 anticipado | RED exit 1 por handler ausente | t017-red.log |
| Deno servidor completo | 13/13, exit 0 | t019-server-tests.log |
| npm test | 75 unitarias, 38 arquitectónicas cliente, 45 servidor, 11 presentación y 18 runner; todas aprobadas, exit 0 | t019-npm-test.log |
| SQL real | 118 esquema + 39 perfiles = 157/157, exit 0 | t019-sql.log |
| HTTP real / composición | 8 resultados TAP, 0 fallos/skip; exit 0 | t019-http-guard-final.log |
| Tipos y Deno check del entry implementado | exit 0 | t019-types.log, t019-client-core.log, t019-server-core.log, t019-deno-check.log |
| Lint/formato y ambos checkers | exit 0 | t019-lint.log, t019-format.log, t019-client-architecture.log, t019-server-architecture.log |

Las unitarias T018 también tuvieron RED antes del adaptador/composición, t018-red.log;
GREEN posterior en t018-green.log. Pruebas de transporte cubren modos secret-key apikey-only
y legacy service JWT separado, DTO malformado, cero filas, Auth inválido/anónimo, error y timeout.
El modo legacy además se ejercitó contra la RPC local; el modo moderno solo con doble,
sin atribuirle integración remota inexistente.

Cobertura nueva de núcleo: cliente 100 % líneas/funciones/ramas en t019-npm-test.log;
servidor 100 % por separado en t019-server-coverage.log. No es cobertura de adaptadores,
handler, SQL, RLS ni UI. npm test no se presenta como npm run check completo: el deno task
genérico todavía referencia create-barbershop/index.ts, perteneciente a T025. Se comprobó
explícitamente el entry ensure-profile real, sin crear stubs ni desactivar gates.

## Matriz HTTP realmente ejecutada

Tres identidades sintéticas se crearon con API administrativa LOCAL y se autenticaron con
password aleatorio en memoria; tokens válidos emitidos realmente por Auth. Nunca se guardan
credenciales ni respuestas Auth. La segunda identidad representa a la futura administradora
compañera; no se crearon barberías/membresías fuera del alcance.

1. Ausencia propia, ensure, repetición sin sobrescritura, GET y PATCH con omitido/null.
2. GET/PATCH ajeno devuelven filas vacías; ambos perfiles conservan sus datos, incluso con
   metadata manipulada de administrador (no concede permisos).
3. userId/actorId/role/status en body, JSON malformado, nombre vacío y tipos inválidos: 400,
   sin cambios propios/ajenos. La identidad siempre procede de la verificación Auth.
4. RPC privilegiada ordinaria, INSERT, DELETE y cambio de id: 403; sin mutaciones.
5. Sin JWT, JWT alterado, expirado y clave/issuer ajenos: 401 real del entorno objetivo.
6. C1: dos llamadas simultáneas mediante barrera de inicio en el cliente real, distinto nombre,
   ambas respuestas iguales al ganador y una sola fila final. No mocks ni llamadas secuenciales.
7. Body mayor de 8 KiB: 413. Método GET del handler: 405.

TAP cuenta siete subcasos y su caso padre: ocho resultados, no ocho usuarios ni ocho matrices
completas de producto. Assertions y limpieza están en profiles.test.mjs.

Los JWT negativos de expiración/emisor ajeno son **entradas de prueba criptográficas**, no
respuestas HTTP simuladas: se construyen en memoria y se envían al gateway/Auth reales.
El expirado usa firma local y claims de una sesión real; un control con vigencia futura y
misma firma fue aceptado por /auth/v1/user (200), evitando confundir expiración con firma mala.
El ajeno usa clave aleatoria independiente e issuer de fixture distinto. Esto prueba rechazo
de una confianza ajena, **no una sesión obtenida de un segundo proyecto Auth en ejecución**;
no se conectó otro proyecto ni el anterior. t019-http-control-firma.log y la ejecución final
incluyen esos controles. La paridad con otro proyecto desplegado queda fuera de esta prueba.

## Conservación y operación reproducible

El primer registro del runner retornó exit 0 pero no mostraba su stdout; se añadió salida
solo de nombres fijos/counters en formato TAP. No se reimprime salida de proveedores ni de
subprocesos fallidos. Los registros iniciales quedan como evidencia del problema de reporte,
sin atribuirles casos no visibles. La última repetición incorpora guard de destino exacto y
comprobación de que la suplantación rechazada no muta perfiles.

La repetición SQL recapturó t013-t015-all.log y se guardó como t019-sql.log: el primero ahora
contiene la ejecución más reciente; el resultado histórico T015 (157/157) permanece documentado
en t013-t015-cierre.md. No se presenta esa recaptura como un registro histórico inmutable.

Todas las fixtures pertenecen a las identidades recién creadas, se retiran al terminar y
el conteo final es profiles=0/auth_users=0. No hubo db reset ni migraciones en este bloque.
La preparación y limpieza usan credenciales locales privadas; los casos ordinarios únicamente
clave pública/JWT de usuario. Ni Expo ni sus variables públicas reciben claves privilegiadas.

Para reproducir, desde raíz App-Barberia y con Docker/stack propio disponibles:

```powershell
npx.cmd --no-install supabase functions serve --workdir "$PWD"
# Otra terminal, con las variables no secretas del destino explícito:
$env:BARBERIA_002_URL = 'http://127.0.0.1:54421'
$env:BARBERIA_002_PROJECT_ID = 'app-barberia-002-local'
node scripts/run-backend-integration.mjs --profiles
```

No ejecutar dos instancias de functions serve sobre el mismo runtime. En esta ejecución
queda una instancia propia sirviendo. Para otro destino no reutilizar estas fixtures sin
adaptar y verificar sus guards. No imprimir docker inspect/env ni status con claves.

Persisten nueve avisos moderados npm, sin remediación ni auditoría de seguridad aprobada.
Sin UI nueva ni pruebas Android atribuidas a Codex. Sin T020–T040, Supabase remoto, cambios
en Constitución/rúbrica/001 ni commits/push.

Fuentes oficiales consultadas: [desarrollo Edge](https://supabase.com/docs/guides/functions/development-environment),
[autorización Edge](https://supabase.com/docs/guides/functions/auth) y
[CLI serve](https://supabase.com/docs/reference/cli/supabase-functions-serve).

Revisión final: git diff --check exit 0, lint y formato de los últimos cambios del runner/
integración exit 0 (t019-cierre-checks.log). Revisión de 103 archivos candidatos acumulados:
sin hallazgos de JWT reales, claves privadas, URLs firmadas ni artefactos privados destinados
a Git. La rama/HEAD sigue main/eb2d605; 19 casillas completadas y T020–T040 pendientes.
