# EQ-09 — Usabilidad: horario ocupado y consulta de ubicación

**26/11/2026, America/Lima.** Resultado: **recorrido funcional Web de conflicto
aprobado; EQ-09 integral parcialmente cumplido**. No se acredita Android nativo,
ubicación denegada, observación con participantes ni accesibilidad completa.

Fuente: [escenario original íntegro](criterio-original-eq09.md), copia del documento
académico. Sus condiciones no se redujeron para aprobar. El procedimiento exige
mensaje textual y acción para continuar, servicios conservados, ausencia de
duplicados, alternativa sin permiso de ubicación, pruebas Web/Android, participantes
y accesibilidad. Solo el recorrido construido de conflicto Web se evalúa aquí.

## Resultado ejecutado

Playwright Test **1.62.1**, Chromium **151.0.7922.34**, viewport **390×844 CSS px**,
emulación táctil/móvil, locale es-PE y zona America/Lima. Dos contextos independientes
y dos clientes sintéticos diferentes. Un worker, cero reintentos automáticos.
Última ejecución: **1 prueba aprobada, 0 fallos, 0 omitidas, 0 flaky**; 11,05 s
de runner y 10,2 s del test. No es una prueba de carga.

| Paso real | Resultado y evidencia |
| --- | --- |
| A y B eligen el mismo servicio, profesional y turno libre | Selecciones hechas con la UI real y datos de disponibilidad del backend |
| A confirma primero | HTTP **201**, reserva a 09:00, confirmación visible |
| B intenta confirmar su selección ya obsoleta | HTTP **409**, código de negocio CONFLICT y texto «Profesional no disponible en ese horario» |
| Tras el conflicto | Servicio sigue `aria-pressed=true`, sin pérdida de la selección; no hay reenvío automático durante 2 s observados |
| B consulta otra vez | HTTP 200, el turno ocupado ya no aparece; activa controles con foco y Enter |
| B elige 09:30 y confirma | HTTP **201**, mismo servicio y profesional; nuevo UUID y turno; pantalla «¡Reserva confirmada!» |
| Recarga posterior | No vuelve a enviar confirmaciones; se mantienen exactamente A:[201], B:[409,201] en la sesión observada |
| Conciliación SQL | **Dos reservas**, exactamente una por 201; **cero filas** para el UUID del 409; un item, un evento confirmed y una fila care por reserva |

Las respuestas no fueron simuladas ni reemplazadas mediante route.fulfill.
Playwright bloqueó destinos externos y permitió únicamente localhost:8081 y
127.0.0.1:54421; cero intentos externos bloqueados y cero errores JavaScript en el
recorrido aprobado. El proxy reenvió las peticiones completas al laboratorio
127.0.0.1:54721, sin cambiar payload, sesión, Origin o respuestas de negocio.

Los turnos sintéticos fueron del **29/11/2026**, 09:00 y 09:30 Lima. El conflicto
se produjo porque A ocupó un turno que B había seleccionado antes; no se forzó
mediante un 409 artificial. Tres UUID distintos y sesiones de cliente separadas.

## Integridad y preservación

Consulta SQL de solo lectura posterior: **18.981 reservas globales**, incremento
de dos respecto a las 18.979 previas. Cero solapamientos, tenants incongruentes,
requests duplicados, recibos duplicados y reservas parciales. El UUID de conflicto
no está registrado y ambos UUID aceptados aparecen una sola vez con el cliente,
servicio y turno correctos. Las dos reservas quedan conservadas para evidencia.

Se compararon como multiconjunto los digest de todas las filas previas de **18
tablas** de negocio; ninguna se modificó o eliminó. Las adiciones están limitadas
al fixture propio: cuatro cuentas Auth/perfiles, una barbería, un profesional,
servicio/horarios y las dos reservas. Sesiones Auth y filas nuevas no se confunden
con inmutabilidad byte a byte de toda la base.

**814 archivos** previamente protegidos conservan SHA-256; también se contrastaron
**763 hashes** anteriores, incluyendo campañas, fixtures y resultados de k6.
No se repitió k6 ni se cambiaron funcionalidades, Cloud, migraciones o Actions.
Sin staging, commits o push. [Resultados y auditoría](resultados.json).

## Revisión acotada de controles y accesibilidad

| Comprobación | Resultado | Límite |
| --- | --- | --- |
| Mensaje independiente del color | Texto explícito y región viva `aria-live=polite` | No se ensayó lector de pantalla real |
| Contraste del mensaje | RGB(161,39,38) sobre RGB(255,241,237): **6,73:1**, supera 4,5:1 para 16 px normal | Solo ese texto, no auditoría de todos los colores |
| Estado de selección | Servicios/horarios exponen `aria-pressed` | No se evalúan todos los widgets del producto |
| Teclado | Foco y Enter para consultar, elegir otro horario y confirmar | No equivale a completar todo el recorrido únicamente con Tab/lector |
| Tamaño de los controles inspeccionados | Servicio 328×78, consulta 184,66×50, turno 76×44 y confirmar 324×50 px | El mínimo 44 px se usa como buena práctica táctil; no certifica por sí solo WCAG AA |
| Reflujo a 390 px | Ancho de contenido=390, sin overflow horizontal | No se ensayaron 320 px ni zoom al 200 % |
| Foco al aparecer el conflicto | **BODY**, el control anterior desaparece con el estado | No se acredita traslado de foco al aviso o a la acción de recuperación |

**Hallazgo pendiente de experiencia:** la captura después del 409 conserva el
scroll inferior del formulario; el texto del error está en el DOM y su visibilidad
CSS fue comprobada, pero el test no exige que esté dentro del viewport al instante
de aparecer. No se presenta `toBeVisible` como comprobación de intersección con
la pantalla. Conviene evaluar traslado de foco/scroll al mensaje en una actividad
de corrección separada. No se modifica UI para ocultar este límite.

Las capturas se revisaron: la de conflicto muestra el estado inferior «Horario:
Sin seleccionar», servicio conservado y datos del resumen, **no un primer plano
del mensaje**. El mensaje y estado completos quedan registrados en las aserciones
y el snapshot del trace privado. No se fabricó una captura del aviso ni se repitió
una reserva aprobada únicamente para cambiar el encuadre.

No se ejecutó axe ni una auditoría WCAG completa; contraste, nombres/roles,
tamaños y teclado son evidencia parcial del recorrido específico. Participantes,
muestra/umbral de comprensión y revisión con ayudas reales siguen pendientes.

La captura inicial también muestra la etiqueta **Efectivo** muy tenue (texto claro
sobre fondo claro). Se registra como hallazgo visual pendiente de medición de
contraste del control, sin atribuirle el 6,73:1 medido para el mensaje de error.
La confirmación fue operable, pero eso no acredita legibilidad de todos los botones.

## Herramientas y preparación local

Playwright estaba disponible en el runtime de herramientas y exportaba
`playwright/test`; no fue necesario modificar package.json, lockfile o instalar
dependencias del producto. El Chromium global existente era de otra revisión;
se descargó el **Chromium oficial compatible** en `.artifacts/eq09/tools/browsers`.
La descarga usó las CA de Windows (`NODE_OPTIONS=--use-system-ca`) después de un
rechazo del certificado del entorno; **no se desactivó TLS**. Sin costos.

La aplicación de desarrollo fija localhost:8081 y el API local 54421. Se usó
Metro en loopback, un worker, dotenv/telemetría desactivados y `EXPO_OFFLINE=1`.
El proxy temporal vinculó solo 127.0.0.1:54421 con 127.0.0.1:54721 del laboratorio;
la pila habitual 54421 permaneció detenida, sin reutilizar sus datos.

Edge Runtime de k6 no tenía `BARBERIA_ALLOWED_ORIGINS`: antes de preparar CORS,
`payment-options` daba 200 sin Origin y 403 desde localhost. Se creó temporalmente
un contenedor idéntico **oneshot** con solo `http://localhost:8081` permitido.
Kong conserva su cabecera CORS `*`, pero el handler sigue rechazando orígenes no
permitidos: localhost 200, origen ajeno 403. No se retiró Origin ni se desactivó la
validación. La imagen, bootstrap, límites y volúmenes se conservaron.

Al terminar, Metro y proxy quedaron cerrados y **el contenedor Edge original fue
restaurado**. El temporal y todos los contenedores previos permanecen conservados
detenidos. Los otros cinco servicios no se reiniciaron. Docker y el laboratorio
siguen activos; no se elimina ningún dato o volumen.

### Intentos de preparación no acreditados

Se preservan sin convertirlos en aprobaciones: conectividad del servidor dentro
del sandbox; exportación Web dev con módulo de Expo Router no resuelto (se cambió
a Metro sin editar producto); selección de efectivo omitida en el primer script;
y 403 por CORS del laboratorio. Todos ocurrieron antes de crear reservas.
El runner guarda intentos en carpetas únicas, no repite un aprobado y rechaza
automáticamente un reintento si el fixture ya tiene escrituras no revisadas.

## Evidencias y comandos reproducibles

- [Resumen HTML sanitizado](reporte.html), [estadísticas Playwright](playwright-resumen.json)
  y [resultados detallados](resultados.json).
- [Restauración verificada](restauracion-verificada.json) y
  [verificación final offline](verificacion-entrega.json), sin repetir el E2E.
- Capturas originales: [selección](01-horario-inicial.png),
  [estado después del conflicto](02-conflicto-textual.png),
  [recuperación confirmada](03-reserva-recuperada.png).
- Prueba y configuración versionables: `tests/e2e/eq09/booking-conflict.spec.mjs`,
  `playwright.config.mjs`; preparador, runner, auditoría y restauración en esa carpeta.
- Reporte HTML nativo, JSON completo y trace están en la carpeta privada de
  `.artifacts/eq09/<fixture>/attempts/<intento>/`, indicada en resultados.json.
  El trace puede contener JWT/cabeceras/estado de sesión. **No publicar esos archivos
  sin sanitizar**, aunque los usuarios sean sintéticos. No se copiaron al informe público.

Para consultar resultados ya aprobados no hace falta levantar servicios ni repetir
Playwright. Abrir `reporte.html` o el reporte nativo local indicado en JSON.
Para reproducir en un fixture nuevo autorizado, con puertos 8081/54421 libres:

```powershell
# Si Playwright está en el runtime de herramientas y no en node_modules:
$env:BARBEXA_PLAYWRIGHT_MODULE = '<directorio que contiene playwright>'
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.artifacts/eq09/tools/browsers'

node tests/e2e/eq09/prepare-local.mjs --execute=local-synthetic-lab
node tests/e2e/eq09/cors-local.mjs --apply-local-only

# Terminales separadas; solo mientras se ejecuta el recorrido:
node tests/e2e/eq09/serve-local.mjs --execute=local-synthetic-lab --proxy-only
node tests/e2e/eq09/start-metro.mjs --execute=local-synthetic-lab

# Terminal del operador:
node tests/e2e/eq09/run-local.mjs --execute=local-synthetic-lab
node tests/e2e/eq09/audit-local.mjs --execute=local-synthetic-lab
node tests/e2e/eq09/stop-local.mjs --execute=local-synthetic-lab
node tests/e2e/eq09/cors-local.mjs --restore-local-only
```

**No ejecutar esos comandos ahora por rutina:** este fixture está concluido y
restaurado; el runner rechaza su repetición. Una reproducción con nuevas escrituras
necesita un fixture nuevo, revisado y autorizado; el script no borra el puntero ni
reinicia automáticamente el experimento. No se ejecuta `npm install` por fallback.

## Estado final y siguiente actividad

EQ-09 queda **parcial integralmente**: conflicto y recuperación Web acreditados con
sesiones reales y persistencia; ubicación denegada sigue pendiente hasta implementar
esa funcionalidad. Emulación móvil Web **no sustituye Android nativo**, pruebas
con participantes ni accesibilidad instrumental completa. El hallazgo de foco/
encuadre del aviso se mantiene explícito, sin atribuir una corrección no realizada.

Para EQ-05 se entrega únicamente [propuesta de una hora](PROPUESTA-EQ05-1H.md).
**No se implementó ni inició esa medición.** Su resultado futuro sería preliminar;
el objetivo mensual original de ≥99,5 % sigue no evaluado.
