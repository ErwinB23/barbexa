# T034 — validación final TalkBack pendiente

Registro: 11/11/2026. Misma versión y [estado de T033](android-final.md).
El usuario ya declaró TalkBack y texto máximo utilizables en Honor 90 Lite.
Se conserva esa evidencia histórica; Codex no ejecutó TalkBack ni solicitó repetirla.

Las pruebas automáticas actuales verifican etiquetas/roles, disabled, configuración
mínima 48×48 dp, escala sin límite, scroll, zonas seguras y avisos de los mensajes.
Son verificaciones de props y comportamiento React con primitivas sustituidas;
no son mediciones físicas ni prueba del lector Android.

Falta acreditar sobre los estados finales añadidos:

- Orden y foco, nombres/roles, disabled y lectura de carga, error y éxito.
- Recuperación real y de muestra, sin anuncios estáticos repetitivos.
- Medidas nativas de las áreas táctiles >=48 dp y de las zonas seguras.

T033 no está cerrada y no hay sesión manual nueva ni mediciones de estos estados.
T034 conserva `[ ]`. El texto máximo previamente declarado no acredita escala
exacta del 200 %; no se adelantó T035 ni se inventaron medidas.

## Verificación de la interfaz final — 11/11/2026

T033 ya está completada; el estado anterior se conserva como historial.
Versión: HEAD `d585e78` más cambios locales T029–T033 y actualización Expo.

**Evidencia manual declarada por el usuario, no ejecutada por Codex:** en Honor
90 Lite CRT-NX3, Android 15, Expo Go 58.0.5, TalkBack recorre correctamente carga,
vacío, error y éxito; permite activar recuperación y regresar a Bienvenida.
El usuario declara botones cómodos de pulsar y ausencia de texto o controles
ocultos detrás de barras del sistema o bordes. Se conserva su prueba anterior
de texto máximo satisfactorio, sin equipararlo a 200 % exacto.

**Comprobación técnica de Codex:** todos los botones propios de las vistas usan
AppButton; su Pressable fija minWidth/minHeight a `tokens.size.minimumTouch=48`,
sin altura fija que corte texto. Incluye etiqueta explícita, rol button, disabled
y manejadores de foco. Estados disabled/focused no reducen esos mínimos.
Las vistas usan Screen con SafeAreaView de react-native-safe-area-context y
ScrollView; ExpoRoot del Router instalado incorpora SafeAreaProvider. Se mantiene
la separación de responsabilidades y no se modifica código.

Comando específico ejecutado:
`node --test tests/presentation/shared-ui.test.mjs tests/presentation/use-app-information.test.mjs`.
Resultado: **11/11 aprobadas, salida 0**; [registro](t034-comprobaciones.log).
Comprueba props de roles/etiquetas/disabled, mínimos configurados >=48×48,
escala habilitada, scroll/zonas seguras, avisos y recuperación. Las primitivas
nativas se sustituyen en Node: no mide el layout real ni ejecuta TalkBack.

**T034 permanece pendiente:** la tarea exige medir áreas >=48 dp y zonas seguras
en Android. Los mínimos declarados en código y la comodidad reportada no son
mediciones de dimensiones/insets nativos, ni miden la flecha de cabecera del
Router. También falta detalle manual explícito de lectura de nombre/rol y
disabled y foco/orden de todos los controles finales. No se deducen estos datos
solo de que los controles puedan activarse. No se marcará `[x]` sin acreditarlos.

No se ejecutaron T035–T040 ni pruebas de escala 200 %. El análisis de las
9 vulnerabilidades moderadas continúa pendiente. Sin instalaciones, commit ni push.

## Decisión autorizada de evidencia y cierre de T034 — 11/11/2026

El responsable considera suficiente para esta fundación la evidencia existente
y autoriza cerrar T034 sin nuevas mediciones instrumentadas del dispositivo.
Se acepta conjuntamente el recorrido/lectura/navegación TalkBack de la interfaz
final declarado por el usuario, la comodidad de controles y ausencia de
obstrucciones reportadas, los mínimos configurados 48×48 dp, etiquetas/roles,
disabled, foco, scroll y zonas seguras comprobados técnicamente, y las 11 pruebas
de presentación aprobadas cuyo registro se conserva. No se transforman las
pruebas técnicas de roles/disabled/foco en observaciones manuales no reportadas.

Se revisaron Constitución v1.0.1 (pruebas según riesgo, accesibilidad y evidencia
real), especificación FR-009 y SC-005 y rúbrica (pruebas E2E e interfaz). Exigen
accesibilidad y tamaño mínimo, pero no imponen un instrumento nativo específico.
Es admisible cambiar el método de evidencia de T034, sin rebajar el requisito
de 48×48, inventar mediciones ni declarar SC-005 totalmente validado. Se refleja
en tasks.md, la nota metodológica de validation.md y el paso 6 de quickstart.md.

**T034 completada conforme al método de evidencia autorizado.** La evidencia
manual corresponde al usuario en Honor 90 Lite CRT-NX3, Android 15, Expo Go
58.0.5; Codex no ejecutó TalkBack. No hubo medición instrumental de dimensiones
o insets nativos, incluida la flecha de cabecera. El texto máximo reportado no
confirma escalado exacto al 200 %. T035 y el cierre íntegro de SC-005 permanecen
pendientes; no se ejecutaron T035–T040. Los estados pendientes anteriores se
conservan como historial, superados solo por esta decisión sobre el método.
No se modificaron código, pruebas o dependencias ni se repitieron pruebas costosas.
Las 9 vulnerabilidades moderadas siguen pendientes de análisis. Sin commit/push.
