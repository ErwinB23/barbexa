# Optimización autorizada del laboratorio k6

26/11/2026. Solo `barbexa-k6-lab`. Campaña preservada:
`af768017-0ecc-48b5-b6fe-af5aa287cd5d`. Ninguna carga ejecutada.

## Configuración anterior y posterior

| Parámetro                           | Antes                                    | Después verificado                                                        |
| ----------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| worker_connections efectivo         | 512 implícito                            | 4096 explícito en events                                                  |
| worker_processes                    | 1                                        | 1                                                                         |
| nofile soft/hard principal y worker | 1.048.576 / 1.048.576                    | Sin cambios                                                               |
| Imagen Kong                         | supabase/kong:2.8.1                      | Sin cambios                                                               |
| Contenedor Kong                     | 668f9b61fc64…                            | Mismo ID completo                                                         |
| Plantilla regenerada al arrancar    | Sin worker_connections                   | Adaptador persistente añade 4096                                          |
| Corte del supervisor en Windows     | child.kill(SIGTERM), exportación perdida | API local stopped:true, plazo de cierre y terminación forzada de respaldo |

No se tocaron rutas, JWT, CORS, puertos, pools SQL/keep-alive, esquema o funciones.
`nginx -t` y `bash -n` del entrypoint aprobaron. Se recargó y luego se reinició
únicamente Kong para verificar persistencia real: después del reinicio, plantilla
y configuración efectiva mantuvieron 4096, con un worker y nofile suficiente.
Los otros cinco servicios conservaron StartedAt; todos conservaron IDs y montajes.

La orden original de arranque escribe de nuevo `/home/kong/custom_nginx.template`.
Por eso se preservó el entrypoint original y se añadió un bloque marcado
`BARBEXA_K6_CONNECTIONS_4096` que corrige solo esa plantilla antes de preparar Nginx.
El adaptador de Node exige nombre exacto, manifiesto, ausencia de vínculo Cloud,
puerto DB 54722, volumen propio y contenedor Kong sin montajes externos. No puede
aplicarse a las otras pilas. Rechaza aplicación si detecta un proceso k6 activo.

Persistencia: sobrevive a reiniciar el contenedor existente, comprobado realmente.
Una recreación desde la imagen original elimina cambios en su capa escribible:
`node k6/lab-control.mjs start` reaplica idempotentemente el adaptador después del
arranque o sobre el laboratorio ya activo. `run-lab` verifica, sin modificar, y
rechaza una configuración no ajustada. No se afirma haber recreado el contenedor.

## Cierre de k6 y protección de evidencias

Se utiliza el mecanismo de parada documentado por
[Grafana k6](https://grafana.com/docs/k6/latest/reference/k6-rest-api/):
`PATCH /v1/status`, atributos `stopped:true`. El control escucha únicamente en
IPv4 loopback con puerto dinámico; en Windows se consulta el PID propietario antes
de enviar la orden. No se reutiliza un puerto fijo ni se detiene otro proceso.

El primer motivo de interrupción se conserva. Solicitudes repetidas no reinician
el plazo ni duplican el stop. Hay hasta 10 s para finalizar y exportar; riesgo
crítico (<512 MiB o RAM >=97 %) acorta el plazo a 2,5 s, incluso si había una
interrupción previa. Si la API o el proceso no responden, SIGKILL conserva la
seguridad. Un fallo escribiendo el diagnóstico no impide detener el proceso.
Al interrumpir, se evita continuar las consultas costosas de monitorización y
se sigue comprobando memoria crítica mientras se espera el cierre.

Se mantiene la salida nativa de terminal y `--summary-export`; no se introduce
handleSummary ni resultados simulados de rendimiento. Cada corrida nueva registra
configuración del laboratorio, estado del cierre y `summaryExported`. Aunque el
stop de la API devuelva exit 0, `interrupted` impide aprobar una corrida detenida.
No es posible garantizar exportación ante un proceso colgado, terminación forzada,
fallo del disco o agotamiento del host: en ese caso se informa la ausencia del
resumen y no se construye uno artificial.

No cambian tiempos, escenarios ni thresholds. Se conservan RAM >=90 % o <768 MiB
durante 15 s, CPU >85 % durante 30 s, conexiones >=80 % durante 15 s y pérdida de
salud/monitorización. Se retiró el mínimo preventivo residual de arranque frío
4 GiB/80 % de lab-control, usando la misma política adaptativa: estimaciones como
avisos, agotamiento crítico bloqueado. Ninguna protección crítica fue desactivada.

## Verificación y límites de lo acreditado

- 27 pruebas del harness/supervisor aprobadas sin k6 ni tráfico al producto.
  Incluyen cierre ordenado, API indisponible, presión crítica, fallo al escribir
  evidencia, rechazo de propietario ajeno, política RAM e idempotencia de Kong.
- Un proceso **Node de prueba** real en Windows recibió la orden y escribió un
  archivo antes de salir, verificando además el PID del puerto. Ese archivo está
  marcado como prueba del supervisor, no evidencia de rendimiento, y se limpió.
- Seis servicios activos, salud Auth por gateway HTTP 200 y consulta SQL de solo
  lectura con cero reservas/violaciones. 26 migraciones originales y sus copias
  conservan hashes. 43 archivos existentes de campaña y puntero sin cambios.
- No se ejecutó k6, ni siquiera humo. La exportación final del proceso k6 real
  queda pendiente de la siguiente ejecución manual del responsable. No se acredita
  1.000 VU por haber aumentado el límite; el antecedente sigue en 400 VU/60 s.

## Respaldos y repetición manual

Copias exactas anterior/posterior de plantilla, configuración efectiva y entrypoint,
más SHA256 del cambio, bajo:

`.artifacts/k6/supabase-lab/kong-tuning/2026-11-26T05-14-01.878Z-7bf68318-d487-45cc-bdf1-509bd3a140a7/`

Los archivos `.before` permiten revertir esos tres archivos; una reversión debe
validar Bash/Nginx y recargar únicamente Kong con las mismas guardas. No borrar
contenedores/volúmenes ni usar reset para revertir. El adaptador automático debe
retirarse también si se decide abandonar 4096. No se ejecutó reversión.

Inventario previo, verificación de identidades/volúmenes, integridad y preservación:
`.artifacts/k6/optimizations/2026-11-26/verification.json` y
`campaign-before.json`. Las evidencias de intentos anteriores no se regeneraron.

Comandos, desde la raíz en PowerShell:

```powershell
node k6/kong-tuning.mjs verify
node k6/lab-control.mjs integrity
# Después de cerrar Codex:
npm run test:carga -- stress
```

Se actualizó solo el harness k6, su guía y la continuidad documental. Sin cambios
de producto, migraciones originales, Cloud, GitHub Actions, commits ni push.
