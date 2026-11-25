import type { Hours } from '../domain/types';
import {
  ownSchedule,
  scheduleHours,
  scheduleClockMinutes,
  type OwnSchedule,
} from '../domain/self-schedule';
import { BusinessError } from '../domain/values';
import { timeOptions } from './weekly-schedule-draft';

// Project the local's real windows for pickers, including contiguous intervals.
export function personalTimeOptions(
  shopHours: readonly Hours[],
  weekday: number,
  current: number | null,
  end: boolean,
  start: number | null = null,
) {
  const windows: { start: number; end: number }[] = [];
  for (const h of shopHours
    .filter((h) => h.weekday === weekday)
    .toSorted((a, b) => a.opensMin - b.opensMin)) {
    const previous = windows.at(-1);
    if (previous && h.opensMin <= previous.end)
      previous.end = Math.max(previous.end, h.closesMin);
    else windows.push({ start: h.opensMin, end: h.closesMin });
  }
  const values = [
    ...new Set([
      ...timeOptions(null, end),
      ...windows.flatMap((w) => [w.start, w.end]),
    ]),
  ];
  return values
    .filter((m) =>
      windows.some((w) =>
        end
          ? m > (start ?? w.start) &&
            m <= w.end &&
            (start === null || (start >= w.start && start < w.end))
          : m >= w.start && m < w.end,
      ),
    )
    .concat(current !== null ? [current] : [])
    .filter((m, i, all) => all.indexOf(m) === i)
    .sort((a, b) => a - b);
}
export function preparePersonalInterval(
  view: OwnSchedule,
  hours: readonly Hours[],
  weekday: string,
  opens: string,
  closes: string,
) {
  if (!/^[0-6]$/.test(weekday)) throw new BusinessError('INVALID_INPUT');
  const next = scheduleHours([
    ...hours,
    {
      weekday: Number(weekday),
      opensMin: scheduleClockMinutes(opens),
      closesMin: scheduleClockMinutes(closes, true),
    },
  ]);
  // Reuse the existing domain checks, including containment in local hours.
  return ownSchedule(
    { ...view, hours: next },
    view.professional.userId,
    view.professional.barbershopId,
  ).hours;
}
