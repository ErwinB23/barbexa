import { useEffect, useRef, useState } from 'react';
import type { OperationApplication } from '../features/barbershop-operation/application/operation-application';
import { professionalDay } from '../features/barbershop-operation/presentation/professional-dashboard-dates';
import {
  readProfessionalDashboard,
  type DashboardData,
  type ProfessionalBooking,
} from './professional-dashboard-data';

export function useProfessionalAgenda(
  app: OperationApplication,
  booking: ProfessionalBooking,
  shopId: string,
) {
  const [day, setDay] = useState(professionalDay),
    [weekly, setWeekly] = useState(false),
    [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<{
    identity: string;
    attempt: number;
    data: DashboardData | null;
    error: boolean;
  } | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const scope = app.scopeKey(),
    identity = `${scope}:${shopId}:${day}:${weekly}`;
  const same = outcome?.identity === identity;
  const busy = !same || outcome.attempt !== attempt;
  useEffect(() => {
    let live = true;
    const isCurrent = () => live && app.scopeKey() === scope;
    async function read() {
      if (!isCurrent()) return;
      try {
        const data = await readProfessionalDashboard({
          app,
          booking,
          shopId,
          day,
          weekly,
          isCurrent,
          includeOverview: false,
        });
        if (isCurrent())
          setOutcome({ identity, attempt, data, error: !data || data.error });
      } catch {
        if (isCurrent())
          setOutcome({ identity, attempt, data: null, error: true });
      }
    }
    queue.current = queue.current.then(read, read);
    return () => {
      live = false;
    };
  }, [app, booking, shopId, day, weekly, attempt, scope, identity]);
  return {
    day,
    setDay,
    weekly,
    setWeekly,
    data: same ? outcome.data : null,
    error: same && outcome.error,
    busy,
    revision: same ? outcome.attempt : 0,
    refresh: () => setAttempt((v) => v + 1),
  };
}
