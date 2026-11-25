import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createAgendaApplication,
  agendaFilters,
  type AgendaScope,
  type AgendaFilters,
} from '../../../src/features/reservations/application/agenda-application.js';
import { BusinessError } from '../../../src/features/reservations/domain/values.js';
import type { BookingDetail } from '../../../src/features/reservations/domain/types.js';
import { detail, id } from './booking-fixture.js';
function fixture() {
  let scope: AgendaScope | null = {
    userId: id(4),
    generation: 1,
    barbershopId: detail.barbershopId,
    role: 'administrator',
  };
  const control = {
    read: async (): Promise<readonly BookingDetail[]> => [detail],
    calls: 0,
  };
  const app = createAgendaApplication({
    gateway: {
      listAgenda: async () => {
        control.calls++;
        return control.read();
      },
    },
    scope: () => scope,
    today: () => '2026-11-15',
  });
  return {
    app,
    control,
    setScope(next: AgendaScope | null) {
      scope = next;
    },
  };
}
test('agenda rejects invalid calendar/filter values and contextual professional escalation', () => {
  const valid = { localDate: '2026-11-15', barberId: null, state: null };
  for (const invalid of [
    null,
    { ...valid, localDate: 'invalid' },
    { ...valid, localDate: '2026-13-01' },
    { ...valid, localDate: '2026-02-31' },
    { ...valid, state: 'administrator' },
    { ...valid, barberId: 'invalid' },
  ])
    assert.throws(() => agendaFilters(invalid as AgendaFilters));
  assert.equal(agendaFilters({ ...valid, barberId: id(3) }).barberId, id(3));
  const f = fixture();
  f.setScope(null);
  f.app.setFilters(valid);
  f.setScope({
    userId: id(4),
    generation: 1,
    barbershopId: detail.barbershopId,
    role: 'barber',
  });
  assert.throws(
    () => f.app.setFilters({ ...valid, barberId: id(3) }),
    (e) => (e as BusinessError).code === 'FORBIDDEN',
  );
  f.app.dispose();
});
test('agenda loads only its scoped rows and subscription/filter changes clear older results', async () => {
  const f = fixture();
  let notifications = 0;
  const off = f.app.subscribe(() => {
    notifications++;
  });
  await f.app.load();
  assert.equal(f.app.getSnapshot().phase, 'ready');
  assert.equal(f.app.getSnapshot().rows[0].id, detail.id);
  f.app.setFilters({
    localDate: '2026-11-16',
    barberId: id(3),
    state: 'confirmed',
  });
  assert.equal(f.app.getSnapshot().rows.length, 0);
  assert.equal(f.app.getSnapshot().filters.barberId, id(3));
  assert.ok(notifications > 0);
  off();
  const count = notifications;
  f.app.invalidateScope();
  assert.equal(notifications, count);
  f.setScope(null);
  f.app.invalidateScope();
  await f.app.load();
  assert.equal(f.control.calls, 1);
  f.app.dispose();
});
test('agenda clears errors/foreign projections and never leaks provider messages', async () => {
  for (const failure of [
    new BusinessError('FORBIDDEN'),
    Error('private provider text'),
  ]) {
    const f = fixture();
    f.control.read = async () => {
      throw failure;
    };
    await f.app.load();
    const s = f.app.getSnapshot();
    assert.equal(s.phase, 'error');
    assert.equal(s.rows.length, 0);
    assert.equal(
      s.error,
      failure instanceof BusinessError ? 'FORBIDDEN' : 'DEPENDENCY_UNAVAILABLE',
    );
    f.app.dispose();
  }
  const f = fixture();
  f.control.read = async () => [{ ...detail, barbershopId: id(99) }];
  await f.app.load();
  assert.equal(f.app.getSnapshot().error, 'DEPENDENCY_UNAVAILABLE');
  f.app.dispose();
});
test('late success/failure after logout context change or disposal cannot revive agenda', async () => {
  for (const mode of ['context', 'logout', 'dispose', 'error'] as const) {
    const f = fixture();
    let finish!: (v: readonly BookingDetail[]) => void,
      reject!: (e: unknown) => void;
    f.control.read = () =>
      new Promise((resolve, fail) => {
        finish = resolve;
        reject = fail;
      });
    const p = f.app.load();
    if (mode === 'dispose') f.app.dispose();
    else {
      f.setScope(
        mode === 'context'
          ? {
              userId: id(4),
              generation: 2,
              barbershopId: id(99),
              role: 'barber',
            }
          : null,
      );
      f.app.invalidateScope();
    }
    if (mode === 'error') reject(Error('late private failure'));
    else finish([detail]);
    await p;
    assert.equal(f.app.getSnapshot().rows.length, 0);
    f.app.dispose();
    await f.app.load();
    assert.equal(f.app.getSnapshot().rows.length, 0);
  }
});
