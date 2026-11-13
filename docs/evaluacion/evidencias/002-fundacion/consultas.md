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
