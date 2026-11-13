# Evidencias — 002 Fundación Supabase y aislamiento multitenant

## T001 — Línea base y conservación

Fecha: 2026-11-11. Comprobaciones ejecutadas por Codex, no pruebas manuales del usuario.
Alcance exclusivo: inventario y conservación; T002–T040 no ejecutadas.

### Estado inicial comprobado

- `git branch --show-current`: main; código 0.
- `git rev-parse HEAD`: `9938bb842683fcd6b7a3fd3ab5e8dd1711234347`; código 0.
- `git status --short`: salida vacía, repositorio limpio; código 0.
- 814 archivos versionados. Los ocho documentos de especificación/diseño/checklist de 002
  antes sin seguimiento ya están versionados, junto con tasks.md. La mención histórica en
  T001 no significa que deban desversionarse ni que el HEAD antiguo siga vigente.
- Checklist requirements.md: 16 marcadas, cero pendientes; revisión documental, no prueba
  del backend. Sin extensions.yml ni hooks de implementación.

Se leyeron AGENTS, T001 y reglas de evidencia de tasks, y los apartados de conservación
de plan/validation. Se consultó speckit-implement bajo el límite explícito de una tarea.
`check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` terminó con código 1 por la política
PowerShell; se verificaron los documentos locales directamente sin cambiar ni eludir la política.

### Inventario reproducible de contenido

[inventario-inicial.json](inventario-inicial.json) contiene **815 archivos**: 814 versionados
y uno ignorado por Git que forma parte del contexto local. Para cada archivo registra ruta
relativa, tamaño, SHA-256 y estado Git; no registra su contenido ni valores de credenciales.
La fecha/hora UTC efectiva y ruta del workspace están en el JSON.

Procedimiento ejecutado con Node existente: recorrer archivos mediante fs.readdirSync/lstatSync,
rechazar enlaces no verificables, leer bytes y calcular crypto.createHash('sha256'); contrastar
rutas con git ls-files y git ls-files --others --exclude-standard. No se normalizaron saltos de
línea: la referencia son los bytes reales del disco, no el contenido normalizado del índice.
Para cotejar después: leer files del JSON, verificar existencia/tamaño y recalcular SHA-256
de cada ruta; comparar incorporaciones por separado y exigir justificación para diferencias.

Exclusiones declaradas: en raíz .git, node_modules, .expo, .test-build, .artifacts, coverage,
dist y build; en cualquier nivel .git, node_modules y __pycache__. Directorios excluidos que
existían realmente: .git, .expo y node_modules. Se conservaron fuentes, assets, skills,
documentación, evidencias históricas, configuración y archivos de lock. No se excluyen logs
históricos necesarios como si fueran artefactos regenerables. El inventario no es un backup.

Los dos archivos nuevos de evidencia se crean después de capturar la línea base y no se
incluyen en sí mismos. El hash inicial de tasks.md corresponde a su estado anterior a marcar
T001; la comprobación final debe admitir únicamente esa casilla como diferencia autorizada.

### Cambios autorizados de esta ejecución

| Archivo | Cambio autorizado |
| --- | --- |
| docs/evaluacion/evidencias/002-fundacion/inventario-inicial.json | Crear línea base inmutable para cotejos posteriores |
| docs/evaluacion/evidencias/002-fundacion/informe.md | Crear este registro y su resultado de conservación |
| specs/002-fundacion-supabase-multitenant/tasks.md | Únicamente cambiar la casilla T001 a completada tras verificar |

No había cambios locales previos que atribuir al usuario. Otros cambios futuros requieren
el alcance autorizado de su tarea y deben registrarse; no se exige identidad absoluta de
archivos que después se modifiquen con autorización expresa.

### Resultado y límites

T001 completada. Primer cotejo: 815/815 archivos con hash original, antes de marcar la tarea.
Cotejo después de marcarla: **814 idénticos y una diferencia autorizada**, tasks.md.
Al revertir en memoria exclusivamente su casilla T001, el SHA-256 coincide con la línea base:
ningún otro byte anterior cambió. Cero archivos originales eliminados o diferencias inesperadas.
Los nueve archivos actuales de specs/002 están inventariados; las ocho fuentes documentales
previas conservan su contenido. La fundación 001 y sus evidencias permanecen intactas.

Comprobaciones de conservación Node: código 0. `git diff --check`: código 0, sin errores.
`git diff --numstat`: una línea añadida/retirada en tasks.md; revisión del diff confirma
exclusivamente la casilla T001. Solo se añaden los dos archivos de evidencia autorizados.
Rama main y HEAD 9938bb842683fcd6b7a3fd3ab5e8dd1711234347 permanecen iguales, sin cambio
de historial. T002–T040 continúan sin marcar. No se alteran los registros históricos de
generación de tasks ni del plan, que describen sus respectivas fechas, no el estado actual.
No se ejecutaron instalaciones, tests de aplicación, empaquetados, auditorías npm, SQL,
conexiones Supabase, limpiezas, commit ni push. No se escribieron repositorios de referencia.
T001 no acredita implementación, seguridad multitenant ni reproducción del backend (SC-001).

### Próximo trabajo, no ejecutado

T002 deberá analizar los avisos npm y su alcanzabilidad, conservando el antecedente de nueve
moderadas frente al último reporte de ocho totales/tres sin dev. Es evidencia previa reutilizada,
no una auditoría nueva ni remediación acreditada. No ejecutar audit fix ni incorporar paquetes
para dar por cerrado ese riesgo. T001 solo establece la línea base necesaria para ese análisis.

## Bloque 1 — Continuación T001–T003 (2026-11-11)

Los apartados anteriores conservan el registro histórico de T001. Al retomar, main/HEAD
9938bb842683fcd6b7a3fd3ab5e8dd1711234347 coinciden (consultas código 0), pero git status
--short **no estaba vacío**: tasks.md modificado y este directorio de evidencias sin seguimiento,
correspondientes a T001 ya autorizada. No se descartaron ni sobrescribieron esos cambios.

T001 fue recotejada, sin regenerar su inventario inmutable: 815 originales, 814 idénticos y
solo su casilla como diferencia autorizada inicial; restaurarla en memoria recupera el hash
original. Comprobación Node código 0. El bloque admite T002/T003 después de esta aceptación;
sus inspecciones no requieren crear servicios ni instalar herramientas.

| Tarea | Estado del bloque | Evidencia |
| --- | --- | --- |
| T001 | Completada anteriormente y recotejada | inventario-inicial.json preservado, cotejo SHA-256 nuevo |
| T002 | Completada como análisis; riesgo sin resolver | [riesgo-npm.md](riesgo-npm.md), [npm-audit.json](npm-audit.json) |
| T003 | Pendiente; inspección parcial realizada | [herramientas.md](herramientas.md) |

Auditorías nuevas válidas: 9 moderadas totales y 3 sin dev, ambas con exit 1 por hallazgos;
intentos sandbox previos fallaron por entorno y se preservan como tales. Node 24.21.0/npm
11.19.0 comprobados con exit 0. No se alteró package/lock ni se remediaron avisos. WSL
3.0.5.0 disponible, Ubuntu/versión predeterminada 2; motor Docker y herramientas Supabase/Deno
no acreditados. T003 necesita rutas existentes o autorización de instalación/preparación.

Cambios autorizados adicionales a T001: crear riesgo-npm.md, npm-audit.json y herramientas.md;
añadir este registro y marcar únicamente T002 tras su aceptación. T003–T040 siguen pendientes.
T004 depende de T003: el siguiente bloque T004–T007 conserva coherencia secuencial, pero
no está habilitado aún. No se ejecutó ninguna de esas tareas ni se cambió su orden.

Cierre de conservación: verificar los hashes originales normalizando en memoria solo las
casillas T001/T002, revisar git diff y los únicos cinco archivos de evidencia autorizados.
No se repitieron pruebas generales, empaquetados, SQL ni instalaciones. Sin proyecto Supabase,
conexiones a bases, cambios de 001/Constitución/rúbrica, commit o push.

Resultado final ejecutado: cotejo de 815 originales con cero diferencias inesperadas;
tasks.md recupera su hash inicial al restaurar exclusivamente T001/T002 en memoria.
`git diff --check`: código 0. Estado final: únicamente tasks.md modificado y los cinco
archivos de evidencia descritos sin seguimiento. Rama main/HEAD 9938bb8 conservados.

## Seguimiento — Finalización condicionada de T003 y bloqueo T004–T007

Fecha: 2026-11-11. Consultas de Codex, sin instalaciones ni ejecución del siguiente bloque.
Se conserva la instalación de Supabase CLI efectuada por el usuario y sus cambios de
package/lock. Versiones exactas de CLI 3.1.0 coherentes entre manifiesto, lock y paquete;
npx --no-install devuelve 3.1.0 y ayuda real (exit 0 fuera del sandbox). Docker Desktop
4.99.0 y Engine 29.9.3 Linux comprobados por consulta read-only del servidor (exit 0).
Los fallos iniciales del sandbox y el método npm distinto del binario externo del plan se
registran en [herramientas.md](herramientas.md), sin borrar evidencia histórica.

T003 continúa pendiente: Deno 2.9.8 no acreditado y todavía necesarios cotejo oficial de
checksum CLI, puertos y disponibilidad PostgreSQL 17. Deno no es necesario intrínsecamente
para T004/T005, pero sí para la aceptación literal de T003 y controles Deno de T006.
Se documentó un procedimiento oficial de descarga manual/validación de Deno para revisión;
no se instaló ni se solicitaron cambios de arquitectura. Se detiene antes de T004 por su
dependencia explícita de T003. T004, T005, T006 y T007 permanecen sin ejecutar/sin marcar.

Solo se amplían herramientas.md y este informe. No se modifica tasks.md, package, lock,
Constitución, rúbrica, código ni documentos 001. Riesgo npm previo de nueve moderadas/tres
sin dev conservado; no se ejecutó auditoría nueva. Sin init/start, SQL, migraciones, nuevo
proyecto remoto, modificaciones a contenedores anteriores, commit ni push.

Verificación de cierre de esta revisión: SHA-256 de package/lock iguales a los capturados
al comenzar; cero diferencias originales inesperadas al cotejar T001 admitiendo los cambios
previos autorizados de package/lock/tasks. `git diff --check`: código 0, solo advertencias
de conversión LF/CRLF, sin errores de whitespace. Rama main/HEAD 9938bb8 conservados.

## Ejecución autorizada — T003–T007

Fecha: 2026-11-11; comandos ejecutados por Codex. Estado inicial main/9938bb8 y cambios
autorizados anteriores conservados, incluidos package/lock con Supabase CLI 3.1.0.
Sin hooks de implementación registrados. Se consultaron speckit-implement, TDD y verificación;
para el error de cobertura se aplicó systematic-debugging.

### T003 completada

[herramientas.md](herramientas.md) detalla descargas, comprobaciones y destinos de usuario.
Deno 2.9.8 instalado fuera del repositorio después de verificar el ZIP y su SHA-256 oficial,
con PATH de usuario añadido sin sobrescrituras ni cambio de ExecutionPolicy. El archivo oficial
usa Algorithm/Hash/Path: el primer parser lo interpretó mal; la verificación corregida confirmó
igualdad antes de extraer/ejecutar. Version/help exit 0. CLI Windows cotejada contra el tarball
npm oficial con SRI y SHA-256 del ejecutable, sin confundir canales npm/GitHub.

Docker Linux operativo y PostgreSQL 17.11.0.011 disponible como imagen local, sin descargarla
ni iniciarla. Conflicto de puertos antiguos identificado; 54420–54429/8183 seleccionados para
la futura configuración T008 tras consulta sin listeners. No se creó config.toml ni se tocó
el stack barberia-app. Revalidar disponibilidad antes del futuro arranque.

### T004/T005 completadas — Verificador servidor

Se crearon tests/architecture/check-server-architecture.test.mjs y server-fixtures/cases.mjs.
RED por ausencia del checker, conservado en servidor-arquitectura-red.log. Se adaptó el análisis
AST existente a scripts/check-server-architecture.mjs con raíz/roles propios, sin modificar
el checker ni fixtures cliente de 001. Las fixtures reutilizan escenarios de ese contrato y
agregan composición/entrada, globals Deno y cruce al cliente. GREEN: **45/45**, exit 0 en
servidor-arquitectura-green.log y repetición aislada.

Se verifican importaciones directas, transitivas, alias, reexports, tipos, ciclos, referencias
sin resolver y análisis incompleto. No se afirma auditoría de núcleo servidor real: actualmente
modules=0/core=0 produce EMPTY_CORE y exit 1, conservado en t006-pendientes.log.

### T006 completada — Preparación de controles

Nuevos tsconfig.server.json (configuración AST del árbol completo) y tsconfig.server-core.json
(strict, ES2022, types vacíos) y supabase/functions/deno.json. Integración selectiva en scripts
package, ESLint/Prettier/ignores, sin versiones nuevas ni cambios de package-lock. Se mantienen
los comandos/regresiones cliente; el check global incluye los controles servidor y no puede
dar verde con el núcleo ausente. Supabase/.temp y .branches ignorados, evidencias conservadas.
No se creó una implementación ficticia para satisfacer compiladores.

Incidencias registradas: un flag Deno no admitido fue retirado tras comprobar la CLI; lint
de un directorio sin fuentes TS se separó a lint:server, dentro de check:server tras el gate
de núcleo. No se declara lint servidor aprobado sin fuentes. Errores de invocación PowerShell
del verificador temporal de cobertura se corrigieron sin modificar los umbrales.

La primera fixture Deno pasó tests pero no emitió un informe utilizable: faltaba código
transpilado en caché restringida. El informe solo fuera del sandbox siguió fallando; repetir
test + informe fuera produjo cobertura correcta, identificando la frontera de escritura de
caché. Se configuró DENO_DIR local en .artifacts/deno-cache. t006-cobertura-fixtures.log conserva
el fallo; t006-cobertura-gate.log demuestra con caché local: tests exit 0, cobertura parcial
exit 1 y cobertura completa exit 0 (100% líneas/funciones/ramas de la fixture técnica).
Esto verifica el gate de herramientas, **no** cobertura del servidor real. El gate Deno usa
threshold=100 e incluye dominio/aplicación; Node conserva el runner y reporte existentes.
Las ramas nuevas del núcleo cliente se acreditarán al existir sus módulos, según validation.

Pendientes intencionales de implementación real: tsc server-core exit 2/TS18003, checker servidor
exit 1/EMPTY_CORE, deno check exit 1 por entradas aún inexistentes y deno test exit 1 por ausencia
de suites servidor. Preparar estos controles es T006; su aprobación sobre el núcleo real
corresponde a las historias posteriores. No declarar npm run check aprobado hoy.

### T007 completada — Runner y herramientas seguras de prueba

Nuevos scripts/run-backend-integration.mjs y tests/integration/tenant-foundation/{fixtures.mjs,
environment.test.mjs}. RED de módulos ausentes en t007-red.log; GREEN final **18/18**, exit 0,
en t007-green.log y t004-t007-repeticion-aislada.log. Una regresión adicional reprodujo aceptación
accidental de un token de servicio (Missing expected exception); se corrigió rechazo explícito
del token privilegiado sin convertir su decodificación en autenticación.

Casos: URL externa, userinfo/path/query, puerto antiguo, project_id ajeno, claves de servicio
en configuración pública/token, aleatoriedad de credenciales sintéticas, directorio ajeno,
marcador alterado, junction, fallo/timeout de subproceso sin filtrar stdout y salida NOT_READY
cuando faltan escenarios reales. Compilación TypeScript en temporal propio verificada con
una fixture técnica, independiente de .test-build, con cleanup que valida raíz/propiedad/enlaces.
No hay solicitudes HTTP, usuarios creados ni fixtures insertados en una base.

El runner prepara los límites y falla cerrado ahora; antes de futuras mutaciones, las suites
reales deberán verificar identidad efectiva del stack, no solo aceptar una URL/configuración.
Los escenarios de perfil/barberías/autorización y la composición cliente real no se crearon:
pertenecen a tareas posteriores. No se declara integración backend realizada.

### Calidad y conservación del bloque

t004-t007-calidad.log: TypeScript cliente/core exit 0, formato exit 0 y checker cliente exit 0.
Lint detectó Buffer no importado en dos archivos nuevos: se corrigió mediante imports explícitos
node:buffer; lint y formato de archivos corregidos exit 0. No se relajó no-undef.

Primera ejecución npm test: 38 arquitectónicas originales, 67 unitarias y 11 de presentación
pasaron; cinco fixtures servidor agotaron el timeout durante comprobaciones concurrentes.
t004-t007-pruebas.log conserva exit 1/ETIMEDOUT. Sin cambiar reglas/aserciones/timeout, la
repetición aislada t004-t007-repeticion-aislada.log pasó 45 servidor + 18 entorno con exit 0.
La repetición general posterior se registra aparte en t004-t007-pruebas-final.log; no borrar
ni presentar como verde la primera ejecución fallida.

Cambios autorizados del bloque: controles/configuración, dos scripts nuevos, nuevas fixtures/tests,
casillas T003–T007, evidencia y herramientas externas de usuario. Fuente src, tests originales,
checker cliente, runner unitario original, Constitución, rúbrica y documentos 001 preservados.
package-lock conserva su hash al comenzar este bloque; los cambios de instalación CLI ya eran
previos del usuario. Riesgo npm de nueve moderadas/tres sin dev conservado sin auditoría nueva
ni remediación. Sin T008–T040, init/start, SQL, migraciones, remoto, commit o push.

Resultado final general: `npm test` repetido sin comprobaciones concurrentes, **exit 0**:
38 regresiones arquitectónicas cliente, 67 unitarias, 11 presentación, 45 servidor y 18 entorno
(179 pruebas en sus respectivas suites). t004-t007-pruebas-final.log conserva los resultados.
T003, T004, T005, T006 y T007 quedan marcadas; T008–T040 permanecen pendientes.
El resultado no convierte EMPTY_CORE/TS18003/ausencia de casos de servidor en verificaciones
superadas; `npm run check` completo seguirá bloqueándose por esos gates hasta implementar US2.

Comprobación final: SHA-256 de archivos previos sin diferencias fuera de controles/evidencias
autorizados, package-lock intacto respecto al inicio de esta ejecución y casillas T003–T007
como únicos cambios adicionales de tasks.md. `git diff --check` código 0; advertencias LF/CRLF
sin errores. Los registros de fallos iniciales quedan preservados. Los directorios temporales
de fixtures y herramientas externas son propios; no se realizaron limpiezas de datos existentes.

## Bloque T008–T011 — entorno local independiente y modelo cerrado

T008, T009, T010 y T011 completadas. Ejecución por Codex el 11/11/2026 (algunos timestamps
UTC de migración/logs corresponden al 12/11). Detalle reproducible, servicios, puertos,
imágenes/digests y límites en [local.md](local.md).

- Proyecto nuevo **app-barberia-002-local**, ocho contenedores propios. API 54421, DB 54422,
  Studio 54423, correo local 54424; PostgreSQL real 17.11. Shadow 54420 e inspector 8183
  configurados; pooler/analytics desactivados. Configuración generada primero en temporal.
- T009 RED significativo: 118 assertions, tres roles presentes y 115 expectativas ausentes,
  exit 1. T010 creó por CLI la migración `20261112031854_foundation_model.sql` con solo
  profiles/barbershops/barbershop_memberships, restricciones e índices mínimos, RLS activada
  y grants revocados dentro de la transacción antes del commit.
- T011: reset --no-seed exclusivamente sobre el stack nuevo, vacío y descartable; migration
  list, lint --fail-on warning y advisors, todos exit 0. GREEN del esquema **118/118**, exit 0.
  Sin hallazgos lint/advisors, sin afirmar auditoría de seguridad superada.
- 36/36 intentos directos de acceso denegados (SQLSTATE 42501, exit 1 esperado; harness 0).
  Consulta final: cero filas de negocio y cero usuarios Auth. Sin permisos temporales.
- El primer start falló por handlers futuros ausentes; se configuraron enabled=false y
  verify_jwt=true. El reset recreó DB y el guard rechazó el ID histórico antes de ejecutar
  pruebas; se verificó el nuevo ID/imagen/volumen/red y se capturó docker-post-reset.json.
  Fallos iniciales conservados/documentados; no se relajaron controles.
- Metadatos estables de los 12 contenedores antiguos idénticos antes/después. Redes y
  volúmenes separados. No hubo conexión, lectura SQL ni operación sobre datos del anterior.

Quickstart actualizado solo para herramientas y operación local comprobadas. No se ejecutaron
T012–T040 ni se creó/enlazó un remoto. Casos de uso, acceso permitido JWT/RLS y núcleo servidor
siguen futuros; `npm run check` completo todavía no se declara aprobado. Las 179 pruebas
anteriores no se repitieron en este bloque SQL/configuración. Nueve avisos moderados npm
(tres sin dev) continúan pendientes, sin auditoría nueva, cambios npm ni remediación.

Cierre del bloque: cotejo SHA-256 de **839 archivos previos**, diferencias solo en este informe,
quickstart de 002 y casillas T008–T011. Código, dependencias, controles previos y fundación 001
conservados. [t008-t011-integridad.json](t008-t011-integridad.json) registra el resultado.
Rama main, HEAD 9938bb842683fcd6b7a3fd3ab5e8dd1711234347 sin cambios. Veinte enlaces locales
del quickstart/local.md comprobados existentes; `git diff --check` exit 0 (advertencias LF/CRLF
sin errores de whitespace). Sin commit ni push.

## Bloque T012–T015 — 12/11/2026

Inicio limpio main/eb2d605. T012 y T014 completadas; T013 preparada parcialmente pero
bloqueada por Docker/API local inaccesibles; T015 no ejecutada por depender de T013.
[Detalle, comandos, errores y límites](t012-t015.md).

Cliente: 73/73 unitarias (seis nuevas), exit 0. Servidor: 3/3 reglas puras, exit 0;
tres contratos HTTP anticipados continúan RED hasta T017. Cobertura de ambos núcleos
nuevos medida por separado: 100 % líneas/funciones/ramas, sin atribuirla a SQL/HTTP/RLS.
Tipos, lint, formato y ambos checkers exit 0; servidor con cuatro módulos de núcleo reales.
No se modificaron dependencias, migraciones previas ni 001. Ninguna migración nueva o SQL
aplicados; ningún contenedor modificado. No fue posible cotejar nuevamente metadatos del
entorno antiguo porque Docker no responde. Persisten nueve avisos moderados sin remediación.

Verificación final del bloque: `git diff --check` exit 0; revisión adicional de archivos nuevos
sin hallazgos de secretos ni espacios finales. Los únicos archivos previos modificados son
este informe y las casillas T012/T014 de tasks.md. Rama main/eb2d605 conservada; sin commit/push.

## Continuaci?n T013/T015 ? 12/11/2026

T013 y T015 completadas; supera el bloqueo hist?rico de la ejecuci?n previa.
[Detalle y l?mites](t013-t015-cierre.md). RED SQL significativo: 23 assertions/12 fallos;
migraci?n 20261113035717 aplicada con migration up solo en app-barberia-002-local:54422.
GREEN: 39 perfiles + 118 esquema = 157/157, exit 0. Lint/advisors/migration list y controles
de calidad aplicables exit 0. Tres denegaciones REST an?nimas aprobadas; dos solicitudes
Edge reciben 503 por runtime detenido, por lo que no acreditan JWT/handler. Composici?n
cliente y contratos HTTP siguen pendientes. Edge no fue reiniciado y sus logs no permiten
atribuir una causa definitiva a exit 255. Los metadatos de 12 contenedores antiguos y ocho
nuevos permanecen iguales; ninguna operaci?n modific? contenedores ni datos antiguos.
No quedaron perfiles/usuarios de prueba. Sin reset, remoto, dependencias, commit o push.
T016 es la siguiente tarea, sin ejecutar. Persisten nueve avisos npm moderados.

## Bloque T016?T019 ? 12/11/2026

T016?T019 completadas. [Detalle y l?mites de la verificaci?n](perfiles.md).
Implementados adaptadores Auth/RPC, handler ensure-profile, composiciones servidor/cliente
y adaptador HTTP cliente. Edge nuevo recuperado con functions serve; verifyJWT=true efectivo.
Sin reiniciar el stack; doce contenedores antiguos y siete servicios nuevos ajenos a Edge
con metadatos estables preservados. No se compartieron redes/vol?menes antiguos.
Npm test exit 0: 75 unitarias, 38 arquitectura cliente, 45 servidor, 11 presentaci?n y 18 runner.
Deno: 13/13; SQL: 157/157; HTTP real: ocho resultados TAP, todos exit 0. JWT v?lidos de Auth;
negativos de expiraci?n y clave/issuer ajenos son fixtures firmadas enviadas al servicio real,
no sesiones obtenidas de otro proyecto Auth. Cobertura de n?cleos 100 % por runtime, sin
atribuirla a HTTP/SQL/UI. Tipos/lint/formato/checkers y deno check de ensure-profile aprobados.
No se declara npm run check gen?rico superado: create-barbershop a?n pertenece a T025.
Fixtures retiradas, cero perfiles/usuarios. Sin migraciones, dependencias, remoto, T020?T040,
commit ni push. Persisten nueve avisos moderados npm. El log t013-t015-all.log fue recapturado
por la repetici?n SQL y copiado a t019-sql.log; no se lo etiqueta como hist?rico inmutable.

## T020?T023 ? 12/11/2026

Cuatro tareas completadas. [Evidencias y l?mites](t020-t023.md). Tipos/casos puros y puertos
estrechos de barber?as, pruebas anticipadas y migraci?n 20261113045240 tenant_context_access
aplicada solo en app-barberia-002-local:54422. RLS por membres?a activa, renombre solo admin
del tenant y lectura inicial de membres?a propia; sin escrituras de personal.
Unitarias cliente 79/79 y servidor 16/16; cobertura nueva de n?cleo 100 % por runtime.
Tipos/lint/formato/ambos checkers exit 0. Tenants 20/20 + perfiles 39/39 + esquema 118/118
aprobados. SQL global exit 1 exclusivamente por diez RED anticipadas de provisioning: no
existe RPC de T024; C2/C4 definidos, no ejecutados. No se acredita atomicidad ni aislamiento
integral de barber?as por HTTP. Doce contenedores antiguos y siete servicios nuevos ajenos
a Edge conservados; Edge operativo, log activo preservado y sin ?rdenes de reinicio.
Cero filas de fixtures/trigger temporal al cierre. Sin reset, dependencias, T024?T040,
commit ni push; nueve avisos npm moderados conservados. Siguiente tarea disponible: T024.

## T024?T027 ? 13/11/2026

Cuatro tareas completadas; [evidencia](atomicidad.md). RPC transaccional nueva aplicada solo
a app-barberia-002-local:54422, migraci?n 20261113050232_create_own_barbershop.sql. Ambos
endpoints y composiciones reales; cliente alta/GET/PATCH y reconciliaci?n sin retry de POST.
Los diez RED SQL est?n resueltos: 193/193 assertions finales, incluidos ACL/actor/perfil.
HTTP US3: siete resultados TAP, C2 con dos sesiones/barrera y SQLSTATE 23505, C3 rollback
tambi?n por HTTP, C4 dos altas independientes con admin propio ?nico por shop. Unitarias
cliente 80/80, servidor 17/17 y regresi?n HTTP perfiles 8/8. npm run check ahora exit 0
(Deno 2.9.8 disponible en PATH de ese proceso). No es aprobaci?n de auditor?a npm ni de
aislamento multitenant integral, que sigue en T028 y posteriores. Doce contenedores antiguos
y siete servicios nuevos ajenos a Edge conservados; cero fixtures/triggers/funciones/backends
de prueba. Log activo preservado; sin ?rdenes de reinicio, db reset, remoto, dependencias,
commit o push. Persisten nueve avisos moderados. Siguiente tarea disponible: T028.

Cierre Git: diff global exit 2 exclusivamente por espacios finales generados en t017-serve.log;
el diff de implementaci?n excluyendo solo ese log activo da exit 0. Registro t027-diff-check.log.
No se edit? ni agreg? a staging el log, ni se detuvo su proceso. Revisi?n de 98 archivos
candidatos acumulados sin hallazgos de secretos. main/2f37266 conservados; cambios sin commit.

## T028?T030 ? 13/11/2026

Tres tareas completadas; [evidencia y l?mites](t028-t030.md). Migraci?n CLI
20261113053907_membership_listing_access aplicada solo a app-barberia-002-local:54422.
Listado m?nimo invoker autorizado por administraci?n activa contextual; lectura propia
inactiva conservada, sin escrituras de personal ni acceso a perfiles de compa?eros.
SQL tenants 163/163, global 336/336; matriz HTTP directa 342/342 y revocaci?n con mismo
JWT aprobadas. Dos preflight cliente siguen RED de T031: HTTP global exit 1. Unitarias
anticipadas de memberships tambi?n RED TS2307; npm run check se detiene all? (exit 1),
sin omitir verificaciones. AST real de ambos ?rboles, tipos, lint/formato, 38+45 regresiones
arquitect?nicas, 17 unitarias servidor, 11 de presentaci?n y 18 del runner comprobados.
Regresiones HTTP perfiles 8/8 y alta 7/7. Preservados doce contenedores antiguos y siete
servicios nuevos ajenos a Edge; cero fixtures al cierre. Sin reinicios, reset, remoto,
instalaciones, T031?T040, commit ni push. Log activo conservado. Nueve avisos moderados
npm pendientes; no auditor?a de seguridad aprobada ni aislamiento integral acreditado.

## T031?T033 ? 13/11/2026

Bloque completado. [Integraci?n y aislamiento](aislamiento.md), [auditor?a y l?mites](calidad.md).
Listados propios y administrativos conectados por puerto, casos de uso, adaptador y composici?n
cliente: las ocho operaciones se consumen realmente por el runner, sin stubs o cach? de permisos.
Corregida traducci?n Auth 403 bad_jwt a UNAUTHENTICATED; el rechazo contextual de RPC sigue FORBIDDEN.
RED inicial y fallos intermedios conservados. SQL global 336/336; HTTP integral 440/440 resultados
TAP, sin skipped (342 directos, 81 cliente, revocaci?n y regresiones; incluye padres TAP).
Se confirma p?rdida de acceso tras COMMIT con mismo JWT y permisos diferentes A/B. Atomicidad
y carreras C1?C4 siguen aprobadas. No se cambi? SQL, migraciones ni el n?cleo servidor.

npm run check completo exit 0: 86 unitarias Node, 38+45 regresiones AST, 11 presentaci?n,
18 runner y 17 Deno. AST real: cliente 30 m?dulos/core 11; servidor 13/core seis, sin infracciones.
Cobertura de n?cleo cliente tenant-foundation al 100 % por archivo; servidor 85/85 ramas
y 142/142 l?neas, separada de infraestructura/presentaci?n (cobertura parcial informativa).
RLS/ACL/owners/search_path efectivos, lint y advisors locales comprobados. Nueve avisos npm
moderados conservados como riesgo abierto; no auditor?a global de dependencias aprobada.

Doce contenedores antiguos y siete servicios nuevos ajenos a Edge con metadatos preservados;
cero usuarios/filas/artefactos SQL de test. Edge operativo con verifyJWT en ambas entradas;
su identidad no se declara estable frente a serve activo. Sin ?rdenes de reinicio/parada,
Cloud, instalaciones, T034?T040, cambios en 001/Constituci?n/r?brica, commit ni push.
Revisi?n final de secretos, conservaci?n de archivos y diff global/acotado en t033-revision.json.
Siguiente tarea disponible: T034.

## T034?T035 ? 13/11/2026

T034 completada: [consultas](consultas.md), 10 000 usuarios/perfiles, 1 000 barber?as y
20 000 membres?as transaccionales, EXPLAIN ANALYZE real y rollback. Variante auth.uid()
139.660 ms frente a filtro literal real del adaptador 0.043 ms; sin nuevos ?ndices ni SLO.

T035 completada con enmienda autorizada de SC-006/US1 y criterios documentales, compatible
con Constituci?n/r?brica: no exige tercero ni crear otro entorno solo para aceptaci?n.
[Registro completo y l?mites](reproduccion.md). Antes de recibirse la decisi?n ya se cre?
una copia externa y un stack temporal aislado: npm ci/start exit 0, cinco migraciones,
SQL 336/336, HTTP 440/440 incluidas carreras, npm run check exit 0; sin revisi?n externa.
Cat?logo equivalente a T033 y hashes de package/lock id?nticos. Desde la decisi?n no se
crean nuevos entornos ni se repiten verificaciones; se reutilizan evidencias reales.
Stack/proceso temporal quedan existentes, sin nuevas operaciones de ciclo de vida; no
se toca el log activo ni proyectos anteriores. Nueve avisos moderados abiertos; sin
seguridad npm aprobada, Cloud, T036?T040, commit o push.

## T036 — identidad de destino y pendientes, 13/11/2026

[Destino autorizado](destino.md): referencia pública vuoncrtkkkquvddunrxx, URL exacta
aportada por el usuario; nombre app-barberia-arquitectura, organización barberia-app,
São Paulo y Healthy son declaraciones del usuario, sin contraste autenticado de Codex.
Documentación oficial confirma São Paulo/sa-east-1; no demuestra región efectiva.
Consulta web del dashboard inaccesible; antecedente CLI sin sesión autenticada reutilizado.
T036 queda pendiente por disponibilidad efectiva de PostgreSQL 17 y responsable/costo,
con Data API/default grants/RLS remotos aún sin verificar. Aprobación del destino ya recibida.
Sin link, SQL/despliegue, T037–T040, cambios de contenedores, código, dependencias, commit
o push. Cambios anteriores y log activo conservados. Nueve avisos npm siguen pendientes.

### Actualización de cierre T036 — 13/11/2026

T036 completada tras evidencia manual declarada por el usuario en el dashboard del destino
vuoncrtkkkquvddunrxx: identidad/organización/región/Healthy, PostgreSQL 17.11.0.019, Auth
2.197.0 y PostgREST 14.18. Plan Free, spend cap enabled, dos facturas $0.00, sin métodos
de pago y créditos $0.00, según usuario; no promesa de costo futuro cero. Responsable/aprobador:
usuario responsable del proyecto; organización de facturación barberia-app. Codex no inspeccionó
el dashboard autenticado ni ejecutó SQL remoto. Data API activa, exposición automática
desactivada; schemas public y graphql_public, search path public/extensions, Max rows 1000;
ninguna tabla/función disponible y Automatic RLS desactivado al crear. Estas opciones no
aprueban RLS/ACL de negocio; migraciones y pruebas remotas futuras deben verificarlas.
Diferencia graphql_public registrada para revisión posterior sin alterar configuración.
[Detalle y atribución](destino.md). T037 habilitada pero no ejecutada; no duplicar creación
manual. Sin link, despliegues, cambios de contenedores, código, dependencias, commit ni push.
Persisten nueve avisos moderados npm. El registro previo de T036 pendiente es histórico.

## T037 — acceso operativo pendiente, 13/11/2026

Creación manual del destino vuoncrtkkkquvddunrxx reconocida sin duplicarla. T036 habilita
T037, pero esta queda abierta: consulta real projects list --output-format json exit 1,
AccessTokenRequiredError. Identidad/configuración siguen acreditadas por evidencia manual
del usuario de T036, no por una conexión nueva de Codex. Ayuda login/list consultada exit 0.
Se revisaron offline cinco migraciones, sus transacciones/RLS/ACL/EXECUTE y efectos previstos,
sin afirmar cuáles faltan realmente en remoto. [Destino, procedimiento manual y plan de
validación/recuperación futura](destino.md).
Plan documental de operaciones posteriores no ejecuta T038. Sin link, dry-run, SQL, despliegue,
creación, cambios de contenedores/dependencias, commit o push. Nueve avisos npm conservados.

### Cierre de T037 — 13/11/2026

T037 completada: creación manual reconocida y acceso operativo de lectura acreditado
mediante consulta nueva CLI projects list --output-format json, exit 0. Coincidencia exacta
vuoncrtkkkquvddunrxx/app-barberia-arquitectura, sa-east-1, ACTIVE_HEALTHY y organización
zxqsrgokncxawohnfidv; el proyecto anterior klebvayvsvibwjpkzrff es distinto. No hay vínculo
local: el aviso de project ref no contradice el listado autenticado correcto. Versiones
y condiciones del plan reutilizadas de evidencia manual T036, sin nuevas lecturas SQL.
[Resultado saneado](t037-acceso-verificado.json) y [cierre/plan posterior](destino.md).
El bloqueo de autenticación previo queda superado sin borrar su registro histórico.
T038 habilitada pero no ejecutada: historial/previsualización/configuración y permisos
deben revisarse antes de solicitar autorización de escrituras concretas. Sin link, push,
migraciones remotas, despliegue, operaciones de contenedores, commit o push Git.
Persisten nueve avisos moderados npm y RLS/ACL de negocio remotas sin validar.

## T038 — preparación sin escrituras, 13/11/2026

T038 permanece pendiente. Consulta autenticada nueva: proyecto exacto
vuoncrtkkkquvddunrxx/app-barberia-arquitectura, sa-east-1, ACTIVE_HEALTHY y organización
zxqsrgokncxawohnfidv; exit 0. CLI 3.1.0/help contrastados. Config diff dirigido explícitamente
al nuevo proyecto, exit 0: 12 diferencias; confirma public/graphql_public frente a public
local. No se aplica configuración global. [Plan revisable, riesgos y recuperación](remoto.md)
y [comparación filtrada](t038-config-diff.json).

Historial remoto y dry-run **no ejecutados**: el código oficial v3.1.0 documenta que,
sin contraseña de base, la conexión crea un rol temporal por POST cli/login-role, incluso
antes de la previsualización SQL. Ese efecto no está autorizado bajo la restricción actual
de cero escrituras. No se solicitó ni guardó contraseña. Por ello los cinco archivos locales
están preparados para contrastar, pero no se afirma que todos estén pendientes en remoto.
Es necesario revisar/autorizar específicamente ese mecanismo antes de esos dos comandos.

Se proponen, sin ejecutarlas, la reducción de Exposed schemas a public, las migraciones
que resulten pendientes y los despliegues explícitos ensure-profile/create-barbershop con
verify_jwt=true. Identidades sintéticas y eventual configuración de secretos/orígenes
requieren preparación/autorización separada. Sin link, migraciones, despliegues, T039–T040,
operaciones de contenedores, cambios de código/dependencias, commit o push. Evidencias
locales previas reutilizadas con su alcance; no se atribuyen a Cloud. Nueve avisos npm
siguen abiertos. [Conservación y comprobaciones](t038-preparacion.json).

### T038 — historial y dry-run tras autorización limitada, 13/11/2026

El usuario autorizó el rol temporal de conexión de CLI 3.1.0 únicamente para las dos
consultas del destino vuoncrtkkkquvddunrxx. Versión/help y destino reconfirmados; projects
list exit 0. Migration list **exit 0**: historial remoto sin versiones registradas.
Db push --dry-run --skip-vault **exit 0**, dryRun=true, destino explícito coincidente:
las cinco migraciones locales están pendientes, en orden 20261112031854, 20261113035717,
20261113045240, 20261113050232 y 20261113053907. Cero seeds/roles personalizados; sin
discrepancias de historial/plan. [Detalle y resultados filtrados](remoto.md).

No se usaron confirmaciones globales ni apareció una confirmación adicional. Se observó
preparación del rol temporal en ambas consultas; no se verificó su eliminación/caducidad
ni si hubo reutilización. Cero roles personalizados no significa cero roles temporales.
Historial vacío no prueba esquema vacío y dry-run no valida los cuerpos SQL ni RLS/ACL.
El bloqueo de conexión anterior queda superado exclusivamente para estas consultas.

T038 sigue pendiente: no se aplicaron migraciones, configuración o despliegues Edge,
ni se acreditó paridad remota. Sin link, SQL adicional, operaciones de contenedores,
T039–T040, commit o push. Log activo y cambios anteriores conservados. Persisten nueve
avisos moderados npm. [Conservación y revisión actual](t038-consultas-revision.json).

### T038 — cinco migraciones SQL aplicadas con autorización expresa, 13/11/2026

Checkpoint previo local **42a695c**, 32 archivos T034–T038, revisión de secretos sin
hallazgos y cached diff check 0; log activo excluido, sin push. Destino reconfirmado
por CLI autenticada: vuoncrtkkkquvddunrxx/app-barberia-arquitectura, sa-east-1, Healthy.
Preflight de solo lectura exit 0: PostgreSQL 17.11, sin tablas/funciones/esquema private
en conflicto. Hashes de los cinco SQL intactos; historial y dry-run previos exit 0.

**Una única aplicación real db push --skip-vault**, exit **0**, con confirmación limitada
a ese comando y plan exacto autorizado. Sin seeds, roles personalizados, configuración
o Edge. Las cinco versiones figuran en el historial posterior, exit 0. No falló ninguna
migración y no se reintentó la aplicación. [Detalle, comandos y resultados](remoto.md).

Inspección remota posterior read-only exit 0; **83/83 comprobaciones estructurales**:
tres tablas con RLS, cinco políticas, once restricciones, cinco índices y siete funciones
con cuerpos/SECURITY DEFINER/INVOKER/search_path/EXECUTE previstos. Grants por columna
y ausencia de escrituras ordinarias de membresías comprobados en catálogo. Cero filas
de negocio; sin fixtures remotas. No son pruebas funcionales de aislamiento con JWT.

T038 continúa pendiente de despliegues/paridad funcional y revisión de exposición:
graphql_public sin modificar, Edge sin desplegar. Sin T039–T040, cambios de código,
dependencias o contenedores; proyecto anterior no operado. Roles temporales: eliminación
y caducidad no acreditadas. Nueve avisos npm moderados sin remediación/aceptación formal.
Las evidencias posteriores al checkpoint quedan sin commit. [Revisión final](t038-sql-revision.json).

### T038 — ambas Edge Functions publicadas, 13/11/2026

Autorización expresa únicamente para ensure-profile y create-barbershop. Destino nuevo
vuoncrtkkkquvddunrxx/sa-east-1 reconfirmado mediante CLI 3.1.0. Revisión de 14 fuentes,
entrypoints, variables y verify_jwt=true; sin secretos/URLs locales incrustados detectados.
Check:server exit 0; pruebas servidor nuevas 17/17, exit 0, con dobles locales.

Despliegues individuales por API, **exit 0 cada uno**. Primera función verificada antes
de publicar la segunda. Listado final: ambas **versión 1, ACTIVE, verify_jwt=true**, sin
funciones adicionales. Sin no-verify-jwt, prune, Docker o cambios de código/configuración.
Checkpoint 42a695c conservado; evidencias posteriores sin commit ni push.

HTTP real **10/10 denegaciones 401**, cinco por función: sin autenticación, Bearer inválido,
apikey inválida, clave pública sola y JWT legacy anon sin usuario. Material público/anon
seleccionado solo en memoria, sin --reveal ni guardar valores/cabeceras. En los casos
público/anon respondió el handler UNAUTHENTICATED, con X-Request-Id, acreditando arranque
y control de usuario adicional al gateway. Sin payload de negocio ni datos preparados.
No se ejecutó SQL remoto ni se midieron filas nuevamente en este turno.

[Detalle y plan de preparación/limpieza de futuras identidades sintéticas](remoto.md).
T038 continúa pendiente de paridad funcional con JWT y tenants reales de prueba autorizados,
revisión de exposición y diferencias de versiones; el runtime Edge no se leyó. Auth 2.197.0
es antecedente manual; PostgreSQL 17.11 corresponde a la inspección SQL anterior. Sin
cambios en Data API/graphql_public/RLS/ACL, proyecto anterior, contenedores o T039–T040.
No se repite auditoría npm: nueve avisos moderados siguen pendientes. [Revisión actual](t038-edge-revision.json).

### T038 — validación funcional real, fixtures retiradas, 13/11/2026

Nuevo acceso operativo comprobado en vuoncrtkkkquvddunrxx/sa-east-1, Auth Admin 200 con
credencial solo en memoria; baseline cero e inspección FK/triggers read-only. Auth
v2.197.0 y PostgreSQL 17.11 actuales. Se crearon **tres usuarios**, **tres perfiles**,
**dos barberías** y **cuatro membresías**, con sesiones propias para todas las operaciones
de negocio. Correos example.invalid, confirmación administrativa sin envíos.

Cumplidos perfiles/idempotencia/propiedad, altas de primer administrador, PROFILE_REQUIRED
sin parciales, aislamiento A/B, roles admin-A/barbero-B, inactividad, autopromoción
denegada, RPC privilegiada denegada y revocación con JWT sin renovar. [Tabla y evidencia](t038-funcional.md).
Run inicial **41/42, exit 1** por expectativa errónea del operador: exigía 403 para anon,
recibió 401. Se limpió todo en finally; repetición de lectura posterior **401/42501**,
conforme a PostgREST, exit 0. Sin cambiar producto ni ocultar el resultado inicial.

Retiradas selectivamente cuatro membresías/dos barberías/tres perfiles y tres usuarios
Auth; logout 204 y bajas Auth 200. **Cero registros activos de prueba**, incluidas
identidades/sesiones/refresh tokens; conteos globales restaurados. Manifiesto privado y
SQL temporal de IDs eliminados. Auditoría de plataforma no purgada; no se promete
invalidación inmediata de JWT ya emitidos.

T038 **permanece pendiente** de resolver/validar la diferencia de exposición GraphQL y
paridad aún no ejecutada (GraphQL con A/B, edición propia de perfil y pruebas remotas
de rollback/concurrencia). GraphQL anónimo tras limpiar devolvió errores y no prueba
aislamiento. No se crearon más recursos tras usar el cupo autorizado. Nueve avisos npm
moderados abiertos. Sin DDL/políticas/despliegues/configuración, T039–T040, proyecto
anterior, contenedores, commit o push. [Revisión final](t038-functional-revision.json).

### T038 — depuración de pendientes contractuales, 13/11/2026

Revisión de T038/FR-006/SC-002/contratos/validation: GraphQL **no es un requisito** de
002. Inspección remota read-only nueva confirma pg_graphql no instalado y wrapper
graphql_public.graphql invoker limitado a error de extensión deshabilitada. Queries
HTTP confirman ese error sin data. public/graphql_public frente a public es diferencia
de plataforma documentada, sin necesidad demostrada de cambiar configuración para 002.
La exigencia previa de GraphQL A/B se corrige como interpretación excesiva, conservando
los registros de lo realmente ejecutado y no ejecutado.

El pendiente es UpdateOwnProfile real: PATCH propio exitoso, teléfono omitido conservado,
null que lo retira, nombre/identidad preservados y GET posterior. Los grants/políticas
propios se inspeccionaron; la prueba no se ejecuta sin nueva autorización de **un usuario
y un perfil, cero barberías/membresías**, con limpieza selectiva. La expectativa anónima
401 ya es correcta en matriz/operador; no se cambia ningún test aprobado ni el 41/42
histórico. [Análisis y prueba mínima](t038-paridad-minima.md).

T038 sigue pendiente únicamente de cubrir/evaluar ese hueco real; GraphQL/carreras
remotas no se convierten en requisitos nuevos. Sin datos nuevos, escrituras remotas,
configuración, extensiones, T039–T040, contenedores, commit o push. Nueve avisos npm
abiertos. [Revisión final](t038-paridad-revision.json).

### T038 completada — paridad contractual cerrada, 13/11/2026

[Cotejo de aceptación](t038-cierre-paridad.md). Tras autorización de un usuario/un perfil,
el primer intento falló por cableado del operador antes del perfil; limpió el usuario.
Se corrigió y comprobó localmente el callback; nueva autorización expresa permitió un
segundo intento. **Exit 0, 7/7 checks** en este último: composición pública real,
PATCH propio de nombre conservando teléfono omitido, PATCH phone=null conservando
nombre/identidad y lecturas posteriores. [Resultado](t038-profile-minimal-retry-results.json).

Ambas limpiezas verificadas; en estos intentos se crearon dos usuarios bajo permisos
separados y un perfil, cero barberías/membresías. Cero usuarios/perfiles/identidades/
sesiones/refresh tokens asociados, conteos de negocio restaurados; manifiestos privados
retirados. No se presume invalidez inmediata de JWT ni se purga auditoría de plataforma.

**T038 [x]** tras revisar sus criterios literales; no exige una API GraphQL no contratada.
No se alteran los resultados históricos (41/42, comprobación posterior 401/42501 y
primer intento de callback fallido). GraphQL deshabilitado y versión numérica de runtime
Edge no observada documentados; sin inventar pruebas GraphQL/carreras remotas.
T039–T040 pendientes, sin ejecutar. Nueve avisos npm moderados continúan sin remediación
o aceptación formal. Sin cambios de aplicación/esquema/configuración, contenedores,
proyecto anterior, commit o push. [Conservación y diff](t038-profile-paridad-revision.json).

## T039 — consolidación final, 13/11/2026

Fundación 002 completada dentro de su alcance; el SaaS completo no está terminado.
Esta sección es el estado vigente; RED, bloqueos y pendientes anteriores son históricos.
No se borran ni se convierten retrospectivamente en GREEN.

| Requisito | Resultado dentro de 002 | Evidencia |
| --- | --- | --- |
| FR-001 | Proyecto nuevo independiente | [destino.md](destino.md), [t038-cierre-paridad.md](t038-cierre-paridad.md) |
| FR-002 | Migraciones/configuración reproducibles | [reproduccion.md](reproduccion.md) |
| FR-003 | Conservación e historial | [cierre.md](cierre.md) |
| FR-004 | Actor verificado por Auth | [perfiles.md](perfiles.md), [t038-functional-results.json](t038-functional-results.json) |
| FR-005 | Perfil único/idempotencia | [perfiles.md](perfiles.md), [t038-functional-results.json](t038-functional-results.json) |
| FR-006 | Edición/lectura propias | [t038-profile-minimal-retry-results.json](t038-profile-minimal-retry-results.json) |
| FR-007 | Perfiles ajenos denegados | [aislamiento.md](aislamiento.md), [t038-functional-results.json](t038-functional-results.json) |
| FR-008 | Alta propia con primer administrador | [atomicidad.md](atomicidad.md), [t038-functional-results.json](t038-functional-results.json) |
| FR-009 | Atomicidad e integridad | [atomicidad.md](atomicidad.md), [t038-sql-estructura.json](t038-sql-estructura.json) |
| FR-010 | Acceso y renombre contextuales | [t038-functional-results.json](t038-functional-results.json) |
| FR-011 | Pareja/roles/estado por tenant | [aislamiento.md](aislamiento.md), [t038-sql-estructura.json](t038-sql-estructura.json) |
| FR-012 | Membresías mínimas propias/contextuales | [aislamiento.md](aislamiento.md), [t038-functional-results.json](t038-functional-results.json) |
| FR-013 | Sin gestión ordinaria de personal | [aislamiento.md](aislamiento.md), [t038-functional-results.json](t038-functional-results.json) |
| FR-014 | Vigencia sin refresh | [t038-functional-results.json](t038-functional-results.json) |
| FR-015 | RLS/ACL compartidos | [t038-sql-catalogo.json](t038-sql-catalogo.json), [t038-sql-estructura.json](t038-sql-estructura.json) |
| FR-016 | Secretos/operaciones privilegiadas | [calidad.md](calidad.md), [t038-edge-http.json](t038-edge-http.json) |
| FR-017 | Clean Architecture y composición | [calidad.md](calidad.md), [t038-edge-local.log](t038-edge-local.log) |
| FR-018 | SQL y HTTP reales | [aislamiento.md](aislamiento.md), [t038-cierre-paridad.md](t038-cierre-paridad.md) |
| FR-019 | Consumidor reproducible, 001 preservada | [reproduccion.md](reproduccion.md), [t038-profile-minimal-retry-results.json](t038-profile-minimal-retry-results.json), [cierre.md](cierre.md) |
| FR-020 | Trazabilidad y riesgo vigente | [riesgo-npm.md](riesgo-npm.md), [cierre.md](cierre.md) |

| Criterio | Evidencia y alcance |
| --- | --- |
| SC-001 | [reproduccion.md](reproduccion.md), [destino.md](destino.md): preparaciones locales aisladas y nuevo Cloud; conservación en cierre |
| SC-002 | [perfiles.md](perfiles.md), [t038-profile-minimal-retry-results.json](t038-profile-minimal-retry-results.json): perfiles propios y edición; pruebas locales y Cloud separadas |
| SC-003 | [atomicidad.md](atomicidad.md), [t038-functional-results.json](t038-functional-results.json): carreras/rollback inducido locales; altas y PROFILE_REQUIRED remoto sin parciales |
| SC-004 | [aislamiento.md](aislamiento.md), [t038-functional-results.json](t038-functional-results.json): matriz local completa y casos funcionales remotos identificados; no se atribuyen 440 casos a Cloud |
| SC-005 | [calidad.md](calidad.md), [t038-edge-http.json](t038-edge-http.json): identidad, secretos y denegaciones; no seguridad absoluta |
| SC-006 | [reproduccion.md](reproduccion.md), guía quickstart y esta trazabilidad; enmienda autorizada sin tercero obligatorio |

### Atribución y límites de las evidencias reutilizadas

- Local real: SQL 336/336 y HTTP integral 440/440, check exit 0 en T032/T033; reproducción aislada T035. No se repiten en T039/T040.
- Dobles: unitarias Node/Deno y fixtures AST verifican contratos/arquitectura; no sustituyen Auth/RLS reales. Tokens externos simulados se identifican como fixtures.
- Cloud: cinco migraciones, catálogo 83/83, dos funciones ACTIVE v1 con JWT, diez rechazos HTTP, flujos A/B/roles/revocación y edición propia final 7/7.
- Historia conservada: 41/42 inicial por esperar 403 en anon, repetición correcta 401/42501; primer intento de perfil fallido por callback, limpieza y segundo intento aprobado. No se afirma rerun 42/42.
- Manual: creación/plan Free y datos del dashboard atribuidos al usuario; no garantizan costo futuro cero. Android/TalkBack/escala de texto son evidencia 001 del usuario, no pruebas nuevas de UI 002.
- Limpiezas Cloud verificadas por IDs exactos, cero fixtures activas. JWT pueden sobrevivir criptográficamente hasta expirar; auditoría de plataforma no purgada. Runtime Edge numérico no observado; GraphQL no contratado y extensión ausente.

### Rúbrica y pendientes del producto

Criterios 1–5: aportes de requisitos, diseño, arquitectura, SDD, unitarias/integración; no calificación académica definitiva. 6: flujos backend reales y Android 001 reutilizado, sin E2E móvil de autenticación 002. 7: UI 001, sin pantallas nuevas. 8–9: índices/planes aportan evidencia parcial, sin validación de escalabilidad global. 10 DNS/CDN, 11 caché, 12 CI/CD y 13 k6 siguen pendientes. 14–16: commit local/documentación no sustituyen publicación final, informe académico y sustentación.

Google y pantallas Auth, reservas/disponibilidad/servicios, pagos manuales, personal/invitaciones, mapas/búsqueda/reseñas, imágenes/Storage y notificaciones quedan futuros. Sin API Node propia ni microservicios. Nueve avisos moderados npm siguen sin remediación ni aceptación formal; historial 9 → 8/3 sin dev → 9 documentado, sin atribuir remediación.

## T040 — cierre formal de 002, 13/11/2026

T039 y T040 completadas, **40/40 tareas**. Cotejo nuevo de 815 archivos iniciales: 804 idénticos, 11 diferencias autorizadas, cero archivos ausentes/diferencias inesperadas. Ascendencia Git conservada. Trazabilidad 20 FR/seis SC y enlaces revisados, sin hallazgos de secretos en candidatos. [Cierre](cierre.md) y [detalle verificable](t040-integridad.json).

Comprobaciones nuevas: SHA-256, ascendencia, casillas/checklist, enlaces, revisión de candidatos y diff. Se reutilizan pruebas ya vinculadas; no se ejecutan instalaciones, SQL/HTTP remoto o baterías completas. Diff global exit 2 exclusivamente por t017-serve.log, excluyéndolo exit 0; ese log no se edita, detiene o incluye en el commit.

Cierre de fundación técnica, no del SaaS ni de toda la rúbrica. Nueve avisos npm y capacidades futuras conservan pendientes; auditoría de dependencias no aprobada. Commit local solicitado sujeto a staging revisado, sin push. No se inicia 003.
