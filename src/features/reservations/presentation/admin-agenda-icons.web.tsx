const paths = {
  calendar: 'M4 5h16v16H4ZM8 2v6m8-6v6M4 11h16',
  shop: 'M3 10h18l-2-7H5ZM5 10v11h14V10M9 21v-6h6v6',
  user: 'M20 21v-2a7 7 0 0 0-14 0v2M17 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
  scissors:
    'M7 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0m16 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6 9l14 13M18 9 4 22',
  clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  check: 'm7 12 3 3 7-7M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  cancel: 'm8 8 8 8m0-8-8 8M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  card: 'M3 5h18v14H3ZM3 10h18M6 15h4',
  switch: 'M3 7h17m-5-5 5 5-5 5M21 17H4m5-5-5 5 5 5',
  info: 'M12 10v7m0-10v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  history: 'M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v6l4 2',
} as const;
export function AdminAgendaIcon({ name }: { name: keyof typeof paths }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
export const localTime = (instant: string) =>
  new Date(instant).toLocaleTimeString('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
export const localDay = (date: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date))
    ? new Date(`${date}T12:00:00-05:00`).toLocaleDateString('es-PE', {
        timeZone: 'America/Lima',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Fecha no válida';
