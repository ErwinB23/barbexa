import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(file, overrides = {}) {
  if (!fs.existsSync(file))
    file += fs.existsSync(file + '.ts') ? '.ts' : '.tsx';
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
    (n) =>
      overrides[n] ??
      (n.startsWith('.')
        ? load(path.resolve(path.dirname(file), n), overrides)
        : require(n)),
    module,
    module.exports,
  );
  return module.exports;
}
const profile = {
  professionalName: 'Nombre guardado',
  description: 'Experiencia guardada',
  instagram: '@real',
  tiktok: null,
  facebook: null,
  memberSince: null,
  barbershopName: 'Local real',
};
const tick = () => new Promise((r) => setImmediate(r));
function hook(app) {
  const values = [],
    refs = [],
    effects = [];
  let i = 0,
    j = 0,
    mounted = false;
  const { useProfessionalProfile: runProfileHook } = load(
    path.resolve(
      'src/features/barbershop-operation/presentation/use-professional-profile.ts',
    ),
    {
      react: {
        useState(initial) {
          const slot = i++;
          if (!(slot in values)) values[slot] = initial;
          return [
            values[slot],
            (v) => {
              values[slot] = typeof v === 'function' ? v(values[slot]) : v;
            },
          ];
        },
        useRef(initial) {
          const slot = j++;
          return (refs[slot] ??= { current: initial });
        },
        useCallback: (f) => f,
        useEffect(f) {
          if (!mounted) effects.push(f());
        },
      },
    },
  );
  return {
    render() {
      i = 0;
      j = 0;
      const view = runProfileHook(app);
      mounted = true;
      return view;
    },
    unmount() {
      effects.forEach((f) => f?.());
    },
  };
}
test('professional profile preserves draft on failed save and preview reads stored values without discarding edits', async () => {
  let stored = profile,
    fail = true;
  const app = {
    scopeKey: () => 'own:shop',
    professionalProfile: {
      read: async () => stored,
      save: async (draft) => {
        if (fail) throw Error('offline');
        return (stored = { ...profile, ...draft });
      },
    },
  };
  const h = hook(app);
  h.render();
  await tick();
  h.render().onChange('description', 'Edición sin guardar');
  h.render().onSave();
  await tick();
  assert.equal(h.render().draft.description, 'Edición sin guardar');
  assert.equal(h.render().saved, false);
  assert.match(h.render().error, /reintentar/);
  h.render().onRead();
  await tick();
  assert.equal(h.render().profile.description, 'Experiencia guardada');
  assert.equal(h.render().draft.description, 'Edición sin guardar');
  fail = false;
  h.render().onSave();
  await tick();
  assert.equal(h.render().saved, true);
  assert.equal(h.render().profile.description, 'Edición sin guardar');
  h.render().onRead();
  await tick();
  assert.equal(h.render().profile.description, 'Edición sin guardar');
});
test('legacy profile cannot simulate saving details and late response after unmount is ignored', async () => {
  const h = hook({
    scopeKey: () => 'own',
    professionalProfile: {
      read: async () => {
        throw { code: 'INVALID_INPUT' };
      },
    },
    getOwnProfessional: async () => profile,
  });
  h.render();
  await tick();
  assert.equal(h.render().extended, false);
  assert.equal(h.render().draft.description, '');
  let resolve;
  const late = hook({
    scopeKey: () => 'own',
    professionalProfile: {
      read: () =>
        new Promise((r) => {
          resolve = r;
        }),
    },
  });
  late.render();
  await tick();
  late.unmount();
  resolve(profile);
  await tick();
  assert.equal(late.render().profile, null);
});
test('Web profile renders real stored preview, optional social fields and honest unknown incorporation date', () => {
  const { ProfessionalProfileWeb } = load(
    path.resolve(
      'src/features/barbershop-operation/presentation/professional-profile-web.tsx',
    ),
    {
      '../../../shared/ui/success-toast': {
        SuccessToast: (p) =>
          React.createElement(
            'div',
            { className: 'bx-success-toast' },
            p.message,
          ),
      },
      'react-native': {
        Platform: { OS: 'web' },
        StyleSheet: { create: (v) => v },
        View: 'div',
        Text: 'span',
        Pressable: 'button',
        TextInput: 'input',
      },
    },
  );
  const render = (extended, stored = profile, saved = false) =>
    renderToStaticMarkup(
      React.createElement(ProfessionalProfileWeb, {
        profile: stored,
        saved,
        draft: { ...profile, description: '🙂'.repeat(250) },
        extended,
        checked: true,
        busy: false,
        dirty: true,
        preview: true,
        onRead() {},
        onSave() {},
        onChange() {},
        onPreviewClose() {},
      }),
    );
  assert.match(render(true, profile, true), /bx-success-toast/);
  const html = render(true);
  assert.match(html, /250 \/ 250/);
  assert.match(html, /Experiencia guardada/);
  assert.match(html, /Fecha no registrada/);
  assert.doesNotMatch(html, /Zona horaria|GMT-05:00/);
  assert.match(
    render(true, { ...profile, memberSince: '2026-11-23T02:00:00.000Z' }),
    /22 de noviembre de 2026/,
  );
  assert.match(html, /Instagram/);
  assert.match(html, /TikTok/);
  assert.match(html, /Facebook/);
  assert.doesNotMatch(html, /22 de noviembre|BRAYAM/);
  assert.match(render(false), /id="professional-description"[^>]*disabled/);
  assert.match(render(false), /aún no están/);
});
