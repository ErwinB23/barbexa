# Operaciones de oferta e invitaciones — T008–T011

14/11/2026. Git main/0ccd33c comprobado; se conserva el trabajo anterior y el log activo.
**004:11/34**, T008–T011 completadas. T012+ no ejecutadas. Solo Supabase LOCAL
app-barberia-002-local:API54421/PostgreSQL54422; sin Cloud, paquetes, APK, commit/push.

| Tarea | Resultado y prueba |
| --- | --- |
| T008 | RED SQL3/3 por RPC ausentes y RED servidor por módulos ausentes; preparación de autorización, invitación, publicación, administrador profesional y guardia de cambios. |
| T009 | RPC de configuración, publicación, servicios, profesionales, capacidades, horarios/excepciones e invitaciones; catálogo comercial y consultas de invitaciones propias/admin. SQL23/23. |
| T010 | Casos de uso compartidos de servidor con unión cerrada de comandos, puertos y adaptador RPC, composición explícita y handler local barbershop-operation. JWT activo; actor validado con Auth002. Tipos/grafo/lint/formato y gate de cobertura aprobados. |
| T011 | HTTP real9/9 resultados TAP, con cuatro cuentas ficticias; tres carreras con dos conexiones PostgreSQL independientes y barrera observada. Limpieza selectiva final y cero residuos. |

## Cambios locales

Migraciones creadas por CLI y aplicadas en orden, cada una con preview local y skip-vault:

1. `20261114202045_booking_operations.sql`: funciones nuevas y sus ACL. No alteró tablas,
   políticas/migraciones previas ni datos existentes.
2. `20261114220827_booking_catalog_visibility.sql`: corrección aditiva de una proyección,
   preservando firma y permisos. La regresión mostró que las capacidades de un profesional
   sin horario podían aparecer aunque el profesional estuviera oculto; RED conservado y
   SQL posterior GREEN. No se editó la migración ya aplicada.

RPC de escritura públicas SECURITY INVOKER, EXECUTE solo service_role; funciones privadas
definer con search_path vacío y autorización vigente. Las lecturas comerciales usan Auth
actual; sus helpers comprueban que el actor recibido coincida con auth.uid, incluso si
se intenta invocarlos directamente. No se expone identidad Auth del profesional en catálogo.
Perfiles y membresías002 mantienen su RLS/ACL original.

El handler verifica JWT/usuario dentro de la función, no confía solo en el gateway ni en
metadata de rol. Reutiliza Auth002 mediante una nueva exportación de su **composición
pública**, conectada en el entrypoint. La primera auditoría rechazó imports de infraestructura
de otro módulo; se corrigió la composición, sin debilitar el checker ni duplicar Auth.
El cambio de002 es solo esa exportación adicional, sin alterar los servicios existentes.

Los cuerpos tienen campos cerrados y límite8KiB; no admiten actorId/role ni destinatario
alternativo en la aceptación. Los precios administrativos usan unidades menores PEN
enteras; no son precios de reserva confiados al cliente. Errores y logs no incluyen JWT,
secretos, SQL o datos de personas. CORS conserva localhost:8081 y la ruta ya acreditada;
no se cambiaron Kong/GoTrue/JWT. El nuevo handler se sirvió sin reiniciar la pila o Metro.

## Pruebas ejecutadas

- [SQL final](sql-green.log):23/23, sin repetir las444 comprobaciones históricas.
- [HTTP](http.log):9/9 TAP (ocho subcasos y su prueba contenedora). Admin A no administra B
  siendo barbero allí; inactivo y clave anon no pueden operar; identidad/campos falsos y
  RPC privilegiadas directas denegados. Administración legítima de A/B, publicación, catálogo
  comercial sin perfiles ajenos, pendiente sin membresía, aceptación/rechazo/reinvitación,
  cancelación, administrador sin degradación e invitante revocado comprobados.
- [Concurrencia](concurrency.json):duplicar invitación, doble aceptación y aceptación vs
  cancelación. En cada par:dos conexiones, dos workers observados bloqueados en barrera,
  una transacción confirmada y otra23505; sin membresía parcial ni duplicada. No se usaron
  timers como prueba de simultaneidad.
- Servidor:10 pruebas nuevas y gate ampliado a27/27 incluyendo17 regresiones rápidas de
  Auth002. [Cobertura del núcleo nuevo](coverage.log):100% líneas/funciones/ramas. No es
  cobertura de todo el Edge Runtime: adaptador y presentación tienen cobertura unitaria
  parcial, complementada con HTTP real sin instrumentación de líneas del worker.
- Tipos cliente y núcleo servidor, entrypoints Deno, check:server, grafos cliente/servidor,
  lint y formato:0. Cliente78 módulos/24 core/185 aristas; servidor24/13/48.
  [Registro reproducible](verificaciones.json).

La ejecución HTTP completa precedió a la corrección aislada de capacidades sin horario.
Esta corrección se verificó con la regresión SQL autenticada y el resto de los23 casos,
sin crear otro conjunto de cuentas ni repetir login/registro003. Después del ajuste de
composición se comprobó disponibilidad204 y rechazo de credencial inválida401, sin datos.
No se declara ningún nuevo recorrido de pantallas Web/Android: corresponden a T012–T013.

## Límites de reservas y recuperación

La guardia contra cambios que invaliden citas se ensaya con una **fixture del contrato
futuro**, creada dentro de la transacción SQL y revertida. No implementa ni acredita el
motor de reservas: no existe public.reservations fuera de esa prueba. La guardia toma
el protocolo de bloqueo de configuración; su integración con filas reales, snapshots,
concurrencia y reservas A/B de la misma persona debe acreditarse en T014–T016. El test
no intenta recrear esa tabla si ya existe el esquema real.

Se probaron transiciones competitivas de invitación; esto no se presenta como prevención
de solapamientos de citas. No slots, confirmación, pagos ni agenda implementados aquí.
Recuperación de contraseña003 sigue obligatoria antes de la evaluación final.

## Datos autorizados y conservación

Autorización expresa del usuario: máximo4 cuentas/perfiles,2 barberías,6 membresías,
3 profesionales,3 servicios y10 invitaciones, más configuración/horarios necesarios.
Se creó un único conjunto con4 cuentas confirmadas sin correo y2 barberías. Credenciales
solo en memoria; no archivo, evidencia o log. Las pruebas usan sus JWT reales.

[Limpieza](cleanup.json):identidad del stack y IDs comprobados, nombres de barbería con
marca aleatoria, propietarios y dependencias contrastados antes de borrar. Se detiene
ante referencias ajenas, exceso de límites o esquema de reservas inesperado. Solo se
eliminaron filas de esos tenants/usuarios identificados. Cotejo de línea base coincidente.
[Postcheck](postcheck.json):dos usuarios/perfiles anteriores, cero barberías/membresías,
cero filas nuevas de negocio, perfiles y sesiones sin huérfanos, ocho migraciones y
23 funciones inspeccionadas sin EXECUTE de PUBLIC. Ningún usuario anterior eliminado.
Eliminar cuentas no se presenta como garantía de revocación instantánea de todo JWT.

## Siguiente bloque, sin ejecutarlo

Dependencias literales: T012 requiere operaciones actuales y T013 sus pantallas y pruebas
reales Web/Android. El backend T014→T015→T016 **no espera T013**: necesita baseT007 y lecturas/
capacidadesT009, ya satisfechas, más oferta controlada específicamente autorizada.
La ruta más corta al motor es **T014–T016**: RED de reserva, esquema/RPC transaccional y
diez pares concurrentes, con exclusión por persona física entre barberías y privacidad.
T012–T013 pueden avanzar en sus archivos de interfaz mientras se prepara ese backend.
Después T017 conecta el motor con Edge/cliente, T018–T019 permiten reservar y T020–T023
aportan agenda y demostración Android→administrador Web, también para el barbero asignado.

No bloqueo técnico actual para ese siguiente bloque. Nueve avisos npm moderados y riesgo
XSS residual siguen pendientes; no se afirma auditoría aprobada. Permisos para futuras
fixtures, operaciones Cloud y aceptación real de pantallas siguen siendo puertas explícitas.

[Revisión final de archivos, secretos y enlaces](revision-final.json):sin modificaciones
inesperadas y sin patrones sensibles encontrados en el alcance revisado. Staging vacío,
main/0ccd33c. Diff global2 por el log activo conocido; excluyéndolo únicamente,0. Este
escaneo no equivale a auditoría de dependencias ni certificación de seguridad. La limpieza
acredita las tablas indicadas en postcheck; no se manipuló la auditoría técnica de Auth.
