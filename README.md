# BARBEXA

Plataforma SaaS multitenant para gestionar barberías, reservar citas y coordinar atención y recepción manual de pagos. **Código público; no implica un servicio desplegado públicamente.**

[Guía académica del Sprint 2](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin#implementación-funcional--barbexa) · [Documentación y entregables](docs/entrega/sprint2/INDICE.md) · [CI aprobada: e139522](https://github.com/ErwinB23/barbexa/actions/runs/45903177680)

## Funcionalidades y perfiles

| Perfil | Responsabilidades implementadas |
|---|---|
| Cliente | Explorar, reservar, consultar/reprogramar citas, gestionar perfil, notificaciones e invitaciones |
| Barbero | Agenda propia, horarios/bloqueos, perfil profesional, atención y registro manual de pagos autorizados |
| Administrador de barbería | Datos del negocio, equipo, servicios, horarios, políticas, invitaciones y agenda contextual |

Los roles se combinan por membresía: un propietario puede trabajar como barbero y un trabajador puede recibir administración de una barbería. No existe administrador global. Efectivo y Yape requieren confirmación manual autorizada; el código remitido por el cliente no verifica automáticamente el ingreso.

## Estado actual

Versión Web recorrida manualmente para cuatro perfiles operativos, con backend integrado y evidencia E2E. **Versión evaluada: `e139522`**, con CI aprobada en 9 min 36 s. El historial continúa evolucionando después de esa referencia.

Seis EQ acreditados en sus escenarios; cuatro parciales: EQ-02/05/08/09. EQ-05 acredita una hora local, no disponibilidad mensual ni del servicio publicado; la adaptación requiere aceptación docente. Android nativo, mapas/imágenes/reseñas, CD, DNS/CDN y despliegue público conservan pendientes. Lecturas 1.000 VU y mezcla 100 VU no son equivalentes; **2.000 VU** siguen como requisito académico pendiente. [Estado y límites](docs/evaluacion/evidencias/eq05/SITUACION-SPRINT2.md).

## Stack y arquitectura

- **Cliente:** Expo 58, React Native, React, Expo Router y TypeScript.
- **Backend:** Supabase Auth, Edge Functions/Deno, PostgREST y PostgreSQL. Storage pertenece al alcance previsto de archivos; no se declara cerrado.
- **Organización:** cliente-servidor y Clean Architecture modular, con puertos/adaptadores y composición explícita. Node.js es herramienta de desarrollo/pruebas, no una API propia de negocio.
- **SDD:** [Constitución](.specify/memory/constitution.md), [18 especificaciones](specs/), planes/tareas y decisiones trazables.

```text
src/
  app/             Rutas Expo Router
  composition/     Composición de dependencias
  features/        Dominio, aplicación, infraestructura y presentación por módulo
  shared/          Contratos y componentes compartidos
supabase/
  functions/       Entradas Edge y módulos de servidor
  migrations/      Modelo, RLS, RPC, índices y restricciones versionadas
tests/             Pruebas cliente/servidor, integración, arquitectura y evaluaciones
specs/             18 especificaciones SDD
docs/              OpenAPI, arquitectura, informes y entrega
k6/                Laboratorio y supervisión de carga aislados
scripts/           Comprobaciones, cobertura y herramientas de desarrollo
```

[Flujo real y SOLID](docs/evaluacion/evidencias/004-reservas/calidad.md) · [Independencia del núcleo](docs/evaluacion/evidencias/eq08/INFORME.md). PostgreSQL revalida identidad, tenant, precio y disponibilidad y confirma las escrituras en una transacción; el catálogo cacheado no concede autoridad.

## Requisitos e instalación

Para las herramientas del proyecto: Node 24.21.0, npm y dependencias del lockfile. Para los checks del servidor: Deno 2.9.8. Estas son las versiones utilizadas por la CI, no una instalación automática del backend.

```powershell
npm ci
```

Un backend Supabase correctamente configurado es un requisito independiente. El laboratorio local usa Docker y sus manuales específicos; no se crea, migra ni restaura mediante `npm ci`. Playwright/Chromium, k6 y Python/ReportLab/PDFium/Pillow son herramientas adicionales de evaluación o regeneración de informes, no requisitos para leer la documentación ni dependencias npm que este comando instale automáticamente.

## Configuración segura del entorno

[Ejemplo cliente](.env.example) y [ejemplo servidor](supabase/functions/.env.example). Configurar privadamente `.env.local` según el entorno autorizado; no sobrescribir una configuración existente solo para seguir esta guía.

- `EXPO_PUBLIC_*` se incorpora al cliente: únicamente URL, claves públicas y opciones públicas. Nunca service-role, contraseñas, secretos OAuth o claves de correo.
- `local` es el modo de desarrollo predeterminado. En Web apunta a `http://127.0.0.1:54421`, con origen/callback `http://localhost:8081`.
- Los perfiles Cloud/producción tienen validaciones y gates propios; la URL pública de un proyecto no acredita su configuración ni autoriza cambiar Cloud.
- Sesiones, fixtures, backups y traces permanecen ignorados. Los ejemplos contienen placeholders; no copiar claves de otro entorno.

## Ejecutar la aplicación Web

El script existente `npm run start` ejecuta `expo start --go --lan`. Desde la raíz:

```powershell
npm run start -- --web --port 8081
```

Abrir `http://localhost:8081`. Mantener ese origen para los callbacks existentes. El comando inicia Metro/Web; no inicia Auth, Edge, PostgREST o PostgreSQL.

| Servicio | Entorno habitual local | Laboratorio de evaluación |
|---|---:|---:|
| API/Auth/REST/Edge | 54421 | 54721 |
| PostgreSQL | 54422 | 54722 |
| Metro Web | 8081 | Solo cuando una evaluación específica lo prepara |
| Swagger | 8082 o 8083 | No necesita backend para explorar el contrato |

Antes de iniciar la Web, comprobar que el backend del entorno autorizado esté disponible y que sus URL, origen y callbacks coincidan con la configuración privada. El entorno habitual y el laboratorio de evaluación son independientes; no intercambiar sus puertos ni restaurar servicios de forma automática.

## API: OpenAPI y Swagger

[Contrato OpenAPI 3.0.3](docs/api/openapi.json): **26 rutas y 32 operaciones HTTP**. Los 33 comandos de negocio contrastados se distinguen del conteo HTTP.

```powershell
npm run docs:api
npm run docs:api -- --port 8083
```

URL predeterminada `http://127.0.0.1:8082`; terminal muestra la URL exacta y cómo resolver un puerto ocupado. Visor vinculado a 127.0.0.1, **sin ejecución interactiva de operaciones**. No hay que iniciar el backend para consultar el contrato. [Script](scripts/serve-api-docs.mjs).

## Pruebas y cobertura

Node Test, Deno Test e integración SQL son las alternativas a Jest aceptadas para esta entrega.

| Comando existente | Alcance |
|---|---|
| `npm run architecture:check` / `npm run architecture:server` | Límites de dependencias cliente/servidor |
| `npm test` | Suites seguras Node: núcleo, integración/presentación y controles adicionales |
| `npm run test:server` | Suite Deno del servidor |
| `npm run coverage:client` | Runner cliente y cobertura del núcleo |
| `npm run coverage:server` | Pruebas y cobertura Deno |
| `npm run check` | Gates integrados de tipos, lint/formato, arquitectura y pruebas |

| Cobertura del núcleo evaluado | Cliente | Servidor |
|---|---:|---:|
| Líneas | 100 % | 100 % |
| Funciones | 100 % | 100 % |
| Ramas | 93,14 % | 100 % |

[Datos de cobertura con fecha y commit probado](docs/entrega/sprint2/evidencias/cobertura-aceptada.json). No son cobertura total de UI ni una ejecución nueva. [Pruebas](tests/) · [E2E Web acreditado](docs/evaluacion/evidencias/eq09/INFORME.md).

Ejemplo rápido sin backend ni monitorización real:

```powershell
node --test tests/availability/eq05-policy.test.mjs
```

Verifica la política de evaluación y el tratamiento de datos ausentes. Los casos de negocio se encuentran, por ejemplo, en [confirmación cliente](tests/unit/reservations/confirmation.test.ts) y [servidor](tests/server/reservations/confirmation.test.ts).

## Integración continua

[Quality](.github/workflows/quality.yml) ejecuta `npm ci`, checks, cobertura, OpenAPI y exportación Web sin credenciales de la estación. Artefacto `quality-evidence`: agregados sanitizados con retención de siete días; su disponibilidad depende de esa retención.

- **[CI de e139522 aprobada · 9 min 36 s](https://github.com/ErwinB23/barbexa/actions/runs/45903177680)**.
- [Primera CI aprobada · 11 min 48 s](https://github.com/ErwinB23/barbexa/actions/runs/45696792837).

CI está implementada; **CD y despliegue público siguen pendientes**. Las 8 alertas npm moderadas y avisos de runtime/deprecación son mantenimiento pendiente; un pipeline verde no significa ausencia de vulnerabilidades. No se cambiaron dependencias/workflow para redactar esta guía.

## Evaluaciones: consultar y reproducir

Las mediciones aprobadas no deben repetirse por rutina. Consultar primero:

| Evaluación | Evidencia / procedimiento |
|---|---|
| Lecturas: Smoke, Load, Stress y Spike | [Informe](docs/evaluacion/evidencias/004-reservas/k6-final/INFORME.md), [manual k6](k6/MANUAL-POWERSHELL.md) |
| Mezcla 25/50/100 VU × 600 s | [Informe e integridad](docs/evaluacion/evidencias/004-reservas/k6-mixta-final/INFORME.md); `npm run test:carga:mixta` solo con fixture nuevo autorizado |
| Independencia de adaptadores | [EQ-08](docs/evaluacion/evidencias/eq08/INFORME.md) |
| Conflicto y recuperación Web | [EQ-09 y procedimiento específico](docs/evaluacion/evidencias/eq09/INFORME.md); requiere Playwright, sesiones sintéticas y laboratorio aislado |
| Disponibilidad local de una hora | [EQ-05](docs/evaluacion/evidencias/eq05/INFORME.md), [manual](docs/evaluacion/evidencias/eq05/MANUAL-POWERSHELL.md); `node tests/availability/eq05-manual.mjs` detecta la ejecución ya completada, no la repite |

Con laboratorio y fixture nuevos expresamente autorizados, el manual k6 documenta `npm run test:carga -- smoke`, `load`, `load-academico`, `stress`, `spike` y `completo`; no ejecutar contra Cloud ni reutilizar campañas cerradas sin revisión. Las evidencias originales excluidas de Git no se descargan automáticamente ni deben publicarse.

Para ver únicamente la interfaz del monitor:

```powershell
node tests/availability/eq05-terminal-demo.mjs
```

Es una **demostración simulada** breve: no Auth, HTTP, SQL ni nueva evaluación real.

## Documentación técnica y entrega académica

- [Índice de cinco entregables](docs/entrega/sprint2/INDICE.md).
- [Matriz EQ-01–EQ-10](docs/evaluacion/evidencias/004-reservas/k6-final/REQUISITOS-CALIDAD.md).
- [PostgreSQL: planes, índices, RLS y atomicidad](docs/evaluacion/evidencias/002-fundacion/consultas.md).
- [Caché: TTL, invalidación y mediciones](docs/evaluacion/evidencias/004-reservas/cache.md).
- [Estado de desarrollo](ESTADO-DESARROLLO.md) y [Constitución](.specify/memory/constitution.md).
- **[Repositorio académico y guía principal de las ocho actividades](https://github.com/ErwinB23/barberia_app-arquitSoft-02-Erwin#implementación-funcional--barbexa)**.

Los informes contienen antecedentes fechados; las menciones históricas a publicación privada o evaluaciones pendientes se interpretan en su fecha. La guía académica enlaza el código y las evidencias de este repositorio sin duplicarlos ni fusionar historiales.
