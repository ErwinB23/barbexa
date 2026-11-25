# T014–T017 — acceso y navegación protegida

14/11/2026, America/Lima. main/0ccd33c. **16/36: T015, T016 y T017 [x]; T014 [ ].**
No T018 ni tareas posteriores ejecutadas. Sin cambios Cloud, configuración Auth/RLS/Kong,
servicios, dependencias ni APK. Datos ficticios existentes conservados sin limpieza.

## Dependencias y resultados individuales

| Tarea literal | Resultado y evidencia |
| --- | --- |
| T014: calidad y tres recorridos reales por plataforma, cierre de vista, enlaces inválidos/consumidos, reintento, duplicados/limpieza | Parcial. Primero se ejecutaron15 pruebas dirigidas del coordinador de registro, todos GREEN: [log](t014-directed.log). Se reutiliza la evidencia real satisfactoria T011/T013 sin repetir registro/correos. Faltan los escenarios reales ampliados, las tres repeticiones y verificación de duplicados/limpieza; ver [Web](../us1-web.md)/[Android](../us1-android.md). No se modifica su aceptación. |
| T015: RED de acceso/salida y protección | Cumplida.8 unitarias y3 presentación inicialmente RED (11/11 fallos por acciones/vistas ausentes), [registro](t015-red.log). Integración SDK adicional4/4 RED por métodos ausentes [log](adapter-red.log); ahora GREEN. Se añadió regresión de la frontera Protected real y limpieza PKCE. |
| T016: login/salida local, generación, limpieza, errores y GREEN | Cumplida técnica y funcionalmente. Casos de uso/adaptador existentes ampliados, sin duplicar Auth/perfil002. Identidad confirmada/no anónima mediante getUser, perfil existente, errores de red distintos de credenciales; entrada estricta rechaza roles/IDs/claves públicas como credenciales. Evidencia manual Web/Android del usuario abajo. |
| T017: pantallas/rutas/guardas y navegación | Cumplida técnica y funcionalmente. SignInScreen/AccountScreen, rutas sign-in/account y layouts. Stack.Protected y frontera adicional de cuenta; estado no ready no monta perfil privado, replace al salir. Inputs accesibles existentes y rutas001 conservadas. Evidencia manual Web/Android del usuario abajo. |

T015 depende de la base y bootstrap T011–T013, ya cerrados; no requiere cerrar T014.
T016 espera T015 y T017 espera T016. El pendiente de T014 no bloqueó trabajo independiente.

## Seguridad y alcance implementado

- Puertos propios SessionApplicationSource; snapshot sin contraseña/tokens. Misma raíz,
  cliente SDK y transporte002. No SDK en pantallas ni roles globales.
- Login validado, getUser y bootstrap existente; sin perfil, vista limitada de completar/
  reintentar; nunca alta repetida ni perfil inventado. Loading/desactivación y doble envío
  protegido; contraseña de formulario vaciada al enviar, sin persistirla.
- Al salir, generation/actor/perfil/contexto transitorios se invalidan **antes de red**.
  Adaptador bloquea token y refresh; espera escrituras de credenciales anteriores antes
  de limpieza final, para que un login tardío no vuelva a persistir una sesión cerrada.
- scope local explícito; SDK y comprobación de claves propias (sesión, usuario, verifier
  legacy e índice/slots PKCE del SDK instalado). No clear() global ni borrado de otros
  proyectos. Corrupción/fallo de eliminación queda persistence-failed, cierre incompleto
  y login bloqueado hasta reintentar limpieza satisfactoriamente.
- Sin red, un cierre local comprobado puede terminar con revocación remota no confirmada;
  la UI lo informa. Revocación confirmada solo con HTTP2xx observado en logout del destino,
  no simplemente error:null del SDK (la versión instalada puede absorber401/403/404).
  No se afirma invalidación inmediata de JWT emitidos ni salida de otros dispositivos.
- Retorno solo a `/account`, único destino privado montado en esta etapa. Parámetros
  externos, role/userId o clave publicable no acreditan sesión ni deciden permisos.
  `/context` se incorporará en US4, sin ruta ficticia ni permisos simulados ahora.
- Se conserva PKCE/confirmación, SecureStore/Web por plataforma y CORS existente. No
  restauración/refresh por AppState/foco ni invalidación multipestaña nuevas: T018/T020–T023.

## Verificación automática ejecutada por Codex

[Comandos y códigos](verification.json), [bundles](bundles.json):

| Control | Resultado |
| --- | --- |
| Tipos de aplicación y núcleo | 0 ambos. |
| ESLint / Prettier del alcance | 0 ambos. Se corrigió un display-name del stub de prueba, sin desactivar reglas. |
| Unitarias con runner/cobertura existente | 0;116/116. Núcleo100% líneas/funciones,96% ramas globales; coordinador89,81% ramas. Umbrales del runner intactos. No cobertura UI. |
| Integración Auth + presentación/regresiones directamente relacionadas | 0;76/76. Incluye composición Web→Android, scope local, offline, fallo de borrado, credencial tardía, índice corrupto y frontera Protected. |
| Arquitectura real | 0;69 módulos,17 núcleo,165 aristas. |
| Metro Development, Web y enseguida Android | HTTP200 ambos, módulos nuevos/configuración pública presentes comprobados como booleanos. No APK ni prueba de dispositivo atribuida a bundling. |

No se repitieron suites SQL/HTTP002, instalaciones, auditorías npm, Expo Doctor ni correos/
registros reales. Las pruebas con dobles no sustituyen RLS/identidades reales. El control
de calidad ya estaba en ejecución cuando llegó la confirmación manual; no se relanzó después.

## Único recorrido manual de este bloque — ya acreditado

**Origen: prueba ejecutada y declarada por el usuario, no por Codex.** Se solicitó primero
Web en http://localhost:8081/sign-in e inmediatamente Android Development desde Metro
192.168.0.33:8081, utilizando las cuentas ficticias locales confirmadas existentes.

| Comprobación | Web | Android APK Development |
| --- | --- | --- |
| Clave incorrecta | Error controlado, correcto. | Error controlado, correcto. |
| Clave correcta | Mi cuenta y nombre propio, correcto. | Mi cuenta y nombre propio, correcto. |
| Cierre de sesión | Correcto. | Correcto. |
| Atrás tras salir | No recupera acceso protegido. | No recupera acceso protegido. |
| Observaciones | Ninguna. | Ninguna. |

No repetir este recorrido ni solicitar credenciales. No se acreditaron por extensión
logout offline nativo, varias pestañas, recarga/restauración, tres secuencias ni escenarios
de recuperación futuros. Sus tareas mantienen su aceptación. No cuentas/correos nuevos
ni eliminación de datos por Codex; conservar cuentas para las verificaciones pendientes.

## Pendientes manuales agrupados y siguiente acción

En este bloque no quedan nuevas pruebas manuales de login/salida solicitadas. **T014**
mantiene un único bloque pendiente: tres recorridos consecutivos por plataforma, cierre
de vista original, enlace inválido/consumido y fallo/reintento real de perfil, más duplicados
y limpieza selectiva. No se consideran demostrados por automatización ni por un recorrido
satisfactorio. No se repitió ahora el registro ya aprobado; antes de nuevos datos/limpieza,
revisar las cuentas existentes y los límites/autorizaciones específicos. Esto no impide T018.

Ruta crítica de003: T018–T023 (invalidación y ciclo real de sesión), T024–T027 (contexto de
barbería por membresía activa, cero/una/varias), recuperación y cierre restantes del alcance
aprobado. Para negocio: reutilizar creación de barbería/primer administrador de002; faltan
catálogo real de servicios (duración/precio), barberos/horarios y reglas de disponibilidad.
No hace falta rehacer la fundación Supabase ni diseñar otra API.

**Primer bloque propuesto de reservas, sin ejecutarlo**: aprobar spec/plan mínimo de
catálogo/disponibilidad por barbería y confirmación atómica. Implementar mediante TDD el
modelo mínimo/RLS y la transacción RPC que revalida membresía, servicio/precio/duración,
horario y solapamientos; probar éxito, aislamiento, rollback y dos solicitudes concurrentes
al mismo intervalo. Luego puertos/caso de uso, Edge/adaptador y flujo Web/Android según
Constitución. No ampliar ahora a gestión completa, invitaciones, Google o pagos.

Nueve avisos moderados npm y riesgo XSS Web siguen pendientes; no auditoría de seguridad
superada. Sin commit/push. [Revisión Git/documental](revision.json).

Fuentes: [signInWithPassword](https://supabase.com/docs/reference/javascript/auth-signinwithpassword),
[scope de salida](https://supabase.com/docs/reference/javascript/auth-signout),
[Stack.Protected](https://docs.expo.dev/router/advanced/protected/), changelog y fuente
auth-js instalada inspeccionados; no actualizaciones ni nuevas dependencias.
