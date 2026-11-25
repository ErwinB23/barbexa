# Perfil profesional — código y activación Cloud, 23/11/2026

## Alcance y archivos

`src/features/barbershop-operation/domain/professional-profile.ts` y
`application/professional-profile.ts`: contratos propios, validación, identidad,
scope y guardado concurrente controlado. El módulo de aplicación y adaptadorHTTP
existentes incorporan la capacidad sin sustituir las operaciones antiguas.

`presentation/professional-profile-web.tsx`, `professional-profile-web.styles.ts`,
`professional-profile-panel.tsx`, `use-professional-profile.ts` y montaje en
`self-professional.tsx`: tarjeta real, editor y consulta guardada; Web responsive,
controlesAndroid compartidos, límite250, enlaces seguros, estados y borrador.
`src/composition/barbershop-operation-composition.ts` conecta el puerto;
`professional-workspace.web.tsx` pasa solo el nombre contextual a esta pestaña.

`supabase/functions/_shared/barbershop-operation/{domain,application}/professional-profile.ts`,
`application/operation.ts`, `infrastructure/postgres-operation-adapter.ts` y
`composition.ts`: comandoscerrados, actor verificado y dos RPC propias.

`supabase/migrations/20261123174640_professional_profile_details.sql`: cuatro
columnas de descripción/redes; `joined_at` nullable de membresía; validación,
bloqueos compatibles y wrappers limitadas a service_role. No backfill histórico.
`supabase/tests/professional-profile-details.test.sql`: ensayo transaccional con
fixtures aleatorias y rollback;21/21 aprobado en PostgreSQL aislado autorizado.

Pruebas añadidas en `tests/presentation/professional-profile-{details,ui}.test.mjs`
y `tests/server/barbershop-operation/professional-profile.test.ts`; resolución de
importsWeb ajustada en el loader de `tests/presentation/booking/self-professional.test.mjs`.
Especificación013 y puntero `.specify/feature.json` actualizados.

## Evidencia ejecutada

- `npm run typecheck`: pasa cliente y núcleo independiente.
- `npm run architecture:check`: pasa,258 módulos /55 núcleo /854 aristas.
- `npm run check:server`: pasa tipos, grafo, Deno check y lintservidor.
- `npm run test:server`: 74/74 pasan.
- `npm run test:client`: 512/512 pasan.
- Dirigidasperfil/tabs/compatibilidad: 9/9 pasan.
- `npm run lint`: pasa tras corregir el alias del harness de hooks.
- Prettier de los archivos nuevos y conexiones modificadas: pasa.
- `expo export --platform web --output-dir .artifacts/professional-profile-web-build`:
  pasa; bundle ignorado. No APK ni instalación.
- Revisión de diferencias delimitadas: sin errores de whitespace. El chequeo global
  encuentra whitespace en el log activo previo t017; no se modifica ese log.
- Brave real en localhost8081, secciónprofile: BRAYAM/BarberStyle cargados mediante
  fallback008. Consulta de vista previa completada sin guardar. A995px se apilan
  tarjetas; a1707px muestra dos columnas, redes y acciones separadas sin solaparse.
  Campos nuevos permanecen deshabilitados por backend anterior, como corresponde.

Las pruebas de round-tripHTTP/RPC usan fetchersdobles: acreditan contratos y estado.
El ensayoSQL posterior sí acredita guardado/lectura PostgreSQL real en DBdesechable;
no acredita todavía guardar/recargar mediante sesiónWeb contraCloud.

## Activación autorizada y comprobada

Usuario autorizó específicamente ensayo, migración013 y actualizaciónEdge.
`scripts/professional-profile-rehearsal.mjs`: recrea las20migraciones en imagen
existente PostgreSQL17.11, sin red, puertos ni montajes de datos, y ejecuta21
comprobaciones de SQL; todas pasan. Contenedorpropio eliminado, sin tocarstackactual.
Evidencia: `.artifacts/barbexa-profile-1795461584088/report.json` y `profile-tests.log`.
El primer ensayo pasó19assertions pero su contador esperaba20; se añadieron dos
comprobaciones de ACL explícitas y se repitió con21/21. No cambió SQLdeproducción.

`scripts/professional-profile-cloud.mjs`: proyecto confirmado vuoncrtkkkquvddunrxx,
regiónsa-east-1, historial19migraciones concordante. Respaldo lógico privado nuevo
en `%LOCALAPPDATA%/Barbexa/backups/professional-profile-1795461588540`:
schema225609B, data34950B, roles297B, historial257563B; manifiestoSHA256. No contiene
respaldo de configuración gestionadaAuth/OAuth/secrets ni binariosStorage. No se
ensayó restauración de este respaldo específico. Se descargó también la fuenteEdgev3.

Aplicada únicamente20261123174640_professional_profile_details.sql, SHA256
9ef6a92d8d3350f9118835b4b651176a54b20ca59f27c7502e585e2d7d7e6f34.
Historial19→20. Huellas de27tablas sobre columnas previas y políticasRLS idénticas.
Todos los camposnuevos quedan en default/null; no se modifican datosprevios ni fechas.
Anon/authenticated sin ejecución directa; service_role autorizado en wrappers.

`scripts/professional-profile-edge.mjs`: staging `.artifacts/profile-edge-deploy`
basado en fuenteCloudprevia; diferencias acotadas a3módulos delperfil y2nuevos.
La descargaSupabase omitía3archivos solo de tipos; se restauraron exclusivamente
declaraciones y Deno check delpaquete pasa. Despliegueúnico a barbershop-operation:
v3→v4 ACTIVE y verify_jwt=true, otras3funciones intactas. Comparación delistado
normalizada por slug; error de red posterior recuperado mediante lecturademetadatos
sin repetir escrituras. Metadatos/evidencias en carpeta privada: verified.json,
edge-verified.json y functions-after.json. No credenciales en reporte delrepositorio.

Después deldespliegue, UIA real deBrave localhost8081/staff?view=professional&section=profile
muestra BRAYAM/BarberStyle, perfilactivo y descripción/redes editables sin aviso
de backendanterior. No se guardó contenido ficticio. Entradasdelusuario y geometría
delaventana impidieron automatizar elbotónConsultar; no se insistió ni se cambiósesión.
Se conserva pendiente la pruebaWeb deguardar/recargar, con contenidoelegido porusuario.
Checksrepetidos: check:server pasa,74testservidor pasan y lintscriptsprofile-* pasa.

## Pendientes y límites

1. ActivaciónCloud completada; no quedan operaciones de migración/despliegue pendientes.
2. Probar guardar/recargar con datos reales que el usuario quiera conservar.
3. Recorrido móvil/teclado y Androidfísico pendientes. ControlesAndroid compilados;
   no se acepta todavía el flujoAndroid completo.
4. La consulta muestra nombre, descripción y redes guardadas del propio perfil.
   No modifica catálogo ni pantallascliente, según restricción de no tocar reservas
   u otras secciones; no afirmar que camposnuevos ya aparecen en esas pantallas.
5. Fecha histórica no disponible; se muestra sin registro. Avatar es icono, sin upload.
6. Cloudwrites limitadas a migración013 y despliegueúnico autorizado; sin escrituras
   de perfiles/reservas delusuario, dependenciasnuevas, cambiosAuth/roles, staging,
   commit ni push. DockerDesktop iniciado para elensayo; no detenido después.
