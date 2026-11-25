# T010 y T012 — pruebas anticipadas y campo accesible

## Actualización posterior — T012 cerrada

El usuario confirmó el recorrido completo en Web y Android Development instalado,
incluyendo TalkBack, teclado/foco, contraseña, errores, disabled y texto ampliado, sin
observaciones. Es evidencia manual declarada por usuario, no ejecución de Codex. T012
se marca [x], la muestra y su import/render se retiran; campo y pruebas permanecen.
[Implementación posterior de T011 y límites](../t011/resultado.md): las17 pruebas originales
ahora están GREEN. Progreso11/36; T011 queda pendiente del recorrido funcional real según
instrucción del usuario. Se conserva abajo el RED y estado previo como historia.

14/11/2026, America/Lima. main/0ccd33c, cambios previos conservados. T010 completada;
T012 implementada y con comprobaciones técnicas, pendiente de evidencia funcional real
Web/Android. Progreso10/36. No T011/T013/T014 ni operaciones Supabase, correo o usuarios.

## Definiciones literales y dependencias

T010 exige escribir RED de registro/confirmación/bootstrap en registration.test.ts/mjs:
inválidos, doble envío, pendiente sin sesión, canje duplicado, perfil existente/ausente,
red y reintento sin repetir signUp/sobrescribir perfil. T012 exige campo compartido
app-text-field.tsx y auth-fields.test.mjs, tokens/UI existentes, labels/errores/foco/teclado,
48×48dp y escalado; sin nueva biblioteca o infraestructura en UI. Ambas dependen de la
fundación T001–T009 ya aprobada; T012 no necesita la lógica T011 para probar el componente.

## T010 — RED verificado, no registro implementado

- 11 casos unitarios tipados, AuthGateway y estados existentes; entradas inválidas sin
  llamadas, doble envío, confirmación sin sesión, canje repetido, perfil conservado,
  perfil ausente, nombre sin límite adicional/phone vacío normalizado a null según002,
  datos de perfil faltantes al volver del enlace y fallos/reintentos sin alta repetida.
- 6 casos de integración controlada: SDK devuelve user sin sesión, fallo de transporte
  sanitizado, getUser verificado frente a metadata, falta de verifier y parsers Web/native
  con targets exactos/rechazo de token-fragmentos y otros hosts/rutas.
- Unitarias: salida1,11/11 RED por session-coordinator todavía inexistente. Integración:
  salida1,6/6 RED por acciones del adaptador y parsers pendientes de T011. No skips, mocks
  de implementación del coordinador ni expectativas cambiadas para obtener GREEN.

Los archivos fijan una superficie de prueba para T011: createSessionCoordinator con puertos
auth y profiles propios, register/completeCallback/retryProfile/getSnapshot; parseAuthLink
en cada adaptador de enlaces. Son nombres de pruebas para desarrollar los módulos previstos,
no una modificación de contratos funcionales ni implementación anticipada. Los datos y
puertos de prueba son ficticios en memoria, sin HTTP o identidad real. El import calculado
mantiene la compilación de pruebas y falla al ejecutar si falta el módulo; no lo omite.

Primero la compilación encontró __DEV__ sin declarar al incluir el adaptador002 en Node.
Se agregó exclusivamente tests/unit/environment.d.ts: no polyfill/valor runtime ni modificación
del adaptador. Después compiló0 y se ejecutó el RED real por módulos/acciones pendientes.
No se agregó código Auth productivo ni dependencias para resolverlo artificialmente.

## T012 — implementación y límites comprobados

AppTextField controla value/onChangeText, tiene ref de instancia compatible con RN0.88,
teclado, submit/focus/blur, contraseña oculta, editable/disabled, labels y errores visibles.
Usa AppText/tokens; tamaño mínimo48×48, sin altura fija ni límite de escalado. Web vincula
hint/error con aria-describedby y aria-invalid; disabled se anuncia y llega a input HTML.
Android recibe etiqueta/labelledBy/hint, estado y error anunciado polite. No SDK, HTTP ni
persistencia en el componente. No reglas de registro o límites comerciales de longitud.

RED inicial4/4 por componente ausente. Al implementarlo, la prueba con RN Web real detectó
aria-disabled ausente: se añadió el atributo Web explícito. Posteriormente4/4 del campo y
4/4 regresiones compartidas, salida0. La comprobación reforzada de disabled HTML ya pasaba
con aria-disabled: no se añadió un prop redundante para aparentar una corrección.
El primer chequeo de tipos detectó que TextInput de RN0.88 no representa su instancia:
se corrigió el ref con ComponentRef<typeof TextInput>; sin cast any ni ocultar errores.

La parte Web renderiza el componente real con React Native Web/ReactDOM server: prueba HTML,
etiquetas, error escapado y semántica de input. **No es una prueba en navegador interactivo**.
La parte Android usa primitivas controladas: prueba props, callbacks, escalado y tamaño
declarado; **no acredita teclado, TalkBack o tamaño físico real en el teléfono**.

Para comprobar ambas se añadió una muestra temporal Development en composición y dos
líneas en AppProvider, sin nuevas rutas ni pantalla Auth. Consume los campos en una muestra
local con Modal/Screen y botones existentes; correo/clave ficticios solo en memoria, sin
envío ni almacenamiento y limpiados al cerrar. No requiere otro APK: Modal/TextInput ya
existen en el runtime instalado. Retirar muestra/import/render tras recibir evidencia.
No desactivar gates de plataforma ni marcar T012 con solo SSR/dobles.

## Comandos y resultados

| Comando | Resultado |
| --- | --- |
| node node_modules/typescript/bin/tsc --noEmit | 0 |
| node node_modules/typescript/bin/tsc -p tsconfig.core.json --noEmit | 0 |
| node node_modules/typescript/bin/tsc -p tsconfig.tests.json --pretty false | 0 después de declaración de prueba |
| node --test .test-build/tests/unit/authentication/registration.test.js | 1 esperado;11 RED por T011 ausente |
| node --test tests/integration/authentication/registration.test.mjs | 1 esperado;6 RED por T011 ausente |
| node --test tests/presentation/auth-fields.test.mjs tests/presentation/shared-ui.test.mjs | 0;8/8 |
| ESLint de los siete archivos de código/pruebas afectados, --max-warnings 0 | 0 |
| Prettier --check sobre esos archivos | 0 |
| node scripts/check-architecture.mjs | 0;49 módulos,15 núcleo,96 aristas |

Logs adjuntos RED/GREEN conservan resultados reales. .test-build queda excluido de Git.
No se cambiaron runners/gates para suprimir los RED: la suite que incluya T010 seguirá
fallando hasta T011. No se ejecutó check completo ni se afirma cobertura funcional nueva
del núcleo/UI; estos módulos Auth aún no existen. Se reutilizan evidencias previas CORS,
deep links, storage, build y aislamiento, sin repetirlas ni atribuirlas a estas pruebas.

## Único bloque manual pendiente (Web y enseguida Android)

1. Reutilizar Metro Development del proyecto con APP_VARIANT=development y Web en
   http://localhost:8081. No detener procesos ajenos ni alterar redirects. Recargar Web,
   pulsar «T012: probar campos (Development)»; usar solo prueba@example.invalid y texto
   ficticio. Tab debe mover foco visible, escribir cambia el valor y Enter desde correo
   enfoca clave; la clave se oculta. Mostrar error debe ofrecer texto comprensible;
   desactivar campos impide edición y los anuncia deshabilitados. Comprobar legibilidad
   con texto ampliado. Cerrar y reabrir debe limpiar los valores, sin petición al backend.
2. Inmediatamente, recargar el APK Development instalado con ese Metro y abrir la misma
   muestra: comprobar escritura, teclado de correo, Siguiente hacia clave, ocultamiento,
   error visible, campos desactivados, lectura/etiquetas con TalkBack y texto ampliado sin
   recortes. Atrás debe cerrar la muestra y conservar la navegación técnica anterior.
3. Reportar por separado Web/Android, resultado y fallos. No datos reales, registro o correos.
   Los flujos Auth se probarán en T014 con autorización concreta de datos/limpieza.

T011 puede planificarse para la siguiente ejecución porque depende de T010; T013 espera
T011 y T012 verificada. No se inició ninguna de ellas. Riesgos npm/XSS previos siguen
pendientes, sin remediación ni auditoría declarada aprobada.
