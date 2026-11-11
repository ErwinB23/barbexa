# T035 — texto y contraste: verificación parcial

Registro: 11/11/2026, America/Lima. Rama `main`, HEAD
`d585e78c3fa8f01e62ae2ce70d8f859d97acbb58` más cambios locales T029–T034,
actualización Expo y ajustes documentales autorizados. T034 continúa completada.

**T035 pendiente**, según su condición expresa de dejarla abierta si no se
acredita el 200 %. No se ejecutó ninguna tarea T036–T040.

## Evidencia disponible y límites

El usuario declaró texto al máximo disponible utilizable en Honor 90 Lite
CRT-NX3, Android 15, Expo Go 58.0.5; también TalkBack y ausencia de controles
ocultos por bordes o barras del sistema. Son pruebas manuales del usuario,
no de Codex. El máximo del dispositivo no equivale automáticamente a 200 %.
Las capturas finales verificadas previamente se conservan sin modificarlas:
[información](capturas/android-final-informacion.jpeg) y
[estados](capturas/android-final-estados.jpeg). No contienen una medición
acreditada de escala ni sustituyen el recorrido completo con escala 2.0.

| Criterio de T035 | Evidencia / estado |
| --- | --- |
| Escala antes del recorrido | No medida |
| Escala efectiva durante el recorrido: 200 % | No acreditada |
| Recorrido completo sin recortes impeditivos y scroll al 200 % | No acreditado; solo se conserva la prueba declarada al máximo disponible |
| Restauración del ajuste y escala posterior | No acreditada; Codex no alteró ajustes del dispositivo |
| Medidas nativas y capturas de ese recorrido | No disponibles |
| Ratios de contraste de tokens usados | Aprobados automáticamente, detalle abajo |

No se encontró `adb` ni `emulator` en PATH mediante `Get-Command`; esto no
demuestra que el dispositivo no exista ni que no haya herramientas fuera de PATH.
No se instaló ninguna herramienta ni se cambió la configuración del teléfono.
El ajuste de evidencia autorizado para T034 no modifica el requisito 200 % de
T035/SC-005. SC-005 permanece parcialmente acreditado, no completo.

## Verificaciones automatizadas de apoyo ejecutadas por Codex

Se reutilizaron las herramientas y pruebas existentes, sin duplicar implementación:

```powershell
node scripts/run-unit-tests.mjs
node --test tests/presentation/shared-ui.test.mjs
```

Ambos comandos terminaron en 0. [Salida reproducible](t035-comprobaciones.log):
67/67 unitarias, incluidas 14 de contraste, y 4/4 pruebas de componentes.
El runner compiló TypeScript para esas unitarias y limpió su `.test-build`.
No se repitieron Doctor ni exportación: no cambiaron código o dependencias.

Ratios sRGB calculados por las pruebas:

| Texto / fondo | Blanco | Superficie |
| --- | --- | --- |
| Principal | 17.7397 | 16.1195 |
| Secundario | 10.3074 | 9.3659 |
| Error | 6.4700 | 5.8791 |
| Éxito | 7.1303 | 6.4791 |
| Acción/borde | 6.7016 | 6.0895 |

Blanco sobre acción y foco interior blanco/azul: 6.7016:1. Texto normal >=4.5,
grande >=3, controles/foco >=3. Son cálculos de tokens, no mediciones nativas.
Los controles se verifican configurados con mínimos 48×48; no se presenta ese
dato como dimensión instrumental medida.

Las pruebas de componentes verifican allowFontScaling=true,
maxFontSizeMultiplier=0, ausencia de numberOfLines, ScrollView y SafeAreaView.
Usan primitivas nativas sustituidas en Node: no prueban geometría/renderizado
Android, TalkBack ni tamaño efectivo de fuente. La cobertura del núcleo que
aparece en el log no se atribuye a UI ni a la validación del 200 %.

## Pendiente concreto

Acreditar escala antes/durante/después, recorrido completo con escala efectiva
2.0 sin recortes impeditivos y con scroll, restauración del ajuste original,
medidas y capturas correspondientes. Sin esos datos no se cambia la casilla
T035 ni se declara SC-005 completo. Se conserva el riesgo de 9 vulnerabilidades
moderadas pendientes de análisis. Sin código, pruebas, configuración o versiones
modificados; sin instalación, commit ni push.

## Revisión de la propuesta de cierre documental — 11/11/2026

El responsable propone aceptar texto al máximo disponible más pruebas automáticas
para esta fundación, condicionado a compatibilidad con requisitos superiores.
La revisión detecta una obligación explícita de la especificación aprobada:
`spec.md`, SC-005, exige recorrido utilizable con lectura asistida y texto al
200 %. El escenario 2 de US3 también parte de texto al 200 %. T035 exige dejar
la tarea pendiente si ese porcentaje no puede acreditarse.

La Constitución y la rúbrica no fijan por sí mismas ese porcentaje ni un
instrumento específico, pero la Constitución exige trazabilidad y evidencia
real conforme a la especificación. El impedimento es el resultado de aceptación
SC-005, no la ausencia de un instrumento concreto. Cambiar solo T035 para aceptar
un máximo de porcentaje desconocido no satisface ese resultado superior.

**T035 permanece pendiente; no se aplica el ajuste condicionado.** Se conserva
como evidencia válida parcial el uso satisfactorio al máximo declarado por el
usuario y las pruebas automáticas ya registradas. No existen verificación del
200 % exacto ni mediciones nativas de ese escalado. La validación exacta al 200 %
se registra para ejecución futura como obligación pendiente de SC-005, no como
mejora opcional que permita declarar ahora el criterio cumplido. Para convertirla
en mejora opcional sería necesario modificar explícitamente la especificación
aprobada y armonizar sus documentos; esa modificación no se realiza bajo esta
solicitud condicionada. No se solicitan nuevas pruebas manuales.

Sin cambios en T034, T035, Constitución, especificación, código o dependencias.
No se ejecutaron T036–T040, instalaciones, commit ni push. Continúa pendiente
el análisis de las 9 vulnerabilidades moderadas.

## Enmienda explícita y cierre de T035 — 11/11/2026

El responsable autoriza ahora formalmente cambiar la especificación: escenario 2
de US3 y SC-005 aceptan máximo de fuente disponible en Android identificado,
complementado por verificaciones técnicas y automatizadas. Se armonizan T035,
el objetivo de US3 en tasks.md, validation.md y quickstart.md. El bloqueo de la
revisión condicionada anterior queda resuelto por esta autorización explícita;
se conserva su diagnóstico histórico sin atribuirle vigencia posterior.

La Constitución y la rúbrica exigen accesibilidad, trazabilidad y evidencia real,
pero no fijan el 200 %. La enmienda afecta el umbral de aceptación inicial y su
método de evidencia, sin cambiar arquitectura, tamaño mínimo ni contraste. No
requiere modificar la Constitución ni declarar superada la rúbrica completa.

**Nueva evidencia manual declarada por el usuario, no ejecutada por Codex:**
repitió la prueba en Honor 90 Lite aumentando la fuente al máximo disponible.
Confirmó todos los textos legibles y comprensibles, botones visibles y funcionales,
ausencia de recortes y superposiciones y aplicación sin errores. Se conserva el
entorno previamente declarado: CRT-NX3, Android 15, Expo Go 58.0.5. No se deducen
de esta prueba nuevos porcentajes, dimensiones o resultados instrumentales.

**T035 completada bajo los criterios revisados**, junto con las pruebas existentes
de componentes/escalado/scroll y contraste (67 unitarias y 4 de componentes
aprobadas en el registro previo). No se repitieron ni atribuyeron a esta sesión.
Las capturas existentes siguen vinculadas arriba; no hay capturas nuevas de esta
repetición. No se midió exactamente 200 % ni existen mediciones nativas de ese
escalado, escalas antes/después o restauración instrumentada acreditada.

La validación exacta al 200 % se mantiene como validación futura, sin resultados
ni equivalencia asumida con el máximo. T034 conserva su cierre y límites. Esta
enmienda resuelve el pendiente de texto de SC-005 revisado; no ejecuta la
consolidación global ni la evaluación académica de T036–T040. Las 9
vulnerabilidades moderadas siguen pendientes. Sin pruebas nuevas solicitadas
en celular, cambios de código/dependencias, instalaciones, commit ni push.
