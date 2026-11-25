# 009 — Horarios y bloqueos propios

Fecha15/11/2026. RF22/HU14 de propuesta aprobada. Implementada y activa en Cloud;
horarios y bloqueos propios aceptados manualmente en Web el 24/11/2026. Android
final pendiente; nuevas operaciones sensibles conservan autorización independiente.

## US1 (P1): Mi disponibilidad contextual

Como profesional activo quiero consultar y reemplazar mis intervalos semanales y
crear, modificar o retirar mis bloqueos en la barbería seleccionada. Un administrador
que también atiende tiene la misma capacidad propia. No administra por ello otra barbería.

Aceptación: consultar horarios generales y propios; guardar varios intervalos por día,
incluidos consecutivos [inicio,fin); rechazar solapamientos y horas fuera del horario
del local; añadir/editar/retirar un bloqueo propio con fechas de Lima; rechazar cualquier
cambio que deje sin cobertura una reserva comprometida o se solape con ella, incluyendo
su buffer. Un conflicto revierte toda la operación; ninguna cita se cancela o reprograma.
Revocación de membresía y cambio de contexto invalidan permisos y respuestas pendientes.

## Requisitos
- FR001: núcleo, formulario y contratos compartidos Web/Android, usando modelos004.
- FR002: actor JWT verificado, membresía/perfil activos; servidor deriva el profesional.
- FR003: intervalos enteros por día0–6 y minutos0–1440, no vacíos/solapados, contenidos
  en la unión de intervalos generales. Lista vacía permite retirar horario sin citas afectadas.
- FR004: bloqueos propios finitos, inicio<fin, motivo opcional; proteger reservas activas
  que todavía ocupan el intervalo. No alterar bloqueos generales ni de otro profesional.
- FR005: serializar cambios con confirmación004 y comprobar versión para evitar sobrescritura
  silenciosa entre dispositivos; doble envío bloqueado, conflictos y red permiten reintento.
- FR006: carga, vacío verificado, error recuperable, éxito y accesibilidad sin rediseño.

## Éxito
SC001: pruebas de intervalos/contención/fechas, payload cerrado, actor verificado,
scope, conflictos y UI Web/Android con dobles. SC002: tras permiso, SQL/HTTP reales
acreditan reservas intactas, carreras/rollback/revocación/A-B. SC003: recorrido físico
Web/Android final. No declarar SC002/003 por código o inspección estática.

## Límites
Sin citas nuevas ni datos modificados en este bloque. No agregar publicación automática,
horarios globales de una persona, tarifa, festivos nuevos o cancelación de citas desde horarios.
Reprogramación tiene bloque posterior; no modifica reglas comerciales aquí.

## Confirmación de operaciones

Guardar disponibilidad propia o un bloqueo muestra en Web una confirmación temporal
accesible, sin insertar un mensaje permanente sobre el formulario. El aviso depende
del resultado de la operación; un error no se representa como guardado. Horarios y
bloqueos del profesional siguen separados de cierres administrativos de 004.
