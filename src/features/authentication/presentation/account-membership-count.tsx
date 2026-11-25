import { createContext, useContext, useEffect, useState } from 'react';
import type { MembershipReference } from '../domain/session-state';
export const AccountMembershipsContext = createContext<
  (() => Promise<readonly MembershipReference[]>) | null
>(null);
export function distinctOwnShops(
  rows: readonly MembershipReference[],
  userId: string,
) {
  return new Set(
    rows
      .filter((m) => m.userId === userId && m.status === 'active')
      .map((m) => m.barbershopId),
  ).size;
}
export function AccountMembershipCount({
  userId,
  generation,
  scope,
}: {
  userId: string;
  generation: number;
  scope: string;
}) {
  const read = useContext(AccountMembershipsContext);
  const [result, setResult] = useState<{
    key: string;
    count: number | null;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = `${userId}:${generation}:${scope}:${attempt}`;
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      try {
        if (!read) throw Error('unavailable');
        const rows = await read();
        if (active) setResult({ key, count: distinctOwnShops(rows, userId) });
      } catch {
        if (active) setResult({ key, count: null });
      }
    });
    return () => {
      active = false;
    };
  }, [read, key, userId]);
  if (result?.key !== key)
    return <strong aria-live="polite">Consultando…</strong>;
  if (result.count === null)
    return (
      <span className="bx-account-count-error">
        <small>No disponible</small>
        <button type="button" onClick={() => setAttempt((n) => n + 1)}>
          Reintentar
        </button>
      </span>
    );
  return <strong aria-live="polite">{result.count}</strong>;
}
