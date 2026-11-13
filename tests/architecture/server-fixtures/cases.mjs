import { cases as clientCases } from '../fixtures/cases.mjs';

const convert = (s) =>
  s
    .replaceAll('@/features/', '@/_shared/')
    .replaceAll('src/features/', 'supabase/functions/_shared/')
    .replaceAll(
      'src/composition/app.ts',
      'supabase/functions/_shared/sample/composition.ts',
    )
    .replaceAll('src/app/index.ts', 'supabase/functions/sample/index.ts')
    .replaceAll('../features/sample/', './')
    .replaceAll('../composition/app', '../_shared/sample/composition')
    .replaceAll(
      '../features/sample/presentation/view',
      '../_shared/sample/presentation/view',
    );
const d = 'supabase/functions/_shared/sample/domain/value.ts';
const base = { [d]: 'export const value = 1;' };
export const cases = [
  ...clientCases
    .filter((c) => c.name !== 'capas-validas')
    .map((c) => ({
      ...c,
      rule: c.rule === 'ROUTE_EXTERNAL' ? 'ENTRY_EXTERNAL' : c.rule,
      files: Object.fromEntries(
        Object.entries(c.files).map(([p, s]) => [
          convert(p),
          convert(
            p.startsWith('src/app/')
              ? s.replaceAll('../features/sample/', '../_shared/sample/')
              : s,
          ),
        ]),
      ),
      exclude: c.exclude?.map(convert),
    })),
  {
    name: 'ensamblaje-servidor-valido',
    rule: null,
    files: {
      ...base,
      'supabase/functions/_shared/sample/application/use.ts':
        "import {value} from '../domain/value.ts'; export const use=()=>value;",
      'supabase/functions/_shared/sample/infrastructure/adapter.ts':
        "import {use} from '../application/use.ts'; export const adapter=use;",
      'supabase/functions/_shared/sample/presentation/handler.ts':
        "import {use} from '../application/use.ts'; export const handler=use;",
      'supabase/functions/_shared/sample/composition.ts':
        "import './infrastructure/adapter.ts'; import './presentation/handler.ts';",
      'supabase/functions/sample/index.ts':
        "import '../_shared/sample/composition.ts';",
    },
  },
  ...['Deno', 'Request', 'Response', 'Headers', 'URL'].map((n) => ({
    name: 'global-servidor-' + n,
    rule: 'CORE_GLOBAL',
    files: { [d]: `export const value = ${n};` },
  })),
  {
    name: 'cruce-cliente',
    rule: 'INCOMPLETE',
    files: {
      ...base,
      'src/client.ts': 'export const x=1;',
      [d]: "import {x} from '../../../../../src/client.ts'; export const value=x;",
    },
  },
  {
    name: 'entrada-directa-infra',
    rule: 'LAYER',
    files: {
      ...base,
      'supabase/functions/_shared/sample/infrastructure/adapter.ts':
        'export const x=1;',
      'supabase/functions/sample/index.ts':
        "import '../_shared/sample/infrastructure/adapter.ts';",
    },
  },
];
