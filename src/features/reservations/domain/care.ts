import { BusinessError } from './values';
import { reservationId } from './reservation-input';
export type Attendance =
  'confirmed' | 'in-service' | 'completed' | 'no-show' | 'cancelled';
export type PaymentMethod = 'cash' | 'yape';
export interface CareView {
  readonly reservationId: string;
  readonly attendance: Attendance | null;
  readonly payment: null | {
    readonly method: PaymentMethod;
    readonly status: 'pending' | 'paid' | 'refunded';
    readonly amountMinor: number;
    readonly currency: 'PEN';
  };
  readonly noShowToleranceMin: number | null;
  readonly yapeInstructions: string | null;
  readonly canReportYape?: boolean;
  readonly yapeReport?: {
    readonly securityCode: string;
    readonly submittedAt: string;
  } | null;
  readonly events: readonly {
    readonly kind: string;
    readonly occurredAt: string;
    readonly reason: string | null;
    readonly capacity: string;
    readonly actorUserId: string;
  }[];
  readonly permissions: {
    readonly attend: boolean;
    readonly receive: boolean;
    readonly refund: boolean;
  };
}
const invalid = (): never => {
  throw new BusinessError('INVALID_INPUT');
};
export function careCommand(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return invalid();
  const d = raw as Record<string, unknown>,
    command = d.command;
  if (typeof command !== 'string') return invalid();
  const shop = ['settings', 'configure', 'payment-options'].includes(command);
  const read = ['read', 'settings', 'payment-options'].includes(command);
  if (
    ![
      'read',
      'settings',
      'configure',
      'payment-options',
      'start',
      'complete',
      'no-show',
      'receive',
      'refund',
      'report-yape',
    ].includes(command)
  )
    return invalid();
  const keys = [
    'command',
    shop ? 'barbershopId' : 'reservationId',
    ...(!read ? ['requestId'] : []),
    ...(command === 'configure'
      ? ['noShowToleranceMin', 'yapeInstructions']
      : []),
    ...(['receive', 'refund'].includes(command) ? ['attested'] : []),
    ...(command === 'refund' ? ['reason'] : []),
    ...(command === 'report-yape' ? ['securityCode'] : []),
  ];
  if (
    keys.length !== Object.keys(d).length ||
    keys.some((k) => !Object.hasOwn(d, k))
  )
    return invalid();
  if (
    command === 'report-yape' &&
    (typeof d.securityCode !== 'string' || !/^[0-9]{3}$/.test(d.securityCode))
  )
    return invalid();
  const result = {
    ...d,
    [shop ? 'barbershopId' : 'reservationId']: reservationId(
      d[shop ? 'barbershopId' : 'reservationId'],
    ),
  };
  if (!read) result.requestId = reservationId(d.requestId);
  if (['receive', 'refund'].includes(command) && d.attested !== true)
    return invalid();
  if (command === 'refund') {
    if (
      typeof d.reason !== 'string' ||
      !d.reason.trim() ||
      d.reason.length > 2000
    )
      return invalid();
    result.reason = d.reason.trim();
  }
  if (
    command === 'configure' &&
    (!Number.isInteger(d.noShowToleranceMin) ||
      Number(d.noShowToleranceMin) < 0 ||
      Number(d.noShowToleranceMin) > 1440 ||
      (d.yapeInstructions !== null &&
        (typeof d.yapeInstructions !== 'string' ||
          !d.yapeInstructions.trim() ||
          d.yapeInstructions.length > 2000)))
  )
    return invalid();
  return Object.freeze(result);
}
export function nextAttendance(
  state: Attendance,
  command: 'start' | 'complete' | 'no-show',
  now: number,
  start: number,
  tolerance: number,
): Attendance {
  if (
    !Number.isFinite(now) ||
    !Number.isFinite(start) ||
    !Number.isInteger(tolerance) ||
    tolerance < 0
  )
    return invalid();
  if (command === 'start' && state === 'confirmed' && now >= start)
    return 'in-service';
  if (command === 'complete' && state === 'in-service') return 'completed';
  if (
    command === 'no-show' &&
    state === 'confirmed' &&
    now >= start + tolerance * 60000
  )
    return 'no-show';
  throw new BusinessError('CONFLICT');
}
export function careView(raw: unknown, id: string): CareView {
  try {
    const v = raw as CareView;
    if (
      !v ||
      v.reservationId !== id ||
      !(
        v.attendance === null ||
        [
          'confirmed',
          'in-service',
          'completed',
          'no-show',
          'cancelled',
        ].includes(v.attendance)
      ) ||
      !(
        v.noShowToleranceMin === null ||
        (Number.isInteger(v.noShowToleranceMin) &&
          v.noShowToleranceMin >= 0 &&
          v.noShowToleranceMin <= 1440)
      ) ||
      !(
        v.yapeInstructions === null || typeof v.yapeInstructions === 'string'
      ) ||
      !Array.isArray(v.events) ||
      v.events.length > 1000 ||
      !v.permissions ||
      ['attend', 'receive', 'refund'].some(
        (k) =>
          typeof v.permissions[k as keyof CareView['permissions']] !==
          'boolean',
      )
    )
      throw Error();
    if (
      v.payment !== null &&
      (!v.payment ||
        !['cash', 'yape'].includes(v.payment.method) ||
        !['pending', 'paid', 'refunded'].includes(v.payment.status) ||
        !Number.isSafeInteger(v.payment.amountMinor) ||
        v.payment.amountMinor < 0 ||
        v.payment.currency !== 'PEN')
    )
      throw Error();
    if (
      v.events.some(
        (e) =>
          !e ||
          typeof e.kind !== 'string' ||
          !Number.isFinite(Date.parse(e.occurredAt)) ||
          !['client', 'barber', 'administrator'].includes(e.capacity) ||
          !(e.reason === null || typeof e.reason === 'string') ||
          reservationId(e.actorUserId) !== e.actorUserId,
      )
    )
      throw Error();
    if (v.canReportYape !== undefined && typeof v.canReportYape !== 'boolean')
      throw Error();
    if (
      v.yapeReport !== undefined &&
      v.yapeReport !== null &&
      (!v.yapeReport ||
        typeof v.yapeReport.securityCode !== 'string' ||
        !/^[0-9]{3}$/.test(v.yapeReport.securityCode) ||
        typeof v.yapeReport.submittedAt !== 'string' ||
        !Number.isFinite(Date.parse(v.yapeReport.submittedAt)))
    )
      throw Error();
    return v;
  } catch {
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  }
}
export interface CareGateway {
  execute(input: Record<string, unknown>): Promise<unknown>;
}
