# Sprint 2 — revisión y propuesta de publicación

26/11/2026. **Solo preparación. No se hizo staging, commit, push, fetch ni una
nueva ejecución de Actions.** Destino previsto: `ErwinB23/barbexa`, que debe
conservarse privado; esta actividad no cambió ni volvió a consultar su visibilidad.

## Estado de Git revisado

- Rama `main`, 23 commits; HEAD `a758dfacceb0323ce11454be7041b1b1daad4a69`.
- `origin`: `https://github.com/ErwinB23/barbexa.git`.
- La referencia **local almacenada** `origin/main` coincide con HEAD; no es una
  comprobación nueva del servidor GitHub. Índice sin cambios preparados.
- Al comenzar: nueve archivos versionados modificados y 212 archivos nuevos
  candidatos. [Inventario actual por archivo](archivos-publicacion.csv) y
  [revisión verificable](revision-publicacion.json) incluyen esta documentación nueva.
- `package.json` añade solo dos comandos k6; no cambia dependencias ni lockfile.
  `care-race.mjs` incorpora observación opcional de locks para la prueba entre
  actores; pertenece al harness, no al producto. Las demás modificaciones previas
  corresponden a documentación, herramientas de laboratorio y evidencias.

## Selección propuesta

| Publicar tras autorización | Motivo |
| --- | --- |
| `k6/`, `scripts/k6-preflight.ps1` y los dos comandos npm | Laboratorio aislado, contratos reales, guards, aprovisionamiento y supervisores reproducibles; sus fixtures privados no forman parte del código |
| `tests/availability/`, `tests/e2e/eq09/` y cambio de `tests/integration/booking/care-race.mjs` | Código de las evaluaciones, políticas y pruebas acotadas; no sesiones ni resultados nativos privados |
| Informes/JSON/CSV/gráficas de lectura, mixta y EQ-05; EQ-08/EQ-09 y cierres acotados | Evidencias agregadas/sintéticas ya sanitizadas; preservar intentos no aprobados y límites metodológicos |
| README, este índice, guía, matrices, estado y handoff actualizados | Acceso de la docente y continuidad; referencias históricas no conceden autorización para repetir operaciones |
| [Copias sanitizadas](evidencias/copias-sanitizadas.json) | Logs de verificación existentes sin prefijos de máquina/ANSI y proyección de cobertura aceptada, con SHA de origen |

| Mantener exclusivamente local | Protección |
| --- | --- |
| `.env*` salvo `.env.example`, claves privadas, credenciales, tokens, sesiones | No publicar aunque un dato corresponda al laboratorio |
| `.artifacts/k6/`, `.artifacts/eq05/`, `.artifacts/eq09/` y resto de `.artifacts/` | Manifiestos, usuarios, passwords, JWT, traces, reportes nativos, ledger crudo y contenedores/configuración de la máquina |
| `node_modules/`, `.expo/`, `.test-build/`, `coverage/`, `dist/`, `build/`, `ci-artifacts/` | Dependencias y salidas regenerables; publicar solo agregados de cobertura sanitizados |
| Logs nuevos ignorados, HAR, dumps, respaldos y archivos temporales | No forzar su incorporación con `git add -f` |
| Tres vistas de QA de `eq05/graficas/`: `informe-pagina-3.png`, `informe-vista-conjunta.png`, `vista-conjunta.png` | Contact sheets de revisión regenerables; las tres gráficas finales y ambos PDF académicos sí se proponen |

La fuente de selección exacta es el CSV: `PROPOSED_PUBLISH` frente a
`LOCAL_ONLY_QA_PREVIEW`. No usar `git add .` como sustituto de esa revisión.
Una ruta privada mencionada por un informe original no autoriza incluirla.

## Revisión de exposición

Se revisó el contenido del checkout versionado y los candidatos nuevos. El escaneo
dirigido no detectó JWT, tokens de GitHub, claves privadas o claves de proveedor.
Se inspeccionaron también texto y metadatos de los cinco PDF y las evidencias
visuales sintéticas de EQ-09. Las dos asignaciones nuevas con nombres de secreto
son valores deliberadamente ficticios de tests; no credenciales válidas.

| Severidad | Hallazgo confirmado | Tratamiento |
| --- | --- | --- |
| Crítica/alta | Ningún secreto real detectado en el alcance revisado | No equivale a garantía absoluta ni a una nueva auditoría de todo el historial |
| Informativa, confianza alta | 300 logs históricos ya están versionados aunque hoy coincidan con `.gitignore` | El ignore no los elimina del índice ni del historial. No se retiraron ni modificaron; no añadir crudos nuevos |
| Informativa, confianza alta | Historial/archivos anteriores conservan identidad de autor y rutas de la estación de trabajo | Advertencia previamente conocida; mantener privado. No reescribir historial. Una futura exposición pública necesitaría revisión y autorización específicas |
| Informativa, confianza alta | Informes originales enlazan algunas evidencias crudas solo locales | Se conservan como trazabilidad histórica; el índice prioriza agregados publicables y copias sanitizadas, sin copiar traces ni manifiestos |
| Informativa, confianza alta | E2E y generadores PDF tienen requisitos de herramientas del operador | No son nuevas dependencias npm de la app ni pasos actuales del CI. No afirmar que `npm ci` instala Chromium/Playwright o Python/ReportLab |

Las diez URL con forma de conexión se encuentran en fixtures negativos/locales
de tests; las demás coincidencias de asignación fueron inspeccionadas como código,
campos de API o valores ficticios. No se publican sus valores en esta revisión.
Las claves/secretos dinámicos solo se leen o generan para manifiestos ignorados.
No se realizó una nueva auditoría de CVE: no cambiaron dependencias del producto.

Los originales se mantienen en su ubicación, sin redacciones destructivas.
`evidencias/copias-sanitizadas.json` registra fuente, SHA y transformación de cada
copia. La extracción de cobertura conserva fecha y commit probado; no finge una
ejecución nueva. El script de revisión requiere custodia local de esas fuentes
ignoradas; no se añade al workflow ni se presenta como comprobación autónoma de
un checkout sin evidencias privadas.

## Commits propuestos, todavía no creados

| Orden | Mensaje | Selección y dependencia |
| --- | --- | --- |
| 1 | `test(k6): versionar laboratorio aislado y supervisores de carga` | Grupo `1-instrumentacion-k6`: todo `k6/`, preflight PowerShell y comandos npm. Mantener juntos los módulos compartidos; no incluir ningún fixture generado |
| 2 | `test(calidad): incorporar casos EQ y monitor local de disponibilidad` | Grupo `2-harness-calidad`: availability, E2E y care-race. Depende de los puertos/helpers de laboratorio del primero |
| 3 | `docs(sprint2): consolidar entrega y evidencias sanitizadas` | Grupo `3-documentacion-evidencias`: informes/tablas/gráficas, copias seguras, README/índice/guía, matrices, estado y handoff |

No separar por funcionalidad cuando los harness comparten contratos, laboratorio
y helpers. Si la comprobación de dependencias muestra que una frontera no es
reproducible, agruparla antes de confirmar. Los 23 commits previos se conservan.
El número de archivos por grupo está en `revision-publicacion.json`.

Tras autorización futura: revisar selección exacta, cambios staged, secretos y
enlaces; comprobar que ningún archivo necesario quede omitido; validar el estado
versionado en copia limpia con `npm ci`, `npm run check`, OpenAPI y exportación Web.
Esto no requiere repetir k6, Playwright ni EQ-05. Ante un fallo, diagnosticar antes
de tocar producto o workflow. Publicar solo `main`, sin force push ni cambios de
visibilidad. Nada de ese procedimiento mutante se ejecutó ahora.

## Verificación de GitHub Actions después de la publicación

1. Confirmar acceso de la docente y que `ErwinB23/barbexa` siga privado. Verificar
   cuota/condiciones gratuitas disponibles antes del push, sin contratar servicios.
2. Registrar el SHA final de `main` y comprobar, después del push autorizado,
   coincidencia local/remota y número de commits. No reutilizar un SHA anterior.
3. Abrir la pestaña Actions y el workflow `Quality` de `.github/workflows/quality.yml`.
   El push a `main` ya inicia una ejecución; **no pulsar Run workflow** ni reenviar
   el push para duplicarla. Seleccionar el run cuyo commit corresponda al SHA final.
4. Comprobar pasos: `npm ci`; `npm run check` (tipos, arquitectura, lint/formato y
   pruebas seguras); reporte/gate de cobertura Deno; validación OpenAPI; exportación
   Web sin credenciales; preparación de evidencias sanitizadas.
5. Confirmar artefacto `quality-evidence`: cuatro agregados JSON de cobertura
   cliente/servidor, validación API y compilación Web. No contiene informes crudos,
   perfiles V8, fixtures o sesiones. Retención configurada: siete días; descargar
   la copia sanitizada para la sustentación antes de que expire.
6. Guardar URL del run, SHA, conclusión y metadatos de los artefactos. Si falla,
   conservar diagnóstico y no afirmar cierre de la versión nueva. Si sigue activo,
   informar estado/enlace, sin iniciar otra ejecución.

La [primera CI aprobada](https://github.com/ErwinB23/barbexa/actions/runs/45696792837)
es histórica, no acredita estos cambios aún locales. La advertencia no bloqueante
de acciones basadas en Node.js20 permanece como mantenimiento técnico pendiente;
no se modificaron acciones ni workflow. El pipeline no ejecuta k6, E2E local con
Docker, la hora EQ-05 ni despliegues; esas evidencias se conservan por separado.

## Alcance que no se cierra artificialmente

EQ-02/08/09 siguen parciales por condiciones originales. EQ-05 cumple la adaptación
de una hora local, no el mes del servicio publicado, y requiere aceptación docente.
2.000 VU es una meta adicional pospuesta; no condiciona EQ-04/EQ-06 ya acreditados.
Android nativo, CD/despliegue público y DNS/CDN no se declaran completos. No se
modificaron funcionalidades, Cloud, migraciones ni GitHub Actions.
