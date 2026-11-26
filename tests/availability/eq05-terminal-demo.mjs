// Explicit simulation: no monitor imports, Auth, HTTP, SQL, fixture or real ledger.
import { setTimeout as wait } from 'node:timers/promises';
import { terminalPresenter, terminalFrame } from './eq05-terminal.mjs';
const snapshot = process.argv[2] === '--snapshot';
const rows = Array.from({ length: 120 }, (_, index) => ({
  index,
  status: index === 29 ? 'unavailable' : index === 69 ? 'no-data' : 'available',
}));
if (snapshot)
  console.log(
    terminalFrame({ rows, elapsedSeconds: 1200, simulated: true, width: 100 }),
  );
else {
  const view = terminalPresenter();
  for (const count of [0, 30, 60, 90, 120]) {
    view.update({
      rows: rows.slice(0, count),
      elapsedSeconds: count * 10,
      simulated: true,
    });
    await wait(150);
  }
  view.finish();
  console.log('DEMO SIMULADA terminada; no se ejecuto ninguna medicion real.');
}
