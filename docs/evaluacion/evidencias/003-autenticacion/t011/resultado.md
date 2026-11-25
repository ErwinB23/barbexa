# T011 — Registro y confirmación, preparación técnica

## Cierre documental — 14/11/2026

**T011 [x], progreso 13/36 junto con T013.** El usuario confirmó el registro, recepción
en Mailpit, confirmación y perfil propio en Web y Android Development. Es evidencia
manual del usuario, no una ejecución de Codex. [Cotejo y límites](../t013/cierre-manual.md).
Se reutilizan las pruebas técnicas previas; no se repiten baterías ni registros/correos.
T014 y su validación real ampliada siguen pendientes. Cuentas locales conservadas.

## Registro técnico anterior (histórico)

14/11/2026, America/Lima. main/0ccd33c, sin commit/push. T012 cerrada con prueba manual
del usuario; T011 implementada y técnicamente GREEN, **pendiente de verificación funcional
real** conforme a la instrucción explícita de esta ejecución. Progreso11/36.

## Implementación del alcance autorizado

- auth-actions.ts: validación de registro/perfil con tipos propios; normalización de nombre
  y teléfono compatible con002, sin nuevos límites de longitud ni roles/IDs del formulario.
- session-coordinator.ts: registro, confirmación y bootstrap del perfil; resolving,
  confirmation-required, profile-required, ready, recovery o error propio. Deduplicación
  de envío/canje/reintento, generation para descartar respuestas obsoletas y limpieza de
  listeners. Perfil existente no se sobreescribe; reintento no repite signUp. Contraseñas,
  tokens y códigos no aparecen en snapshots. Un solo código de canje acotado en memoria,
  eliminado al disponer/cambiar flujo; no URL completa ni persistencia de contraseña.
- supabase-auth-adapter.ts: signUp con redirect explícito validado, SDK PKCE ya configurado;
  user sin session no se trata como autenticado. Tras sesión/canje usa getUser y exige
  correo confirmado/usuario no anónimo, sin roles de metadata. Error propio sanitizado,
  estados no enumerativos, sin reintentos automáticos de alta. Tokens ordinarios bloqueados
  durante resolución o tras canje fallido. No se implementan login/logout/reset de US2/US5.
- auth-links.web.ts/native.ts y auth-link-validation.ts: origen/scheme/host/path exactos
  desde configuración, rechazo de fragmentos, códigos vacíos/duplicados y parámetros
  imprevistos. captureAuthLink Web elimina query/hash mediante el adaptador replace
  suministrado antes de publicar estado; no importa window al núcleo. El propósito real
  se contrasta con redirectType del SDK, no se habilita recuperación por URL sola.
- auth-composition.ts: createRegistrationApplication lazy/idempotente conecta el coordinador
  con getOwnProfile/ensureOwnProfile existentes de002, sin copiar persistencia ni exponer
  operaciones administrativas. Traducción de errores002 en composición. T013 montará esta
  fuente en el proveedor; no se añadieron rutas/formularios ni se alteró navegación.

El SDK instalado conserva code-verifier en SessionStorage por proyecto y devuelve
redirectType desde su estado PKCE. No se borra ese storage al disponer una vista/cliente.
Su declaración pública omite redirectType aunque el runtime lo devuelve: se comprueba
la propiedad en runtime con `in`, sin tipos SDK en aplicación ni cast any. Las dos plataformas
comparten el núcleo; adaptadores de enlaces/storage siguen diferenciados.

## RED → GREEN y resultados reales

Se ejecutaron primero las17 pruebas originales T010:11 unitarias y6 integración, salida1
previa por implementación ausente. Después pasaron las17, conservando sus expectativas.
Al fixture SDK se añadió únicamente el redirect aprobado que ahora exige el adaptador;
no se eliminó ninguna aserción original. Se añadieron pruebas de carreras, recovery,
desmontaje, reintento concurrente fallido, saneamiento Web, sesión anterior bloqueada y
cableado002 para Web/Android.

| Verificación ejecutada | Resultado |
| --- | --- |
| Runner node scripts/run-unit-tests.mjs | 0;106/106 unitarias (incluye16 registro) |
| Cobertura de núcleo del runner | líneas100%, funciones100%, ramas97,17% |
| auth-actions | líneas/funciones/ramas100% |
| session-coordinator | líneas/funciones100%, ramas91,04% |
| node --test tests/integration/authentication/*.test.mjs | 0;43/43 (incluye9 registro y14 composición) |
| Pruebas campo+UI compartida | 0;8/8 |
| tsc --noEmit y tsc -p tsconfig.core.json --noEmit | 0 ambas |
| ESLint de archivos afectados --max-warnings 0 | 0 |
| Prettier --check de archivos afectados | 0 |
| Arquitectura del proyecto | 0;53 módulos,17 núcleo,108 aristas |

La integración usa SDK/dobles de transporte en memoria, no usuarios reales. Un caso con
SDK real y transporte interceptado prueba signUp PKCE S256 y verifier conservado después
de dispose; no envía correo. Los harnesses Web y Android recorren composición y lectura
real del adaptador002 con respuestas controladas; no equivalen a navegador/Hermes reales
ejecutando registro. La cobertura corresponde al núcleo, no a la UI ni al proveedor.

Se preservan RED adicionales que detectaron sesión anterior liberada tras error y perfil
de cuenta anterior reintentable tras canje fallido; se corrigieron las causas. El runner
se detuvo inicialmente por .test-build creado manualmente sin su marca de propiedad:
se preservó moviéndolo a .artifacts/t011/manual-test-build, verificando ambos destinos
dentro del workspace. No se relajó el guard. Sus primeros controles de cobertura fallaron;
se añadieron casos significativos de cleanup/recovery/reintentos y finalmente pasó sin
cambiar umbrales. No se repitieron SQL/HTTP/CORS ni las pruebas manuales de T012.

## Cierre de T012

Usuario confirmó Web real correcto, Android Development instalado correcto y TalkBack
correcto, sin observaciones; conforme al recorrido previo se probaron teclado, foco,
contraseña, error, disabled y texto ampliado. Es **evidencia manual declarada por usuario**;
Codex no ejecutó esos recorridos. Navegador/versión no reiterados en esta confirmación.
Se retiró TextFieldDevelopmentPreview y su import/render; AppProvider vuelve a su contenido
previo. Se mantienen AppTextField, mejoras y auth-fields.test.mjs. T012 está [x].

## Único bloque manual pendiente — requiere vistas T013, aún prohibidas aquí

No se puede ejecutar el registro desde la app actual: no existe pantalla sign-up ni
consumidor de callback/perfil, y añadirlos sería anticipar T013. Se deja T011 [ ] por
la condición del usuario sobre verificación manual; su implementación técnica está lista.
No se pide repetir T012 ni se usa una sonda para simular pantallas futuras.

Cuando se autorice la integración de vistas, el recorrido conjunto será:

1. Web localhost:8081: registrar una cuenta ficticia local con nombre y phone vacío;
   doble pulsación no duplica alta; sin sesión, mostrar confirmación pendiente. Leer
   exclusivamente Mailpit54424 y abrir el enlace en el mismo navegador: callback limpio,
   identidad verificada y perfil propio. Cerrar la vista original y reabrir el enlace
   no debe eliminar el verifier ni volver a consumir el código automáticamente.
2. Inmediatamente Android, APK existente y LAN actual: mismo recorrido con otra cuenta
   ficticia local y retorno appbarberia://auth/callback, conservando SecureStore al cerrar
   vista. Verificar antes que la URL de verificación del correo sea alcanzable desde
   el teléfono; loopback de PC no equivale al loopback Android. No alterar redirects
   ni configuración sin revisar ese requisito operativo concreto.
3. En ambas: perfil existente conservado, perfil ausente exige datos si faltan; fallo
   controlado de perfil queda reintentable y reintentar no llama signUp. Enlace inválido,
   consumido o sin verifier falla seguro, sin ready ni datos de otra cuenta. Reportar
   plataforma, pasos y resultado sin incluir enlace/código/password/cabeceras sensibles.
4. Datos previstos: como máximo2 cuentas/perfiles ficticios (una por plataforma), solo
   Supabase local/Mailpit, sin barberías/membresías. Registrar IDs de control fuera del
   reporte sensible; cerrar sesiones y limpiar selectivamente únicamente esas cuentas y
   perfiles. No se crearon datos en este bloque ni se solicita usar direcciones reales.

Estos pasos quedan preparados, **no ejecutados**. Para evitar el bloqueo de secuencia entre
T011 pendiente de evidencia y las vistas que dependen de su implementación, deberá revisarse
la aceptación del gate técnico al autorizar el siguiente bloque; no se reescribe tasks/spec
ni se declara una prueba inexistente. No se ejecutó T013/T014.

No Cloud, Kong, RLS, datos, nuevas dependencias, APK, Metro o log activo modificados.
Riesgos npm/XSS anteriores continúan, sin auditoría declarada superada.
Fuentes: [signUp oficial](https://supabase.com/docs/reference/javascript/auth-signup),
[canje PKCE](https://supabase.com/docs/reference/javascript/auth-exchangecodeforsession)
y auth-js instalado, inspeccionado para PKCE/redirectType. Changelog consultado sin
cambios de versión ni decisiones arquitectónicas.
