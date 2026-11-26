# BARBEXA

SaaS multitenant para clientes, profesionales y administradores de barberías:
reservas, agenda, atención, equipo, notificaciones y registro manual de pagos
en efectivo o Yape. Repositorio funcional **privado**; la docente necesita acceso
autorizado para consultar código, historial, Actions y evidencias.

## Entrega del Sprint 2 — acceso para evaluación

**Comenzar por el [índice central de los cinco entregables](docs/entrega/sprint2/INDICE.md).**

| Entregable | Acceso directo |
| --- | --- |
| Código y arquitectura | [Cliente](src/), [servidor Edge](supabase/functions/), [migraciones SQL](supabase/migrations/), [arquitectura verificada](docs/evaluacion/evidencias/eq08/INFORME.md) |
| Primera versión funcional | [Alcance Web y situación del Sprint 2](docs/evaluacion/evidencias/eq05/SITUACION-SPRINT2.md), [E2E de conflicto y recuperación](docs/evaluacion/evidencias/eq09/INFORME.md) |
| OpenAPI y Swagger | [OpenAPI JSON](docs/api/openapi.json), [visor local](docs/api/index.html), comando `npm run docs:api` |
| Pruebas y cobertura | [Pruebas](tests/), [validación reproducible aceptada](docs/evaluacion/evidencias/004-reservas/reproducibilidad.json), [cobertura para la entrega](docs/entrega/sprint2/evidencias/cobertura-aceptada.json) |
| Atributos de calidad | [Matriz EQ-01–EQ-10](docs/evaluacion/evidencias/004-reservas/k6-final/REQUISITOS-CALIDAD.md), [informes y gráficas](docs/entrega/sprint2/INDICE.md#5-validación-de-atributos-de-calidad) |

La evidencia acredita seis EQ en su alcance definido y cuatro parcialmente:
EQ-02, EQ-05, EQ-08 y EQ-09. La observación local de EQ-05 duró una hora y tuvo
100 % de disponibilidad/cobertura; **no acredita disponibilidad mensual ni del
servicio publicado**. La adaptación requiere aceptación docente. Lecturas hasta
1.000 VU y carga mixta hasta 100 VU son mediciones diferentes. Los **2.000 VU**
permanecen como objetivo adicional pospuesto.

## Tecnologías y organización

- Cliente: Expo, React Native, Expo Router y TypeScript, con presentación Web.
- Backend: Supabase Auth, Edge Functions en Deno, PostgREST y PostgreSQL.
- Clean Architecture: dominio/aplicación independientes; composición mediante
  puertos y adaptadores en cliente y servidor. Node.js se utiliza para herramientas
  y pruebas; no existe una API Node propia de negocio.
- SDD: [18 especificaciones](specs/), con requisitos, planes, tareas y decisiones;
  [Constitución](.specify/memory/constitution.md) y [rúbrica](docs/evaluacion/RUBRICA.md).
- Storage, mapas, imágenes, reseñas y Android nativo conservan los límites y
  pendientes descritos en el índice; su presencia en el diseño no acredita cierre.

## Consulta local de la documentación

Con Node 24.21.0 y las dependencias del lockfile disponibles:

```powershell
npm ci
npm run docs:api
```

Swagger muestra la URL exacta en terminal y usa `http://127.0.0.1:8082/` por defecto.
Si está ocupado: `npm run docs:api -- --port 8083`. La ejecución interactiva de
operaciones está deshabilitada. `npm ci` no configura por sí solo un backend de
demostración; no copiar credenciales privadas al repositorio.

## Calidad, CI y sustentación

[Workflow Quality](.github/workflows/quality.yml): instalación reproducible,
tipos, arquitectura, lint, formato, pruebas, cobertura, OpenAPI y exportación Web.
La primera ejecución aprobada se conserva como evidencia histórica en
[GitHub Actions](https://github.com/ErwinB23/barbexa/actions/runs/45696792837).
La futura ejecución debe corresponder al nuevo commit, sin reutilizar el estado
verde de esa ejecución como aprobación de cambios todavía locales.

- [Guía de demostración de 10–12 minutos](docs/entrega/sprint2/GUIA-SUSTENTACION.md).
- [Revisión del paquete y propuesta de commits](docs/entrega/sprint2/PUBLICACION.md).
- [Verificación de Actions después de publicar](docs/entrega/sprint2/PUBLICACION.md#verificación-de-github-actions-después-de-la-publicación).

Los informes sanitizados se conservan en `docs/`. Fixtures, sesiones, traces,
capturas de red, credenciales y crudos privados permanecen en carpetas ignoradas.
No es necesario repetir k6, Playwright o la hora de disponibilidad para consultar
esta entrega. Preparación documental actual: **sin staging, commits ni push**.
