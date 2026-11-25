import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
test('professional tabs preserve context and reuse own tools without enabling administrative agenda', () => {
  let section;
  const captured = [];
  const booking = { agenda: {} };
  const panel = (name) =>
    function TestPanel(props) {
      captured.push({ name, props });
      return React.createElement('div', null, name);
    };
  const module = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync('src/composition/professional-workspace.web.tsx', 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
    (name) => {
      if (name === 'react') return { useContext: () => booking };
      if (name === 'react/jsx-runtime') return require(name);
      if (name === 'expo-router')
        return {
          Link: (props) => React.createElement('a', props),
          useLocalSearchParams: () => ({ section }),
          useRouter: () => ({ push() {} }),
        };
      if (name.endsWith('/professional-dashboard.web'))
        return { ProfessionalDashboard: panel('summary') };
      if (name.endsWith('/self-schedule'))
        return { SelfSchedulePanel: panel('schedules') };
      if (name.endsWith('/self-professional'))
        return { SelfProfessional: panel('profile') };
      if (name.endsWith('/professional-agenda.web'))
        return { ProfessionalAgenda: panel('agenda') };
      if (name.endsWith('/workspace-icon.web'))
        return { WorkspaceIcon: () => null };
      return {};
    },
    module,
    module.exports,
  );
  const app = {
    ownSummary: {},
    selfSchedule: {},
    canEditOwnProfessional: () => true,
  };
  const render = () =>
    renderToStaticMarkup(
      React.createElement(module.exports.ProfessionalWorkspace, {
        application: app,
        shopId: 'selected-shop',
        shopName: 'Barbería real',
        scopeKey: 'verified:shop',
      }),
    );
  for (const id of ['summary', 'agenda', 'schedules', 'profile']) {
    section = id;
    captured.length = 0;
    const html = render();
    assert.match(html, /Mi espacio profesional/);
    assert.match(html, /Barbería real/);
    assert.equal(
      (html.match(/view=professional&amp;section=/g) ?? []).length,
      4,
    );
    assert.match(html, /aria-current="page"/);
    assert.equal(captured.length, 1);
    assert.equal(captured[0].name, id);
    if (id === 'agenda') {
      assert.equal(captured[0].props.booking, booking);
      assert.equal(captured[0].props.shopId, 'selected-shop');
      assert.equal(captured[0].props.application, app);
    }
  }
  section = 'forged-admin';
  captured.length = 0;
  render();
  assert.equal(captured[0].name, 'summary');
});
