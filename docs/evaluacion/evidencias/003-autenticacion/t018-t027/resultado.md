# Sesión y contexto — cierre del bloque T018–T027

14/11/2026. Git main, HEAD `0ccd33c` comprobado; se conserva el trabajo local anterior.
**003: 24/36**. No commit ni push. El estado comunicado anteriormente por el usuario
no se sustituyó por una supuesta base limpia: existen cambios autorizados de 003 y log activo.

| Tarea | Estado y evidencia |
| --- | --- |
| T018 | Completa: invalidación Web por claves, sin valores/tokens en mensajes; SDK BroadcastChannel propio cerrado, sin parche global. Logout offline/storage fallido con pruebas; usuario acreditó multipestaña y recorrido de historial. |
| T019 | Pendiente: no se acreditaron tres recorridos completos SC-001 por plataforma ni todos los escenarios reales SC-002; no repetir los aprobados. |
| T020 | Completa: RED de restauración/carreras y adaptador, después GREEN. |
| T021 | Completa: getSession seguido de getUser, perfil requerido, generación de credenciales, deduplicación, refresh/AppState/foco y descarte tardío. |
| T022 | Completa: resolución pública/reintento sin perfil privado, denegación distinta de red y limpieza de listeners. |
| T023 | Pendiente: vigente/reapertura/red acreditadas manualmente; falta matriz real completa renovable/definitivamente inválida × arranque/foco en Web y Android, incluidos conteos/tiempos sin tokens. Mocks y bundles no la sustituyen. |
| T024 | Completa: RED inicial de contexto; unitarias e integración cubren cero/una/varias, inactivas, preferencia obsoleta, respuesta tardía, revocación y roles. |
| T025 | Completa: reutiliza listOwnMemberships/getBarbershop de 002, preferencia por cuenta/proyecto revalidada, retiro previo y ningún rol global. |
| T026 | Completa: ruta/contexto accesible, nombre y rol por barbería, selección/cambio, carga/vacío/error/reintento; sin acciones de negocio. |
| T027 | Completa: SQL/HTTP local real, recorridos Web/Android del usuario, revocación verificada y limpieza selectiva con cero residuos. |

T014 conserva sus pendientes anteriores. T028–T036 no se ejecutaron. Las dependencias
técnicas de sesión/contexto se implementaron conforme a la instrucción de continuar
sin bloquear trabajo independiente por matrices manuales pendientes; no se cerraron estas
matrices artificialmente. Recuperación de contraseña T028–T032 sigue siendo necesaria
antes de la evaluación final.

## Código y decisiones de seguridad

Núcleo: `session-coordinator.ts`, `tenant-context.ts`, puertos y estados propios.
Infraestructura: `supabase-auth-adapter.ts`, `session-storage.web.ts`; composición:
`auth-composition.ts`, auth-platform, auth-provider y registration-runtime-provider.
Presentación: `use-auth.ts`, account-screen, context-screen, rutas account/context y
layout protegido. Se actualizó una frase obsoleta de confirmación; no se rediseñó UI.
Fixtures: `scripts/local-auth-context-fixtures.mjs`, exclusivo operador local, no cliente.

- Un refresh del mismo actor no equivale a cambio de cuenta. La regresión específica
  primero obtuvo signed-out incorrectamente y después pasó al separar su invalidación.
- Verificación fuera del callback SDK, sin segundo cliente, sin tokens en React o mensajes.
  El cierre del BroadcastChannel **propio** usa una guarda del SDK fijado en 2.119.0;
  es una dependencia interna a revalidar si se actualiza el SDK, no protección contra XSS.
- Marcador normal/pending/recovery evita restaurar una sesión de recuperación como cuenta
  ordinaria. Sesiones anteriores sin marcador requieren una autenticación nueva una vez.
- Preferencia guarda solo el ID del contexto, por namespace y usuario; no autoridad ni rol
  persistido. Cada resolución consulta membresías y barberías autorizadas actuales.
- Auth válido no se cierra por denegación de tenant. Red no concede autorización desde caché.
- El cliente no usa claves administrativas; el operador de fixtures las mantiene solo en
  memoria fuera del bundle. Los datos ficticios ignorados se retiraron tras la limpieza.

## Verificación ejecutada y fallos preservados

[Registro de comandos/códigos](verificaciones.json), [unitarias](unit-final.log),
[integración/presentación](integration-final.log), [grafo real](architecture-final.log).
129/129 unitarias; cobertura del núcleo del runner: 100% líneas/funciones,93,48% ramas.
73/73 integración/presentación afectadas; no atribuir esa cobertura a UI, SDK o Hermes.
Tipos, lint, formato y arquitectura: código 0. Grafo:72 módulos,18 del núcleo,181 aristas.
[Metro](metro.json): Web/Android HTTP200, módulos nuevos presentes, sin sondas temporales;
los tiempos de bundling no miden restauración de sesión ni acreditan un dispositivo.

Lint/formato afectaron authentication (src y tests/integration), las composiciones citadas,
layout/rutas account, los dos nuevos tests de presentación y el operador local. Prettier
incluyó además los nuevos tests unitarios. No batería completa histórica 001/002, SQL global,
Cloud, instalación, nuevo APK ni npm audit repetidos. Los RED y el lint inicial con tres
warnings se conservaron como resultados iniciales; se corrigieron sin relajar expectativas.
La expectativa de composición se precisó para incluir identidad/membresías nuevas: cuatro
llamadas con un GET de perfil y uno de membresías, sin eliminar la regresión previa.

## Evidencia manual y limpieza

[Confirmación del usuario](manual-confirmado.md), [comprobación SQL/HTTP 11/11](t027-verificacion.json),
[revocación invocada por el usuario](t027-revocacion.json),
[cotejo previo a borrar](t027-prelimpieza.json), [limpieza](t027-limpieza.json).
Solo local app-barberia-002-local, puerto54422/API54421; identidad/red/volumen cotejados.
Se identificaron 3 cuentas/perfiles,2 barberías,4 membresías; cero dependencias ajenas,
revocación efectiva inactiva y propiedad confirmada antes de borrar. Cero residuos propios,
huellas de datos anteriores conservadas; ninguna cuenta anterior eliminada.
[Consulta posterior](t027-postlimpieza.json): cero sesiones/identidades Auth del conjunto
y cero perfiles/membresías huérfanos. Credenciales ficticias retiradas de los archivos
ignorados. No se promete invalidación instantánea de JWT ya emitidos: los recursos y
sesiones propios fueron retirados y el verificador de usuario permanece obligatorio.

## Próximo trabajo y riesgos

004 está en `specs/004-mvp-reservas/`: borrador spec/plan/modelo/contratos/validación y
34 tareas, **0 ejecutadas**, pendiente de revisión/aprobación. Primer bloque propuesto
T001–T007: guardas del runner, RED SQL, catálogo mínimo/RLS y puertos; después oferta,
confirmación transaccional, agenda y demo Android→administrador Web. Sin SQL ni backend
004 creado en este bloque. Invitaciones solo a barbero existente con aceptación; no
promoción a administrador, correo de invitación ni pagos en este MVP.

Nueve avisos npm moderados y riesgo XSS residual siguen documentados, sin auditoría
aprobada ni remediación. Cloud/origen HTTPS y operaciones futuras necesitan autorización.
No se modificaron RLS/JWT/Kong/GoTrue, contenedores anteriores, dependencias ni log activo.
[Cotejo de 484 archivos protegidos](conservacion.json): ninguna diferencia frente a la
línea base disponible. Cambios Git del log se registran separados del resto.

Revisión final: [secretos](revision-secretos.json), [enlaces/trazabilidad](revision-documental.json),
[estado Git](revision-git.json). El escaneo estático no es una auditoría de seguridad.
Diff global:2 por el log activo conocido; excluyendo únicamente ese log:0. Ningún contenido
añadido al staging ni commit/push en este bloque; se conserva la intención de añadir eas.json
que ya existía. Main continúa en0ccd33c y se conservan todos los cambios autorizados previos.
