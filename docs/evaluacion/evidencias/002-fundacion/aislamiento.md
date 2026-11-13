# T031–T032 — integración cliente y aislamiento local

13/11/2026. Ejecutor: Codex. Rama `main`, HEAD `2f37266`, cambios autorizados de
T020–T030 preservados. Destino exclusivo: `app-barberia-002-local`, API 54421/DB 54422.
T031 y T032 completadas en ese orden; ningún proyecto remoto fue creado o conectado.

## T031 — RED a GREEN

Se incorporó `application/memberships.ts`, un puerto estrecho `MembershipGateway` y las
dos operaciones en el adaptador y composición existentes. El núcleo valida resultados e
identificadores y proyecta tipos propios; no importa HTTP, Expo, React, Supabase ni SQL.
El adaptador obtiene la sesión vigente desde Auth en cada operación, lee relaciones propias
con filtro del ID verificado y llama al listado administrativo mediante RPC con JWT de usuario.
No usa credenciales de servicio ni caché de roles/membresías. La autorización definitiva sigue
en PostgreSQL. Presentación y navegación no cambiaron.

- [RED inicial](t031-unit-red.log): módulo de aplicación ausente, exit 1.
- [RED con contratos de transporte](t031-listados-red.log): operaciones inexistentes, exit 1.
- [Primer GREEN unitario](t031-unit-green.log): 85/85, exit 0.
- [Primer GREEN HTTP](t031-http-green.log): 342 casos directos, 56 cliente y revocación,
  400 resultados TAP incluyendo padre, exit 0.
- [Ampliación HTTP](t031-http-ampliado.log): dos fallos adicionales detectaron que Auth
  responde 403 `bad_jwt` y el cliente lo traducía a FORBIDDEN en vez de UNAUTHENTICATED.
  [Regresión unitaria RED](t031-auth-red.log), [diagnóstico y comprobación real posterior](t031-auth-diagnostico.json).
  Corrección limitada al adaptador para `/auth/v1/user`; un 403 de la RPC conserva FORBIDDEN.
- [GREEN final unitario](t031-unit-final.log): 86/86, exit 0, ramas del núcleo cliente al 100 %.

## T032 — matriz ejecutada mediante el runner real

```powershell
$env:BARBERIA_002_URL = 'http://127.0.0.1:54421'
$env:BARBERIA_002_PROJECT_ID = 'app-barberia-002-local'
node scripts/run-backend-integration.mjs
```

La preparación privilegiada queda exclusivamente en fixtures del stack local comprobado.
Las composiciones ordinarias reciben solo clave pública y JWT. El runner ejecuta las suites
de forma secuencial (`--test-concurrency=1`): comparten una base y verifican hashes de estado.
Las carreras C1–C4 mantienen sus conexiones/solicitudes simultáneas internas; no se serializó
su concurrencia. No se cambió ninguna expectativa válida ni política SQL.

| Casos definidos | Denominador y resultado final |
| --- | --- |
| HTTP adversario directo | **342/342**: nueve actores × dos tenants × 19 operaciones |
| Composición cliente | **81/81**: 56 operaciones contextuales, 21 lecturas/ediciones/altas propias con siete identidades, cuatro rechazos de sesión |
| Revocación confirmada | **1/1**: mismo cliente y JWT antes/después de COMMIT |
| Regresiones de perfiles y aprovisionamiento | **13/13** subcasos, incluidas C1–C4 |
| Total runner | **440/440 resultados TAP**, exit 0; incluye tres padres, cero skipped |
| PostgreSQL/RLS | **336/336**, cuatro suites, exit 0; tenants aporta 163 assertions |

[Resultados por ID](t032-case-results.json), [runner final](t032-http-final.log),
[SQL global](t032-sql-all.log). Los resultados TAP no representan un conteo de peticiones HTTP.
El primer intento del runner devolvió [SUBPROCESS_FAILED](t032-http-integral.log), exit 1.
Su salida segura no identifica una causa; no se atribuye a Auth, Docker, Edge ni a una
denegación prevista. La [ejecución diagnóstica de las mismas tres suites](t032-http-diagnostico.log)
y la repetición del runner original terminaron en 0, sin modificar código entre ambas.

## Permisos comprobados y límites

- Admin A y B solo listan/renombran el tenant correspondiente; sus roles no son globales.
- Barberos ven su tenant y sus propias relaciones, sin listar compañeros ni renombrar.
- Compartido admin A/barbero B conserva permisos diferentes. Tras inactivar A mediante
  fixture y COMMIT, el mismo JWT pierde lectura/listado allí en la siguiente solicitud,
  conserva su relación inactiva y sigue leyendo B sin permiso de renombrarlo/listar personal.
- Cliente sin membresía A/B e inactivo no acceden a esos negocios. Cada autenticado con
  perfil puede crear otro tenant con primer administrador propio, sin ganar permisos A/B.
- Lectura/edición de perfil sigue siendo propia, incluso con membresía inactiva. Administrar
  una barbería no revela nombres/teléfonos de compañeros, tampoco mediante joins directos.
- Se deniegan altas, promoción, estado, DELETE y cambios de ambas FK de membresías a todos
  los usuarios ordinarios; también RPC privilegiadas y cuerpos/metadata con permisos inventados.
  Denegaciones comparan estado persistido y ausencia de datos ajenos.
- Auth local emite los JWT válidos. Los controles de expiración/issuer-clave independiente
  de la regresión son fixtures enviadas a los servicios reales; no sesiones de otro remoto.

[Conservación posterior](t032-conservacion.json): doce contenedores antiguos y siete servicios
nuevos ajenos a Edge mantienen sus metadatos; sin redes/volúmenes compartidos con el antiguo.
Cero perfiles, usuarios Auth, barberías, membresías, triggers/funciones temporales o backends
de carrera restantes. Edge observado operativo con verifyJWT en ambas entradas. No se ordenó
ningún reinicio/parada. No se modificaron migraciones ni datos anteriores; fixtures retiradas.

No hay prueba nueva Android/web/remota, reservas ni concurrencia de reservas. Persisten nueve
avisos moderados npm; este GREEN no aprueba la seguridad de dependencias. T033 se documenta
por separado en [calidad.md](calidad.md); T034–T040 no se ejecutaron.
