# Disponibilidad clara — Ajuste UI 23/11/2026

## Solicitud y diseño

El usuario no distingue bloqueos personales, cierres generales y excepciones.
Mantener flujos existentes, explicando alcance antes de guardar y organizando
la vista administrativa sin volver a incluir el editor semanal personal duplicado.

Desplegable «Bloqueos y cierres por fecha» con guía de tres tarjetas compactas.
Primero bloqueos propios, luego formulario para registrar cierre/ausencia y al
final consulta/retirada de cierres generales. Paleta/tokens e iconos existentes,
espaciado uniforme, cuadrícula apilada en pantallas estrechas y foco visible.

Bloqueos personales identifica el nombre profesional propio una vez consultado;
antes de consulta no inventa identidad. Avisa que no cambia con el selector superior.
Omite en la administración la referencia semanal redundante; en espacio profesional
conserva la presentación previa. Se mantienen editar/crear/retirar bloqueos.

Registrar cierre/ausencia: selector local de destinatario sincronizado con el
selector superior mediante chooseBarber existente, explicación dinámica «Toda la
barbería» o «Solo [profesional]», fecha nativa Web, horas y motivo existentes.
Botón cambia a Guardar cierre de la barbería/Guardar ausencia del profesional.
No cambia formato UTC/Lima, caso de uso ni autorización de servidor. Las citas
existentes no se cancelan desde este formulario. La tarjeta de cierres explica que
consulta/retira cierres generales y cómo registrar uno, sin confundirlo con crear.
Android conserva controles nativos existentes y añade explicación explícita de
alcance en bloques y excepciones. No dependencia o migración nueva.

## Archivos

- presentation/availability-scope.web.tsx (nuevo): selector y aviso dinámico.
- presentation/weekly-schedule-web.tsx y weekly-schedule-web.styles.ts: guía y
  diseño local de herramientas, responsive850px y controles con foco.
- presentation/operation-screen.tsx: integración del selector, orden de secciones,
  fechaWeb y textos/botón según destino. Backend y acciones intactos.
- presentation/self-schedule-web.tsx y self-schedule.tsx: identidad/alcance propio.
- presentation/shop-closures-panel.web.tsx: instrucciones de creación/retirada y
  nombres de cierres por motivo, sin UUID como título principal.
- tests/presentation/booking/weekly-schedule-ui.test.mjs: distingue destino local
  y profesional. Prueba observada fallar antes de crear el componente y pasar después.

Todos los archivos de presentación anteriores están en
src/features/barbershop-operation/. Mantiene especificación009 y sus contratos.

## Validación

- Suite cliente:526/526 aprobadas antes del último ajuste de texto Android.
- Pruebas dirigidas tras ese texto:20/20 aprobadas (self-schedule, premium,
  weekly-schedule-ui, shop-closures).
- Tipos aprobados tras ajuste final; lint y formato dirigidos aprobados.
- Arquitectura:263módulos,55núcleo,867aristas, aprobada.
- Expo export Web aprobado; artefacto ignorado
  .artifacts/availability-tools-web-build. Último cambio posterior fue texto Android
  y formato, sin comportamiento Web nuevo.
- git diff --check dirigido aprobado.

No acciones en navegador ni escrituras Cloud. No se guardaron bloqueos/cierres,
ni se alteraron horarios, reservas o políticas. Sin instalar, APK, staging/commit/push.
Pendientes: inspección visual con sesión real y aceptación en Android físico;
no afirmar que una prueba de render acredita esos E2E.
