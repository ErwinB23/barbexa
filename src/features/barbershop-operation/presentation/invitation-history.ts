import type { StaffInvitation } from '../domain/types';
export function newestInvitations(
  items: readonly StaffInvitation[],
  shop?: string,
) {
  const stamp = (i: StaffInvitation) => {
    const value = Date.parse(i.createdAt ?? '');
    return Number.isFinite(value) ? value : -Infinity;
  };
  return items
    .filter((i) => !shop || i.barbershopId === shop)
    .slice()
    .sort((a, b) => {
      const x = stamp(a),
        y = stamp(b);
      return x === y ? b.id.localeCompare(a.id) : x > y ? -1 : 1;
    });
}
export function invitationDate(value?: string | null) {
  if (!value || !Number.isFinite(Date.parse(value)))
    return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
export function professionalActivity(invitation: StaffInvitation) {
  return invitation.professionalActive === true
    ? 'Activo'
    : invitation.professionalActive === false
      ? 'Inactivo'
      : 'Estado no disponible';
}
