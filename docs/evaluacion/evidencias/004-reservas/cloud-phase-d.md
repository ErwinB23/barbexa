# Fase D — Web de desarrollo conectada a Cloud

21/11/2026, 23:25 America/Lima. Proyecto `vuoncrtkkkquvddunrxx`, `sa-east-1`.
Cambio exclusivamente del entorno de ejecución Web; sin despliegues ni escrituras
de datos de negocio. No equivale a aceptación integral de B1–B5 en Cloud.

## Perfil y archivos

- Perfil anterior comprobado: local-team-authority, API127.0.0.1:54421,
  Metro24148 y supervisor13756, preparados en .artifacts/b523-functional/metro.mjs.
- Perfil reutilizado: cloud-integration, URL efectiva
  `https://vuoncrtkkkquvddunrxx.supabase.co`. Credencial pública existente tomada
  de .artifacts/007-cloud-auth/public-config.json; sin generar ni mostrar claves.
- Reutilizada la función cloudIntegrationEnvironment del operador existente.
  El entorno elimina EXPO_PUBLIC_* heredadas, usa EXPO_NO_DOTENV=1 y agrega solo
  las variables Cloud existentes. CI=false mantiene la recarga de desarrollo.
- Se conserva el marcador de contrato de cliente20261115230134; no es el conteo
  ni la última migración del servidor. Cloud tiene18 migraciones.
- Nuevos operadores ignorados: .artifacts/cloud-phase-d/metro.mjs y browser.mjs.
  Metadatos y diagnósticos de esta ejecución en el mismo directorio ignorado.
- No se editó .env.local, app.config.js, app.json, package.json, config.toml ni
  ninguno de los dos perfiles anteriores. Comparación SHA-256 antes/después.
  Tampoco se modificaron implementaciones, interfaces, estilos o Android.
- Git tenía cambios previos; se conservaron. Sin staging, commit o push.

## Metro

Se verificaron PID, parentesco y comandos antes de detener solo el supervisor y
Metro de8081. Metro salió con su supervisor antes del segundo Stop-Process; no se
había iniciado la instancia nueva. Comprobados ambos PID ausentes, se inició una
única instancia nueva con el perfil Cloud, Development/dev-client/LAN/8081 y
limpieza de caché Metro para cargar las variables correctas.

Estado final: supervisor27228, Metro33768, /status HTTP200,
packager-status:running, sin errores registrados. Metro se deja funcionando.
No se reiniciaron Supabase, Docker ni otros servicios. Los PID son evidencia de
esta ejecución, no autorizan detener procesos futuros sin revalidarlos.

El cambio de perfil es de proceso, no una sustitución del archivo .env.local.
Un inicio genérico posterior no implica seleccionar Cloud: reutilizar el perfil
explícito y comprobar PID/puerto antes de reiniciar. No lanzar otra instancia
sobre8081 ni ejecutar operadores históricos con intentos ya registrados.

## Auth y URLs

Lectura de configuración Cloud y /auth/v1/settings HTTP200:

- Google habilitado; client_id configurado, sin mostrar su contenido.
- Registro permitido; confirmación de correo requerida.
- Retornos exactos permitidos:
  - http://localhost:8081/auth/callback
  - http://localhost:8081/auth/reset-password
- Site URL actual: http://localhost:3000. Se conserva. Los casos de uso actuales
  envían retornos explícitos a8081 para Google/confirmación y recuperación.
  Ninguna URL necesaria para esos recorridos falta en la lista permitida.
- PKCE, namespaces de sesión, login, registro y recuperación existentes sin cambios.
- No se inició Google, no se enviaron correos, no se registraron usuarios ni se
  introdujeron contraseñas. No declarar una nueva autenticación real aprobada.

BARBERIA_ENABLE_TEAM_AUTHORITY y las invitaciones administrativas no se activaron.
La sesión Cloud tiene namespace independiente del perfil LOCAL; no se copiaron
credenciales de usuarios, roles o datos de prueba entre entornos.

## Navegador y solicitudes

Chrome existente, contexto nuevo sin sesión, caché desactivada. La puerta de red
permitió solo GET/OPTIONS a localhost8081 y al proyecto Cloud; habría bloqueado
escrituras, otros destinos y API LOCAL. No se instalaron herramientas.

Pantallas observadas: /sign-in, /sign-up, /forgot-password e Inicio público.
F5 de login correcto, sin errores de runtime. Google visible sin el mensaje de
configuración pendiente. /account sin sesión regresó a Inicio público y no mostró
contenido privado. No se cambió esa guarda ni su navegación.

Se inspeccionó expo/virtual/env consumido por el módulo real del runtime en Expo58:
environment=cloud-integration, backend Cloud exacto, credencial pública coincidente
por comparación booleana y ausencia de EXPO_PUBLIC_TEAM_LOCAL_URL configurada.
No se serializó ninguna clave ni sesión.

Solicitudes observadas al Cloud: OPTIONS y GET /auth/v1/settings, HTTP200 en GET.
Fue una sonda diagnóstica explícita del navegador, no una consulta autenticada de
servicios ni una solicitud producida por un login. Cero intentos al puerto54421,
cero escrituras bloqueadas y cero errores de navegador durante el recorrido.
No generalizar esta observación a recorridos autenticados que no se ejecutaron.

El primer verificador esperaba redirección a /sign-in y literales inlined dentro
de la factory. Se diagnosticó el retorno público existente y el módulo virtual de
entorno de Expo58; se corrigió solo el verificador y el segundo recorrido aprobó.
El primer resultado detenido se conserva como antecedente, sin cambios de producto.

## Pruebas, datos y pendientes

- TypeScript general y del núcleo: aprobados; arquitectura cliente: aprobada.
- 87 regresiones existentes de entorno, composición Cloud, sesiones, login,
  registro, recuperación, Google y presentación de vacíos: aprobadas,0fallos.
  Son pruebas con dobles y de presentación; no operaciones reales de Auth Cloud.
- El transporte integrado fija el origen Cloud y rechaza destinos LOCAL y otros
  proyectos; las regresiones existentes cubren esa separación.
- Lectura Cloud final:18migraciones,2usuarios,2perfiles;0barberías/membresías,
  servicios, profesionales y reservas. No se copió ni alteró ningún dato LOCAL.
- Los vacíos de Inicio y la distinción carga/error/vacío aprobaron las pruebas de
  presentación existentes. No se acreditó el catálogo autenticado contra Cloud:
  hace falta que el usuario ingrese con una cuenta Cloud ya existente.
- Ninguna configuración Auth/OAuth/Google, contraseña, secreto, variable de servidor,
  SQL, RPC, RLS, migración o Edge Function fue modificada en esta fase.

Próximo paso manual mínimo: abrir http://localhost:8081/sign-in, usar la cuenta
Cloud existente y revisar Inicio/Explorar. Como Cloud no tiene oferta, corresponde
el estado vacío. Las cuentas ficticias U3/U6 de LOCAL no se trasladaron a Cloud.
No crear cuentas/barberías/reservas ni repetir confirmación/recuperación para esta
comprobación de conexión. Cualquier nuevo recorrido de escritura requiere alcance
separado. Detenerse después del informe de Fase D.

Evidencia sanitizada: cloud-phase-d.json.
