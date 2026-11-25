# Administración, permisos e invitaciones — Web

24/11/2026. Implementar exclusivamente el contenido del desplegable administrativo
según adjunto f5673624. Mantener navegación, profesionales, invitaciones recibidas,
Android, Cloud, banderas y jerarquía. Sin operaciones reales de invitación/retirada.

Diseño: Outfit existente; marfil #fffdfa, crema #f8eedf, marrón #382717,
dorado #996322, líneas #e7d7c1 y verde #28623b. Resumen de cuatro bloques,
tabla compacta y filtros; invitación plegable; historial enviado compacto y matriz
informativa de roles. Jerarquía alineada a izquierda, espacios16/24px y acciones44px.
Referencia manda sobre recomendaciones genéricas; sin fotos ni dependencias.

Datos: secondaryCount del backend excluye propietario; null es desconocido.
Invitaciones consultadas por controlador existente, filtradas por barbería y vigencia.
Miembros administradores del contexto; nombre profesional o nombre propio disponible.
Contrato actual no incluye correo de miembros/invitados ni última actividad: se omiten
actividad y correo, destinatario por nombre real; buscador por nombre. Un secundario
no se identifica como propietario ni recibe lista administrativa no autorizada.

Reutilizar TeamAuthorityPanel y AdminInvitationsPanel mediante render opcional;
salida universal previa sigue por defecto. Composición Web única evita paneles duplicados.
Conservar cola, idempotencia, incertidumbre, validación, destino y motivo de retirada.
Consultas automáticas salientes solo para propietario una vez por montaje/contexto;
fallo conserva recuperación manual. Selector de roles informativo, no edita privilegios.
Transferencia, reportes y promociones no se presentan como operativos.

Validación: tests de contadores/filtros/capacidades/acciones/estados/aislamiento;
controladores con dobles para escrituras. Tipos/lint/formato/grafo y cliente pertinente.
Revisión visual aislada1600/1260/800/390 y CUA integrada a100% sin guardar datos.
Detener al finalizar para revisión del usuario.

- [x] Pruebas de regresión observadas fallar antes de implementación.
- [x] Renderers y composición exclusivamente Web, lógica existente conservada.
- [x] Tabla, filtros, resumen, formulario, historial, roles y retirada.
- [x] Revisión visual integrada a100% y render aislado1600/1260/800/390 sin overflow; sin mutacionesCloud.

Implementación: admin-management.web.tsx, admin-management.web.styles.ts y
admin-management-panel.web.tsx en presentación. Render opcional en TeamAuthorityPanel
y AdminInvitationsPanel reutiliza sus estados/handlers; contenido universal por defecto
conservado. operation-route.web compone el panel único mediante administrationPanel
en OperationScreen; las otras rutas y la salida Android no cambian.

Pruebas nuevas6 de contenido/acciones +2 de controladores: cuotas, filtros,
datos no consultados, estados, cupo completo, secundario, cancelación porID,
single-flight y descarte tardío de otro contexto. Dirigidas29/29, cliente576/576,
tipos/lint/formato/grafo aprobados. Ver evidencia
docs/evaluacion/evidencias/004-reservas/ui-administracion-premium.md para cierre técnico.

Se conservan operaciones de retirada con destino/motivo y reintento incierto; formulario
de invitación con validación existente, Escape/cancelar/cerrar y foco al campo. Menú
de propietario no ofrece retirada. Fuentes de autoridad/roles/cupos no modificadas.

Pendiente de revisión visual del usuario. No se envían invitaciones ni se retiran
administradores reales. Para mostrar correo o actividad sería necesario ampliar el
contrato backend con autorización separada; no son requisitos para operar esta UI.
