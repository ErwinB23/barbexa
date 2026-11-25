import type { BookingOffer } from '../application/booking-offer-gateway';
type Hours = NonNullable<BookingOffer['shopHours']>;
const weekdays = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
const time = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
export function weeklyHours(hours: Hours | undefined) {
  return [1, 2, 3, 4, 5, 6, 0].map((day) => ({
    day,
    label: weekdays[day],
    intervals:
      hours
        ?.filter((h) => h.weekday === day)
        .slice()
        .sort((a, b) => a.opensMin - b.opensMin)
        .map((h) => `${time(h.opensMin)}–${time(h.closesMin)}`) ?? null,
  }));
}
export function openingState(
  hours: Hours | undefined,
  closures: BookingOffer['shopClosures'],
  now: number,
): 'open' | 'closed' | 'unknown' {
  if (!hours || !Number.isFinite(now)) return 'unknown';
  if (
    closures?.some(
      (c) => Date.parse(c.startsAt) <= now && now < Date.parse(c.endsAt),
    )
  )
    return 'closed';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(now));
  const part = (name: string) =>
    parts.find((p) => p.type === name)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
      part('weekday'),
    ),
    minute = Number(part('hour')) * 60 + Number(part('minute'));
  return hours.some(
    (h) => h.weekday === day && minute >= h.opensMin && minute < h.closesMin,
  )
    ? 'open'
    : 'closed';
}
export function contactLinks(raw: string) {
  if (!/^[+\d\s().-]+$/.test(raw.trim())) return null;
  const digits = raw.replace(/[^\d]/g, '');
  // The existing commercial contract is PEN / America-Lima. A local mobile has
  // nine digits; other numbers need their explicit international prefix.
  const normalized = /^9\d{8}$/.test(digits)
    ? '51' + digits
    : /^519\d{8}$/.test(digits)
      ? digits
      : raw.trim().startsWith('+') && /^[1-9]\d{7,14}$/.test(digits)
        ? digits
        : null;
  return normalized
    ? { call: 'tel:+' + normalized, whatsapp: 'https://wa.me/' + normalized }
    : null;
}
export const mapSearch = (address: string) =>
  address.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`
    : null;
export function visibleOffer(offer: BookingOffer) {
  const services = offer.services.filter(
    (s) => s.active && s.barbershopId === offer.barbershopId,
  );
  const professionals = offer.professionals.filter(
    (p) =>
      p.active &&
      p.barbershopId === offer.barbershopId &&
      offer.capabilities.some(
        (c) =>
          c.barberId === p.id && services.some((s) => s.id === c.serviceId),
      ),
  );
  return { services, professionals };
}
