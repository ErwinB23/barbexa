# Validación y trazabilidad — 003

Plan de pruebas, no resultados ejecutados. Cinco historias/20 FR/seis SC. Web y Android
obligatorios, ligera prioridad Web de ejecución. No repetir batería completa 002 salvo
cambio/regresión; sus evidencias RLS/Cloud se reutilizan como base, no pruebas de UI 003.

## Niveles y puertas

1. Unitarias node:test de núcleo: estado/generation, entradas, selección contextual y
   traducción de errores. Dobles para éxito, inválido, fallo, carreras y cero llamadas
   ante entrada inválida; cobertura por archivo y ramas, sin atribuirla a UI/SDK.
2. Integración adaptadores con respuestas controladas y storage real por plataforma:
   sin secretos, errores/roundtrip/interrupción, canje deduplicado y signOut local.
3. Presentación: harness actual para vistas/estados/acciones/guardas; extender solo si
   no cubre interacción requerida. Tests de estructuras no equivalen a E2E.
4. Funcionales reales en navegador Chromium y Android build propio: correo/retornos,
   backend 002 autorizado, perfil/contexto, navegación y ciclo de sesión. Manual reproducible
   es válido con atribución; automatizar donde haya herramientas disponibles sin nueva
   dependencia innecesaria. Tipos/export/SDK mocks no sustituyen esta puerta.
5. Calidad: typecheck/lint/format:check/architecture:check/test/check existentes tras
   incorporar módulos. Checker debe incluir nuevo núcleo y rechazar SDK/DOM/RN/transitivas;
   no relajar reglas ni eliminar regresiones. Reportar fallos iniciales y códigos reales.

## Matriz FR → verificación (ambas plataformas cuando interactúa el cliente)

| FR | Prueba y evidencia mínima |
| --- | --- |
| FR-001 | Registro válido/inválido/duplicado; validar sin petición si datos inválidos; formulario Web/Android y resultado Auth real. |
| FR-002 | Confirmación pendiente sin ready; correo real y retorno válido/consumido/incorrecto en cada plataforma. |
| FR-003 | Doble pulsación/timeouts sin altas a ciegas; separar registro/confirmación/sesión/perfil. |
| FR-004 | GET/ensure 002 del actor; reintentar perfil no signUp, no sobrescribir existente; perfil propio visible real. |
| FR-005 | Login correcto/incorrecto/no confirmado; clave pública sola no acredita identidad; UI sin detalles sensibles. |
| FR-006 | Persistir/reabrir navegador e instalación Android; fallo storage, sesión extensa y verifier conservado; no flash privado. |
| FR-007 | Vigente/renovable/inválida/red en arranque y foco; renovación concurrente y callbacks tardíos sin restaurar cuenta cerrada. |
| FR-008 | Logout online/offline; scope local; Web pestañas/recarga/historial, Android Atrás/reapertura; error de eliminación no se declara éxito. |
| FR-009 | A→salir→B y cambio de tenant con respuestas de A retrasadas; cero datos de A publicados. |
| FR-010 | URL protegida directa, retorno interno válido, externo rechazado, desconocida; recarga/Atrás/Adelante Web y Atrás Android. |
| FR-011 | Cero membresías con perfil válido muestra cuenta/salida, sin crear membresía ni rol global. |
| FR-012 | Una activa/autorizada automática; varias elegir/cambiar; preferencia obsoleta revalidada, inactiva no candidata. |
| FR-013 | Admin-A/barber-B: nombre y rol del contexto correcto, sin traslado de acciones admin ni permisos por metadata. |
| FR-014 | Revocación/inactividad/denegación: retirar contexto y conservar Auth válido; red no se transforma en autorización por caché. |
| FR-015 | Recuperación por email real no enumerativa; límites/errores/reenvío controlado. |
| FR-016 | Canje recovery válido/expirado/repetido/cancelado/sin verifier; contraseña actualizada, salida local y nuevo login; no ready anticipado. |
| FR-017 | Estados/inputs/controles accesibles, 48dp Android/equivalente Web, etiquetas/roles, teclado/foco Web, lector, scroll/zonas seguras/texto ampliado. |
| FR-018 | Auditoría grafo real y regresiones checkers; composición pública sin adaptador en pantalla; core sin SDK/HTTP/SQL/RN/DOM. |
| FR-019 | Recorridos reales de todas las historias en ambas plataformas, no solo fixtures HTTP; registrar límites y limpieza autorizada. |
| FR-020 | Evidencia sanitizada por plataforma/versión y lista de avisos; ambas aprobadas para cerrar, sin declarar auditoría npm superada. |

## SC y aceptación

| Criterio | Acreditación requerida |
| --- | --- |
| SC-001 | Tres recorridos consecutivos registro/confirmación/login por plataforma con identidades autorizadas, un perfil por actor; reintento no duplica/sobrescribe. |
| SC-002 | Todos los casos acceso/historial/logout/cambio/respuestas tardías, cero datos de otra cuenta ni entrada no autorizada en las dos plataformas. |
| SC-003 | Matriz cuatro estados × arranque/foco Android y recarga/reapertura/foco Web, resultado propio correcto y no duplicados. |
| SC-004 | Cero/una/varias e inactiva, admin-A/barber-B, cambio/revocación y preferencia en ambas plataformas. |
| SC-005 | Enlaces reales válidos/inválidos/vencidos/repetidos/cancelados Web/Android; nueva clave funciona solo después de cambio correcto. |
| SC-006 | Matriz FR completa más accesibilidad funcional en ambas; un pendiente documentado no satisface cierre. |

## Datos y seguridad de ejecución posterior

Diseñar fixtures mínimas autorizadas, cuentas de registro por recorrido y cuenta multi-tenant
controlada sin usuarios personales; cantidad exacta/entorno/limpieza se aprueban antes de
crearlas. No reutilizar contraseñas ni copiar datos viejos. Verificar destino nuevo por ref
antes de escrituras. Preferir backend local ya autorizado para fixtures cuando sea accesible;
Cloud para Android solo con permiso de datos/configuración correspondiente.

CORS/preflight y respuestas Edge con Origin Web se prueban realmente; no browser security
disabled ni extensión para eludir CORS. Read-only 002 no prueba recepción de correo de 003.
Comprobar URLs autorizadas, URL sin tokens tras retorno, scope local y ninguna clave
privilegiada en bundle/logs. No usar service_role para simular el cliente ordinario.

## Alcance académico y límites

Rúbrica 1–7 y 14–16 reciben trazabilidad/evidencia de esta fase cuando se implemente;
no quedan automáticamente validados por plan. Escalabilidad/caché/DNS-CDN/CI-CD/k6
permanecen trabajo del producto con justificación por etapa; sesiones no se presentan
como caché de permisos ni carga funcional como prueba de rendimiento. Nueve avisos npm
moderados pendientes se mantienen separados de la aceptación funcional y del análisis de
paquetes nuevos. No hay certificación de seguridad por reutilizar RLS de 002.
