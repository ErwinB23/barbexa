# Pagos y reglas — 24/11/2026

## Solicitud y alcance
Añadir una pestaña después de Horarios en Administrar barbería, con Pagos,
Reglas de atención y Reglas de reservas. Trasladar la configuración que antes
estaba al pie de Agenda de tu barbería. No reorganizar aún la agenda general.

## Criterios
- Solo administración de la barbería seleccionada; mismos controles servidor.
- Pagos: instrucciones Yape, confirmación manual, vacío deshabilita Yape.
- Atención: tolerancia de inasistencia. Se guarda junto con Yape mediante el
  comando configure existente; nunca enviar defaults sin consultar.
- Reservas: antelación de reprogramación con consulta/guardado existente.
- No duplicar esos controles en la agenda ni cambiar sus filtros/reservas.
- Web y Android comparten controladores. Sin endpoints, datos o reglas nuevos.
- Las otras políticas generales de la pestaña Barbería conservan su ubicación.

## Plan y tareas
- [x] Añadir ruta y entrada administrativa después de Horarios.
- [x] Componer tres apartados con controles existentes y fallos de disponibilidad.
- [x] Retirar configuraciones trasladadas de AgendaScreen.
- [x] Prueba navegación/ocultación por rol Web y Android y contenido de apartados.
- [ ] Aceptación visual en sesión real Web y dispositivo Android, agrupada al recorrido final.

## Verificación
Prueba inicial roja por pestaña inexistente y posterior verde. Tipos, lint,
formato y arquitectura ejecutados; resultados finales en handoff.
Cargador de route-hydration actualizado para resolver sufijos .styles.ts al importar
la composición nueva; sus seis pruebas de sesión vuelven a pasar.
Sin recargar navegador del usuario ni ejecutar guardados reales.


## Rediseño Web premium — 24/11/2026
Referencia y texto autorizado de adjunto11c4eaf0. Nuevos payments-rules-web.tsx,
.styles.ts y composición especializada payments-and-rules-panel.web.tsx. Cuatro
paneles en dos columnas, banner CSS/SVG, márgenes pequeños y ancho disponible.
CareSettings expone estado/callbacks de edición mediante renderLayout; controlador
conserva comando conjunto e idempotencia/reintento. ReschedulePolicyControl admite
renderContent opcional conservando su guardado propio. Android mantiene su interfaz.
Yape deriva del texto consultado, no del borrador; consulta pendiente se indica.
No toggle de efectivo/Yape; borrar instrucciones requiere guardar explícitamente.
Campo único hasta2000 caracteres, tolerancia0–1440 y reprogramación entero no negativo.
Ejemplo dinámico de inasistencia y equivalencia de minutos. Sin datos prefabricados.

### Validación y límites
Captura aislada1260/800/390 sin overflow, controles reales de presentación con datos
de prueba solo en artefactos ignorados. No recargar ni escribir en Cloud del usuario.
Verificación final: cliente556/556, tipos, lint, formato, arquitectura y diff
aprobados. Verificación integrada/Android físico pendiente.
Anticipos obligatorios, facturación y comprobantes no soportados: omitidos. No se
introducen cargos de cancelación. Política de cancelación continúa en Barbería;
esta tarjeta explica confirmación/estado/devoluciones ya existentes, sin nuevas
políticas económicas ni ampliación de permisos. Reembolsos siguen en atención.

- [x] Interfaz Web y navegación de cinco pestañas conservada.
- [x] Editor desplegable de Yape y controles numéricos.
- [x] Guardados independientes con consulta previa, estados y protección doble clic.
- [x] Capturas de escritorio/tablet/móvil sin overflow.
- [ ] Revisión visual del usuario en sesión real.


### Corrección de conexión de la ruta
Usuario reportó vista anterior tras implementación. Se fuerza import Web explícito
en operation-route.web.tsx; prueba de cableado roja→verde. Cliente557/557, tipos/lint
pasan. Verificada página real mediante lectura CUA de ventana Brave en /payments-rules:
contenidos premium presentes. Sin recargar, editar ni guardar configuración real.
La causa exacta de que el grafo anterior permaneciera servido no se atribuye a un
error de caché del navegador: se corrigió la dependencia y se observó el resultado.


### Edición bloqueada hasta consulta manual — corrección
Carga inicial automática opt-in solo en Web de Yape/tolerancia y antelación.
Hook useInitialRead consulta una vez por scope, no al editar borradores; conserva
consulta manual/reintento y no guarda defaults. Prueba roja→verde del comando settings
sin configure. CUA verificó lectura real, campos10/120, guardar habilitado y editor
Yape abierto/editable. Ningún campo modificado ni guardado real; guardados se prueban
con dobles aislados. Carga fallida deja controles protegidos y consulta para reintentar.

Verificación de esta corrección: cliente558/558, TypeScript, lint dirigido,
formato, arquitectura y diff aprobados. Logs .artifacts/payments-autoload-*.


### Segunda referencia compacta
Distribución superior7/5 e inferior6/6; filas de métodos, franja de información real
y filas enmarcadas de reglas de pago. No facturación o anticipos ficticios. Efectivo
siempre disponible como indicador fijo. Switch de Yape opera sobre instrucciones del
borrador, pide confirmación inline antes de vaciarlas y requiere guardado explícito.
Reactivación reutiliza instrucciones consultadas o abre editor, nunca datos de ejemplo.
Estado configurado se mantiene distinguido de cambios pendientes. Prueba aislada de
confirmación sin escrituras; cliente559/559, tipos/lint/formato/arquitectura aprobados.
CUA confirmó distribución nueva en página real sin recargar ni modificar valores.
Capturas aisladas1260/800/390 sin overflow. Pendiente revisión visual del usuario.
