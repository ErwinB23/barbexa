import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
test('shared typography explicitly uses readable sans-serif and action contrast meets AA', () => {
  const module = { exports: {} };
  const code = ts.transpileModule(
    fs.readFileSync('src/shared/ui/tokens.ts', 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  vm.runInNewContext(`(function(exports){${code}\n})`, {})(module.exports);
  const { tokens } = module.exports;
  for (const value of Object.values(tokens.typography))
    assert.equal(value.fontFamily, 'sans-serif');
  const light = (hex) => {
    const channels = hex
      .match(/[a-f0-9]{2}/gi)
      .map((c) => parseInt(c, 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  for (const [foreground, background] of [
    ['onAction', 'action'],
    ['text', 'background'],
    ['textSecondary', 'surface'],
    ['error', 'background'],
    ['success', 'background'],
    ['error', 'errorSurface'],
    ['success', 'successSurface'],
    ['text', 'panel'],
    ['text', 'tint'],
  ]) {
    const values = [
      light(tokens.color[foreground]),
      light(tokens.color[background]),
    ].sort((a, b) => b - a);
    assert.ok(
      (values[0] + 0.05) / (values[1] + 0.05) >= 4.5,
      `${foreground}/${background}`,
    );
  }
  assert.ok(
    (light(tokens.color.panel) + 0.05) /
      (light(tokens.color.controlBorder) + 0.05) >=
      3,
    'field boundary contrast',
  );
});
