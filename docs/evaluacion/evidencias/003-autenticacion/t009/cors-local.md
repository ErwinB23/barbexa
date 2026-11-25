# T009 — Corrección local de Origin y diferencia del gateway

14/11/2026, America/Lima. Solo entorno app-barberia-002-local. T009 permanece pendiente,
8/36, por el comportamiento adicional del gateway descrito abajo. No T010+.

## Causa acreditada

El handler existente consulta BARBERIA_ALLOWED_ORIGINS y rechaza un Origin no listado
antes de procesar OPTIONS o Auth. La configuración efectiva de Docker no incluía esa
variable global ni en env por función de SUPABASE_INTERNAL_FUNCTIONS_CONFIG. Ambas
funciones tenían verifyJWT=true. Por eso localhost:8081 se rechazaba403; no era una regla
de usuario/tenant. No se cambió código, autenticación, RLS ni autorización.

Se consultó CLI3.1.0 functions serve --help: --env-file alimenta explícitamente las
variables locales. La primera consulta en sandbox falló por EPERM al escribir telemetría;
se repitió fuera del sandbox, salida0. No se instaló ni actualizó herramienta alguna.
La primera inspección del main-service minificado generó salida excesiva, con literales
enmascarados; se reemplazó por extracción estructural de solo campos públicos del env.
No se guardó el código del runtime ni valores secretos en evidencias.

## Cambio mínimo aplicado

- Creado supabase/functions/.env, ignorado por Git, con una sola entrada pública:
  BARBERIA_ALLOWED_ORIGINS=http://localhost:8081.
- Creada supabase/functions/.env.example como plantilla reproducible sin secretos.
- Ejecutado exclusivamente `supabase functions serve --env-file supabase/functions/.env`
  desde este proyecto, identidad/puertos comprobados antes. Sin --no-verify-jwt.

Recarga solo del runtime Edge nuevo. No se encontraron procesos functions serve/escritores
del log en la consulta previa; no se terminó ningún proceso. El archivo t017-serve.log
mantiene su hash SHA256, los PIDs Metro57392/46488 siguen iguales y todos los contenedores
ajenos a Edge mantienen sus IDs/nombres (incluidos12 antiguos). No se tocaron datos,
migraciones, otros servicios ni entorno temporal. La nueva salida serve no escribe en
el log anterior. El servicio queda operativo para desarrollo local.

## Resultados reales y capas

[Pruebas de ambos handlers](cors-verificacion.json):10/10, salida0.

| Solicitud por función | Resultado |
| --- | --- |
| OPTIONS, localhost:8081 | 204; Allow-Origin exacto localhost:8081 |
| OPTIONS, origen no autorizado | 403 FORBIDDEN, sin Allow-Origin |
| POST, origen permitido, clave pública anon sin identidad de usuario | 401 UNAUTHENTICATED; Allow-Origin exacto |
| POST, origen no autorizado, clave pública anon | 403 FORBIDDEN, sin Allow-Origin |
| POST sin cabecera Auth | 401 UNAUTHORIZED_NO_AUTH_HEADER del runtime, anterior al handler |

Clave pública anon extraída solo en memoria; cabecera enviada por stdin a curl, sin
argumentos con tokens ni persistencia. No clave administrativa, usuarios ni datos de negocio.
Anon permite verificar el JWT del runtime, pero **no** identifica un usuario ante Auth.

La ejecución inicial4/10 tenía expectativas equivocadas: los POST sin cabecera Auth no
alcanzan el handler y no tienen por qué devolver su CORS/error propio. Se conserva
[resultado inicial](cors-expectativas-iniciales.json), no se oculta. Se ajustó el operador
para distinguir esas capas y alcanzar el handler con anon público; no se modificó servidor.

## Bloqueo adicional y detención

La API pública54421 conserva los estados/códigos del handler (401 permitido sin usuario,
403 origen rechazado), pero **Kong sobrescribe Allow-Origin con \*** en ambas respuestas.
[Verificación externa](cors-api-publica.json):0/4 bajo el criterio de cabecera exacta;
los estados de negocio son correctos y no se convierten en acceso permitido. El OPTIONS
genérico200 con wildcard ya estaba acreditado antes de esta intervención.

No se añadió ningún wildcard. No se cambió Kong para ocultar la diferencia ni se declaró
superada la comprobación externa. La instrucción vigente exige no permitir cualquier
origen mediante \*: antes de cerrar T009 hace falta revisar y autorizar un ajuste CORS
limitado a la ruta local /functions/v1 del gateway, manteniendo Auth/REST, JWT y las
denegaciones del handler, con recarga aislada si resulta necesaria. Debe verificarse el
mecanismo soportado y su persistencia antes de aplicarlo; no se presume que editar solo
el env de la función cambie cabeceras del gateway.

No Cloud, usuarios, nueva build, dependencias, commits ni push. No código funcional nuevo:
se reutilizan los controles anteriores de tipos/lint/arquitectura30/30; en esta ejecución
se realizan las comprobaciones HTTP específicas y de conservación, sin batería general.
No sondas de aplicación ni instrumentación temporal nueva en src/tests. Avisos npm siguen
pendientes, sin remediación ni auditoría declarada aprobada.

Referencia oficial consultada: [variables locales de Edge Functions](https://supabase.com/docs/guides/functions/secrets).
