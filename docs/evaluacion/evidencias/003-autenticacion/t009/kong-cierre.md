# T009 — Cierre CORS local

14/11/2026, America/Lima. T009 completada,9/36. Solo app-barberia-002-local.

## Causa y cambio autorizado

Kong2.8.1 tenía un plugin cors sin config en el servicio functions-v1, cuya única ruta
es /functions/v1/. El valor predeterminado añade Allow-Origin:*. No impedía por sí solo
Web sin cookies ni significaba que JWT autorizase usuarios; incumplía la restricción
explícita de aceptar solo localhost:8081. El handler ya rechazaba otros orígenes.

scripts/local-functions-cors.mjs configura únicamente ese plugin con
origins:[http://localhost:8081] y preflight_continue:true. OPTIONS alcanza así al handler
que aplica su allowlist y devuelve204/403. No cambia request-transformer, Auth, REST,
otros servicios, JWT o roles. El operador valida proyecto, nombre/red y alcance exacto;
aborta ante políticas inesperadas. Compara todo el YAML estructuralmente exceptuando
solo el plugin autorizado. Comprueba la inversión byte por byte con el archivo real
en memoria antes de escribir, valida mediante kong config parse y ejecuta kong reload.
Los secretos locales del YAML no se alteran, imprimen ni copian al host. Ante fallo de
recarga restaura el original desde memoria; no se simuló ese fallo.

Aplicación y reversión, desde la raíz y solo con autorización operativa:

```powershell
node scripts/local-functions-cors.mjs apply
node scripts/local-functions-cors.mjs revert
```

Aplicación correcta, lectura posterior idéntica y segunda ejecución idempotente sin
otra recarga. La reversión se comprobó en transformación/regresiones, sin una reversión
operativa innecesaria. El cambio permanece en /home/kong/kong.yml del contenedor actual
y tras reiniciarlo. **Al recrearlo, Supabase puede regenerar ese archivo**: comprobar y
reaplicar este operador tras start/actualización, seguido de validación pública. No se
instaló un watcher ni se promete persistencia automática tras recreación. Env del handler
en .env ignorado; plantilla reproducible en supabase/functions/.env.example. Nada configura Cloud.

## Verificación real

[API pública54421](kong-verificacion.json):22/22, salida0, sobre ambas funciones:

- Origin aprobado: OPTIONS204 con ACAO exacto; POST con anon público401 UNAUTHENTICATED,
  con CORS legible. Anon no identifica a un usuario ni permite operaciones de negocio.
- Origin ajeno: OPTIONS/POST403 y sin wildcard ni cabecera que autorice al solicitante.
- Otros puertos,127.0.0.1,HTTPS y sufijo malicioso: OPTIONS403 y acceso CORS bloqueado.
- Sin cabecera Auth o con JWT inválido:401 del runtime. verifyJWT sigue true en ambas.
- Auth /health200 y consulta REST de perfiles limit0 sin credenciales401. Su configuración
  se conserva estructuralmente, incluidos los plugins CORS ajenos al alcance de Functions.

La clave anon pública se usó solo en memoria; no sesiones, usuarios, credenciales
administrativas ni datos de negocio creados. No se persistieron tokens ni cabeceras sensibles.
La primera ejecución20/22 exigía ausencia de cabecera en un POST rechazado. Kong devuelve
el origen permitido fijo: al ser distinto del solicitante, el navegador bloquea la lectura.
Se corrigió solo esa expectativa, manteniendo403 y prohibiendo wildcard; se conserva el
[resultado inicial](kong-expectativas-iniciales.json). No se alteró servidor para ese GREEN.

Regresión del operador2/2: alcance, idempotencia, reversión exacta y rechazo de configuración
inesperada. RED inicial por módulo inexistente; error sintáctico intermedio corregido antes
de escribir en Kong. La inspección inicial usó por error yaml inexistente; se corrigió a
js-yaml ya instalado, sin nueva dependencia. ESLint inicialmente rechazó imports default;
corregidos a load nombrado, lint final0. Prettier0. No cambia TypeScript/src: se reutilizan
tipos/arquitectura y30 pruebas Auth anteriores, sin repetir baterías completas.

Todas las identidades de contenedores permanecen iguales, incluidos12 antiguos; hash
del log t017 idéntico. Solo se recargaron workers Kong. No se detuvo Metro, Edge ni otros
servicios. Sin stack restart, Cloud, RLS, migraciones, APK o instrumentación del producto.

## Aceptación y siguiente bloque

T004–T008 aprobadas; destino nuevo acreditado; redirects/local/correo preparados; correo
ficticio recibido en Mailpit; único build FINISHED e instalación/apertura/API y ambos schemes
acreditados manualmente por el usuario. Estas pruebas completan el último criterio
Origin/preflight real manteniendo JWT. No se declara implementado registro/login/recuperación.
Los riesgos npm/XSS continúan documentados, sin remediación ni auditoría superada.

Propuesta, sin ejecutar: T010+T012 en paralelo; T011 tras T010; T013 tras T011/T012;
T014 con recorridos Web y enseguida Android y datos concretamente autorizados.
Sin commit/push ni autorización implícita para implementar ese bloque.

Fuente primaria consultada: [plugin CORS Kong](https://developer.konghq.com/plugins/cors/),
contrastada con YAML efectivo2.8.1 y validación nativa instalada. ACAO distinto del Origin
solicitante no concede lectura CORS.
