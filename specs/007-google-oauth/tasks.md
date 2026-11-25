# Tasks — 007

**Consolidación vigente — 18/11/2026: 5/6.** Inicio y flujo principal de autenticación
Web aprobados por el usuario. Se reutiliza Google Web/Android ya acreditado sin nuevas
sesiones. T006 conserva pendiente SC002: cotejo atribuible de cuenta existente/perfil
reutilizado sin duplicación y consolidación del logout integrado Android. La lectura
agregada de perfiles no acredita por sí sola ese recorrido. El aviso linking sigue
pendiente sin causa demostrada; no investigarlo de nuevo sin evidencia nueva.
Ver [cierre Web y criterios](../../docs/evaluacion/evidencias/003-autenticacion/informe.md#cierre-de-inicio-y-autenticación-web--18112026)
y quickstart.md. La aceptación principal Web permite avanzar a006.

## Fundamentos
- [x] T001 Contrastar RF02/HU02 y SDK/documentación en spec.md, plan.md y contracts/oauth.md.
## US1 — Acceso Google
- [x] T002 [US1] Preparar RED en tests/unit/authentication/google-oauth.test.ts y tests/integration/authentication/google-oauth.test.mjs.
- [x] T003 [US1] Implementar adaptador, puerto, coordinador y composición de apertura segura en src/features/authentication/ y src/composition/.
- [x] T004 [US1] Integrar Google/espera/cancelación en login y registro; probar presentación Web/Android en tests/presentation/google-oauth.test.mjs.
## Aceptación
- [x] T005 Validar pruebas afectadas, tipos/lint/formato/arquitectura y diff; registrar aquí.
- [ ] T006 Completar acreditación integrada de ausencia de duplicados/perfil y Android de quickstart.md. Proveedor e integración Cloud ya activos; recorrido funcional manual Web aceptado el24/11. No repetir configuración ni Google aislado.

Incidencia posterior16/11:usuario acredita Google normal Android/perfil/persistencia,pero
logout mostró aviso linking duplicado. Reload recuperó pantalla pública y no se reprodujo.
Análisis no invasivo/3 verificaciones de guarda instaladas;causa física no demostrada.
No parche funcional especulativo ni repetición de sesiones. T006 sigue abierta5/6;véase
quickstart para límites de evidencia y pendiente de logout/perfil sin duplicación.

Actualización16/11:usuario acredita arranque físico Android normal tras reconectar el
DevelopmentClient a8081 y reactivar autolanzamiento;no es aún evidencia de Google normal.
Consulta Cloud read-only:1 identidad Google/1 usuario/1 perfil propio,sin duplicados y0
membresías. Preparada huella del perfil para cotejo posterior a Android. No nuevas sesiones
ni escrituras realizadas por Codex. T006 continúa pendiente de login normal/reutilización/
persistencia/logout Android y consolidar la evidencia integrada de ambas plataformas.

Dependencias: T001→T002→T003→T004→T005→T006. Sin cambios de esquema o datos en T001–T005.
El bloqueo de T006 no detiene código del perfil profesional propio.

Resultados15/11: RED6 unitarias y5 integración por método inexistente (código1).
GREEN7 unitarias,9 integración y4 presentación nuevas (código0). Incluye generación
S256 del SDK real instalado sin HTTP, doble composición Web/Android y lifecycle navegador,
callback único/verificado, perfil faltante explícito, cancelación, payload/URL cerrados,
proveedor deshabilitado y permanencia de correo/contraseña. No se realizó OAuth con Google.
La capacidad pública EXPO_PUBLIC_ENABLE_GOOGLE permanece false/ausente en el entorno real;
solo .env.example documenta su activación futura. No se configura proveedor ni secretos.
No nuevas instalaciones ni APK. Aceptación T006 sigue pendiente.

Verificación conjunta007/008:53 unitarias,78 integración/presentación y10 servidor
dirigidas (todas código0); sin nuevas llamadas reales de negocio. Tipos cliente/core y
servidor, Deno check Edge afectado, ESLint, Prettier y arquitectura cliente/servidor0.
Se corrigieron imports React duplicados y el doble tipado004 incorporó los nuevos puertos;
no se cambió ninguna expectativa válida. Diff global2 por log activo conservado;0
excluyendo solo ese archivo. Sin staging, commit o push.

Preparación posterior15/11: proveedor/redirects configurados por el usuario; lectura CLI
confirma proyecto nuevo/región, clave publishable y Auth settings200/google=true. Perfil
Development /auth/google-test implementado, sin modificar .env: SDK/almacenamiento y
consumidor PKCE propios, gate que suspende negocio LOCAL, transporte Auth-only al destino
exacto, producción cerrada y fence frente a callbacks tardíos. No OAuth/identidades reales
todavía. T006 permanece pendiente; pasos y autorización concreta en quickstart.md.
Verificación de este bloque:70 pruebas dirigidas de composición, OAuth/PKCE, almacenamiento,
lifecycle, retornos, gate y presentación aprobadas (dobles/SDK local, no Google real).
TypeScript/core, ESLint, Prettier y arquitectura cliente0. Diff0 excluyendo únicamente
el log activo; global1 por espacios históricos de ese log, conservado. Metro8081 rechazó
conexión también fuera del sandbox; no se inició. Sin cambios Cloud/configuración/datos.

Corrección posterior del formulario Android: gate conservaba solo el formulario y
desmontaba el navegador; Expo Router58 reinicializa navegadores retirados y el cambio
de ruta descartaba setup. Se conserva la rama LOCAL montada/oculta solo durante setup,
sin SDK Cloud aún; tras activar Cloud se retira LOCAL y se mantiene Auth-only/fence.
Regresiones nuevas Web/Android RED2→GREEN2. Bundle Android Metro200, sin APK/reinicio.
Web OAuth/PKCE/F5/logout acreditado manualmente por el usuario; Android antes de OAuth
pendiente de volver a comprobar. T006 permanece abierta.
Verificación posterior:72 pruebas dirigidas aprobadas; TypeScript/core, lint, formato
y arquitectura cliente0. Diff0 excluyendo solo el log activo. Ningún servicio reiniciado,
ninguna operación Cloud o de datos realizada por Codex durante esta corrección.

Aceptación manual posterior15/11 — reportada por el usuario, no ejecutada por Codex:
Web: login Google correcto; PKCE/identidad/sesión true; persistencia después de3 F5;
cierre remoto confirmado true. Android APK existente: formulario permanece abierto tras
corrección; login Google correcto; PKCE/identidad/sesión true; persistencia al pasar a
otra app y volver; cierre remoto confirmado true. No repetir estos recorridos.
La validación real del perfil Cloud Auth aislado queda acreditada en ambas plataformas.
T006 permanece [ ] y0075/6: exige además perfil propio y cuenta existente sin duplicación
(SC002), no comprobados por el diagnóstico Auth-only. Perfil/membresías/negocio LOCAL
no se probaron con identidad Google; no se enviaron credenciales Cloud a LOCAL desde
ese perfil. No ampliar ni reducir el alcance original para forzar el cierre.

Preparación de integración normal posterior: cloud-integration Development opt-in,
URL/clave Cloud separadas y revisión de liberación obligatoria antes de construir SDK;
un transporte fijado para Auth/perfiles/contexto/negocio, sin redirect ni fallback LOCAL.
Google normal limpia la marca retirada del diagnóstico antes de abrir el navegador.
RED7→GREEN7 nuevas: configuración incompleta/rechazo anticipado, transporte y escenarios
de perfil nuevo/cuenta existente con membresía contextual en ambas plataformas. Más2
regresiones runtime de selección de entorno/fence. Total dirigido68 aprobado con dobles/
SDK; no usuarios, SQL o HTTP Cloud reales. No prueba el linking de identidades del servidor.
Inventario exacto y autorizaciones propuestos en quickstart, sin despliegue/activación.
T006 permanece abierta,0075/6;003/004/005 sin nuevos cierres.

Primer bloque Cloud completado con autorización específica:20261114195018 y20261114202045
aplicadas una vez;detención histórica del verificador por nombre abreviado de tipo resuelta
tras autorización de corrección por OID/esquema (6 tests). Segunda validación completa513;
20261114220827 aplicada1vez y validación final515 read-only aprobada.8 tablas nuevas vacías
RLS/8 políticas/2 triggers/24 funciones,btree_gist;historial8. AuthGoogle/objetos002/Edge/
config/digests intactos. No negocio transaccional Cloud,datos,Edge,CORS o cliente activados.
T006 sigue pendiente;no repetir Google aislado ni aplicar otros bloques sin permiso.

Preparación integrada16/11:SQL/Edge/CORS previamente acreditados;usuario autorizó perfil
cloud-integration,hasta2 sesiones Google existentes y1 perfil propio si falta. Baseline
read-only1 usuario/identidad Google y0 perfiles/membresías/datos de negocio. Un Metro
Development/LAN8081 iniciado con permiso específico,sin modificar .env.local. HTTP200
Web/Android y bundles con clave Cloud/sin clave LOCAL. Gate Auth-only ya no intercepta
el perfil integrado (RED2→GREEN2).51 pruebas dirigidas,TypeScript/core,lint,formato y
arquitectura aprobados;no login real ejecutado por Codex. T006 continúa [ ] hasta el
recorrido normal Web/Android y cotejo de perfil/reutilización autorizado en quickstart.
