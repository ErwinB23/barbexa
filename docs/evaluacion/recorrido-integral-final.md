# Recorrido integral final — preparación, no ejecución

**Actualización24/11/2026:** el usuario confirma completado y aceptado el recorrido
funcional manual Web de todas las funcionalidades implementadas, con cliente,
barbero, administrador secundario y propietario que también atiende. Interfaces Web
aceptadas. No solicitar repetirlo por rutina. Esta confirmación no acredita Android,
pruebas automatizadas, transferencias reales ni cada gate negativo específico.
El plan del15nov que sigue es histórico; cotejar únicamente gates aún sin evidencia
con el estado vigente en docs/CODEX-HANDOFF.md antes de continuar.

15/11/2026. Un solo bloque, Web primero e inmediatamente Android con el APK existente.
No se solicita ejecutarlo ahora ni repetir registros/reservas ya acreditados. No introducir
contraseñas, enlaces, códigos, JWT o datos personales en capturas/evidencias.

## Prerrequisitos que requieren autorización específica

1. Actualización16/11: URLs Auth LOCAL corregidas y recuperación HTTP/Mailpit acreditada
   con19 comprobaciones; no repetir ni recrear GoTrue. La etapa actual valida Web en
   Cloud nuevo vuoncrtkkkquvddunrxx: revalidar SMTP, Site URL y redirect exacto de recovery
   antes de autorizar ajustes o enviar correos. Mailpit LOCAL no acredita entrega Cloud.
2. Autorizar por separado las sesiones/cuentas/correos/cambios de contraseña Cloud del
   recorrido. Identificar primero una cuenta Cloud con contraseña; no usar credenciales
   LOCAL en Cloud ni modificar la cuenta Google para fabricar ese caso. Móvil Web requiere
   origen accesible aprobado, cambios cliente/redirects/CORS y eventualmente hosting HTTPS.
3. No Cloud/hosting/carga/limpieza implícitos. Evaluación remota y origen final requieren
   otro bloque autorizado. Las tres repeticiones SC-001 de003 aún no se acreditaron: las
   pruebas previas no deben contarse varias veces; resolver el gate con el responsable.

## Bloque único pendiente

**Primer tramo Web16/11: 5/5 aprobadas por el usuario en laptop.** Login visible,
mostrar/ocultar contraseña, validación de campos vacíos y navegación de ida y vuelta
a Crear cuenta y Recuperar contraseña. Evidencia manual del usuario; no acredita
una sesión nueva, registro ni entrega de correo. Tras los
permisos: acceso Cloud por contraseña/logout/protección → registro-confirmación/perfil
solo si falta evidencia Cloud → recovery/nueva clave/rechazos → completar casos de sesión
y aceptación en navegador móvil real. Reutilizar Google ya acreditado; pendiente cotejo
de identidad/perfil y cuenta existente, sin repetir por rutina ni inventar evidencias.

**Lectura Cloud16/11:** email habilitado, registro abierto, confirmación obligatoria,
Site URL `http://localhost:3000`; callbacks exactos Web localhost8081 y Android ya
autorizados, sin `/auth/reset-password`. El diff no muestra SMTP personalizado;
intervalo de correo1min. SQL read-only:1 usuario,0 con contraseña. El siguiente
recorrido requiere una cuenta Cloud de prueba autorizada; combinar registro,
confirmación, login/logout y recuperación en la misma cuenta, sin repetir Google.

| Flujo | Web | Android | Evidencia esperada |
| --- | --- | --- | --- |
| Oferta e invitación004T013 | Servicios publicados existentes; destinatario revisa invitación A y acepta solo dentro del recorrido autorizado | Verifica la misma relación/rol y navegación contextual | Estado aceptado y membresía correcta, sin privilegios previos/cruzados. No emitir otra invitación. |
| Cancelación004T027 | Revisar cita sintética final9a679512 y estado actual antes de actuar | Revisar finalb8980a05; motivo obligatorio de staff | Si siguen confirmadas, aclarar el resultado anterior antes de otra mutación. Estado cancelado, un evento y capacidad liberada. No tocar citas T019 ni cancelar otra cita. |
| Recuperación003T031/T032 | Solicitar enlace, cerrar vista original conservando storage, abrirlo, F5 restringido, nueva clave y login | Enlace desde teléfono con app activa/cerrada, recuperación restringida y nuevo login | Propósito PKCE, cero acceso a negocio durante recovery, salida local al terminar. Solo cambios autorizados. |
| Enlaces negativos | Inválido/reutilizado/sin verifier/cancelado, vencido según mecanismo aprobado | Equivalentes | Error seguro; no crear eventos/usuarios de prueba por improvisación. |
| Matriz sesión003T023 | Renovable/inválida en arranque/foco y restauración | Arranque/segundo plano equivalentes | No confundir red con revocación; sin datos privados indebidos ni cuentas duplicadas. |
| Accesibilidad/acabado final | Teclado, foco, lector, responsive, carga/error y recuperación | TalkBack, Atrás, texto máximo, teclado y zonas seguras | Flujos nuevos completables, sin recortes; no inventar 200% instrumental. |

**Ya acreditado, no repetir:** registro/confirmación normales, login/logout básicos,
reservas reales, demo de agenda, F5/entrada directa con query y retorno de pestaña/app.
Revalidar solo si un cambio posterior los afecta o una discrepancia real lo requiere.
Conservar las cuentas, citas T019 y siete sintéticas hasta una autorización de retirada.

Registrar fecha/plataforma/resultado y fuente manual del usuario. Un test con dobles o
un check verde no reemplaza estos gates. Mantener casillas abiertas hasta evidencia completa.
