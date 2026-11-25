# Plan

Extensión modular de barbershop-operation, con comandos cerrados read/write de
perfil ampliado en la Edge Function existente. MantenerProfessional y APIs antiguas;
nuevoProfessionalProfile extiende sus datos únicamente para esta capacidad.

La migración añade descripción/redes a barber_profiles y fecha nullable a membresías:
existentes sin fecha, default para nuevas filas. RPCs solo service_role, actor
verificado de Edge, orden de bloqueo settings→membresía→profesional igual a008,
search_path vacío, validación redundante SQL y sin cambios en RLS/permisos de negocio.

Pruebas: validadores, aislamiento y respuesta tardía, payloads, servidor/adaptador,
UI y compatibilidad antigua. Preparar ensayo SQL transaccional; no ejecutarlo contra
LOCAL/Cloud sin autorización. Verificar tipos/lint/arquitectura/tests/build.
