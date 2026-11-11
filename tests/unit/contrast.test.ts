import assert from 'node:assert/strict';
import { test } from 'node:test';

import { tokens } from '../../src/shared/ui/tokens.js';

function luminance(hex: string): number {
  const rgb = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

function contrast(a: string, b: string): number {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('contraste: negro/blanco 21, mismo color 1 y gris/blanco conocido', () => {
  assert.equal(contrast('#000000', '#FFFFFF'), 21);
  assert.equal(contrast('#FFFFFF', '#FFFFFF'), 1);
  assert.ok(Math.abs(contrast('#777777', '#FFFFFF') - 4.478089) < 0.000001);
});

for (const background of ['background', 'surface'] as const) {
  for (const foreground of [
    'text',
    'textSecondary',
    'error',
    'success',
  ] as const) {
    test(`texto normal ${foreground}/${background} >=4.5; grande >=3`, () => {
      const ratio = contrast(
        tokens.color[foreground],
        tokens.color[background],
      );
      console.log(`${foreground}/${background}: ${ratio.toFixed(4)}:1`);
      assert.ok(ratio >= 4.5);
      assert.ok(ratio >= 3);
    });
  }
}

for (const [a, b, minimum] of [
  ['onAction', 'action', 4.5],
  ['action', 'background', 3],
  ['action', 'surface', 3],
  ['textSecondary', 'surface', 3],
  ['onAction', 'action', 3],
] as const) {
  test(`botón/texto/borde/foco ${a}/${b} >=${minimum}`, () => {
    const ratio = contrast(tokens.color[a], tokens.color[b]);
    console.log(`${a}/${b}: ${ratio.toFixed(4)}:1`);
    assert.ok(ratio >= minimum);
  });
}
