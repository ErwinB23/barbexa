# T033 — revisión técnica acotada, aceptación publicada pendiente

15/11/2026. Alcance: cambios de recuperación, composición, caché y evidencias relacionadas.
Skills utilizadas: security-review y github-actions-hardening para el workflow. No es una
auditoría completa de todo el repositorio ni de los proyectos Cloud.

| Severidad | Resultado |
| --- | --- |
| Alta/crítica nueva confirmada | Ninguna identificada en el alcance leído/probado. No significa ausencia garantizada. |
| Riesgo vigente | Persistencia Web accesible a JavaScript: XSS puede comprometer la sesión. Riesgo residual aceptado por el usuario en preparación003, sin protección HttpOnly atribuida. |
| Dependencias pendientes | Auditoría existente T005:9 moderados totales,3 sin dev; reutilizada, no nueva consulta npm ni remediación. |
| Configuración pendiente | Origen de aceptación, HTTPS y CSP reales no aprobados/verificados en este bloque. |

Flujo revisado: entrada formulario→validador propio→SDK configurado→getUser→estado
restringido→updateUser→salida local. No roles desde metadata/query ni claves privilegiadas
en cliente. `session_id` decodificado liga una sesión **después** de verificar su usuario
con Auth; no sirve como verificador JWT ni autorización de negocio.

Callbacks admiten solo origen/path configurados, código y opcional flow id SDK validado;
URL Web saneada incluso en errores. Código/token no se publica en snapshots React.
Recovery no entrega tokens al transporte ordinario y cuenta solo se monta tras ready.
Logout retira contexto/cache y verifica eliminación de las claves propias.

Renderización mediante Text/TextInput y componentes existentes; búsqueda en auth/composición
sin innerHTML, eval, HTML inseguro o logs nuevos. Los tests VM usan código de prueba local,
no datos de usuario. Caché almacena solo DTO comercial validado/copias defensivas, nunca
permisos ni slots como autoridad. Cada hit vuelve a verificar identidad en servidor.

[Escaneo acotado](../004-reservas/t028-t029/security-review.json):68 archivos, cero coincidencias
de claves privilegiadas/PAT/JWT literales/URLs firmadas/clave privada/conexión con contraseña
en los patrones revisados. No se imprimieron valores. Archivo local .env y credenciales
de fixtures siguen ignorados; ningún .env privado aparece en `git ls-files` consultado.
No se leyó ni editó el log activo. Esto no sustituye pruebas dinámicas o revisión independiente.

T033 no se cierra: faltan origen publicado/HTTPS/CSP y validaciones reales finales. Las
mitigaciones y el buen uso de componentes no garantizan protección frente a XSS.

Actualización funcional del 15/11: se verificó en navegador la retirada efectiva de
parámetros de recuperación también del estado de Expo Router. `replaceState` aislado
no bastaba; la corrección espera la captura PKCE y el montaje del navegador. Enlace
inválido de prueba: URL final canónica, error seguro y ningún formulario de nueva clave.
Se preserva el estado del historial; no se añadió un segundo consumidor del código.
Escaneo acotado de 125 archivos de cliente, pruebas afectadas y borrador005: cero
coincidencias de los patrones de JWT/clave privada/clave secreta/PAT/URL firmada/conexión
con contraseña revisados. No equivale a una garantía de ausencia de secretos o XSS.

## Auditoría de código Sprint2 — 25/11/2026

Alcance: seis módulos funcionales; inventario de354 fuentes cliente/servidor,
19 rutas montadas y84 referencias literales de navegación, sin destinos inexistentes.
Revisión estática y de contratos, complementada con Node/Deno y antecedentes SQL.
No es una certificación del despliegue Cloud ni un recorrido E2E nuevo.
Artefactos: .artifacts/quality-closure/{code-inventory,secrets-summary,dependencies}.json.
Escaneo de2194 textos elegibles para Git:0 candidatos a JWT de sesión/privilegiados
o claves privadas en los patrones revisados; excluye historial Git, archivos privados,
binarios y textos mayores de2MB. No demuestra ausencia absoluta de secretos.

| Severidad | Hallazgos del alcance |
| --- | --- |
| Crítica/alta confirmada | 0; no equivale a garantía de ausencia |
| Media | 1 grupo de dependencias con8 entradas moderadas |
| Baja | 2 riesgos acotados de compatibilidad/publicación |
| Mejora opcional | 1 guarda redundante; sin defecto funcional observado |

### Trazas inspeccionadas
| Módulo | Contraste entre capas |
| --- | --- |
| authentication | Formularios/SessionCoordinator/tenant-context → supabase-auth-adapter/getUser; callback PKCE y allowlists en auth-link-validation/google-authorization-url; storage por entorno/proyecto; recovery restringido y descarte por generación. Rutas account/auth y sidebar frente a workspace-access/navigation-policy. |
| tenant-foundation | Composición → ensure-profile/create-barbershop → verificador Auth → puertos/PostgREST y migraciones002. Identidad no derivada de cuerpo/rol de URL; membresías propias y RLS. |
| barbershop-operation | Operación/nombre/servicios/categorías/perfil/equipo/horarios/cierres → comandos cerrados → operation-handler → puertos → SQL. authority_lock e invariantes diferidas; propietario y máximo2 secundarios por barbería; transferencia definitiva aún bloqueada. Caché comercial32 entradas/TTL30s, clave usuario/tenant/versión, invalidación y fencing; nunca autoridad para slots o permisos. |
| reservations | Selección/duración/precio/confirmación/reintento, agenda propia/general, cancelación/reprogramación → reservation-handler → casos de uso/adaptadores → booking/care SQL. Precio/políticas históricos, locks por personas, exclusión GIST e idempotencia; confirmación atómica y rechazo de snapshots/horarios obsoletos. Atención/pago independientes; report-yape exige3 dígitos y no registra recepción automática. |
| notifications | Inbox/filtros/contador/papelera → gateway RPC → auth.uid, destinatario y membresía/asignación actuales; tombstone, unicidad y triggers transaccionales. Destinos cerrados, incluido staff profesional/Mi agenda; fallo externo no concede roles. |
| foundation | Contratos propios/composición/adaptador local, rutas técnicas y not-found; independencia comprobada por checkers. |

Navegación estática/guardas y pruebas de presentación revisadas; recarga, acceso directo
y carreras se respaldan por tests de contratos/rutas existentes, no por un nuevo navegador
autenticado. Enlaces externos se contrastaron con saneamiento y hosts permitidos;
no se afirma disponibilidad actual de redes sociales o mapas.
Las pruebas nuevas cubren contratos válidos/inválidos, rechazo temprano, errores de
dependencias, resultados tardíos y límites. Los SQL/pgTAP/RLS, carreras y rollback
históricos se conservan como evidencia separada: no se ejecutó BD en este bloque.
Los cinco avisos históricos de advisors (notificaciones/recordatorio y protección
de contraseñas) se mantienen pendientes de reconsulta del destino; no se reetiquetan
como vulnerabilidades confirmadas. Las funciones de notificaciones leídas fijan
search_path vacío y comprueban identidad/destinatario; este patrón no demuestra
por sí solo inseguridad de una función SECURITY DEFINER.

### Hallazgos y propuestas (sin correcciones funcionales)
**AUD-01 — Media; dependencias; confianza alta sobre el inventario, explotación no reproducida.**
Ubicación: package-lock.json:10679 y cadenas Expo/fingerprint/TypeScript-ESLint.
Confirmado por npm audit actual:8 entradas moderadas,0 altas/críticas; minimatch
GHSA-g3hv-75wg-m249 (amplificación globparts/DoS), con dependientes transitivos.
Reproducción: npm audit --json; evidencia dependencies.json. Esperado: versión compatible
sin aviso; observado: rangos afectados instalados. Impacto condicionado a patrones
no confiables, principalmente herramientas; no demostrado como entrada explotable Web.
Propuesta: evaluar actualización compatible con Expo58 y regresiones de toolchain;
no aceptar automáticamente la sugerencia de volver a Expo52. Regresión: auditoría limpia
para el aviso y control temporal de patrones adversos en el consumidor que acepte entradas.

**AUD-02 — Baja; perfil008/SQL; compatibilidad confirmada por inspección y evidencia histórica.**
Ubicación: supabase/migrations/20261115171232_own_professional_profile.sql:34,39,47.
La lectura get toma FOR SHARE; dentro de BEGIN READ ONLY puede producir SQLSTATE25006.
Reproducción histórica: C4-S06 en specs011/tasks; sin nueva ejecución SQL.
Esperado si se exige lectura readonly: consultar sin bloqueo de fila incompatible;
observado: el bloqueo requiere transacción de escritura. POST normal actual no se
declara roto. Impacto: consumidores readonly/réplica o diagnóstico, no escalamiento.
Propuesta: decidir primero el contrato readonly; cualquier ajuste SQL requiere
autorización y nueva migración, conservando reautorización y locks de escritura.
Regresión propuesta: misma consulta con actor válido en readonly y normal; actor ajeno
denegado en ambos. No debilitar locks para aparentar compatibilidad.

**AUD-03 — Baja; publicación; riesgo potencial, sin filtración activa identificada.**
Ubicación: .gitignore:1–16; evidencias/logs ya versionados.
Faltan reglas específicas para credentials.json, *.key, *.keystore, *.zip y *.dump;
hay301 logs rastreados. Reproducción: git check-ignore --no-index credentials.json
private.key upload.keystore backup.zip database.dump local.log no los excluye.
Esperado: proteger archivos privados antes de publicar; observado: los .env actuales
sí están ignorados, pero nuevos formatos sensibles podrían incluirse por accidente.
Impacto condicionado a agregar credenciales/datos reales;0 candidatos en el escaneo actual.
Propuesta: revisión selectiva de evidencias e historial y reglas de exclusión con autorización;
.gitignore no elimina archivos ya rastreados y .easignore no protege Git.
Regresión propuesta: check-ignore y escaneo sin valores de secretos sobre el contenido publicable.

**OBS-01 — Baja/opcional; mantenibilidad, sin error funcional confirmado.**
Ubicación: src/features/barbershop-operation/application/admin-invitations.ts:92–101.
La comprobación de action tras el try repite la comprobación previa del contrato cerrado.
Reproducción por inspección: parser devuelve acciones cerradas y el primer guard ya rechaza
otra acción. Esperado/observado: rechazo seguro, sin efecto adverso demostrado.
Impacto: redundancia de lectura; no bloquea la cobertura final. Propuesta: considerar
simplificación solo con aprobación; no borrar defensas para mejorar porcentajes.
Regresión: preservar rechazo de comandos ajenos, idempotencia y aceptación contextual.

### Límites y prioridades antes del despliegue
No se verificaron estado Cloud actual, advisors nuevos, correo externo real,
certificados/HTTPS/CSP publicados, carga o Android físico. Son gates separados.
QR/Storage, mapas exactos, favoritos/reseñas y transferencia definitiva se mantienen
como alcance conocido pendiente, no como errores de lo entregado.
Prioridad: revisar AUD-01 y contenido publicable; decidir AUD-02 si se requiere readonly;
acreditar configuración de publicación y revalidar SQL/aislamiento/concurrencia en destino
autorizado. No se modificó comportamiento de producción ni se aplicaron migraciones.

## Preparación de publicación y CI — antecedente del 25/11/2026

| Resultado del alcance nuevo | Cantidad | Confianza |
| --- | --- | --- |
| Credenciales privadas reales confirmadas en árbol/historial | 0 | Alta para los patrones/contextos examinados; no garantía absoluta |
| Riesgos bajos de privacidad/higiene pendientes de selección | 2 | Alta |
| Dependencias moderadas del audit anterior | 8 entradas | Antecedente AUD-01; no se repitió la auditoría general |

Escaneo local sin imprimir valores: main con17 commits,1198 blobs únicos/15.298.665
bytes; también las3 refs locales de checkpoints de Codex (árboles, no nuevos commits
de producto). Alcance ampliado2409 blobs/27.662.101 bytes, árbol actual y .env privados;
4532 objetos/textos en el escaneo final y20 objetos binarios de recursos excluidos
del análisis textual. Lectura UTF-8/UTF-16;37 logs actuales UTF-16 incluidos, sin
tratarlos como binarios. Los144 logs nuevos ahora ignorados se revisaron además en
el recorrido específico de445 logs. Sin límite por2MB en esta revisión. Patrones: JWT,
tokens de proveedores, claves privadas, URLs con credenciales, asignaciones sensibles,
encabezados de autorización y correos; revisión complementaria de asignaciones sin
comillas y contexto telefónico. No se validó ningún token contra un proveedor.
Detalle solo con ruta/línea/tipo/huella en .artifacts/repository-preparation; no valores.

Candidatos de alta apariencia descartados tras revisión: key de ejemplo AWS y marcador
PEM incompleto en las referencias de la skill security-review; Bearer/contraseñas
sintéticas en tests; referencias env y rutas reset-password. Las direcciones de
terceros en skills son ejemplos/documentación. Metadatos de autor de los17 commits
incluyen un correo y se conservarían al publicar; revisar esa exposición antes de aprobar.
En .env.local se encontró una credencial pública anon de Supabase, no service_role;
el archivo está ignorado. functions/.env contiene configuración local de orígenes.
Ningún .env privado encontrado forma parte de main. No se identificó un secreto
histórico que justifique rotación o reescritura, y ninguna se ejecutó.

**PUB-01 — Baja, confianza alta: evidencia operativa cruda.** Los301 logs rastreados y
sus versiones históricas se incluyeron en el análisis;0 candidatos sensibles en sus
patrones principales.105/301 contienen rutas de la estación de trabajo. En total se
revisaron445 logs actuales (incluye144 nuevos antes de añadir exclusiones), sin
candidatos telefónicos en contexto de contacto/pago. Esto no acredita anonimización
de cualquier texto libre. No publicar automáticamente logs crudos/capturas: conservar
los informes académicos sanitizados y retirar los logs del índice solo tras aprobar
el plan. El log activo t017-serve.log no fue editado, detenido ni eliminado. Las rutas
locales y la identidad de autor ya presentes en commits requieren aceptación de
privacidad si se conserva el historial; no son claves de acceso.

**PUB-02 — Baja, confianza alta: exclusiones no retroactivas.** .gitignore ahora cubre
env privados, claves/firma/configuración local, respaldos/dumps, logs/capturas y
artefactos regenerables, además de herramientas descargadas .agents. skills-lock.json
se conserva versionado para trazabilidad.
Check-ignore confirmó credenciales, claves, backup, dump, logs y artefactos; fuentes,
migraciones, SDD, OpenAPI y workflow permanecen elegibles. La propuesta inicial de854
exclusiones se refinó por valor académico:57177d1 retiró553 entradas solo del índice
(552 herramientas .agents y el log activo), sin borrar sus físicos. Se retuvieron300
logs académicos y skills-lock.json;104 logs actuales conservan rutas locales, además
de sus versiones históricas. recovery-local-real.json queda local. No se alteró historia.

CI revisado: push/main, pull_request y workflow_dispatch; GitHub-hosted Windows,
contents:read, persist-credentials:false, sin entradas de PR interpoladas en run,
sin pull_request_target, secrets u OIDC. Cuatro acciones fijadas a SHA completos,
contrastadas con fuentes oficiales. Upload v4.6.2 verificado en su release/commit.
Solo cuatro JSON agregados de ci-artifacts, no logs, bundles, perfiles, fixtures,
HTML de cobertura ni .env; retención7 días y archivos ocultos deshabilitados.
Los artefactos de un PR siguen siendo datos no confiables; ningún job privilegiado
los consume. Guía de referencia: https://docs.github.com/en/actions/reference/security/secure-use.

Antes de publicar: la selección/retirada del índice ya fue autorizada y realizada.
Queda aceptar o tratar los metadatos históricos y revisar el destino de publicación. No hay un bloqueo por secreto confirmado, pero
la publicación sigue sin autorización. Si apareciera uno nuevo: detener publicación,
identificar commit/ruta sin revelar valor y acordar revocación/rotación y saneamiento
histórico bajo autorización separada. No usar push --mirror para refs locales.

## Cierre local de reproducibilidad — 25/11/2026

Se conservaron los21 commits aceptados y se añadieron el fix9192d1a y el cierre
documental:23 commits finales, sin remotos ni push. npm ci/check/cobertura/OpenAPI/Web
aprobados desde checkout nuevo sin .env privados. Solo dos cambios de helpers de
pruebas; no producto, permisos, SQL, arquitectura ni nuevos secretos. El delta final
y documentos pendientes se revisan antes de staging; logs crudos/perfiles/bundles
siguen ignorados. La relectura de patrones no encontró secretos privados reales
confirmados; no es certificación de ausencia absoluta ni un nuevo audit de dependencias.

Al publicar se expondrían nombres/correos de autor y rutas locales históricas con
identificadores de la estación, además de documentos/evidencias académicos. No son
credenciales. Cambiar la identidad futura no oculta commits previos; retirar del
HEAD tampoco borra historia. Alternativas: aceptar la exposición con autorización
de publicación, restringir acceso (repositorio privado) o acordar una publicación
sanitizada separada. Saneamiento/recreación de historia exige autorización específica;
no se hizo ni se recomienda ejecutarlo automáticamente. Publicación aún no autorizada.
