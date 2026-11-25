# T004 — Decisiones operativas aprobadas y permisos de ejecución

Estado vigente14/11: T009 completada,9/36. [Configuración y reversión CORS local](t009/kong-cierre.md).
API pública22/22, allowlist exacta en handlers/gateway Functions; sin cambios Cloud.
Los pendientes inferiores son registros históricos superados en este alcance.

**Preparación T009 actual**: [pendientes y camino mínimo](t009-preparacion.md).
Actualización autorizada: [transporte DEV, SMTP y exclusiones EAS](t009/resultado.md).
El registro histórico inferior no sustituye estos resultados; build propio sigue pendiente.

Avance posterior: [único build development FINISHED](t009/eas-build.md), firma administrada
por EAS y APK disponible. Pendientes reales: instalación y comprobación del scheme/API
en el teléfono; no se cierra T009 ni se modifica Cloud.
Cuenta/proyecto EAS, cambios locales Supabase/redirects/CORS y conectividad Chrome móvil
reportados manualmente por el usuario; Codex contrastó archivos, sin modificar configuración.
No correo efectivo ni build acreditados. T009 continúa pendiente (8/36).

13/11/2026. T004 completada como preparación y aprobación de decisiones, tras T002/T003.
No hubo configuración remota ni fixtures. Las respuestas explícitas del responsable
se registran abajo; no constituyen autorización genérica para ejecutar operaciones.

## Decisiones explícitas del responsable

- Desarrollo/pruebas repetibles primero en Supabase local app-barberia-002-local y Mailpit;
  después validación real en Cloud nuevo vuoncrtkkkquvddunrxx tanto Web como Android.
- Web desarrollo aprobado: http://localhost:8081; retornos exactos
  http://localhost:8081/auth/callback y http://localhost:8081/auth/reset-password.
- Android aprobados: appbarberia://auth/callback y appbarberia://auth/reset-password.
- Android: EAS development build, revisar cuenta/requisitos/costos antes de ejecutar.
- Correo local: bandeja Supabase/Mailpit para registro, confirmación y recuperación;
  Cloud solo correos de prueba controlados, con autorización previa a ejecución.
- Se acepta riesgo XSS residual de persistencia Web accesible a JavaScript, condicionado
  a mitigaciones previstas, mínima información persistida y verificación de controles.
- Plan de datos por entorno aprobado, sin autorización de creación: hasta siete cuentas
  Auth y siete perfiles ficticios (seis registros, tres por plataforma; una cuenta contextual),
  dos barberías y dos membresías controladas. Reutilizar cuentas para recuperación y variar
  estados/roles controladamente para cero/una/varias/inactiva y admin-A/barber-B.

Limpieza planificada: conservar solo las fixtures necesarias entre recorridos dependientes,
cerrar sus sesiones y retirar selectivamente membresías, barberías, perfiles y cuentas
de esa ejecución al concluir; identificar por IDs generados y registro local privado,
nunca borrar por correo/patrón amplio ni tocar cuentas reales. Comprobar residuos cero.
Antes de cada ejecución aprobar destino, cantidad efectiva y limpieza; este límite no
autoriza mutaciones ni creación remota. No hubo tales operaciones aquí.

## Estado inicial de la revisión (histórico, anterior a las respuestas)

| Tema | Comprobado / propuesta | Decisión o permiso faltante |
| --- | --- | --- |
| Proyecto permitido | Cloud nuevo vuoncrtkkkquvddunrxx según cierre 002; antiguo klebvayvsvibwjpkzrff prohibido | Elegir Cloud nuevo o local para recorridos; no se consultó Cloud hoy |
| Origen Web | localhost:8081 es candidato de desarrollo del contrato, no URL final ni puerto comprobado | Aprobar origen/puerto, luego comprobar disponibilidad; URL pública/hosting aún no definidos |
| Redirects Web | Propuestos http://localhost:8081/auth/callback y /auth/reset-password | Aprobar valores exactos y posterior permiso de modificación de allowlist Auth |
| Redirects Android | Scheme appbarberia existente; propuestos appbarberia://auth/callback y appbarberia://auth/reset-password | Aprobar destinos, elegir build y verificar parser host/path en implementación |
| Correo | Entrega real no acreditada por pruebas administrativas 002 | Definir SMTP/mecanismo y buzón de prueba autorizado; no pegar secretos en chat |
| CORS | Composición Edge lee BARBERIA_ALLOWED_ORIGINS y rechaza Origin ajeno | Confirmar origen efectivo y autorizar cambio preciso si hace falta, no wildcard; no despliegue ni modificación hoy |
| Build Android | Sin toolchain local moderna ni EAS CLI acreditadas | Elegir vía, herramientas/expo-dev-client y eventual cuenta/costos; nada instalado |
| Datos ficticios | Ninguno creado hoy | Aprobar cantidad/entorno/recorridos/limpieza concreta antes de cada ejecución remota |
| Nuevos paquetes | Metadatos/compatibilidad documental en dependencias.md | T005 y análisis lock posterior requieren autorización de ejecución, fuera del bloque |

## Sesión Web, XSS y diferencias Android

La SPA persiste sesión en almacenamiento del origen accesible a JavaScript. No es
equivalente a HttpOnly ni se promete protección contra XSS. Propuesta: HTTPS fuera de
loopback, origen dedicado, renderizado escapado sin HTML arbitrario, scripts externos
mínimos, callbacks saneados, CSP efectiva al publicar y limpieza de claves propias.
El responsable aceptó el riesgo residual sujeto a controles; verificarlos antes de entrega
pública, sin afirmar que ya se ejecutaron. Pedir HttpOnly implicaría revisar
arquitectura servidor; no introducir BFF/Node silenciosamente.

Android usa SecureStore para sesión/verifier, sin fallback plano; requiere pruebas reales
de persistencia/tamaño/fallos. Web requiere recarga/historial/pestañas; Android reinicio,
segundo plano/Atrás/enlaces fríos y calientes. Ambas requieren autorizar credenciales con
Auth/servidor, nunca metadata o preferencia de tenant. PKCE necesita verifier conservado
en origen/instalación; otro navegador sin él falla seguro, sin implicit.

El cierre local no revoca obligatoriamente otros dispositivos y un JWT puede seguir
vigente. Ningún mecanismo protege por sí solo contra autorización multitenant incorrecta;
RLS/ACL de 002 permanecen definitivos y no se modificaron.

## Ejecución posterior: permisos y requisitos aún necesarios

T004 cierra decisiones, no acredita configuraciones implementadas. Antes de T005:
autorizar instalación y revisar árbol de dependencias. Antes de T009: verificar cuenta,
cuota y proyecto EAS, aprobar configuración y build concretos; revisar puertos/orígenes,
redirects/Auth y BARBERIA_ALLOWED_ORIGINS y autorizar solo sus cambios necesarios.
No hay URL pública/hosting de producción aprobados; localhost es desarrollo únicamente.
Usar Mailpit existente según configuración 002, sin iniciarlo ni modificar contenedores hoy.

Para Android contra Supabase local debe resolverse transporte explícitamente en T009:
el adaptador 002 solo permite HTTP loopback, no LAN arbitraria. Opción a evaluar: adb
reverse del puerto API 54421 con app apuntando a loopback, preparando platform-tools solo
si se autoriza; alternativa HTTPS local exige revisión y permiso propios. No es una ruta
de red acreditada ni permiso para instalar, tunelizar o exponer credenciales. La prueba
Android local no se reemplaza silenciosamente por Web local más Android solo Cloud.

Antes de pruebas Cloud: autorización específica de correos controlados, fixtures y limpieza,
sin usar proyecto anterior; ambos clientes deben validar la misma funcionalidad. Los nueve
avisos npm permanecen abiertos. Cuenta/cuota/build/CORS/correo funcional se acreditarán
cuando se ejecuten sus tareas, no mediante estas decisiones documentales.
