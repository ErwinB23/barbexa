# T017–T019 y preparación T013 — 14/11/2026

**17/34**: T017 y T018 verificadas técnicamente. **T013 y T019 siguen pendientes de
recorrido funcional real Web/Android**.003 permanece24/36. No se ejecutó T020–T023.

## Entrega

T017: SolicitarReserva/ConfirmarReserva, validadores cerrados y puertos propios; adaptadores
HTTP/PostgreSQL y composiciones separadas. Edge `reservation-command` con verify_jwt=true,
actor verificado reutilizando Auth002, POST acotado8KiB, CORS exacto,201 inicial/200 replay,
errores seguros. P0002/NOT_AVAILABLE se traduce a404; conflicto de ocupación usa siempre
«Profesional no disponible en ese horario», sin contexto SQL ni IDs privados ajenos.
No se implementó cancelación ni un stub exitoso de esa operación.

T018: rutas `/booking` y `/my-reservations`, enlazadas desde Mi cuenta. Catálogo público
autenticado reutiliza el adaptador de oferta; multiselección, profesional concreto/cualquiera,
fecha/horas Lima y estimación PEN. Confirmación muestra snapshots y profesional definitivo
del servidor. La lista propia filtra client_user_id verificado incluso para administradores;
no se presenta como agenda. Inputs/roles/48dp/scroll reutilizan componentes acreditados.

El requestId usa Expo Crypto existente. Doble activación comparte la operación en vuelo;
respuesta perdida conserva el mismo ID y bloquea editar el intento hasta reconciliarlo.
Datos/respuestas se descartan al cambiar cuenta/generación/contexto. Estado pendiente solo
en memoria: tras recarga completa/cierre de sesión se debe consultar Mis reservas antes
de repetir. No se promete persistencia del borrador ni reservas offline.

Pequeña mejora necesaria de T013: la invitación muestra el nombre de barbería que ya
entregaba la RPC, sin abrir perfiles ni modificar SQL. Se verificaron en HTTP real gestión
propia, invitación pendiente y rechazo del administrador extranjero; no sustituye la UI.

## Verificaciones nuevas

| Verificación | Resultado y código |
| --- | --- |
|8 RED T014 originales |8 fallos previstos antes; **8 GREEN** después,0; expectativas intactas |
| Runner unitario, nuevo núcleo incluido |**147/147**,100% líneas/funciones y95,20% ramas globales del núcleo,0 |
| Tests dirigidos nuevos y regresiones afectadas |**53/53**,0; incluye10 UI con dobles Web/Android, no dispositivos |
| Servidor reservations Deno |**7/7**,0; núcleo filtrado al100% según gate vigente |
| HTTP real con JWT del conjunto autorizado |**9/9 TAP** (8 subtests + grupo),0; [registro](http-primer-intento.log) |
| Tipos, lint cliente/servidor, check servidor |0; [tipos](types.log), [lint](lint-client.log), [check](server-check.log) |
| Checkers reales |cliente102/core29/aristas262 y servidor31/core15/aristas66, sin infracciones |
| Prettier |0, [formato](format-check.log) |
| Grafos completos Metro Web y Android |HTTP200 ambos, sin APK ni prueba de ejecución del teléfono; [metadatos](bundles.json) |
| P0002 real por pausa temporal de B |Edge404; publicación restaurada;3 reservas sin cambios,0 |

HTTP nuevo: cliente sin membresías consulta oferta/slots, confirma precio/duración/perfil
propios, doble envío genera una sola cita, respuesta real descartada se recupera por replay,
propias hidratan items sin clientes ajenos. Campos actor/rol/precio falsos y servicio extranjero
rechazados; RPC privilegiada directa403; anon/JWT inválido401, Origin ajeno403, cancel no
implementado400. No se repitieron444 SQL ni diez carreras T016: motor/migraciones/RLS no cambiaron.

Incidencias técnicas conservadas: primer acceso a Metro bloqueado por sandbox (EACCES),
consulta autorizada posterior200 sin reiniciar Metro. Primera cobertura Deno tuvo7 tests
aprobados pero no pudo recuperar fuentes transpiladas del caché; no se contabilizó como
cobertura. Se repitieron solo esos7 con DENO_DIR de workspace y reporte nuevo: gate100/0.
El total automático de servidor incluyendo infraestructura/presentación fue92,1% líneas;
no atribuir100% del núcleo a toda la aplicación, SQL, interfaz o Hermes.

## Datos autorizados conservados y recuperación local

Un único conjunto nuevo:3 cuentas/perfiles confirmados sin correo,2 barberías,2 membresías
iniciales,2 profesionales explícitos,4 servicios,1 invitación pendiente y3 citas automáticas.
Dentro de los máximos autorizados3/2/3/3/4/3/12. Credenciales solo en
`.artifacts/004-client/credenciales-locales.json`, comprobado ignorado por Git; no tokens
persistidos ni correos enviados. IDs y límites se conservan localmente para la limpieza.
El operador **no permite cleanup** sin confirmación manual documentada y cotejo de dependencias.

**Incidencia inicial conservada:** Docker Linux Engine dejó de estar disponible (pipe
dockerDesktopLinuxEngine ausente); Auth respondió ECONNREFUSED y status dio1/LOCAL_OPERATOR_FAILED.
No se limpiaron datos ni se recreó el conjunto para resolver ese fallo de infraestructura.

**Recuperación comprobada:** el usuario restableció Docker. Se verificaron PostgreSQL,
Auth200 y3 reservas conservadas. El Edge nuevo seguía exited255; tras comprobar nombre,
única red y montaje de este repositorio, se inició únicamente ese mismo contenedor.
Un primer intento del operador tuvo un error de referencia JavaScript antes de ejecutar
docker start; corregido ese acceso a la clave de red, el inicio terminó0, mismo ID running.
No se operaron otros contenedores, Metro ni datos. La API pública volvió a dar OPTIONS204,
anon401 y Origin ajeno403, sin escrituras de negocio. [Recuperación](edge-recovery.json),
[API](handler-readonly.json), [conteos actuales](fixtures-status.json).
El conjunto sigue conservado para manual: no ejecutar prepare otra vez, reset ni limpieza
antes de la confirmación del usuario. El conteo inicial previo a las reservas se conserva
en [fixtures-status-inicial.json](fixtures-status-inicial.json).

[Único recorrido manual](recorrido-manual.md): reserva Web→Android primero, después
oferta/invitaciones y permisos. Hasta recibir los resultados no se atribuye ejecución al
usuario ni se cierran T013/T019. No agenda administrativa implementada: próxima secuencia
T020 RED→T021 consultas/proyecciones→T022 UI; T023 espera T019 para la demostración real.

Sin Cloud, proyecto anterior, nuevos paquetes/APK, cambios RLS/JWT/Kong ni commit/push.
Nueve avisos npm documentados sin remediación; recuperación003 obligatoria antes de evaluación.
Cambios previos y log activo conservados. Revisión final y diff en [revision-final.json](revision-final.json).
