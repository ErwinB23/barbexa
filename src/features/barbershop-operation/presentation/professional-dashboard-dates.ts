export function professionalDay(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
export function shiftProfessionalDay(day: string, offset: number) {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}
export function professionalWeek(day: string) {
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  const first = shiftProfessionalDay(day, -((weekday + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => shiftProfessionalDay(first, i));
}
