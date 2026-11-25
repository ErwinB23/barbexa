# T028 — caché comercial local

15/11/2026. Implementada y verificada sin cambios de esquema, datos ni servicios.

`catalog-cache.ts` mantiene únicamente la proyección comercial validada. Clave compuesta
por cuenta, barbería, versión y origen del proyecto; TTL de 30 segundos exactos. Memoria
limitada a 32 entradas, copias defensivas, deduplicación de cargas y descarte de respuestas
tardías invalidadas. No conserva permisos, membresías privadas, slots, citas ni tokens.
Cada lectura, incluso un hit, verifica la identidad con Auth. Cambiar sesión/contexto,
disponer la composición o ejecutar una mutación invalida la caché; también se invalida
al fallar una mutación, pues un timeout no demuestra que el servidor no la aplicó.
Confirmación y disponibilidad siguen consultando el servidor y la RPC atómica.

Tres pruebas de `tests/integration/booking/catalog-cache.test.mjs`: aislamiento y TTL,
carreras/errores/invalidation, y adaptador real con transporte doble. RED por módulo
ausente y posteriormente por namespace de proyecto incompleto; GREEN sin bajar expectativas.
Se comparte una instancia explícita por composición, sin dependencias cruzadas en los núcleos.

Medición de catálogo de solo lectura en Node contra Supabase LOCAL con la cuenta ficticia ya existente:
cinco muestras frías frente a cinco calientes, mediana **15,713 ms → 1,8845 ms**. Los cinco
hits ejecutaron cinco verificaciones Auth y cero consultas de catálogo.
[Resultados](t028-t029/cache-latency.json). Son tiempos locales de Node, no una medición
de navegador/Hermes, carga k6 ni garantía de rendimiento productivo. No se repitieron
reservas ni se modificaron los conjuntos conservados. APK existente compatible en JS;
no se hizo build ni se atribuye esta medición a una prueba física.
Para autenticar esas consultas se inició y cerró una sesión local de la cuenta existente;
«solo lectura» describe el catálogo/datos de negocio, no una ausencia de actividad en Auth.
