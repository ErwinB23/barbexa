# T028 — límites del backend — 11/11/2026

**Resultado:** revisión completada para FR-007 y contribución parcial a SC-006.
No acredita el cierre de la funcionalidad ni de toda la matriz de evaluación.
Rama `main`, HEAD `904ff3de1a612ddb849a3f9a3a957df2e5d0b3c3`, con cambios locales
T020–T027 preservados. No se ejecutaron T029–T040.

## Composición actual y grafo revisado

`src/app/_layout.tsx` monta `AppProvider`, que expone exclusivamente la función
del caso de uso por `InformacionAplicacionContext`. `useAppInformation` consume
esa función; la pantalla técnica consume el hook, sin importar infraestructura.
`src/composition/app-composition.ts` conecta `CrearAdaptadorInformacionLocal` con
`ConsultarInformacionAplicacion` por `InformacionAplicacionGateway`.
El caso de uso depende del contrato y del validador de dominio; el adaptador
depende del contrato propio. El proveedor inyecta únicamente nombre, versión y
descripción públicos. No hay identidad, tenant ni persistencia en esta operación.

La auditoría real registra 20 módulos, 4 de núcleo y 33 aristas locales, sin
infracciones. El inventario de imports se conserva en [t028-limites.log](t028-limites.log)
y el análisis de alias, tipos y dependencias transitivas del checker en
[t028-check.log](t028-check.log). El checker y sus reglas no se modificaron.

## Incorporación futura, según el contrato aprobado

| Lado / responsabilidad | Composición e integración previstas, aún no implementadas |
| --- | --- |
| Cliente | Contratos propios por funcionalidad para identidad, reservas y archivos. La composición cliente conectará casos de uso con adaptadores SDK/HTTP; las pantallas no instanciarán SDK ni adaptadores. |
| Auth | El adaptador cliente gestionará la interacción con Supabase Auth. La entrada de servidor verificará la sesión y traducirá la identidad autenticada a contexto propio; el cuerpo HTTP no acredita identidad ni permisos. |
| Servidor | `supabase/functions/<operacion>/index.ts` será entrada y composición independiente. Dominio y aplicación de servidor conservarán tipos y puertos propios; los adaptadores encapsularán Supabase, HTTP y persistencia. Esas rutas son diseño futuro, no archivos existentes. |
| Reservas / datos | `SolicitarReserva` → `ReservaHttpAdapter` → Edge Function → `ConfirmarReserva` → `PostgresReservaAdapter` → PostgREST RPC → PostgreSQL. Puertos `ReservaRemotaGateway` y `ReservaAtomicaGateway`. PostgreSQL revalidará autorización contextual, membresía activa, barbería, precio y disponibilidad; transacción y restricciones protegerán atomicidad y concurrencia. |
| Storage | Adaptador cliente transferirá archivos bajo políticas; servidor autorizará asociar, sustituir o retirar referencias. PostgreSQL conservará referencias y metadatos. Se diseñará recuperación ante fallos parciales: Storage y PostgreSQL no comparten una transacción. |

No se necesita API Node propia, microservicios de negocio ni rutas Expo `+api`.
El código servidor futuro permanecerá fuera del bundle del cliente. No se crearon
carpetas vacías ni se adelantó implementación de esas integraciones.

## Ausencias comprobadas y límites

Revisión de los 20 módulos de `src`, `package.json`, `package-lock.json`, `app.json`
y estructura actual: sin paquete `@supabase/*` instalado, imports activos de SDK de
backend, llamadas remotas identificadas, API Node, rutas `+api` ni carpetas Supabase.
No se encontraron firmas conocidas de claves privadas, claves secretas Supabase,
JWT o asignaciones de service-role en los 22 archivos cliente/manifiestos inspeccionados.
El verificador solo imprime rutas y reglas, nunca valores candidatos a secretos.

Comando reproducible, salida 0:

```powershell
node docs/evaluacion/evidencias/001-fundacion/verificar-limites-backend.mjs
```

Es una inspección acotada y revisión del grafo actual, no una auditoría integral
de secretos, historial, dependencias o seguridad. Las firmas no detectan todas las
credenciales posibles. No se inspeccionan ni publican credenciales externas.
La información local no demuestra aislamiento multitenant, RLS, permisos reales,
transacciones, concurrencia ni políticas de Storage. Todo ello requiere integración
y pruebas posteriores contra el backend real.

## Verificaciones y compatibilidad Node/Metro

`npm.cmd run check` terminó en 0: TypeScript app/núcleo, ESLint, Prettier,
checker real, 38/38 regresiones arquitectónicas, 53/53 unitarias compiladas y
6/6 pruebas de presentación. Cobertura del núcleo ejecutable: 100 % en líneas,
funciones y ramas; no es cobertura de UI. [Salida completa](t028-check.log).

Las tres importaciones ejecutables corregidas para Metro permanecen sin extensión.
Las importaciones `.js` de tests y tipos se conservan. El runner compila con NodeNext
a CommonJS y las pruebas ejecutan los `.js` emitidos; esta ejecución confirma la
compatibilidad Node actual. La [exportación Android anterior](t027-metro-android-final.log)
aprobó con Hermes; no se repitió el empaquetado en T028 porque no cambió código ni
configuración. No se ejecutó la validación final de T032.

La checklist `requirements.md` tiene 16 marcadores completos y cero pendientes.
El script Spec Kit de prerrequisitos fue bloqueado por la política de PowerShell;
se verificaron manualmente `.specify/feature.json` y los documentos requeridos,
sin alterar esa política. No existen hooks en `.specify/extensions.yml`.
Se revisaron los ignores existentes; no requirieron cambios. Los logs de evidencias
se conservan deliberadamente. [Integridad](t028-integridad.json).

## Android y pendientes

El usuario confirmó que, tras la corrección Metro, la aplicación vuelve a funcionar
en Honor 90 Lite, Android 15, Expo Go 58.0.5. **Origen: prueba manual declarada por
el usuario; no ejecutada por Codex.** Esta confirmación no acredita nuevos recorridos
detallados, prueba manual de error/reintento, TalkBack ni escala exacta de texto.

El escalado exacto al 200 % y el análisis de las 11 vulnerabilidades moderadas
previamente reportadas continúan pendientes. No se ejecutó `npm audit fix` ni se
declaró superada una auditoría de seguridad. No se instalaron paquetes, conectó
Supabase, modificó documentación arquitectónica aprobada ni hizo commit/push.
