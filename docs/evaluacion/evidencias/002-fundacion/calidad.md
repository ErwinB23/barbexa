# T033 — auditoría de arquitectura, calidad y fronteras de confianza

| Severidad | Hallazgos del alcance revisado | Estado |
| --- | --- | --- |
| Crítica / alta | 0 detectados | No equivale a garantía de ausencia |
| Media | 1 cadena de dependencia con nueve nodos npm moderados reportados | Abierta, sin remediación ni aceptación formal |
| Baja | 1 traducción incorrecta de sesión inválida en cliente | Corregida y verificada en T031 |

13/11/2026, Codex. `main/2f37266`, cambios T020–T032 conservados. Alcance: árboles reales
cliente y Edge de tenant-foundation, composición, cinco migraciones, catálogo efectivo local,
runner/fixtures, pruebas y evidencias. TypeScript, Node, Deno, HTTP/PostgREST y PostgreSQL.
T033 completada según sus controles; **no se declara aprobada una auditoría global npm**.

## Comandos y resultados ejecutados

| Control | Resultado |
| --- | --- |
| `npm run check` | **Exit 0**, completo; [log](t033-check.log) |
| TypeScript cliente/core y `tsc -p tsconfig.server-core.json --noEmit` | Exit 0, incluidos en check |
| ESLint cliente/servidor y Prettier | Exit 0, incluidos en check |
| AST real cliente | 30 módulos, 11 de núcleo, 60 aristas; cero infracciones |
| AST real servidor | 13 módulos, seis de núcleo, 29 aristas; cero infracciones |
| Regresiones arquitectónicas | 38 cliente y 45 servidor, exit 0; las fixtures negativas fallan como se espera |
| Unitarias Node | 86/86, exit 0; ejecutadas junto a regresiones 001 |
| Presentación existente / runner seguro | 11/11 y 18/18, exit 0 |
| `deno check` de ambas entradas / `deno test` servidor | Exit 0; 17/17 unitarias, sin permisos de red/env |
| `npm run coverage:server` | Exit 0; [LCOV y ejecución](t033-server-coverage.log) |
| SQL lint `--fail-on warning` / advisors | Exit 0, sin hallazgos; [lint](t033-sql-lint.log), [advisors](t033-sql-advisors.log) |
| Catálogo efectivo local | Exit 0; [RLS, políticas, owners y EXECUTE](t033-catalogo.json) |
| Matriz SQL/HTTP | Se reutiliza la ejecución nueva T032: 336 SQL y 440 resultados TAP HTTP, exit 0; [detalle](aislamiento.md) |

Deno 2.9.8 se añadió únicamente al PATH del proceso de verificación, sin instalación o cambio
de política de PowerShell. El prerequisito `.ps1` de Spec Kit sigue bloqueado por la política
del equipo; se revisaron directamente los artefactos. Checklist documental 16/16, sin hooks
de extensión registrados. No se debilitó ningún checker, suite ni umbral para obtener GREEN.

## Cobertura delimitada

[Node cliente](t033-cobertura-cliente.json): seis archivos ejecutables de dominio/aplicación
tenant-foundation, **100 % líneas, funciones y ramas por archivo**, medidos dentro de check.
La cobertura de foundation 001 se conserva en el log y no se presenta como cobertura nueva.

[Deno servidor](t033-cobertura-servidor.json): cinco archivos ejecutables de núcleo,
**85/85 ramas y 142/142 líneas**. Tipos/puertos sin ejecución no requieren pruebas artificiales.
LCOV contiene también infraestructura/presentación: sus cuatro archivos se registran como
informativos y algunos tienen cobertura parcial. No se les atribuye el 100 % del núcleo.
No se suman porcentajes entre runtimes ni se extrapolan a SQL, UI o integración HTTP.

## Revisión de seguridad y flujos de datos

1. **Cliente → Auth → PostgREST:** token vigente inyectado, ID propio obtenido por verificación
   Auth, no por body/metadata. Los filtros elegidos por el consumidor no autorizan; las tres
   tablas tienen RLS, cinco políticas y grants mínimos por columna. Domain/application no
   conocen fetch, SQL, SDK ni tipos generados. Presentación no importa adaptadores.
2. **Entrada Edge:** verifyJWT activo y nueva verificación contra `/auth/v1/user`; se rechaza
   identidad anónima. Body por lista de campos, validación runtime, máximo 8 KiB leído por
   streaming, métodos limitados y CORS por allowlist. Logs de handler solo requestId/status;
   errores propios sin stack, SQL o datos del perfil.
3. **Frontera privilegiada:** VerifiedActor procede del verificador, no del JSON. El adaptador
   servidor envía valores a RPC sin interpolar SQL. Credencial de servicio separada de la
   sesión cliente; nunca se inyecta en Expo. Los dos wrappers invoker y sus implementaciones
   privadas solo conceden EXECUTE a service_role. Esa credencial es privilegiada: comprometerla
   rompe esta frontera y requiere custodia; BYPASSRLS no demuestra aislamiento ordinario.
4. **PostgreSQL:** funciones privadas definer acotadas, owner postgres y `search_path=''`.
   Ninguna de las siete funciones revisadas concede EXECUTE a PUBLIC/anon. Helpers de
   membresía usan exclusivamente auth.uid() y filas vigentes, sin usuario alternativo.
   El listado invoker exige admin activo del tenant, devuelve cinco columnas y no une perfiles.
   ID/FK son inmutables para usuarios y las escrituras de membresías siguen denegadas.
5. **Atomicidad e integridad:** FK/CHECK/UNIQUE, creación de barbería+membresía en transacción,
   y regresiones reales C1–C4 aprobadas en T032. No hay autorización por metadata ni caché
   de permisos. No se promete revocar una consulta que tomó snapshot antes del COMMIT.
6. **Herramientas de prueba:** acceso administrativo solo tras guard de destino loopback,
   proyecto, puerto, red y volúmenes. SQL interpolado en fixtures usa IDs sintéticos validados
   y constantes de test, no entrada pública; procesos con argumentos separados/timeouts y
   cleanup de directorios con propiedad comprobada. MD5 se usa como huella de comparación
   de estado de test, nunca para autenticación o contraseñas. No hay una API Node de negocio.

## Hallazgos y acciones

**Baja, confianza alta, corregida — traducción de Auth 403.**
Ubicación: `src/features/tenant-foundation/infrastructure/tenant-foundation-http-adapter.ts`,
funciones request/session. El rechazo `bad_jwt` se exponía como FORBIDDEN; no concedía acceso.
Se limita la traducción a UNAUTHENTICATED en el endpoint Auth, conservando el 403 contextual
de RPC. RED/GREEN y comprobación real constan en [aislamiento.md](aislamiento.md).

**Media, confianza alta en el aviso; alcanzabilidad en producto no demostrada — npm.**
Se reutiliza el análisis [T002](riesgo-npm.md) y su [consulta](npm-audit.json); no se presenta
como un audit nuevo. Lectura actual del lock confirma minimatch 10.2.6 en fingerprint/ramas
ESLint y las versiones Expo 58.0.24/eslint-config-expo 58.0.4. Nueve nodos afectados totales,
tres sin dev, según ese reporte; una cadena de aviso no son nueve exploits independientes.
No se acreditó explotación en Android/PostgreSQL ni remediación. Sin cambios de paquetes,
overrides, audit fix o force. Acción pendiente: evaluar parche upstream compatible en un
cambio separado o aceptación explícita del riesgo; T033 no lo acepta por el responsable.

**Observaciones de operación, no vulnerabilidades demostradas:** el primer runner integral
falló sin diagnóstico público detallado; luego las mismas suites y el runner original
pasaron. Se conserva el registro y no se inventa una causa. Edge está gestionado por el
proceso serve activo; su ID observado difiere del registro T030, sin órdenes de ciclo de vida
por este bloque. Los doce contenedores antiguos y siete servicios nuevos ajenos a Edge
mantienen metadatos estables. Disponibilidad continua/causa del cambio de ID no se acreditan
por una instantánea; esto no se presenta como prueba de producción.

## Conservación, secretos y límites

[Revisión final de archivos y diff](t033-revision.json) y [conservación final](t033-conservacion.json).
La revisión de patrones y flujo distingue valores sintéticos de credenciales: sin secretos
detectados en archivos nuevos/revisados, sin JWT reales, URLs firmadas o entornos privados
añadidos. Es una revisión acotada, no una garantía universal basada en regex.
No quedaron usuarios/filas/artefactos SQL de test. No se editó ni detuvo el log activo.

No se modificaron dependencias, migraciones, núcleo servidor, Constitución, rúbrica o 001.
Sin Cloud, instalaciones, db reset, commit o push. T034–T040 pendientes; sin nueva prueba
Android/web/TalkBack, remoto, k6, caché, CI/CD o DNS/CDN. La próxima tarea disponible es T034.

Referencias consultadas: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[errores Auth](https://supabase.com/docs/guides/auth/debugging/error-codes) y
[observabilidad](https://supabase.com/docs/guides/observability).
