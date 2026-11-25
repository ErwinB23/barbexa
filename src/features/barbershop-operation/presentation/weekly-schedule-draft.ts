import type { Hours } from '../domain/types';
import { BusinessError } from '../domain/values';
export interface WeeklyDraft {
  weekday: number;
  opensMin: number | null;
  closesMin: number | null;
}
export const weekDays = [
  { id: 1, name: 'Lunes', short: 'Lun' },
  { id: 2, name: 'Martes', short: 'Mar' },
  { id: 3, name: 'Miércoles', short: 'Mié' },
  { id: 4, name: 'Jueves', short: 'Jue' },
  { id: 5, name: 'Viernes', short: 'Vie' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
  { id: 0, name: 'Domingo', short: 'Dom' },
] as const;
export const scheduleClock = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
export function timeOptions(current: number | null, end: boolean) {
  return [
    ...new Set([
      ...Array.from({ length: 96 }, (_, i) => i * 15).filter(
        (v) => !end || v > 0,
      ),
      ...(end ? [1440] : []),
      ...(current !== null ? [current] : []),
    ]),
  ].sort((a, b) => a - b);
}
export function validateWeeklyDraft(rows: readonly WeeklyDraft[]): Hours[] {
  const result = rows
    .map((row) => {
      if (
        !Number.isInteger(row.weekday) ||
        row.weekday < 0 ||
        row.weekday > 6 ||
        row.opensMin === null ||
        row.closesMin === null ||
        !Number.isInteger(row.opensMin) ||
        !Number.isInteger(row.closesMin) ||
        row.opensMin < 0 ||
        row.closesMin > 1440 ||
        row.opensMin >= row.closesMin
      )
        throw new BusinessError('INVALID_INPUT');
      return {
        weekday: row.weekday,
        opensMin: row.opensMin,
        closesMin: row.closesMin,
      };
    })
    .sort((a, b) => a.weekday - b.weekday || a.opensMin - b.opensMin);
  for (let i = 1; i < result.length; i++)
    if (
      result[i].weekday === result[i - 1].weekday &&
      result[i].opensMin < result[i - 1].closesMin
    )
      throw new BusinessError('INVALID_INPUT');
  return result;
}
export function splitForBreak(
  rows: readonly WeeklyDraft[],
  weekday: number,
  start: number,
  end: number,
): WeeklyDraft[] {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start >= end)
    throw new BusinessError('INVALID_INPUT');
  const index = rows.findIndex(
    (row) =>
      row.weekday === weekday &&
      row.opensMin !== null &&
      row.closesMin !== null &&
      row.opensMin < start &&
      row.closesMin > end,
  );
  if (index < 0) throw new BusinessError('INVALID_INPUT');
  return rows.flatMap((row, i) =>
    i === index
      ? [
          { ...row, closesMin: start },
          { ...row, opensMin: end },
        ]
      : [{ ...row }],
  );
}
export function joinBreak(
  rows: readonly WeeklyDraft[],
  weekday: number,
  start: number,
  end: number,
): WeeklyDraft[] {
  const first = rows.findIndex(
      (row) => row.weekday === weekday && row.closesMin === start,
    ),
    second = rows.findIndex(
      (row) => row.weekday === weekday && row.opensMin === end,
    );
  if (first < 0 || second < 0 || first === second || start >= end)
    throw new BusinessError('INVALID_INPUT');
  return rows.flatMap((row, i) =>
    i === second
      ? []
      : [
          i === first
            ? { ...row, closesMin: rows[second].closesMin }
            : { ...row },
        ],
  );
}
export function copyWeekday(
  rows: readonly WeeklyDraft[],
  weekday: number,
): WeeklyDraft[] {
  const source = rows.filter((row) => row.weekday === weekday);
  validateWeeklyDraft(source);
  if (!source.length) throw new BusinessError('INVALID_INPUT');
  return weekDays.flatMap((day) =>
    source.map((row) => ({ ...row, weekday: day.id })),
  );
}
