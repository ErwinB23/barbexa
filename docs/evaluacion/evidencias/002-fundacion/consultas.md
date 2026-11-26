# T034 ? consultas e ?ndices

13/11/2026, Codex, main/477b360. Solo app-barberia-002-local:54422; guard de nombre, puerto, red, volumen y metadatos antiguos antes de SQL.

Ejecutado query-plans.sql con psql ON_ERROR_STOP=1 v?a docker exec guardado, exit 0. Dataset transaccional: 10 000 identidades sint?ticas/perfiles, 1 000 barber?as, 20 000 membres?as, 20 por barber?a, dos por usuario, con estados activos/inactivos y roles distintos. ROLLBACK final; cero identidades del prefijo de prueba restantes. Timeout de consulta 60 s y de bloqueo 5 s. Sin reset, nuevas migraciones, ?ndices o cambios de servicios.

[SQL reproducible](../../../../tests/integration/tenant-foundation/query-plans.sql), [planes completos](t034-query-plans.log). PostgreSQL efectivo/version() y configuraci?n de planner en el log. Las lecturas RLS usan authenticated y claims SQL sint?ticos; no son JWT ni mediciones HTTP.

| Consulta | Execution Time observado, segunda ejecuci?n | Plan |
| --- | --- | --- |
| Perfil propio RLS | 0.061 ms | profiles_pkey |
| Propias con auth.uid() en WHERE | 139.660 ms | Seq Scan, 19 998 filas descartadas |
| Propias con ID literal verificado, como el adaptador | 0.043 ms | UNIQUE user_id/barbershop_id |
| Listado contextual RLS | 0.306 ms | ?ndice barbershop_id/user_id |
| Barber?a por ID RLS | 0.510 ms | barbershops_pkey |
| Ambos helpers | 0.930 ms | Result; interior no visible por wrapper |
| RPC invoker listado | 0.728 ms | Function Scan; 20 resultados |
| Lookup interior helper como owner | 0.015 ms | ?ndice contextual; no prueba RLS |

Primera ejecuci?n exploratoria: perfil 0.080 ms, propias con auth.uid() 155.765 ms, contextual 0.577 ms, shop 0.215 ms, helpers 0.377 ms, RPC 1.676 ms, lookup 0.035 ms, exit 0. Se a?adi? despu?s el filtro literal real del adaptador para evitar equiparar la variante SQL exploratoria a la petici?n de aplicaci?n. No se sustituy? un resultado lento por una promesa de mejora.

Los cinco ?ndices efectivos cubren PK de las tres tablas, FK perfil?Auth por PK, pareja UNIQUE(user_id,barbershop_id) y contexto/FK inversa (barbershop_id,user_id). No crear ?ndice adicional por rol/estado o duplicado por user_id: el prefijo de la pareja ya sirve al acceso propio real. La variante auth.uid() demuestra sensibilidad a la expresi?n y evaluaci?n RLS; conservar filtros expl?citos y volver a medir cualquier cambio antes de proponer optimizaci?n.

No se ejecut? ANALYZE sobre tablas persistentes para conservar sus estad?sticas; las estimaciones pueden ser inexactas. Dos observaciones locales, cach?/orden de ejecuci?n y carga compartida, sin distribuci?n estad?stica ni aislamiento de CPU. EXPLAIN ANALYZE ejecuta realmente la consulta. No hay SLO de producto, prueba k6, carga concurrente ni afirmaci?n de escalabilidad productiva. Referencia: https://www.postgresql.org/docs/17/using-explain.html . Nueve avisos npm moderados siguen pendientes.

## Consolidación PostgreSQL y escalabilidad — 25/11/2026

Contraste estático con migraciones vigentes en `a758dfa`. No se repitió EXPLAIN ni
se inició una base; los valores siguientes son históricos locales, no producción.

| Mecanismo | Referencia desde raíz | Estado y alcance probado |
| --- | --- | --- |
| Esquema compartido multitenant | `20261112031854_foundation_model.sql`: profiles/barbershops/barbershop_memberships, UNIQUE usuario/barbería | Implementado; no base por tenant, sin admin global |
| RLS y autorización contextual | `20261113045240_tenant_context_access.sql::private.is_active_member/is_active_admin`; políticas y `20261113053907_membership_listing_access.sql` | Roles authenticated con filtros propios/contextuales; helpers no convierten metadatos editables en permisos |
| PK simples / índices compuestos | PK de perfiles/barberías/membresías; `barbershop_memberships_user_shop_key`, `barbershop_memberships_shop_user_idx` | Planes históricos usan PK o prefijos adecuados; no justifica duplicar índice por usuario |
| Catálogo y agendas | `20261114195018_booking_catalog.sql`: services_shop_idx, barber_profiles_shop_idx, capacidades y horarios; `20261114224344_booking_atomic.sql`: reservations_client_start/shop_start/barber_start | Implementados. Los índices de reserva por persona física/tenant se distinguen de permisos. No hay benchmark masivo de cada consulta |
| Integridad | FKs compuestas de reservation_items/reservations/barber_profiles, CHECKs de importes/duración, UNIQUE cliente/tenant/requestId | Restringe cruces de tenant, parciales y duplicados; snapshots históricos evitan recalcular precios pasados |
| Solapamientos | `20261114224344_booking_atomic.sql`: reservations_barber_user_id_occupied_excl, GiST sobre persona física y `occupied &&`, estado confirmed | Protege a la misma persona incluso entre barberías; intervalos semiabiertos e inclusión de buffer |
| Atomicidad y concurrencia | `private.reservation_confirm`: configuración FOR SHARE, advisory xact locks por persona ordenados, perfiles/membresías bloqueados; wrapper `private.confirm_booking_paid` en `20261115151745_care_payments.sql` | Reserva/items/eventos/pago pendiente en la misma transacción. Conflicto de exclusión se traduce a error seguro; no reserva por datos del cliente |
| Consultas acotadas | `private.booking_list`/`list_booking_barbershops` en `20261114202045_booking_operations.sql`; índices y filtros tenant/usuario | Paginación/filtrado evitan descargar todo; medir selectividad real y crecimiento sigue pendiente |
| Pooling | `supabase/config.toml [db.pooler]`: enabled=false, transaction, default_pool_size=20, max_client_conn=100 | Configurado pero NO activo localmente; parámetros no son capacidad comprobada. Transporte HTTP a PostgREST no acredita por sí mismo un pool Cloud efectivo; configuración/saturación Cloud no inspeccionadas |

Todas las migraciones de la tabla están en `supabase/migrations/`; no se modificaron.
El orden incremental importa: `20261121040559_administrative_closure_withdrawal.sql`
redefine `private.reservation_available` para excluir cierres retirados lógicamente;
no se presenta el cuerpo inicial de20261114 como toda la disponibilidad vigente.
La autoridad administrativa también evoluciona en `20261120010538_team_authority.sql`;
los roles/permisos actuales no se deducen únicamente de las políticas iniciales.
Los wrappers privilegiados requieren actor previamente verificado y permisos SQL;
RLS no sustituye sus comprobaciones. Los índices favorecen consultas concretas, no
garantizan escalabilidad horizontal, particionamiento ni una cantidad de usuarios.

### Planes y medidas históricas recuperadas

Fuente primaria: [query-plans.sql](../../../../tests/integration/tenant-foundation/query-plans.sql)
y [t034-query-plans.log](t034-query-plans.log), 13/11/2026. Fixtures transaccionales:
10.000 identidades/perfiles,1.000 barberías,20.000 membresías; ROLLBACK y cero fixtures
remanentes. Sin ANALYZE de tablas persistentes: estadísticas/orden/caché afectan el plan.

| Consulta | Plan observado | Planning / Execution ms, segunda observación |
| --- | --- | --- |
| Perfil propio bajo RLS | Index Scan profiles_pkey | 0,770 / 0,061 |
| Membresías propias, WHERE user_id=auth.uid() | Seq Scan,2 resultados/19.998 descartados | 0,503 / 139,660 |
| Membresías propias, UUID literal verificado (forma del adaptador) | Index Scan barbershop_memberships_user_shop_key,2 resultados | 0,330 / 0,043 |
| Membresías de barbería con RLS | Index Scan barbershop_memberships_shop_user_idx,20 resultados | 0,139 / 0,306 |
| Barbería por ID con RLS | Index Scan barbershops_pkey | 0,195 / 0,510 |
| Dos helpers en wrapper | Result; interior opaco | 0,010 / 0,930 |
| RPC list_barbershop_memberships | Function Scan,20 resultados | 0,037 / 0,728 |
| Lookup interior como owner | Index Scan contextual,1 resultado | 0,044 / 0,015; NO demuestra RLS |

La diferencia139,660→0,043 ms compara expresiones distintas y observaciones locales;
no es una optimización recién aplicada ni una garantía de aceleración productiva.
El adaptador `src/features/tenant-foundation/infrastructure/tenant-foundation-http-adapter.ts`
envía filtros del actor verificado; no confiar en un UUID arbitrario enviado por UI.

Reservas: [planes propios](../004-reservas/t012-t016/plans.txt) sobre17 cabeceras sintéticas
eligieron Index Scan por UNIQUE cliente/tenant/requestId y filtro temporal; [ocupación
global](../004-reservas/t012-t016/global-plan.txt) eligió la exclusión GiST por persona/rango.
Estos dos archivos son EXPLAIN sin tiempos ANALYZE; no asignarles latencias inventadas.
[Atomicidad](../004-reservas/atomic.md): diez pares de conexiones concurrentes (cinco
mismo tenant, cinco persona entre tenants),1 commit y1 rechazo por par; par idempotente,
rollback inyectado y comprobación complementaria acreditados. La primera suite tuvo
un fallo de expectativa HTTP y no se volvió a ejecutar íntegra: conservar esa limitación.

Implementado/comprobado acotadamente: integridad, RLS, locks y planes indicados.
Validación parcial: selectividad con volumen sintético y concurrencia de dos conexiones.
Pendiente: distribución de latencias, throughput, saturación de conexiones/locks,
grandes volúmenes de reservas, contención prolongada, disponibilidad y capacidad Cloud.
La siguiente etapa k6 deberá separar lecturas/escrituras y métricas; no se ejecutó aquí.
