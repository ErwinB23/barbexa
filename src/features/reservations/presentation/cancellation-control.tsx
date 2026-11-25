import { useContext, useRef, useState } from 'react';
import { BookingContext } from './booking-context';
import type { BookingDetail, CancellationInput } from '../domain/types';
import { clientCancellationAllowed } from '../domain/cancellation';
import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { View } from 'react-native';
import { tokens } from '../../../shared/ui/tokens';
export function CancellationControl({
  detail,
  staff = false,
}: {
  detail: BookingDetail;
  staff?: boolean;
}) {
  const app = useContext(BookingContext),
    [expanded, setExpanded] = useState(false),
    [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [locked, setLocked] = useState(false),
    [clock, setClock] = useState(() => Date.now());
  const request = useRef<CancellationInput | null>(null),
    inFlight = useRef(false);
  if (
    detail.state !== 'confirmed' ||
    !app?.cancelReservation ||
    !app.cancellationRequestId
  )
    return null;
  const allowed =
    staff ||
    clientCancellationAllowed(
      detail.startsAt,
      detail.policySnapshot.cancellationAdvanceMin,
      clock,
    );
  async function confirm() {
    if (
      inFlight.current ||
      !app?.cancelReservation ||
      !app.cancellationRequestId
    )
      return;
    inFlight.current = true;
    setBusy(true);
    setLocked(true);
    setError('');
    try {
      request.current ??= {
        requestId: app.cancellationRequestId(),
        reservationId: detail.id,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      };
      await app.cancelReservation(request.current);
      request.current = null;
      setLocked(false);
      setExpanded(false);
    } catch (e) {
      const code =
        e && typeof e === 'object' && 'code' in e ? e.code : undefined;
      const uncertain =
        request.current !== null && code === 'DEPENDENCY_UNAVAILABLE';
      if (!uncertain) request.current = null;
      setLocked(uncertain);
      setError(
        uncertain
          ? 'No se pudo confirmar el resultado. Consulta la lista o reintenta la misma cancelación.'
          : code === 'FORBIDDEN'
            ? 'La política o tus permisos no permiten esta cancelación.'
            : code === 'INVALID_INPUT'
              ? 'Revisa el motivo de cancelación.'
              : 'No pudimos cancelar esta cita. Actualiza e inténtalo nuevamente.',
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  if (!allowed)
    return (
      <AppText variant="caption" tone="textSecondary">
        El plazo de cancelación de esta cita terminó. Contacta con la barbería.
      </AppText>
    );
  return (
    <View
      style={{
        gap: tokens.space.md,
        borderTopWidth: 1,
        borderTopColor: tokens.color.border,
        paddingTop: tokens.space.lg,
      }}
    >
      <AppButton
        label="Cancelar cita"
        variant="danger"
        onPress={() => {
          setClock(Date.now());
          setExpanded(true);
        }}
        disabled={busy || expanded}
      />
      {expanded && (
        <>
          <AppText>
            ¿Confirmas cancelar esta cita? Se conservará su historial y el
            horario quedará libre.
          </AppText>
          {staff && (
            <AppTextField
              id={`cancel-reason-${detail.id}`}
              label="Motivo de cancelación (obligatorio)"
              value={reason}
              onChangeText={setReason}
              disabled={busy || locked}
            />
          )}
          {!!error && (
            <AppText tone="error" accessibilityLiveRegion="polite">
              {error}
            </AppText>
          )}
          <AppButton
            label={busy ? 'Cancelando…' : 'Confirmar cancelación'}
            variant="danger"
            onPress={() => {
              void confirm();
            }}
            disabled={busy || (staff && !reason.trim())}
          />
          <AppButton
            label="Conservar cita"
            variant="secondary"
            onPress={() => {
              request.current = null;
              setLocked(false);
              setExpanded(false);
              setError('');
            }}
            disabled={busy || locked}
          />
        </>
      )}
    </View>
  );
}
