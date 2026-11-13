# T004 — Decisiones operativas pendientes

13/11/2026. Preparación documental parcial, T004 no ejecutada/completada: requiere T002
y T003; T003 sigue abierta. No hubo configuración remota ni fixtures. Preguntas enviadas
al usuario, sin asumir respuesta por silencio ni aprobación genérica de implementación.

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
Revisar/aceptar riesgo residual antes de entrega pública. Pedir HttpOnly implicaría revisar
arquitectura servidor; no introducir BFF/Node silenciosamente.

Android usa SecureStore para sesión/verifier, sin fallback plano; requiere pruebas reales
de persistencia/tamaño/fallos. Web requiere recarga/historial/pestañas; Android reinicio,
segundo plano/Atrás/enlaces fríos y calientes. Ambas requieren autorizar credenciales con
Auth/servidor, nunca metadata o preferencia de tenant. PKCE necesita verifier conservado
en origen/instalación; otro navegador sin él falla seguro, sin implicit.

El cierre local no revoca obligatoriamente otros dispositivos y un JWT puede seguir
vigente. Ningún mecanismo protege por sí solo contra autorización multitenant incorrecta;
RLS/ACL de 002 permanecen definitivos y no se modificaron.
