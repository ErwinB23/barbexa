# Implementation Plan: 010 — Reprogramación

**Date**:2026-11-15 · **Spec**:[spec.md](spec.md) · Feature010 sobre main, sin commits.

## Summary / Technical Context
Expo58/React Native/TypeScript y Supabase existentes; ninguna dependencia nueva.
Dominio cerrado fecha/hora; aplicación compartida coordina scope y reintentos; adaptadores
usan Auth verificado y Edge reservation-command; PostgreSQL es la única autoridad.
Backend y capacidad de reprogramación activos en Cloud. Web usa selección de fecha
y horarios disponibles, consulta de historial desplegable y mensajes de plazo
separados de errores de sesión. Recorrido manual Web aceptado; Android final pendiente.

## Constitution Check
Doce principios conservados: núcleo sin SDK/framework, composición explícita, autorización
contextual de servidor, transacción/exclusión por persona, Web/Android obligatorios.
Sin cambios Cloud, datos, pagos, migraciones históricas, dependencias o rediseño.

## Project Structure / Implementación
- domain/reschedule.ts en cliente y servidor: UUID/UTC/fecha cerrados; no override de rol,
  actor, tenant, profesional, servicios, precio, pago o política.
- application/reschedule.ts: puerto propio, requestId criptográfico existente, scope con
  generación/contexto, un envío en vuelo y mismo payload tras incertidumbre.
- Adaptador cliente existente y nuevo reschedule-adapter.ts de servidor: RPC fijas.
- RescheduleControl en Mis reservas, controles accesibles existentes y flags opt-in.
- SQL futuro: política por barbería, request/evento auditable, disponibilidad excluyendo
  solo la reserva actual; comparar expectedStartsAt y reservar destino atómicamente.

## Dependencias y riesgos
Backend SQL/editor administrativo/historial implementados. Excepción de personal aprobada:
administrador activo o barbero asignado activo, motivo obligatorio fuera del plazo; opcional
dentro. Aplicada migración20261115210802 solo LOCAL:2 tablas privadas vacías,10 funciones;
68 checks estructurales y13 HTTP de lectura/rechazo reales aprobados,29 reservas intactas.
Usar snapshots originales de duración/buffer/precio, no catálogo cambiado. Reutilizar
locks004/005 en orden único; revalidar care/pago sin escribir su ledger. Eventos reintento
deben conservar respuesta original o rechazar colisión de requestId de otro payload.
Escrituras/carreras y pruebas físicas siguen pendientes de autorización de datos y ejecución;
las verificaciones de lectura no acreditan atomicidad funcional del nuevo caso de uso.

## Verificación
RED→GREEN dirigida de núcleo/adaptadores/handler y controles Web/Android con dobles;
regresiones de reservas, care, cancelación e hidratación, tipos/lint/formato/arquitectura.
No confundir estas pruebas con concurrencia PostgreSQL o validación en dispositivos.
