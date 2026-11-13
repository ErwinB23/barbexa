# Quickstart de validación — 002

**Estado tras T011:** configuración local, migración mínima cerrada y schema.test.sql existen
y se comprobaron en el stack nuevo. Las operaciones de aplicación, entradas Edge y validaciones
posteriores descritas aquí siguen previstas; no ejecutarlas antes de sus tareas autorizadas.
Resultados y límites: [local.md](../../docs/evaluacion/evidencias/002-fundacion/local.md).
Usar [modelo](data-model.md), [contratos](contracts/backend-foundation.md) y
[matriz de aceptación](validation.md) como referencia, sin duplicar SQL aquí.

## Requisitos previos y destino

- Git y Node 24.21.0/npm 11.19.0 existentes; conservar package-lock y usar herramientas de 001.
- Supabase CLI 3.1.0 fijada como devDependency, con integridad npm y ejecutable cotejados en
  T003; usar `npx.cmd --no-install supabase` desde esta raíz. Deno 2.9.8 instalado externamente
  para check/test. No reinstalar herramientas ya verificadas. Verificar ayuda antes de ejecutar.
- Docker Desktop compatible con Windows/WSL2 y contenedores Linux, virtualización activa y
  puertos locales libres. Comprobar el motor real con `docker info`, no solo existencia del exe.
- PostgreSQL major 17 local y en el proyecto administrado nuevo; registrar parche/digests.
- Antes del remoto: organización, región, nombre, responsable y autorización del proyecto.
  Nunca seleccionar el backend de referencia. Sin destino inequívoco, detener acceso remoto.

Comprobaciones iniciales previstas en PowerShell:

```powershell
git status --short
git branch --show-current
git rev-parse HEAD
node --version
npm.cmd --version
supabase --version
supabase --help
supabase init --help
supabase db reset --help
supabase test db --help
supabase functions serve --help
deno --version
docker info
```

En la revisión plan solo se comprobaron Node/npm y búsquedas de herramientas; no se arrancó
Docker. Los `.ps1` de Spec Kit están bloqueados por la política actual; no cambiarla para
seguir esta guía. Usar binarios, `npm.cmd` y runners `.mjs`; comprobar `$LASTEXITCODE` al ejecutar
comandos externos y detenerse ante cualquier fallo.

## Preparación local durante implementación

1. Inventariar SHA-256 de archivos existentes y registrar Git. En carpeta temporal nueva
   ejecutar `supabase init`; inspeccionar su salida y copiar solo configuración nueva tras
   verificar colisiones. Si ya existe `supabase/`, comparar y detenerse ante diferencias no
   autorizadas. No sobrescribir AGENTS, skills, specs, docs, configuración ni historial.
2. Configurar project_id exclusivo `app-barberia-002-local`, PostgreSQL 17 y schemas API.
   Configuración del [plan](plan.md#preparación-y-migraciones-previstas) versionada; seed
   automático desactivado. Crear archivos con `supabase migration new <nombre>` durante la
   implementación y escribir solo el modelo/ACL/operaciones aprobados. No generar nombres
   timestamp manualmente ni copiar migraciones antiguas.
3. Antes de comandos que modifican datos, comprobar directorio resuelto, project_id y
   ausencia de opciones/variables que seleccionen un remoto. No volcar variables de entorno
   completas a consola o logs: pueden contener secretos. El guard del runner acepta solo
   loopback para pruebas destructivas y rechaza URLs del backend anterior.

### Arranque del entorno ya preparado, sin depender del anterior

Desde la raíz App-Barberia, confirmar `project_id = "app-barberia-002-local"` en
supabase/config.toml y revisar Docker antes de arrancar. La red y los volúmenes propios llevan
ese sufijo, distinto de barberia-app. API 54421, DB 54422, Studio 54423, correo local 54424;
shadow 54420 reservado, pooler/analytics desactivados (54429/54427), inspector Edge 8183
configurado sin sesión debug validada. Comprobar disponibilidad de puertos si están detenidos;
si ya están ocupados, verificar que pertenecen a este stack, sin detener servicios ajenos.

Comandos comprobados en T008–T011 (cada fallo debe detener la secuencia):

```powershell
$featureRoot = (Get-Location).Path
if ((Get-Content -Raw supabase/config.toml) -notmatch 'project_id = "app-barberia-002-local"') {
  throw 'Destino local inesperado'
}
if (Get-ChildItem Env:SUPABASE_* -ErrorAction SilentlyContinue) {
  throw 'Revisar variables SUPABASE_* heredadas antes de seleccionar destino'
}
npx.cmd --no-install supabase start --workdir "$featureRoot"
if ($LASTEXITCODE -ne 0) { throw 'Fallo al iniciar el stack local' }
npx.cmd --no-install supabase migration list --workdir "$featureRoot"
if ($LASTEXITCODE -ne 0) { throw 'Fallo al listar migraciones locales' }
npx.cmd --no-install supabase db lint --fail-on warning --workdir "$featureRoot"
if ($LASTEXITCODE -ne 0) { throw 'Fallo en lint SQL' }
npx.cmd --no-install supabase db advisors --workdir "$featureRoot"
if ($LASTEXITCODE -ne 0) { throw 'Fallo en advisors' }
npx.cmd --no-install supabase test db supabase/tests/schema.test.sql --workdir "$featureRoot"
if ($LASTEXITCODE -ne 0) { throw 'Fallaron las pruebas PostgreSQL' }
```

El runner final debe comprobar **cada** código, no únicamente el último mostrado en este
extracto. CLI v3 selecciona local por defecto; no agregar `--remote` a estas pruebas ni usar
flags heredados `--local`/`--linked`. `db reset` elimina datos del stack local: solo usar el
entorno descartable identificado, nunca una base compartida. Ningún reset remoto forma
parte de este procedimiento. Revisar hallazgos de advisors; exit 0 no equivale a audit passed.

T011 ejecutó `npx.cmd --no-install supabase db reset --no-seed --workdir "$featureRoot"`
solo tras comprobar identidad del contenedor/volumen nuevos y ausencia de datos. No es un paso
de arranque habitual ni debe repetirse sobre datos que se quieran conservar. Para detener el
entorno propio cuando sea necesario: `npx.cmd --no-install supabase stop --workdir "$featureRoot"`
(no ejecutado en este bloque, sin --all ni --no-backup). Nunca apuntar al directorio antiguo.

Tras T019, ensure-profile tiene enabled=true y verify_jwt=true. create-barbershop tambi?n tiene
enabled=true/verify_jwt=true tras T025. Un primer start con entradas habilitadas sin handlers falló y se corrigió
esa configuración; no crear handlers ficticios ni usar --no-verify-jwt. Realtime, Storage y
analytics están desactivados para este incremento. Start puede mostrar claves locales: no
copiar su salida sin redactar en Git, Expo, evidencias ni transcripciones.

## Sesiones, Edge e integración

El runner tendrá dos fases separadas: preparación privilegiada **local** de fixtures y
operaciones ordinarias con JWT emitidos por Auth. Generar passwords de prueba aleatorios
en memoria y no publicarlos. No almacenar usuarios reales ni claves en fixtures versionados.

Separar variables:

- Cliente: URL, clave publicable y token de prueba inyectado. No secret/service_role.
- Servidor Edge: URL, clave pública para verificación y secret key de servidor; compatibilidad
  service_role local solo en infraestructura. Ninguna variable privilegiada `EXPO_PUBLIC_*`.
- Operador de fixtures: credencial administrativa local y conexión del contenedor, fuera del
  consumidor ordinario. No imprimir `supabase status`/JSON de claves en evidencias.

Archivo privado de entorno fuera del repositorio, excluido de transcripciones. No incluir
valores reales en ejemplos. En una segunda terminal, desde el mismo proyecto local:

```powershell
supabase functions serve --env-file "$env:BARBERIA_002_PRIVATE_ENV_FILE"
```

No usar `--no-verify-jwt`. Ambos handlers verifican también sesión contra Auth. Si los JWT
locales/firmas no son compatibles con el gateway, diagnosticar y documentar la configuración
antes de continuar; no desactivar la comprobación para obtener verde.

Comandos de validación previstos, cuando existan los archivos de implementación:

```powershell
npm.cmd run check
npm.cmd exec -- tsc -p tsconfig.server-core.json --noEmit
deno check supabase/functions/ensure-profile/index.ts supabase/functions/create-barbershop/index.ts
deno test --no-prompt tests/server/tenant-foundation
node scripts/check-server-architecture.mjs
node --env-file="$env:BARBERIA_002_PRIVATE_ENV_FILE" scripts/run-backend-integration.mjs
git diff --check
```

El runner integra Auth → casos de uso cliente → Edge/PostgREST → PostgreSQL. Ejecuta además
intentos directos adversarios y carreras mediante dos procesos psql del contenedor, con
timeouts y códigos de salida. No necesita instalar un driver PostgreSQL npm. Los permisos
de Deno para unitarias son los predeterminados (sin red/env); la integración HTTP real se
ejecuta por Node con acceso explícito al entorno de pruebas. Capturar logs redactados y
resultados por caso conforme a [validation.md](validation.md).

## Segundo entorno vacío y remoto nuevo

Para SC-001 repetir en una carpeta temporal externa con copia controlada de artefactos
versionados, project_id y puertos distintos. No reutilizar volumen Docker ni datos del primero.
Comparar modelo, ACL/RLS, migraciones y resultados de casos, no UUID aleatorios/passwords.
Conservar hashes del proyecto principal y detener solamente los recursos propios de prueba.

Solo después de aprobación del destino: crear **nuevo** proyecto administrado, registrar
referencia y configurar Auth/API por procedimiento reproducible. Comprobar con CLI v3 la
ayuda de link/config/deploy y destino efectivo. Revisar `config diff` antes de `config push`;
aplicar migraciones con destino remoto explícito y desplegar exclusivamente las dos entradas.
No usar `pull` del antiguo ni `--prune` para eliminar funciones. Las confirmaciones remotas
son la última acción tras revisar configuración y destino. No registrar tokens personales
de plataforma; usar acceso operativo limitado al nuevo entorno.

Paridad remota: comparar catálogos/grants y probar los flujos permitidos/denegados con
identidades sintéticas autorizadas; fixtures SQL y triggers de fallo no se despliegan como
migraciones. Documentar diferencias respecto al stack local. Si no hay remoto nuevo preparado,
FR-001 y su evidencia permanecen pendientes; un stack local no acredita un proyecto alojado.

## Cierre posterior

Registrar comandos y exit codes, versiones, casos, resultados, límites y trazabilidad sin
secretos; preservar 001. No repetir pruebas manuales Android si su UI no cambió: reutilizar
su evidencia con el alcance real y comprobar regresiones automatizadas. Si cambia la interfaz
deberá validarse el flujo afectado. Carga, caché, CI/CD, Google e interfaz Auth siguen futuras.
Los avisos npm históricos y la consulta actual de [research.md](research.md#riesgo-npm-consulta-real)
no quedan resueltos por superar integración. No ejecutar audit fix ni actualizaciones automáticas.

## Incremento de perfiles comprobado en T019

Ver [evidencia de perfiles](../../docs/evaluacion/evidencias/002-fundacion/perfiles.md).
Con el stack propio operativo, functions serve --workdir expl?cito recupera ?nicamente el
runtime de funciones, sin iniciar/parar el stack completo. Mantener una sola instancia.
Para ejecutar solo lo implementado: configurar BARBERIA_002_URL=http://127.0.0.1:54421 y
BARBERIA_002_PROJECT_ID=app-barberia-002-local, y usar
`node scripts/run-backend-integration.mjs --profiles`. La preparaci?n privilegiada es local
y privada; el cliente compilado recibe ?nicamente clave p?blica y token de usuario.
El runner sin selector sigue exigiendo los escenarios futuros completos. No ejecutar
create-barbershop ni afirmar integraci?n de barber?as antes de sus tareas.

## Aprovisionamiento comprobado en T027

Ambas entradas est?n implementadas y habilitadas con verify_jwt=true. Para US3, con el
mismo destino local expl?cito y Edge activo, ejecutar
`node scripts/run-backend-integration.mjs --barbershops`. [Atomicidad y l?mites](../../docs/evaluacion/evidencias/002-fundacion/atomicidad.md).
La prueba C2 abre sesiones psql propias; C3 instala y retira un trigger limitado al actor
sint?tico; todas las fixtures se limpian en finally. No ejecutar contra datos de producci?n.
El check general fue ejecutado con c?digo 0 en T027, con Deno 2.9.8 disponible en el PATH
del proceso. Los pasos posteriores y la matriz integral a?n no se acreditan por ese resultado.
