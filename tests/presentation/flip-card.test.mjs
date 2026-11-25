import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import React from 'react';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function fixture(overrides = {}) {
  let values = [],
    index = 0,
    refs = [],
    refIndex = 0;
  const code = ts.transpileModule(
    fs.readFileSync(
      'src/features/foundation/presentation/step-flip-card.web.tsx',
      'utf8',
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText;
  const module = { exports: {} };
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {
    window: { matchMedia: () => ({ matches: true }) },
  })(
    (name) =>
      name === 'react'
        ? {
            ...React,
            useId: () => 'step',
            useState(initial) {
              const at = index++;
              if (!(at in values)) values[at] = initial;
              return [
                values[at],
                (value) => {
                  values[at] =
                    typeof value === 'function' ? value(values[at]) : value;
                },
              ];
            },
            useRef(initial) {
              const at = refIndex++;
              return (refs[at] ??= { current: initial });
            },
          }
        : name.includes('site-icon')
          ? { SiteIcon: () => null }
          : require(name),
    module,
    module.exports,
  );
  return () => {
    index = 0;
    refIndex = 0;
    const tree = module.exports.StepFlipCard({
      step: 1,
      title: 'Elige una barbería',
      description: 'Explora',
      icon: 'scissors',
      backTitle: 'Encuentra',
      details: 'Información',
      points: ['Uno', 'Dos'],
      ...overrides,
    });
    const [inner, button] = React.Children.toArray(tree.props.children);
    const faces = React.Children.toArray(inner.props.children);
    return { tree, button, faces, flipped: button.props['aria-expanded'] };
  };
}

test('benefit cards have descriptive controls without presenting a numbered reservation step', () => {
  const render = fixture({ step: undefined, title: 'Ahorra tiempo' });
  let view = render();
  assert.equal(view.button.props['aria-label'], 'Descubrir más: Ahorra tiempo');
  assert.equal(view.flipped, false);
  view.button.props.onClick({ detail: 0 });
  view = render();
  assert.equal(view.flipped, true);
  assert.equal(view.button.props['aria-label'], 'Volver: Ahorra tiempo');
});

test('hover opens and closes the card while hiding the inactive face from assistive technology', () => {
  const render = fixture();
  let view = render();
  assert.equal(view.flipped, false);
  assert.equal(view.faces[1].props['aria-hidden'], true);
  assert.equal(view.faces[1].props.inert, true);
  view.tree.props.onPointerEnter({ pointerType: 'mouse' });
  view = render();
  assert.equal(view.flipped, true);
  assert.equal(view.faces[0].props['aria-hidden'], true);
  assert.equal(view.faces[1].props['aria-hidden'], false);
  view.tree.props.onPointerLeave({ pointerType: 'mouse' });
  assert.equal(render().flipped, false);
});

test('touch toggles independently and compatibility mouse clicks do not undo the flip', () => {
  const render = fixture(),
    other = fixture();
  let view = render();
  view.tree.props.onPointerEnter({ pointerType: 'touch' });
  assert.equal(render().flipped, false);
  view.button.props.onPointerDown({ pointerType: 'touch' });
  view.button.props.onClick({ detail: 1 });
  view = render();
  assert.equal(view.flipped, true);
  assert.equal(other().flipped, false);
  view.tree.props.onPointerLeave({ pointerType: 'touch' });
  assert.equal(render().flipped, true);
  view.button.props.onClick({ detail: 1 });
  assert.equal(render().flipped, false);
  view = render();
  view.tree.props.onPointerEnter({ pointerType: 'mouse' });
  view = render();
  view.button.props.onPointerDown({ pointerType: 'mouse' });
  view.button.props.onClick({ detail: 1 });
  assert.equal(render().flipped, true);
});

test('keyboard click toggles; Escape and leaving keyboard focus close the card', () => {
  const render = fixture();
  let view = render();
  assert.equal(view.button.props.type, 'button');
  view.button.props.onClick({ detail: 0 });
  assert.equal(render().flipped, true);
  view = render();
  view.button.props.onKeyDown({ key: 'Escape' });
  assert.equal(render().flipped, false);
  view = render();
  view.button.props.onClick({ detail: 0 });
  view = render();
  view.button.props.onClick({ detail: 0 });
  assert.equal(render().flipped, false);
  view = render();
  view.button.props.onClick({ detail: 0 });
  render().button.props.onBlur();
  assert.equal(render().flipped, false);
});
