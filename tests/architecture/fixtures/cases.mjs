// Árboles sintéticos: se materializan fuera de src para cada prueba del checker.
const d = 'src/features/sample/domain/value.ts';
const a = 'src/features/sample/application/use.ts';
const i = 'src/features/sample/infrastructure/adapter.ts';
const p = 'src/features/sample/presentation/view.ts';
const base = {
  [d]: 'export type Value = number;',
  [a]: "import type {Value} from '../domain/value'; export type Result = Value;",
};
export const cases = [
  {
    name: 'capas-validas',
    files: {
      ...base,
      [i]: "import type {Result} from '../application/use'; export type Adapter = Result;",
      [p]: "import type {Result} from '../application/use'; export type View = Result;",
      'src/composition/app.ts':
        "import '../features/sample/infrastructure/adapter';",
      'src/app/index.ts':
        "import '../features/sample/presentation/view'; import '../composition/app';",
    },
    rule: null,
  },
  {
    name: 'alias-valido',
    files: {
      ...base,
      [a]: "import type {Value} from '@/features/sample/domain/value'; export type Result = Value;",
    },
    rule: null,
  },
  {
    name: 'global-local-permitido',
    files: {
      ...base,
      [d]: 'export function value(process: number) { const obj = {fetch: 1}; return process + obj.fetch; }',
    },
    rule: null,
  },
  ...['react-native', '@supabase/supabase-js', 'node:fs'].map((dep) => ({
    name: `externo-${dep.replaceAll('/', '-').replaceAll(':', '-')}`,
    files: { ...base, [d]: `import '${dep}';` },
    rule: 'CORE_EXTERNAL',
  })),
  {
    name: 'tipo-externo',
    files: { ...base, [a]: "import type {View} from 'react-native';" },
    rule: 'CORE_EXTERNAL',
  },
  {
    name: 'reexport-externo',
    files: { ...base, [d]: "export * from 'react-native';" },
    rule: 'CORE_EXTERNAL',
  },
  {
    name: 'alias-infra',
    files: {
      ...base,
      [a]: "import '@/features/sample/infrastructure/adapter';",
      [i]: 'export const x=1;',
    },
    rule: 'LAYER',
  },
  {
    name: 'dominio-a-aplicacion',
    files: { ...base, [d]: "import '../application/use';" },
    rule: 'LAYER',
  },
  {
    name: 'presentacion-a-infra',
    files: {
      ...base,
      [p]: "import '../infrastructure/adapter';",
      [i]: 'export const x=1;',
    },
    rule: 'LAYER',
  },
  {
    name: 'infra-a-presentacion',
    files: {
      ...base,
      [i]: "import '../presentation/view';",
      [p]: 'export const x=1;',
    },
    rule: 'LAYER',
  },
  {
    name: 'ruta-a-infra',
    files: {
      ...base,
      'src/app/index.ts': "import '../features/sample/infrastructure/adapter';",
      [i]: 'export const x=1;',
    },
    rule: 'LAYER',
  },
  {
    name: 'otro-modulo',
    files: {
      ...base,
      [a]: "import '../../other/domain/value';",
      'src/features/other/domain/value.ts': 'export type X = number;',
    },
    rule: 'LAYER',
  },
  {
    name: 'transitivo-reexport',
    files: {
      ...base,
      [a]: "export * from '../domain/value';",
      [d]: "export * from './bridge';",
      'src/features/sample/domain/bridge.ts': "import 'react-native';",
    },
    rule: 'CORE_TRANSITIVE',
  },
  {
    name: 'sin-resolver',
    files: { ...base, [a]: "import './absent';" },
    rule: 'UNRESOLVED',
  },
  {
    name: 'import-type-query',
    files: { ...base, [a]: "export type X = import('react-native').View;" },
    rule: 'CORE_EXTERNAL',
  },
  {
    name: 'require-externo',
    files: { ...base, [a]: "const x = require('node:fs');" },
    rule: 'CORE_EXTERNAL',
  },
  {
    name: 'dinamico-local-valido',
    files: {
      ...base,
      [a]: "export const load = () => import('../domain/value');",
    },
    rule: null,
  },
  ...['import(target)', 'require(target)'].map((expr, n) => ({
    name: `dinamico-no-literal-${n}`,
    files: { ...base, [a]: `declare const target:string; ${expr};` },
    rule: 'UNVERIFIABLE',
  })),
  {
    name: 'ciclo',
    files: {
      ...base,
      [d]: "export * from './second';",
      'src/features/sample/domain/second.ts': "export * from './value';",
    },
    rule: 'CYCLE',
  },
  ...[
    'fetch',
    'XMLHttpRequest',
    'WebSocket',
    'process',
    'eval',
    'globalThis',
  ].map((name) => ({
    name: `global-${name}`,
    files: { ...base, [d]: `export const x = ${name};` },
    rule: 'CORE_GLOBAL',
  })),
  {
    name: 'barrel-mixto',
    files: {
      ...base,
      [a]: "import '../index';",
      'src/features/sample/index.ts':
        "export * from './infrastructure/adapter';",
      [i]: 'export const x=1;',
    },
    rule: 'LAYER',
  },
  {
    name: 'excluido-tsconfig',
    files: { ...base },
    exclude: ['src/features/sample/domain/**'],
    rule: 'INCOMPLETE',
  },
  {
    name: 'sintaxis-invalida',
    files: { ...base, [d]: 'export const = ;' },
    rule: 'PARSE',
  },
  {
    name: 'nucleo-vacio',
    files: { 'src/shared/ui/text.ts': 'export const text=1;' },
    rule: 'EMPTY_CORE',
  },
  { name: 'src-vacio', files: {}, rule: 'EMPTY_CORE' },
  {
    name: 'sdk-en-adaptador',
    files: {
      ...base,
      [i]: "import type {Client} from 'sdk'; export type Adapter = Client;",
      [p]: "import type {Client} from 'sdk'; export type View = Client;",
      'node_modules/sdk/index.d.ts': 'export interface Client {name:string}',
    },
    rule: null,
  },
  {
    name: 'require-alias',
    files: { ...base, [d]: 'const loader = require; loader(target);' },
    rule: 'UNVERIFIABLE',
  },
  {
    name: 'referencia-tipos-node',
    files: {
      ...base,
      [d]: '/// <reference types="node" />\nexport type X = number;',
    },
    rule: 'CORE_EXTERNAL',
  },
  {
    name: 'referencia-lib-dom',
    files: {
      ...base,
      [d]: '/// <reference lib="dom" />\nexport type X = number;',
    },
    rule: 'CORE_LIB',
  },
  {
    name: 'ruta-sdk',
    files: {
      ...base,
      'src/app/index.ts': "import 'sdk';",
      'node_modules/sdk/index.d.ts': 'export const client: number;',
    },
    rule: 'ROUTE_EXTERNAL',
  },
];
