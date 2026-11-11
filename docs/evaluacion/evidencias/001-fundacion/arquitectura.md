# Verificador arquitectónico — T010 y T011

Base: rama main, HEAD b7484843c93902ca7ff8eb9f3d92c48fe510e6dd.
Los cambios locales de T007–T009 se conservaron; manifiesto previo externo:
`../arquitectura-t010-antes.json`, relativo a la raíz del repositorio.

## Implementación

`scripts/check-architecture.mjs` usa exclusivamente TypeScript instalado y módulos Node.
Lee tsconfig (incluidos extends/paths), resuelve con resolveModuleName, inventaría todo
el código bajo src y rechaza fuentes excluidas, enlaces, referencias locales fuera
del conjunto auditado, errores de sintaxis y roles desconocidos. No ejecuta las fuentes.

Reconoce dominio, aplicación, infraestructura y presentación por funcionalidad, UI
compartida, composición y rutas. Dominio solo depende de dominio del mismo módulo;
aplicación, de aplicación/dominio propios. Infraestructura y presentación pueden usar
su núcleo; presentación puede usar UI compartida. Composición conecta concreciones;
rutas solo dependen de presentación, composición, rutas y React/Expo Router.
Se rechazan inversiones, módulos cruzados y barrels sin responsabilidad identificada.

Analiza imports normales, tipos, import type queries, reexports, import-equals, imports
dinámicos y require literales; rechaza llamadas no literales y alias globales de require.
Incluye referencias triple-slash y globals de plataforma en núcleo, distinguiendo
identificadores locales y nombres de propiedades. Recorre el cierre transitivo de
imports/reexports/tipos desde cada módulo del núcleo y detecta ciclos del grafo.
Los SDK externos solo pueden quedar fuera del grafo en capas autorizadas; su existencia
debe poder resolverse. No se audita el código interno de terceros ni se certifica
seguridad dinámica o comportamiento de negocio mediante este análisis estático.

Salida: número de módulos, núcleo y aristas; rutas y roles inspeccionados; errores con
archivo, dependencia/cadena y regla. Violaciones o análisis incompleto devuelven exit 1.
Uso: `node scripts/check-architecture.mjs [--project ruta/tsconfig.json]`.

## Pruebas ejecutadas y resultados

Comando reproducible:

```powershell
node --test tests/architecture/check-architecture.test.mjs
```

- [Fallo inicial](arquitectura-red.log): antes de implementar el checker. Los casos
  válidos no podían devolver éxito y los inválidos carecían del diagnóstico esperado.
- Se corrigió un error del fixture en Windows: el nombre de directorio node:fs contenía
  dos puntos. No fue un fallo arquitectónico de la aplicación.
- [Rojo adicional](arquitectura-escapes-red.log): cuatro casos detectaron huecos reales
  de require indirecto, referencias de tipos/lib y acceso a SDK desde rutas; luego se
  implementaron sus rechazos sin cambiar los resultados esperados.
- [Resultado final](arquitectura-fixtures.log): **38/38**, suite exit 0. Cinco casos
  válidos devuelven exit 0; 33 inválidos devuelven exit 1 y el diagnóstico de regla esperado.
  Cada caso registra la salida del checker y su exit code.
- [Calidad](arquitectura-calidad.log): ESLint sin warnings y Prettier, ambos exit 0,
  solo sobre los tres archivos nuevos de implementación/pruebas.

Cobertura funcional de fixtures: capas válidas, alias válido, globals locales permitidos,
SDK en adaptador/presentación, imports locales dinámicos literales; externos React Native,
Supabase y Node en núcleo; tipos externos; reexports; transitividad; alias a infraestructura;
inversiones entre dominio/aplicación y presentación/infraestructura; rutas a infraestructura;
internals entre módulos; referencias no resueltas; import type query; require externo;
import/require no literales; ciclo; fetch/XMLHttpRequest/WebSocket/process/eval/globalThis;
barrel mixto; archivo excluido del tsconfig; sintaxis inválida; núcleo y src vacíos;
require indirecto; referencias de tipos Node y lib DOM; SDK en ruta.

Los fixtures están declarados en `tests/architecture/fixtures/cases.mjs` y se materializan
en temporales independientes; sus ubicaciones se registran en el log. No se crea src
ni código de negocio ficticio en el proyecto.

## Límites y cierre

`node scripts/check-architecture.mjs` sobre este proyecto devuelve **exit 1, EMPTY_CORE**:
modules=0, core=0, edges=0. [Registro](arquitectura-proyecto-pendiente.log).
Esto comprueba el rechazo del núcleo vacío; **no es una auditoría real aprobada**.
La verificación de todos los módulos reales sigue pendiente de T026. TS18003 permanece
esperado hasta que existan fuentes. La integración de scripts/npm test corresponde a T012,
por lo que no se modificó package.json ni se ejecutó npm test sin script disponible.

T010 y T011 se completan por sus pruebas del checker. No se ejecutaron T012–T040,
instalaciones, cambios de versiones, commit ni push. No se modificaron documentos aprobados.
Persisten los riesgos previos de dependencias (11 vulnerabilidades moderadas pendientes
de análisis y aviso de soporte de ESLint 9); este verificador no es una auditoría de seguridad.
Fecha, hashes de preservación y Git: [integridad](arquitectura-integridad.json).
