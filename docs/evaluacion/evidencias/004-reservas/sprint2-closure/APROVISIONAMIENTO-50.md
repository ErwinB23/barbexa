# Preparación de 50 VU — corrección puntual, 26/11/2026

## Diagnóstico

25 VU está **aprobado**, intento `dfbeb172`: 16.227 HTTP, 3.236 confirmaciones,
cero errores, thresholds aprobados, 600 s estables y verificación SQL coincidente.
No se repitió ni se modificó esa evidencia.

La operación interrumpida al pasar a 50 fue el primer
`POST /functions/v1/barbershop-operation`, acción **configure-shop**, para la
primera barbería sintética. Se determina por la secuencia del preparador, las
sesiones aún vigentes al fallo, el manifiesto guardado a las 17:28:14.190 UTC y la
ausencia de llamadas del preparador en Kong/Edge/Auth entre 17:28:13 y 17:29:00 UTC.
El único HTTP de esa ventana es la consulta de salud al finalizar 25 VU.
No había work ni fixture de 50 exportados; ese nivel no estaba en ejecución.

El error informado ECONNABORTED ocurrió en transporte antes del gateway. No es
otro WorkerAlreadyRetired ni un rechazo funcional del backend. Una conexión
persistente obsoleta tras el largo spawnSync es una explicación compatible;
sin la traza del socket original no se atribuye con certeza el mecanismo de Windows.
El wrapper anterior solo recuperaba 429 y propagaba cualquier fetch failed.

El estado anterior estaba íntegro: 4.585 reservas, 100 seeds existentes,
20 profesionales, 20 capacidades, 14 intervalos generales y 140 intervalos
profesionales. Ambas barberías conservaban su capacidad de 600 futuras reservas
por cliente, horizonte de 90 días y publicación published.
No se encontró una creación parcial de 50.
Logs privados: `.artifacts/k6/diagnostics/prepare-50/2026-11-26T17-39-47.588Z/`.

## Corrección del aprovisionamiento

- Transportes reconocidos, incluido ECONNABORTED anidado en AggregateError:
  máximo **3 intentos**, pausas de 500/1000 ms, únicamente en lecturas, setters de
  configuración y seeds con UUID idempotente persistido. Mismo contenido en cada
  intento. No se reintentan ciegamente altas de barbería/servicio ni login.
- HTTP funcionales/500 y TypeError sin causa de transporte se conservan como fallo.
  La espera por 429 mantiene su límite previo y no evade el rate limit.
- `Connection: close` se limita a las llamadas del preparador. Evita conservar
  sockets durante la ejecución síncrona prolongada del hijo. El HTTP medido de k6
  mantiene su configuración y no recibe reintentos ni cambios de conexiones.
- Journal JSONL privado registra nivel, endpoint, acción, intento y causa, sin
  credenciales/cuerpos. Un fallo posterior identifica la operación concreta.
- prepare-only selecciona el **siguiente nivel pendiente**: ahora 50, nunca 25.
  El comando normal omite niveles aprobados y continuará después con 100.

## Verificación realizada sin k6

Se completó realmente la preparación de 50: 131 llamadas de preparación/verificación,
sin reintentos necesarios en esa ejecución; sesiones renovadas fuera de medición.
Catálogo, slots y reservas propias: HTTP 200. Fixture de 50 exportado con 8.000 casos previstos,
no reservas nuevas. [Estado exportado](provisioning-50-verification.json).

Antes/después: **4.585 reservas**, mismos digest de cabeceras, items, eventos y care;
mismos valores de políticas y horarios. Solo cambió el campo técnico version de la
configuración al reejecutar setters, según el incremento previsto del servidor;
no se declara identidad byte a byte de esa fila ni de las sesiones Auth renovadas.
Es idempotencia de los valores de oferta, no supresión de su versionado técnico.
Las versiones técnicas de las dos configuraciones pasaron de 54 a 67.
El resultado y aprobación de 25 permanecen exactamente iguales; 50 aún no se ha medido.

[Pruebas acotadas](provisioning-50-tests.log),
[preservación y verificación final](provisioning-50-final.json).
Las 19 pruebas acotadas aprobaron; 871 archivos protegidos conservan sus hashes.
Se mantuvieron oneshot, 600 s estables, thresholds e integridad/protecciones; sin
cambios de producto, Cloud, migraciones, GitHub Actions, commits o push.

## Continuación manual

Desde la raíz, después de cerrar Codex:

```powershell
npm run test:carga:mixta
```

Conserva 25 y ejecuta únicamente **50 y 100 VU**. Renueva las sesiones cuando corresponde
y prepara fuera de la medición. Duración configurada restante: 30 min más preparación
y cierre. No volver a ejecutar 25 ni crear otra campaña.
