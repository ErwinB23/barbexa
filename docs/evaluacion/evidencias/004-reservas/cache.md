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

## Consolidación del contrato y rendimiento — 25/11/2026

Contraste con `a758dfa`; referencias desde la raíz:

| Aspecto | Implementación / evidencia |
| --- | --- |
| Datos / ubicación | `src/features/barbershop-operation/infrastructure/catalog-cache.ts::createCatalogCache`: Maps RAM del proceso cliente, DTO BookingCatalog comercial validado; servicios, profesionales, capacidades y políticas de oferta. No Redis, disco, CDN ni caché compartida entre dispositivos |
| Clave real | `read`: JSON.stringify([user,tenant,version]); `operation-http-adapter.ts` aporta version=`booking-catalog-v1:<base.origin>`. Origen está en el componente version, no una cuarta posición |
| Scope / cuenta | `src/composition/auth-composition.ts` crea instancia compartida y llama setScope con usuario/generación/contexto; cambio de owner también vacía mapas. No reutiliza entradas entre cuentas |
| TTL | 30.000ms desde almacenamiento después de carga, hit solo si edad >=0 y <30.000; no deslizante, retroceso de reloj no entrega hit |
| Capacidad | Máximo32 entradas completas; al llenar elimina la primera clave por orden de inserción. FIFO, NO LRU; límite de entradas no garantiza un tope de bytes ni limita por sí mismo todas las cargas en curso |
| Invalidación | invalidate incrementa epoch y vacía entries/pending; setScope distinto y dispose invalidan. operation-http-adapter.ts::command invalida antes y en finally, incluso ante error/timeout; shopNames también recibe invalidate |
| Concurrencia | pending comparte Promise por clave; cada lector obtiene copia defensiva. El epoch/owner/disposed rechaza una respuesta tardía invalidada. Limpieza de pending verifica identidad de la promesa para no quitar otra carga |
| Seguridad | request verifica `/auth/v1/user` antes incluso del hit, exige identidad esperada/confirmada/no anónima y vuelve a cotejar contexto. Tenant del DTO debe coincidir. El hit puede fallar si Auth falla; no modo offline autorizado |
| Fuera de autoridad | No tokens, permisos privados, membresías, citas ni slots como fuente autoritativa. Políticas de catálogo orientan UI; precios, disponibilidad y permisos se revalidan al confirmar en SQL |
| Frescura externa | Mutación local/contexto invalidan; cambios de otro cliente pueden tardar hasta TTL en reflejarse en el catálogo. No hay invalidación distribuida ni garantía de frescura instantánea |

[Tres pruebas dirigidas existentes](../../../../tests/integration/booking/catalog-cache.test.mjs)
cubren TTL exacto, cuenta/tenant/versión, copias defensivas, single-flight, carreras,
fallos no cacheados, scope/dispose y adaptador con Auth por hit, invalidación en éxito/error,
y exclusión de lecturas privadas. Se reutiliza su aprobación en la CI, sin repetirlas.
Capacidad32/FIFO se acredita por lectura del código; esas tres pruebas no equivalen a
una prueba exhaustiva de presión de memoria o todas las secuencias de intercalado.

| Medición histórica Node contra Supabase LOCAL (15/11/2026) | Resultado |
| --- | --- |
| 5 frías, ms | 40,9997;15,7130;15,5155;17,2622;6,5286 |
| 5 calientes, ms | 1,9854;1,7942;2,0773;1,8565;1,8845 |
| Medianas fría → caliente | 15,7130 → 1,8845ms;≈8,34 veces menor latencia,≈88,01% de reducción |
| Tráfico de cinco hits | 5 verificaciones Auth;0 consultas de catálogo |

Fuente: [cache-latency.json](t028-t029/cache-latency.json). Cálculos derivados de las
medianas, no un resultado nuevo ni percentiles. Solo cinco muestras por condición,
misma estación/red local y cuenta ficticia existente; no control estadístico de CPU,
no navegador/Hermes ni k6/producción. No implica esa mejora en todo el flujo de reserva,
ni menor latencia de Auth, ni capacidad para un número concreto de usuarios.
Implementado y comprobado: contrato acotado y ahorro de lecturas local. Parcial:
capacidad/memoria y rendimiento representativo. Pendiente: carga gradual, colas/contención,
observabilidad y frescura multi-cliente. Sin nuevas tecnologías ni mediciones SQL.
