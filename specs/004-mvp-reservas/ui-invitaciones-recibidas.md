# Bandeja de invitaciones recibidas — 24/11/2026

Referencia e instrucciones adjuntas del usuario: página premium unificada con filtros,
bandeja y lateral de resumen/reglas/respuestas. Sustituye la propuesta preliminar de
dos secciones, pausada al recibir la referencia. Conserva fuentes y respuestas reales.

## Implementación

- composition/received-invitations-page.web.tsx coordina las lecturas propias de
  administración y barbero mediante servicios existentes. Promise.allSettled distingue
  errores parciales, carga y vacío. No consulta invitaciones enviadas/gestión de equipo.
  Respond utiliza el servicio de cada rol y vuelve a leer tras éxito verificado.
  Guardia síncrona evita doble envío; respuestas tardías se descartan por scope/unmount.
  Un resultado incierto bloquea respuestas hasta reconsulta completa, sin simular éxito.
- composition/operation-route.web.tsx monta la página solo en staff/incoming, tras las
  comprobaciones existentes de configuración/sesión. Clave por actor/generación/scope.
  Administración, equipo y pestañas profesionales mantienen sus rutas y controles.
- presentation/invitations-inbox.web.tsx y .styles.ts: encabezado/actualización, filtros
  Todas/Administración/Barbero/Pendientes/Aceptadas; listado ordenado por fecha disponible,
  detalle nativo por tarjeta y filtro de historial de respuestas/estados no pendientes.
  Lateral con pendientes por tipo, reglas y cinco estados. Conteos calculados; «—» si
  no se verificó toda la fuente necesaria. Historial corresponde a lo devuelto por las
  consultas actuales; no añade paginación ni promete recuperar registros fuera de ellas.
- Pendientes permiten aceptar/rechazar; vencidas y demás estados son de lectura.
  Contexto/permiso definitivo continúa en servidor. No modifica caducidad o límites.
  La regla de siete días se atribuye a administración, no a invitaciones profesionales.
- Los contratos recibidos no traen invitador; se indica «No disponible». Fechas no
  disponibles también se identifican sin inferir fechas de registro/aceptación. Mocks
  del brief se usan SOLO en .artifacts para vista aislada; la aplicación conecta datos
  reales y presenta vacíos honestos. No SQL, migraciones, RPC, Edge o cambios Cloud.
- Propuesta preliminar: received-invitations.web/styles.ts y adaptaciones en
  admin-invitations.tsx/operation-screen.tsx quedan para composiciones heredadas.
  La nueva ruta Web usa la bandeja unificada. Android mantiene presentación funcional
  existente; el autoconsumo entrante administrativo solo realiza lectura propia.

## Validación

Pruebas ampliadas en booking/team.test.mjs y workspace-navigation.test.mjs: interfaz sin
controles de envío, carga/error/vacío diferenciados, orden, filtros, vencidas sin
respuestas, handler por rol, doble clic, actualización tras aceptación y descarte
tras desmontaje. La prueba de navegación falló antes de modificar la propuesta inicial.

Vista HTML aislada con fixtures sintéticos, Chrome nuevo sin sesión ni servicios Cloud:
1260/800/390px, sin desbordamiento horizontal. Revisión de capturas de escritorio/móvil.
Tipografía del artefacto es fallback; aplicación hereda Outfit del proyecto. Sin recargar
la pestaña del usuario ni enviar/aceptar/rechazar invitaciones para probar.
Artefactos ignorados: .artifacts/invitations-inbox-* y received-invitations-*.
Pendientes aprobación visual integrada, datos opcionales no expuestos por contratos,
Android físico y cualquier evolución de historial/paginación fuera del alcance actual.

Cierre: cliente547/547, tipos cliente/núcleo, lint sin advertencias, Prettier,
grafo de arquitectura y diff --check aprobados. Una corrida intermedia tuvo fallo
transitorio UNKNOWN al abrir un archivo en el cargador de prueba OAuth; el caso aislado
6/6 y la batería completa547/547 pasaron al repetir, sin modificar autenticación.
