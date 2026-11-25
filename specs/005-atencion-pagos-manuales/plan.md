# Implementation Plan: Atención y pagos manuales

Fecha: 15/11/2026. Checkout main; spec005 seleccionada por Spec Kit. Sin cambio de rama.

## Summary
Extensión aditiva: estado de atención separado de reserva y pago. Reservas antiguas no
reciben pagos ficticios. Nuevas confirmaciones con método utilizan una RPC transaccional
que reutiliza el motor004. Cliente y servidor conservan núcleos propios y composición.

## Technical Context
TypeScript6, Expo58/RN/Web, Deno, Supabase Auth/PostgREST/PostgreSQL17 existentes.
Sin dependencias nuevas. Datos en PostgreSQL, secretos solo en Edge. Pruebas Node/Deno,
SQL real después de autorización y recorrido Web→Android final. Sin objetivo de rendimiento
inventado: priorizar exclusión/idempotencia y10 pares concurrentes del SC003.

## Constitution Check
I–V: mismo cliente/servidor, módulos por funcionalidad y puertos sin SDK en núcleo.
VI–VII: JWT verificado, membresía actual, RPC privilegiada cerrada, auditoría y atomicidad.
VIII–X: spec→plan→tasks→tests RED/GREEN; ninguna prueba doble sustituye SQL/dispositivo.
XI–XII: conservar evidencias/datos/estado; no cierres prematuros. Sin excepción arquitectónica.
Gates posteriores: SQL revisado pero no aplicado; integración PostgreSQL y E2E pendientes.

## Project Structure
- src/features/reservations/{domain,application,infrastructure,presentation}/care-*
- src/composition/reservations-composition.ts: composición explícita sobre transporte existente.
- supabase/functions/_shared/reservations/: caso de uso/puerto/adapter; mismo Edge reservation-command.
- specs/005-atencion-pagos-manuales/contracts/care.sql: borrador no ejecutable por runner automático.
- tests/integration/booking/care.test.mjs y tests/server/reservations/care.test.ts.

## Complexity Tracking
Sin nueva plataforma ni servicio. Separar estado financiero evita reinterpretar confirmed
como pagado y conserva compatibilidad del catálogo/agendas. SQL exige autorización antes
convertir borrador en migración creada por CLI y aplicarla.
