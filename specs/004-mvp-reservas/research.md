# Research — 004 MVP de reservas

2026-11-14. Lectura de fuentes/código y decisiones de diseño; no DB, tests de negocio,
migraciones, usuarios ni despliegues ejecutados. Fuentes anteriores son solo referencia.

## R1 — Alcance por etapa y obligaciones del producto

**Decisión**: cuatro historias para oferta, reserva, agenda y cancelación. Recuperación003
es puerta antes de evaluación. Google se difiere por decisión expresa, pero sigue obligatorio
de producto por ConstituciónV/RF02; rúbrica no nombra proveedor. Pagos totalmente fuera del
MVP por decisión expresa: se conservan como alcance futuro VII/RF15/25/37–38, sin afirmar
cumplimiento. Precio de catálogo/total no equivalen a cobro. Imágenes/mapas/reseñas y otros
requisitos de propuesta siguen pendientes, no convertidos en opcionales.

**Razón**: alcanzar Android→Web sin reabrir Auth/infraestructura ni fingir SaaS completo.
**Descartadas**: copiar21 tablas; ampliar a pasarela; borrar obligaciones constitucionales;
asumir que rubricar frontend equivale a pruebas de seguridad.

## R2 — Reglas funcionales resueltas

Cancelación configurable120min inicial, límite inclusive por reloj servidor y snapshot de
confirmación. Cliente después no puede; staff autorizado puede con motivo obligatorio.
Sin penalización económica. Invitación interna existente, aceptar/rechazar y pendiente sin
acceso, sin correo; solo admin emite/cancela, unicidad pendiente y nueva tras rechazo/cancelación.
Admin puede atender únicamente con perfil/capacidad/horario activos, sin cambiar identidad/rol.
Se aprobó exclusión por persona entre tenants, mensaje público uniforme y sin datos ajenos.
America/Lima/PEN ya estaban impuestos. Varios servicios deriva de RF09, no se reduce a uno.
Otros valores operativos no tienen default comercial adivinado: se configuran antes de publicar.

## R3 — Persistencia y relaciones

**Decisión**: once tablas nuevas: settings, servicios, profesionales, capacidades, dos horarios,
excepciones, invitaciones, reservas, items históricos y eventos. Reusar profiles/barbershops/
memberships002. FKs compuestas de todo hijo que lleve tenant; snapshot de precio/duración,
descripción/nombres/política. No borrar referencias históricas al desactivar oferta.
**Razón**: impedir mezcla de tenants aun por error de adaptador y mantener hechos de la cita.
**Descartadas**: roles globales; copiar nombre/email del perfil global como dato público sin
consentimiento; reservas sin detalles históricos; depender solo de validación TypeScript.

## R4 — Autoridad, RLS y superficie de lectura

**Decisión**: permisos mínimos por columna/operación, RLS habilitada y denegación por defecto.
Lecturas propias/agenda con JWT; proyecciones comerciales autenticadas seguras para clientes
sin membresías mediante RPC acotada. Mutaciones por Edge→caso de uso→RPC de servicio, actor
derivado de Auth y SQL repite pertenencia actual. private no expuesto; EXECUTE/PUBLIC revocados
en la misma transacción de creación. Toda SECURITY DEFINER fija search_path y objetos calificados.
**Descartadas**: abrir base barbershops/profiles a anon para facilitar catálogo, SDK service en
Expo, autorizar por metadata o rol del formulario, tratar CORS como permiso, GraphQL nuevo.

## R5 — Concurrencia definitiva

**Decisión**: `tstzrange` semiabierto y exclusión GiST por barber_user_id físico, con btree_gist,
condicionada a reserva activa. Profesionales en A/B de la misma persona comparten ocupación,
pero no datos ni permisos. Canceladas no bloquean. Orden estable de locks transaccionales y
validación bajo lock; metadata/catálogo usan el mismo protocolo. Las llamadas externas quedan
fuera de transacciones. Clave de idempotencia por actor/tenant, huella calculada SQL, rollback
de reserva/items/evento ante fallo. No SELECT libre seguido de INSERT como única defensa.

**Razón**: dos sesiones distintas pueden confirmar simultáneamente aun viendo el mismo slot;
un lock JavaScript o estado optimista del cliente no protege la base.
**Descartadas**: solo lock por perfil profesional local (permitiría doble atención física A/B),
cachear disponibilidad como garantía, confiar en serialización del proceso Edge, reparar historial
con datos del cliente. Presupuesto de10pares concurrentes en validación, no resultado obtenido.

## R6 — Interfaces y dependencias

Expo/RN/Router/SDK/Deno/PostgreSQL existentes; no nuevo framework UI, caché externa o librería
fecha. Usar UTC absoluto devuelto por slots y presentar America/Lima; PEN decimal exacto
traducido a unidades menores en dominio, sin suma binaria flotante como autoridad.
Campos/botones/Screen accesibles existentes. Rutas solo navegación; dos módulos con contratos
propios y dos entradas Edge, no microservicios. Crypto existente para requestId seguro.

## R7 — Reproducción y riesgos de entrega

Solo stack app-barberia-002-local:54422/API54421 en ejecución local futura, previa identidad.
Runner aprobado002 se amplía con modos booking/concurrency y limpieza selectiva; no copiar
credenciales ni modificar el proyecto anterior. Cloud requiere aprobación de cada escritura,
exposición ACL/RLS/Edge y origen/callbacks; no basta el backend002 publicado. Recuperación003
y aceptación Web/Android no son opcionales por el plazo. No nuevo APK si no cambia nativo.
Nueve avisos npm moderados continúan; no auditoría ni remediación supuestas.

## Fuentes comprobadas

- [Propuesta y flujo de reserva](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/main/README.md),
  [RF09–RF42](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/main/docs/01-analisis-de-sistema/03-requisitos-funcionales.md),
  [restricciones](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin/blob/main/docs/01-analisis-de-sistema/05-restricciones.md),
  leídas mediante connector GitHub. Referencia actual local: [análisis anterior](../../docs/arquitectura/analisis-supabase-anterior.md).
- [PostgreSQL17 rangos/exclusión](https://www.postgresql.org/docs/17/rangetypes.html),
  [constraints/FK](https://www.postgresql.org/docs/17/ddl-constraints.html).
- [Supabase funciones y privilegios](https://supabase.com/docs/guides/database/functions),
  [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
- AGENTS, Constitución2.0.0, rúbrica local, contratos/modelo002, package.json y estructura
  servidor actual. Skills Spec Kit y supabase-postgres: RLS, índices FK y transacciones cortas.

La lectura justifica el diseño; no acredita extensión instalada, privilegios futuros,
latencias, protección concurrente ni flujos funcionales de una implementación inexistente.
