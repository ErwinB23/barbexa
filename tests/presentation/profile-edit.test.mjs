import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function fixture(platform, controller = false) {
  const controls = [],
    cache = new Map();
  const values = [],
    refs = [],
    cleanups = [];
  let index = 0,
    refIndex = 0;
  const hooks = {
    ...React,
    useState(initial) {
      const slot = index++;
      if (!(slot in values)) values[slot] = initial;
      return [
        values[slot],
        (value) => {
          values[slot] =
            typeof value === 'function' ? value(values[slot]) : value;
        },
      ];
    },
    useRef(initial) {
      const slot = refIndex++;
      refs[slot] ??= { current: initial };
      return refs[slot];
    },
    useEffect(effect) {
      if (!cleanups.length) cleanups.push(effect());
    },
  };
  const primitive = (kind) =>
    function Primitive(props) {
      controls.push({ kind, props });
      return React.createElement('div', null, props.children);
    };
  const rn = {
    View: primitive('View'),
    Text: primitive('Text'),
    TextInput: primitive('TextInput'),
    Pressable: primitive('Pressable'),
    Platform: { OS: platform },
    StyleSheet: { create: (s) => s },
  };
  function load(file) {
    if (!fs.existsSync(file))
      file = ['.tsx', '.ts'].map((e) => file + e).find(fs.existsSync);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, {})(
      (name) =>
        name.endsWith('success-toast')
          ? {
              SuccessToast: (props) =>
                React.createElement(
                  'div',
                  { className: 'bx-success-toast' },
                  props.message,
                ),
            }
          : name === 'react/jsx-runtime'
            ? Object.fromEntries(
                Object.entries(require(name)).map(([key, value]) => [
                  key,
                  ['jsx', 'jsxs'].includes(key)
                    ? (type, props, ...rest) => {
                        if (type === 'input')
                          controls.push({
                            kind: 'TextInput',
                            props: {
                              ...props,
                              nativeID: props.id,
                              editable: !props.disabled,
                              allowFontScaling: true,
                              accessibilityLabel: props.id,
                              keyboardType:
                                props.type === 'tel' ? 'phone-pad' : undefined,
                              onChangeText: (v) =>
                                props.onChange({ target: { value: v } }),
                            },
                          });
                        if (type === 'form')
                          controls.push({
                            kind: 'Pressable',
                            props: {
                              accessibilityLabel: 'Guardar perfil',
                              disabled: props['aria-busy'],
                              onPress: () =>
                                props.onSubmit({ preventDefault() {} }),
                            },
                          });
                        if (type === 'button' && props.type === 'button')
                          controls.push({
                            kind: 'Pressable',
                            props: {
                              ...props,
                              accessibilityLabel: 'Cancelar edición',
                              onPress: props.onClick,
                            },
                          });
                        return value(type, props, ...rest);
                      }
                    : value,
                ]),
              )
            : name === 'react' && controller
              ? hooks
              : name === 'react-native'
                ? rn
                : name.startsWith('.')
                  ? load(path.resolve(path.dirname(file), name))
                  : require(name),
      module,
      module.exports,
    );
    return module.exports;
  }
  const { PersonalProfileForm, PersonalProfileEditor } = load(
    path.resolve(
      'src/features/authentication/presentation/personal-profile-editor.tsx',
    ),
  );
  return {
    controls,
    unmount() {
      for (const cleanup of cleanups) cleanup?.();
    },
    render(props) {
      controls.length = 0;
      index = 0;
      refIndex = 0;
      return renderToStaticMarkup(
        React.createElement(
          controller ? PersonalProfileEditor : PersonalProfileForm,
          props,
        ),
      );
    },
  };
}
for (const platform of ['web', 'android']) {
  test(
    platform +
      ' editor connects edited values once and reports persisted success',
    async () => {
      const f = fixture(platform, true),
        writes = [];
      let resolve;
      const props = {
        profile: { userId: 'own', displayName: 'Original', phone: '123' },
        onSave: async (input) => {
          writes.push(input);
          await new Promise((r) => {
            resolve = r;
          });
        },
      };
      f.render(props);
      f.controls
        .find((c) => c.props.accessibilityLabel === 'Editar perfil')
        .props.onPress();
      f.render(props);
      f.controls
        .find(
          (c) =>
            c.kind === 'TextInput' && c.props.nativeID === 'own-profile-name',
        )
        .props.onChangeText('Edited');
      f.controls
        .find(
          (c) =>
            c.kind === 'TextInput' && c.props.nativeID === 'own-profile-phone',
        )
        .props.onChangeText('');
      f.render(props);
      const save = f.controls.find(
        (c) => c.props.accessibilityLabel === 'Guardar perfil',
      ).props.onPress;
      save();
      save();
      assert.equal(writes.length, 1);
      assert.equal(writes[0].displayName, 'Edited');
      assert.equal(writes[0].phone, null);
      resolve();
      await new Promise((r) => setImmediate(r));
      const success = f.render(props);
      assert.ok(success.includes('Perfil actualizado'));
      if (platform === 'web') assert.match(success, /bx-success-toast/);
      else assert.doesNotMatch(success, /bx-success-toast/);
    },
  );
  test(
    platform +
      ' editor cancels locally and sanitizes save errors while retaining input',
    async () => {
      const f = fixture(platform, true);
      let writes = 0;
      const props = {
        profile: { userId: 'own', displayName: 'Original', phone: null },
        onSave: async () => {
          writes++;
          throw new Error('private-provider-detail');
        },
      };
      f.render(props);
      f.controls
        .find((c) => c.props.accessibilityLabel === 'Editar perfil')
        .props.onPress();
      f.render(props);
      f.controls
        .find((c) => c.props.accessibilityLabel === 'Cancelar edición')
        .props.onPress();
      assert.equal(writes, 0);
      f.render(props);
      f.controls
        .find((c) => c.props.accessibilityLabel === 'Editar perfil')
        .props.onPress();
      f.render(props);
      f.controls
        .find((c) => c.props.accessibilityLabel === 'Guardar perfil')
        .props.onPress();
      await new Promise((r) => setImmediate(r));
      const html = f.render(props);
      assert.ok(html.includes('Conservamos tu edición'));
      assert.ok(!html.includes('private-provider-detail'));
      assert.equal(
        f.controls.find((c) => c.kind === 'TextInput').props.value,
        'Original',
      );
    },
  );
  test(
    platform +
      ' own-profile form has accessible name/phone, cancel and clear error',
    () => {
      const f = fixture(platform);
      let saved = 0,
        cancelled = 0;
      const html = f.render({
        displayName: 'Own',
        phone: '',
        busy: false,
        error: 'Revisa el nombre',
        onName() {},
        onPhone() {},
        onSave() {
          saved++;
        },
        onCancel() {
          cancelled++;
        },
      });
      assert.ok(html.includes('Revisa el nombre'));
      const fields = f.controls.filter((c) => c.kind === 'TextInput');
      assert.equal(fields.length, 2);
      assert.ok(
        fields.every(
          (c) =>
            c.props.editable &&
            c.props.allowFontScaling &&
            c.props.accessibilityLabel,
        ),
      );
      assert.equal(fields[1].props.keyboardType, 'phone-pad');
      f.controls
        .find((c) => c.props.accessibilityLabel === 'Guardar perfil')
        .props.onPress();
      f.controls
        .find((c) => c.props.accessibilityLabel === 'Cancelar edición')
        .props.onPress();
      assert.equal(saved, 1);
      assert.equal(cancelled, 1);
    },
  );
  test(
    platform + ' pending profile form disables edits and duplicate save/cancel',
    () => {
      const f = fixture(platform);
      let calls = 0;
      const html = f.render({
        displayName: 'Own',
        phone: '',
        busy: true,
        error: null,
        onName() {},
        onPhone() {},
        onSave() {
          calls++;
        },
        onCancel() {
          calls++;
        },
      });
      assert.ok(html.includes('Guardando perfil'));
      assert.ok(
        f.controls
          .filter((c) => c.kind === 'TextInput')
          .every((c) => !c.props.editable),
      );
      const buttons = f.controls.filter((c) => c.kind === 'Pressable');
      assert.ok(buttons.every((c) => c.props.disabled));
      for (const button of buttons) button.props.onPress?.();
      assert.equal(calls, 0);
    },
  );
}
