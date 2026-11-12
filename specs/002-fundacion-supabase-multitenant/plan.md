# Implementation Plan: Fundación Supabase y aislamiento multitenant

**Branch**: `main` | **Date**: 2026-11-11 | **Spec**: [spec.md](spec.md)

**Identificador**: `002-fundacion-supabase-multitenant`. Plan propuesto; ninguna integración,
migración, prueba de base de datos o creación de proyecto se ha ejecutado en esta fase.

## Summary

Preparar un Supabase nuevo con tres tablas propias, perfiles privados y permisos por
membresía vigente. Crear barbería y primer administrador en una única operación PostgreSQL,
precedida por una entrada Edge que verifica al actor. Demostrar los flujos mediante un
runner de integración y los casos de uso cliente, sin pantallas completas de autenticación.
La gestión de personal se limita a fixtures; descubrimiento público y reservas siguen fuera.

Decisiones, alternativas y fuentes: [research.md](research.md). Modelo:
[data-model.md](data-model.md). Interfaces: [contratos](contracts/backend-foundation.md).
Aceptación y trazabilidad: [validation.md](validation.md). Procedimiento futuro:
[quickstart.md](quickstart.md).

## Technical Context

| Aspecto | Selección y límite |
| --- | --- |
| Lenguaje | Cliente TypeScript 6.0.3 estricto existente; servidor TypeScript estricto sobre Edge Runtime Deno 2, con objetivo ES2022 |
| Cliente conservado | Expo 58.0.24, Router 58.0.31, React Native 0.88.1; Node 24.21.0 y npm 11.19.0 para herramientas existentes |
| Herramientas nuevas previstas | Supabase CLI **3.1.0** mediante binario Windows oficial con checksum; Deno **2.9.8** para check/test local. Sin agregarlos a dependencias de Expo |
| Persistencia | Supabase PostgreSQL **major 17** como objetivo local/nuevo remoto; registrar parche, imágenes y digests efectivos al preparar el entorno, sin inventarlos |
| Integraciones | Auth, Edge Functions y PostgREST; adaptadores con `fetch` nativo, sin SDK npm adicional en 002 |
| Pruebas | `node:test` existente para cliente; `Deno.test` para servidor; pgTAP y pruebas HTTP reales; concurrencia con dos sesiones PostgreSQL mediante `psql` del contenedor |
| Plataforma | Windows/PowerShell y Docker Desktop con contenedores Linux; Android conserva 001. Deno CLI, Supabase CLI, Docker y psql no se encontraron en PATH durante esta revisión |
| Rendimiento | Sin SLO de latencia inventado. Medir duración de consultas y planes con volumen sintético; índices de FK/RLS y cero resultados incorrectos ante concurrencia |
| Alcance/escala | Tres tablas de aplicación, dos entradas Edge, A/B y actores de la matriz. No equivale a validación de carga de producción |

La versión del CLI se verificó en la publicación oficial. Su v3 cambia los destinos y
algunas opciones: usar comandos locales por defecto y `--remote` explícito solo para el
proyecto nuevo autorizado. Antes de implementación comprobar `--help` del binario fijado.
El Deno del host no acredita la versión exacta del runtime administrado: registrarla y
ejecutar integración en Edge. No se propone actualizar Node, Expo ni su lockfile.

## Constitution Check

Gates revisados antes de investigación y después del diseño, contra Constitución 1.0.1:

| Principios | Comprobación del diseño | Resultado documental |
| --- | --- | --- |
| I–III | Tres capas lógicas; módulos funcionales; núcleos sin HTTP/SQL/SDK; composiciones separadas | Conforme |
| IV–V | Expo conservado; Auth/Edge/PostgREST/PostgreSQL; sin API Node ni microservicios | Conforme |
| VI | Privacidad por defecto, permisos contextuales, identidad verificada, SQL privilegiado limitado y secretos fuera del cliente | Conforme; ejecución pendiente |
| VII | No se implementan reservas/pagos; se conserva su recorrido aprobado para etapas futuras | No aplicable a estas operaciones |
| VIII | Cuatro US, 20 FR y seis SC sin cambiar la especificación; matriz de trazabilidad | Conforme |
| IX | Unitarias, integración/RLS, HTTP de extremo a extremo y concurrencia de aprovisionamiento. Caché, k6 y carga de negocio se aplazan explícitamente | Conforme al alcance de spec; no se eliminan obligaciones futuras |
| X–XII | Controles existentes, evidencia sin secretos y actualización posterior del estado compartido | Previsto; ninguna prueba de implementación aprobada ahora |

No se solicita excepción constitucional. La rúbrica 1–6 recibe diseño y verificaciones
previstas; 8–9 reciben índices/mediciones iniciales, sin declarar escalabilidad validada.
DNS/CDN, caché de datos apropiados, CI/CD y k6 permanecen pendientes para etapas pertinentes.
En 002 **no se cachean permisos ni membresías**: la siguiente solicitud consulta el estado
vigente. No confundir esto con satisfacer el criterio académico de caché.

## Arquitectura y flujos

Las tres capas lógicas no son tres servidores: presentación (cliente y entradas HTTP),
aplicación/negocio (casos de uso puros cliente/servidor) y datos/archivos (Auth y PostgreSQL
vía servicios administrados; Storage no se configura en 002). Infraestructura y composición
son responsabilidades internas de Clean Architecture, no capas adicionales de despliegue.

| Responsabilidad | Cliente | Servidor |
| --- | --- | --- |
| Dominio | Perfil, barbería, membresía, validaciones y errores propios | Actor verificado, entradas y resultados propios; no importar tipos cliente |
| Aplicación | Operaciones de fundación mediante `TenantFoundationGateway` | `EnsureOwnProfile` y `CreateOwnBarbershop` mediante `FoundationProvisioningGateway` |
| Presentación/entrada | Runner técnico consumidor; UI existente sin cambios funcionales | HTTP: sesión, método/body, mapeo a contexto propio y respuestas seguras |
| Infraestructura | Adaptador HTTP con token de usuario inyectado; traduce filas/errores | Adaptador Auth y adaptador PostgREST RPC con credencial secreta separada |
| Composición | Fábrica cliente consumida por el runner; sin token global ni secretos | Fábrica por solicitud que ensambla autenticación, casos de uso y persistencia |

Creación: consumidor → caso de uso cliente → adaptador → `create-barbershop` → Auth verifica
Bearer → `CreateOwnBarbershop` → adaptador PostgreSQL → RPC invoker restringida → función
privada transaccional → barbería + membresía. El body contiene solo el nombre. Un actor
añadido al JSON se rechaza, no se propaga a SQL.

La RPC recibe internamente un actor obtenido por Edge. Esta confianza está limitada por ACL:
solo `service_role` puede ejecutarla; `anon`/`authenticated` no pueden invocarla ni a través
de PostgREST. PostgreSQL valida existencia de identidad/perfil y datos, fija rol/estado y
genera IDs. La credencial de servicio **omite RLS**: no se presenta esta escritura como una
prueba de RLS. Su seguridad depende además de la entrada verificada, autorización SQL y ACL.

Lectura y edición básica: casos de uso cliente → adaptador PostgREST con JWT del usuario →
grants por columna + RLS → PostgreSQL. Incluye perfil propio, barberías/membresías permitidas
y cambio de nombre por admin activo. No se necesita una Edge por cada lectura.

## Project Structure

### Documentation (this feature)

```text
specs/002-fundacion-supabase-multitenant/
├── spec.md                         # aprobado, conservado
├── checklists/requirements.md       # conservado
├── plan.md
├── research.md
├── data-model.md
├── contracts/backend-foundation.md
├── quickstart.md
└── validation.md
```

No se genera `tasks.md` en esta fase.

### Source Code previsto (todavía no creado)

```text
src/features/tenant-foundation/
├── domain/                         # tipos y validación puros
├── application/                    # gateway y operaciones públicas
└── infrastructure/                 # adaptador HTTP, DTO externos privados
src/composition/tenant-foundation-composition.ts
supabase/
├── config.toml
├── migrations/                     # nombres timestamp creados por CLI
├── functions/
│   ├── ensure-profile/index.ts      # entrada delega a handler compartido
│   ├── create-barbershop/index.ts
│   └── _shared/tenant-foundation/
│       ├── domain/
│       ├── application/
│       ├── presentation/            # handlers HTTP
│       ├── infrastructure/          # Auth HTTP y PostgREST RPC
│       └── composition.ts
└── tests/                          # suites pgTAP
tests/unit/tenant-foundation/        # cliente, runner actual
tests/server/tenant-foundation/      # Deno.test, incluido handler con dobles
tests/integration/tenant-foundation/ # HTTP con JWT reales, fixtures y concurrencia
scripts/check-server-architecture.mjs
scripts/run-backend-integration.mjs
docs/evaluacion/evidencias/002-fundacion/  # futuras evidencias redactadas
```

Solo se crean archivos con consumidores concretos; no carpetas vacías de presentación
cliente ni framework de repositorios genérico. El runner importa la composición cliente,
no sustituye sus casos de uso por llamadas crudas. Las pruebas adversarias sí acceden
directamente a PostgREST para intentar eludir ese cliente.

El checker actual inventaría exclusivamente `src/`. Se conservarán sus 38 regresiones y
reglas; se añadirá auditoría explícita del árbol servidor usando TypeScript Compiler API,
con fixtures de alias, type imports, reexportaciones y tránsito. No basta ejecutar el
checker cliente para afirmar que también verificó Edge. Núcleos de ambos lados se compilan
sin DOM/Node/Deno/SDK; HTTP y permisos del runtime quedan en adaptadores/entradas. Imports
de servidor `.ts` compatibles con Deno; cliente con resolución Metro ya corregida en 001.

Prever `tsconfig.server-core.json` con strict, noEmit, lib ES2022, types vacíos y resolución
Bundler/allowImportingTsExtensions, limitado a dominio/aplicación de servidor. `deno check`
comprueba además entradas/adaptadores con sus APIs de runtime; no reemplaza ese control del
núcleo. Auditoría servidor: index solo entrada/composición, handler → aplicación/dominio,
aplicación → dominio, infraestructura → contratos/núcleo y composición → concreciones;
prohibir cruces a src, imports externos en núcleo y análisis incompleto. Reutilizar la lógica
AST existente donde sea posible, con regresiones; no crear un checker basado solo en regex.

## Preparación y migraciones previstas

1. Confirmar Git y hashes; verificar herramientas/puertos. Inicializar configuración en
   carpeta temporal y comparar colisiones antes de incorporar únicamente archivos nuevos.
   Nunca ejecutar una inicialización que sobrescriba el proyecto existente.
2. Configurar `project_id` local exclusivo, PostgreSQL 17, API expuesta solo en `public`,
   schema `private` excluido, seed automático desactivado, sign-in anónimo desactivado y
   `verify_jwt=true` en ambas entradas. Datos de prueba fuera de migraciones de producción.
3. Crear migraciones ordenadas por CLI: modelo mínimo y restricciones **con RLS habilitada
   y grants revocados antes de su primer commit**; después helpers/políticas y grants mínimos;
   finalmente operaciones atómicas privadas y wrappers. No dejar tablas accesibles entre
   migraciones. Creación de funciones y revocación de EXECUTE ocurren en la misma transacción.
4. Pruebas locales desde cero, segunda preparación aislada y comparación de capacidades.
   Registrar versión CLI, imágenes/digests y versión real PostgreSQL/Edge; no solo major.
5. Con autorización y destino definidos, crear un proyecto **nuevo** administrado; registrar
   referencia no secreta/organización/región y comprobar que no sea el anterior. Aplicar
   configuración/migraciones revisadas y desplegar solo estas dos funciones. Validar paridad
   de grants/RLS/operaciones con identidades sintéticas. Nunca importar dumps anteriores.

No se reescriben migraciones aplicadas; correcciones posteriores mediante otra migración.
`db reset` queda limitado al stack local descartable identificado. No habrá reset remoto ni
`db pull` del backend anterior. Los fixtures con usuarios confirmados por API administrativa
son exclusivos del runner local; no se desactiva confirmación de correo en producción para
facilitar pruebas. Google, persistencia/renovación de sesión y sus pantallas se integrarán después.

## Errores, observabilidad y verificación

Los contratos definen errores propios y traducción HTTP. Una lectura RLS sin filas no debe
revelar si un recurso ajeno existe; una escritura de cero filas se interpreta como resultado
no disponible/denegado, nunca como éxito. Red, Auth no disponible y RPC fallida no generan
éxito local. Creaciones no se reintentan automáticamente tras timeout: listar pertenencias
y reconciliar antes de repetir; no se promete idempotencia de alta de negocios.

Logs estructurados mínimos: ID de correlación generado por servidor, operación, resultado,
duración y código seguro; sin Authorization, claves, body, teléfono ni fila de perfil.
Correlación no sustituye un registro de auditoría de negocio, fuera de esta fundación.
Pruebas e inventario de resultados se detallan en [validation.md](validation.md).

## Riesgos y decisiones previas a implementación

- Definir organización, nombre, región y responsable/costo del **nuevo** proyecto antes de
  crearlo o desplegar. Los secretos se entregan por mecanismo privado, no en este plan.
- Habilitar/verificar Docker/WSL2, CLI y Deno. Su ausencia en PATH es un requisito previo,
  no prueba de que no estén instalados en otra ubicación. No se instalaron ahora.
- Confirmar disponibilidad de PostgreSQL 17 en el destino nuevo. Si difiere, detener la
  preparación afectada y revisar compatibilidad/versionado antes de cambiar esta decisión.
- Aprobación de este plan precede a tasks e implementación. No queda ambigüedad de permisos:
  alta propia abierta a autenticados y privacidad inicial fueron confirmadas por el responsable.
- Nueve avisos moderados históricos siguen sin remediación acreditada. Consulta nueva:
  ocho moderados totales y tres sin dev, ambos exit 1; [análisis](research.md#riesgo-npm-consulta-real).
  No se acepta ni se declara superado el riesgo de seguridad. No agregar SDK en 002 evita
  ampliar ese árbol; no elimina la exposición existente.

## Complexity Tracking

Sin violaciones constitucionales. Dos entradas separan operaciones con contratos distintos;
comparten núcleo y composición del módulo. Funciones privadas privilegiadas se justifican
por aprovisionamiento atómico y helpers RLS sin recursión; no habilitan administración general.

## Registro de esta fase

Git inicial: `main`, `e0141cbfe95a76e9eac4a0aeae86d8d0c49e5902`; solo spec/checklist 002
sin seguimiento. `setup-plan.ps1 -Json` terminó con código 1 por política de ejecución;
se leyó su procedimiento, metadata activa y plantilla core resuelta por `specify preset
resolve plan-template` (código 0), sin cambiar la política. No hay `extensions.yml` ni hooks
de plan. Verificación ejecutada aquí: lectura, consultas oficiales/npm e integridad documental;
las verificaciones del backend descritas son futuras, no resultados obtenidos.

Revisión documental: seis artefactos nuevos, trazabilidad de 20 FR y seis SC, sin marcadores
de plantilla ni enlaces locales inexistentes. Cotejo SHA-256 de los 807 archivos previos:
sin cambios. `git diff --check`: código 0. Para archivos nuevos sin seguimiento se comprobó
además whitespace y destinos de enlaces; `git diff --no-index --check` devuelve 1 por existir
diferencias frente a NUL, sin diagnósticos de whitespace (no es una prueba de backend fallida).
No se modificaron spec/checklist 002, documentos de 001, código, dependencias, Constitución
o rúbrica; rama e historial conservados. Sin hooks before/after_plan registrados.
