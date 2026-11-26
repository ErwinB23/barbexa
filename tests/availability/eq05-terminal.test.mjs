import { test } from 'node:test';
import assert from 'node:assert/strict';
import { terminalFrame, terminalPresenter } from './eq05-terminal.mjs';
const rows = [
  { index: 0, status: 'available' },
  { index: 1, status: 'unavailable' },
  { index: 2, status: 'no-data' },
];

test('presentation shows distinct availability, coverage, missing intervals and elapsed progress', () => {
  const frame = terminalFrame({ rows, elapsedSeconds: 30, width: 90 });
  assert.match(frame, /50\.00%/);
  assert.match(frame, /0\.56%/);
  assert.match(frame, /00:30 \/ 60:00/);
  assert.match(frame, /Exitosos 1/);
  assert.match(frame, /Fallidos 1/);
  assert.match(frame, /Sin datos 1/);
  assert.match(frame, /3\/360/);
  assert.match(frame, /\+x\?/);
  assert.equal(
    terminalFrame({ rows: [], elapsedSeconds: 0 }).includes(
      'Disponibilidad --',
    ),
    true,
  );
});

test('simulation is visibly marked and never changes supplied records', () => {
  const input = structuredClone(rows),
    before = JSON.stringify(input);
  const frame = terminalFrame({
    rows: input,
    elapsedSeconds: 11,
    simulated: true,
    width: 60,
  });
  assert.match(frame, /SIMULADOS/);
  assert.equal(JSON.stringify(input), before);
  for (const line of frame.split('\n')) assert.ok(line.length <= 60, line);
});

test('TTY reuses its display; redirected output is readable and free of ANSI control codes', () => {
  const tty = {
    isTTY: true,
    columns: 100,
    text: '',
    write(s) {
      this.text += s;
    },
  };
  const p = terminalPresenter(tty);
  p.update({ rows, elapsedSeconds: 30 });
  p.update({ rows, elapsedSeconds: 31 });
  p.finish();
  assert.match(tty.text, /\x1b\[\d+A/);
  assert.match(tty.text, /\x1b\[0J/);
  const pipe = {
      text: '',
      write(s) {
        this.text += s;
      },
    },
    redirected = terminalPresenter(pipe);
  redirected.update({ rows, elapsedSeconds: 30 });
  redirected.update({ rows, elapsedSeconds: 31 });
  assert.equal(pipe.text.includes('\x1b'), false);
  assert.equal(pipe.text.split('\n').filter(Boolean).length, 1);
  redirected.update({
    rows: [...rows, { index: 3, status: 'available' }],
    elapsedSeconds: 40,
  });
  assert.equal(pipe.text.split('\n').filter(Boolean).length, 2);
});

test('display failure cannot interrupt or alter availability accounting', () => {
  const p = terminalPresenter({
    isTTY: true,
    write() {
      throw Error('closed terminal');
    },
  });
  assert.doesNotThrow(() => {
    p.update({ rows, elapsedSeconds: 10 });
    p.finish();
  });
});
