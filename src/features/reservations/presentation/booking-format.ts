export const bookingTime = (utc: string) =>
  new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(utc));
export function bookingError(code: string, occupation = false) {
  if (occupation) return 'Profesional no disponible en ese horario';
  const messages: Record<string, string> = {
    INVALID_INPUT:
      'Selecciona servicios, una fecha válida y un horario disponible.',
    UNAUTHENTICATED: 'Verifica tu sesión antes de continuar.',
    FORBIDDEN: 'Tu sesión actual no permite esta operación.',
    NOT_AVAILABLE: 'La oferta ya no está disponible para nuevas reservas.',
    PROFILE_REQUIRED: 'Completa tu perfil antes de reservar.',
    CONFLICT:
      'La solicitud cambió o el horario dejó de estar disponible. Consulta los horarios nuevamente.',
  };
  return (
    messages[code] ??
    'No se pudo obtener respuesta. Comprueba la conexión y reintenta.'
  );
}

// This detects only a certainly expired client deadline; the server also checks the shop's advance policy.
export function rescheduleDeadlineMessage(
  startsAt: string,
  staff: boolean,
  now: number,
): string | null {
  return !staff && now > Date.parse(startsAt)
    ? 'El plazo para reprogramar esta cita terminó. Contacta con la barbería.'
    : null;
}
