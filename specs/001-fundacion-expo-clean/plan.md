# Implementation Plan: Fundación técnica de Expo, React Native y Clean Architecture

**Branch**: `main` (rama Git real; no se cambió) | **Date**: 2026-11-10 | **Spec**: [spec.md](spec.md)

**Input**: `specs/001-fundacion-expo-clean/spec.md`, aprobada por el usuario.
Spec Kit resuelve el identificador `001-fundacion-expo-clean` en su campo BRANCH mediante
el localizador de feature; `git branch --show-current` confirma `main` como rama real.

## Summary

Incorporar una base Expo a la raíz del Git existente mediante staging temporal, manifiestos
SHA-256 y copia de archivos nuevos sin colisiones. Una feature técnica local demuestra contratos,
composición e independencia del núcleo; dos vistas y recuperación de ruta desconocida permiten
validar navegación y accesibilidad en Android. Este documento planifica; no implementa.

## Technical Context

**Language/Version**: TypeScript 6.0.3 estricto; versiones verificadas en [research.md](research.md).
Node.js 24.21.0 y npm 11.19.0 detectados localmente; PowerShell 7.6.9.

**Primary Dependencies**: Expo 58.0.23 (SDK58), React Native 0.88.1, React 19.3.0,
Expo Router 58.0.30 y safe-area-context ~5.11.1 según la matriz oficial.
Sin SDK Supabase ni biblioteca de estado global en esta feature.

**Storage**: Ninguno; información pública local inyectada.

**Testing**: Node test runner + assert, compilación TypeScript separada, ESLint flat config de Expo,
Prettier, comprobación arquitectónica con TypeScript Compiler API y aceptación manual Android.

**Target Platform**: Android físico con Expo Go compatible como primera opción; emulador como
alternativa. Entorno móvil todavía no acreditado. Windows/PowerShell para desarrollo.

**Project Type**: Aplicación móvil cliente de futuro SaaS multitenant, una raíz de paquete npm.

**Performance Goals**: Tres recorridos sin cierre inesperado; no hay objetivo de carga o latencia
de backend en esta entrega. Registrar problemas observados sin declarar escalabilidad probada.

**Constraints**: FR-001–FR-011, SC-001–SC-006; preservar archivos existentes e historial;
sin backend real, secretos, API Node propia, microservicios ni carpetas vacías especulativas.

**Scale/Scope**: Una feature técnica, dos pantallas, fallback de ruta y cuatro estados visuales.

## Constitution Check

Evaluación previa y posterior al diseño: conforme en alcance; ejecución todavía pendiente.

| Principios | Control de diseño | Resultado |
| --- | --- | --- |
| I–III | módulos por función, núcleo independiente, contratos y composición | Conforme; checker previsto |
| IV–V | Expo/Android; backend Supabase solo delimitado a futuro | Conforme |
| VI–VII | ninguna identidad o reserva ficticia; autoridad de servidor preservada | Conforme; integración futura pendiente |
| VIII | trazabilidad de los 11 FR y 6 SC | Conforme; validation.md |
| IX | unitarias, límites y recorrido; obligaciones de caché/carga conservadas para futuras entregas | Conforme al alcance aprobado |
| X | controles, accesibilidad y evidencia antes del cierre | Conforme; pruebas aún no ejecutadas |
| XI | rúbrica de 16 criterios, sin atribuirles validación prematura | Conforme |
| XII | preservar AGENTS; añadir estado de desarrollo al implementar | Conforme a FR-001 |

Las tres capas son **lógicas**, no tres despliegues: presentación (vistas/entrada), aplicación
y negocio (casos de uso/dominio), datos y archivos (servicios administrados futuros).
Presentación/aplicación/dominio/infraestructura describen responsabilidades y dependencias
internas de cada funcionalidad. El punto de composición conecta concreciones; no es otra capa
de negocio. Ninguna excepción constitucional solicitada.

## Project Structure

### Documentation (this feature)

```text
specs/001-fundacion-expo-clean/
├── spec.md                         # aprobado, intacto
├── checklists/requirements.md       # intacto
├── plan.md
├── research.md
├── data-model.md
├── contracts/foundation.md
├── quickstart.md
└── validation.md
```

### Source Code (repository root)

Árbol **previsto**, no creado durante la planificación:

```text
src/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── technical.tsx
│   └── +not-found.tsx
├── composition/
│   ├── app-composition.ts
│   └── app-provider.tsx
├── features/foundation/
│   ├── domain/
│   │   ├── app-information.ts
│   │   └── validate-information-request.ts
│   ├── application/
│   │   ├── app-information-gateway.ts
│   │   └── get-app-information.ts
│   ├── infrastructure/local-app-information-adapter.ts
│   └── presentation/
│       ├── information-context.ts
│       ├── use-app-information.ts
│       ├── welcome-screen.tsx
│       ├── technical-screen.tsx
│       └── not-found-screen.tsx
└── shared/ui/
    ├── tokens.ts
    ├── app-text.tsx
    ├── app-button.tsx
    ├── status-message.tsx
    └── screen.tsx
tests/
├── unit/                           # operación, validación, adaptador, contraste
└── architecture/                   # fixtures y comprobación del checker
scripts/
├── check-architecture.mjs
└── run-unit-tests.mjs
package.json / package-lock.json / app.json
tsconfig.json / tsconfig.core.json / tsconfig.tests.json
eslint.config.js / .prettierrc.json / .prettierignore / .gitignore
ESTADO-DESARROLLO.md
```

**Structure Decision**: Un módulo foundation con consumidores reales de cada responsabilidad;
UI compartida porque bienvenida, recuperación y galería la reutilizan. Sin módulos de negocio
vacíos ni carpetas Supabase todavía. Separación física de servidor se incorporará al existir el
primer caso de uso real, con su propia composición, descrita en contracts/foundation.md.
La configuración Expo usa alias `@/*` para `src/*`; núcleo y tests usan rutas relativas para
ejecución compilada independiente. Los controles de arquitectura resuelven ambos mecanismos.
`tsconfig.core.json`: strict, noEmit, lib ES2022, types vacío; solo dominio/aplicación.
`typecheck` ejecutará tanto tsconfig principal como core para evitar globals del navegador/Node.

## Complexity Tracking

Sin violaciones. El checker específico usa el compilador ya requerido y fixtures de regresión;
no añade motor de DI, framework de servidor ni monorepo. No se instala un runner móvil para
probar reglas puras. El coste del checker se limita a las reglas explicitadas en validation.md.

## Secuencia y puertas de implementación

1. Confirmar versiones y prerequisitos; inventario y staging sin sobrescrituras (FR-001–FR-002).
2. Configurar compilación, lint, formato, tests y checker antes de extender la base (FR-004–FR-005, FR-010).
3. Tipos propios, operación local, adaptadores y composición; probar los casos del contrato (FR-006–FR-007).
4. Tokens, componentes y rutas mínimas; estados de muestra separados de datos reales (FR-003, FR-008–FR-009).
5. Ejecutar controles, empaquetado y aceptación Android; registrar FR/SC y estado compartido (FR-011).

Cada puerta exige su evidencia; si no hay dispositivo, la implementación puede avanzar pero
SC-002/SC-005 y el cierre total quedan pendientes. No compensar con una prueba web.
No generar tasks.md ni ejecutar etapas de implementación desde este comando.

## Riesgos y límites

- Versiones resueltas documentalmente no equivalen a instalación comprobada: cerrar con lockfile,
  revisión de engines/peers, expo install --check, doctor y Android.
- Rutas Windows con espacios: siempre argumentos separados y LiteralPath; no comandos concatenados
  para copiar/borrar. Ninguna limpieza fuera de rutas temporales identificadas.
- Formateadores o generadores pueden tocar documentos protegidos: alcance por allowlist y hashes.
- Metadatos locales públicos no prueban seguridad multitenant, RLS ni concurrencia.
- Código para servidor permanece fuera del bundle móvil cuando se incorpore Supabase.
- [quickstart.md](quickstart.md) concreta ejecución; [validation.md](validation.md) conserva trazabilidad.
