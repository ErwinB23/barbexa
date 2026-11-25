# Motor atómico local — T014–T016

14/11/2026. Solo `app-barberia-002-local`, API54421/PostgreSQL54422; PostgreSQL17.11,
CLI3.1.0. Git observado `main/0ccd33c`, cambios previos conservados. No Cloud ni T017+.

## Entrega y permisos

Migración nueva **20261114224344_booking_atomic.sql**, creada con CLI, revisada y aplicada
una vez con `db push --skip-vault`. Preview mostró exclusivamente ese archivo y el destino
127.0.0.1:54422. No edita migraciones históricas ni filas anteriores. Crea cabecera,
items históricos y eventos, RLS, FKs compuestas, índices y funciones estrechas.

`confirm_booking(uuid,jsonb)` es invoker y EXECUTE solo service_role. El actor separado
es una frontera de confianza para la futura Edge de T017; **todavía no existe una Edge
de confirmación**. La integración verificó JWT reales con Auth antes de invocar esta
frontera mediante su puente de pruebas. No equivale al E2E cliente→Edge de T017/T019.
`list_booking_slots` es invoker authenticated→proyección privada con auth.uid actual.
Los definers fijan search_path vacío. Sin INSERT/UPDATE/DELETE directo para usuarios.

Lectura RLS de citas/items/eventos: cliente propietario, administrador activo del tenant
o profesional asignado activo. No se abren profiles002; identidad física/fingerprint
no se conceden como columnas de cliente. No hay rol administrativo global.

## Invariantes verificadas

- Varios servicios distintos y del mismo tenant; total PEN/duración calculados desde
  catálogo vigente, capacidades completas, membresía y profesional activos. Cualquiera
  termina en un perfil concreto. Se rechazan actor/precios/duración/snapshots del body.
- Hora absoluta UTC; días, horas y horizonte en America/Lima. Paso alineado a medianoche
  local; contención en unión de intervalos del local y del profesional. Horarios que
  atraviesan medianoche no se inventan: la oferta usa intervalos dentro de un día.
  Buffer extiende occupied_until; la disponibilidad es estimativa y se revalida al confirmar.
- Exclusión GiST por **barber_user_id**, global como recurso físico, no como permiso.
  Intervalos `[inicio, occupied_until)`: consecutivos con buffer0 son válidos. Solo
  confirmed ocupa. El ensayo de liberación puso una cita sintética propia en cancelled:
  **no implementa ni acredita el flujo de cancelación T024–T027**.
- Configuración FOR SHARE y claves advisory de cliente/candidatos físicos ordenadas por
  hash; perfil/membresía actuales protegidos por locks. Las mutaciones de oferta existentes
  usan configuración exclusiva y el guard ahora se ejercitó contra tablas reales.
- UNIQUE(cliente,tenant,request_id), SHA-256 canónico de servicios ordenados/profesional/
  instante. Mismo contenido devuelve la instantánea original; otra huella da CONFLICT.
- Cabecera/items/evento se insertan juntos; fallo inyectado en detalle revierte todo.
  No hay un flag de fallo en código productivo. La inyección existió solo en transacción
  de prueba y terminó en ROLLBACK.
- Conflicto dentro de A o entre A/B: solo «Profesional no disponible en ese horario».
  Slots no devuelven IDs de otra barbería, de su cliente ni de su cita.

## Resultados reales y fallo conservado

1. SQL estructural RED:13 fallos previstos de18 por objetos ausentes, wrapper1/psql0;
   antes hubo setup sin pgTAP (psql3), corregido dentro de BEGIN/ROLLBACK.
   [RED](t012-t016/schema-red.log). GREEN posterior **18/18**, exit0.
2. `concurrency.mjs`: un único conjunto autorizado,5 cuentas/perfiles confirmados sin
   correo,2 barberías,4 membresías,2 profesionales de la misma persona,4 servicios.
   **Diez pares** de dos conexiones reales, dos waiters observados antes de liberar barrera:
   cinco mismo tenant y cinco persona A/B. En cada par:1 commit y1 rechazo23505 uniforme.
   También un par idempotente (dos éxitos, una cabecera/2 items/1 evento) y un par
   publicación/confirmación. No se usaron esperas como sustituto de concurrencia observada.
3. **14 escenarios completos pasaron antes de la aserción de pausa**: snapshots,
   huella/reintento, campos forjados/servicio ajeno, ACL con JWT ordinario, RLS,
   slots/privacidad, consecutivos,10 carreras, reintento concurrente, rollback, edición
   de catálogo, protección de agenda/capacidades y revocación vigente, cancelada sintética.
4. La ejecución inicial terminó **exit1** porque esperaba404 del contrato Edge al llamar
   directamente a PostgREST. La carrera ya había terminado y la publicación quedó pausada.
   No se cambió SQL para ocultarlo. `atomic-followup.mjs`, **con los mismos registros y
   sin crear otra cuenta**, confirmó HTTP500/P0002/NOT_AVAILABLE y ausencia de parciales:
   **17 cabeceras, todas con2 items y1 evento confirmed**. Exit0. Se corrigió la expectativa
   del operador para futuras ejecuciones; **no se repitió la suite completa corregida**.
   No se afirma que el primer comando fuera GREEN. [Comprobación complementaria](t012-t016/followup.json).
5. P0*→500 es la traducción documentada de [PostgREST14](https://docs.postgrest.org/en/v14/references/errors.html).
   T017 debe mapear NOT_AVAILABLE a404 y no propagar texto/contexto SQL. Esta diferencia
   no autorizó un cambio de contrato, de RLS, de gateway o de configuración Auth.

Los criterios SQL/RLS y diez carreras de T016 quedan acreditados por la ejecución y su
comprobación complementaria, no por una supuesta suite global completamente verde.
[Observaciones de la ejecución](t012-t016/concurrency-observed.json).

## Limpieza, planes y límites

Tras cotejar IDs, nombres del run y dependencias ajenas, se retiraron únicamente eventos,
items/citas y oferta/membresías/barberías/perfiles/usuarios del conjunto nuevo. Credenciales
solo RAM;0 archivos de credenciales y0 correos. [Limpieza](t012-t016/cleanup.json):0 usuarios
propios restantes, línea base conservada (2 cuentas previas y sus perfiles). Los12
contenedores anteriores y los de reproducción conservan identidades/montajes; vector antiguo
reinicia por sí mismo, por eso no se afirma igualdad de todos los StartedAt. No se operaron.

[EXPLAIN](t012-t016/plans.txt) corresponde a consulta propia con17 filas de prueba; eligió
Index Scan sobre el UNIQUE por cliente/tenant/request_id y filtro temporal. Hay además
índices por cliente/tenant/profesional y GiST,
no se afirma una medición de carga o rendimiento. Fundamento de intervalos/exclusión:
[PostgreSQL17](https://www.postgresql.org/docs/17/rangetypes.html); orden de locks:
[PostgreSQL17](https://www.postgresql.org/docs/17/explicit-locking.html).

La consulta de ocupación global también utiliza la exclusión GiST según el
[plan acotado](t012-t016/global-plan.txt). Inspección final de owners/ACL/filas en
[postcheck](t012-t016/postcheck.json); no es un benchmark ni validación Cloud.

Reversión: no ejecutar reset ni down destructivo. Primero detener nuevas escrituras de
esta funcionalidad y diagnosticar. Los objetos nuevos pueden retirarse en una migración
de reversión revisada solo después de comprobar que están vacíos y obtener autorización;
si hay citas, conservarlas y corregir hacia delante. No se ensayó borrar estas tablas.
Nueve avisos npm siguen pendientes. Cloud, UI de reserva, Edge de confirmación, agenda y
cancelación permanecen fuera de este bloque.
