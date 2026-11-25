import { useInitialRead } from './use-initial-read';
import { useContext, useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { BookingContext } from './booking-context';
import { AppText } from '../../../shared/ui/app-text';
import { AppButton } from '../../../shared/ui/app-button';
import { AppTextField } from '../../../shared/ui/app-text-field';
import {
  bookingError,
  bookingTime,
  rescheduleDeadlineMessage,
} from './booking-format';
import type { AvailableSlot, BookingDetail } from '../domain/types';
import { BusinessError, type UtcInstant } from '../domain/values';
import { tokens } from '../../../shared/ui/tokens';
import type { RescheduleEvent } from '../domain/reschedule';
export interface RescheduleContentProps {
  staff?: boolean;
  reason?: string;
  onReason?: (value: string) => void;
  fieldId?: string;
  date: string;
  slots: readonly AvailableSlot[];
  selected: UtcInstant | null;
  busy: boolean;
  queried: boolean;
  uncertain: boolean;
  error: string | null;
  done: boolean;
  onDate: (v: string) => void;
  onSearch: () => void;
  onSelect: (v: UtcInstant) => void;
  onConfirm: () => void;
  onClose?: () => void;
}
export function RescheduleContent(p: RescheduleContentProps) {
  return (
    <View style={{ gap: tokens.space.md }}>
      <AppText>
        Reprogramar conserva tus servicios, profesional, precio y pago. Solo
        cambia fecha y hora.
      </AppText>
      {p.done ? (
        <AppText accessibilityLiveRegion="polite">
          Reserva reprogramada.
        </AppText>
      ) : (
        <>
          <AppTextField
            id={p.fieldId ?? 'reschedule-date'}
            label="Nueva fecha (AAAA-MM-DD)"
            value={p.date}
            onChangeText={p.onDate}
            disabled={p.busy || p.uncertain}
          />
          <AppButton
            label={p.busy ? 'Consultando…' : 'Consultar nuevos horarios'}
            onPress={p.onSearch}
            disabled={p.busy || p.uncertain}
          />
          {p.staff && (
            <AppTextField
              id={`${p.fieldId ?? 'reschedule'}-reason`}
              label="Motivo (personal fuera del plazo)"
              value={p.reason ?? ''}
              onChangeText={p.onReason ?? (() => {})}
              disabled={p.busy || p.uncertain}
            />
          )}
          {p.queried && !p.slots.length && (
            <AppText>No hay horarios disponibles para esta fecha.</AppText>
          )}
          {p.slots.map((slot) => (
            <AppButton
              key={slot.startsAt}
              label={bookingTime(slot.startsAt)}
              variant={p.selected === slot.startsAt ? 'primary' : 'secondary'}
              onPress={() => p.onSelect(slot.startsAt)}
              disabled={p.busy || p.uncertain}
            />
          ))}
          {!!p.error && (
            <AppText tone="error" accessibilityLiveRegion="polite">
              {p.error}
            </AppText>
          )}
          {p.uncertain && (
            <AppText>
              El resultado no pudo verificarse. Reintenta el mismo cambio; no se
              generará otra reserva.
            </AppText>
          )}
          <AppButton
            label={
              p.uncertain
                ? 'Reintentar el mismo cambio'
                : 'Confirmar nuevo horario'
            }
            onPress={p.onConfirm}
            disabled={p.busy || !p.selected}
          />
        </>
      )}
    </View>
  );
}
export function RescheduleControl({
  detail,
  staff = false,
  canChange = true,
  renderContent: Content = RescheduleContent,
}: {
  detail: BookingDetail;
  staff?: boolean;
  canChange?: boolean;
  renderContent?: (props: RescheduleContentProps) => ReactNode;
}) {
  const booking = useContext(BookingContext),
    actions = booking?.reschedule;
  const [expanded, setExpanded] = useState(false),
    [date, setDate] = useState(''),
    [slots, setSlots] = useState<readonly AvailableSlot[]>([]),
    [selected, setSelected] = useState<UtcInstant | null>(null),
    [busy, setBusy] = useState(false),
    [queried, setQueried] = useState(false),
    [uncertain, setUncertain] = useState(false),
    [error, setError] = useState<string | null>(null),
    [done, setDone] = useState(false);
  const [reason, setReason] = useState(''),
    [history, setHistory] = useState<readonly RescheduleEvent[] | null>(null);
  const inFlight = useRef(false);
  if (!actions) return null;
  async function run(save: boolean) {
    if (!actions || inFlight.current || (save && !selected)) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      if (save) {
        await actions.submit({
          reservationId: detail.id,
          expectedStartsAt: detail.startsAt,
          startsAt: selected!,
          ...(reason.trim() ? { reason: reason.trim() } : {}),
        });
        setDone(true);
        setUncertain(false);
        await booking?.loadOwn();
        await booking?.agenda?.load();
      } else {
        setSlots(
          await actions.slots({ reservationId: detail.id, localDate: date }),
        );
        setQueried(true);
        setSelected(null);
      }
    } catch (e) {
      const code =
        e instanceof BusinessError ? e.code : 'DEPENDENCY_UNAVAILABLE';
      setError(
        code === 'FORBIDDEN'
          ? (rescheduleDeadlineMessage(detail.startsAt, staff, Date.now()) ??
              bookingError(code))
          : bookingError(code),
      );
      if (save && code === 'DEPENDENCY_UNAVAILABLE') setUncertain(true);
      if (code === 'UNAUTHENTICATED' || code === 'FORBIDDEN') {
        setSlots([]);
        setSelected(null);
        setExpanded(false);
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return (
    <View style={{ gap: tokens.space.md }}>
      {canChange && detail.state === 'confirmed' && (
        <AppButton
          label={done ? 'Elegir otro horario' : 'Reprogramar cita'}
          variant="secondary"
          onPress={() => {
            const deadline = rescheduleDeadlineMessage(
              detail.startsAt,
              staff,
              Date.now(),
            );
            if (deadline) {
              setExpanded(false);
              setError(deadline);
              return;
            }
            setExpanded(true);
            setDone(false);
            setDate('');
            setSlots([]);
            setSelected(null);
            setQueried(false);
            setError(null);
            setReason('');
          }}
          disabled={busy || (expanded && !done)}
        />
      )}
      {canChange && expanded && (
        <Content
          onClose={() => {
            if (inFlight.current || busy || uncertain) return;
            setExpanded(false);
          }}
          fieldId={`reschedule-date-${detail.id}`}
          staff={staff}
          reason={reason}
          onReason={setReason}
          date={date}
          slots={slots}
          selected={selected}
          busy={busy}
          queried={queried}
          uncertain={uncertain}
          error={error}
          done={done}
          onDate={(v) => {
            setDate(v);
            setSlots([]);
            setSelected(null);
            setQueried(false);
            setError(null);
          }}
          onSearch={() => void run(false)}
          onSelect={setSelected}
          onConfirm={() => void run(true)}
        />
      )}
      <AppButton
        label={
          history !== null
            ? 'Ocultar historial de reprogramación'
            : 'Consultar historial de reprogramación'
        }
        variant="ghost"
        disabled={busy}
        onPress={() => {
          if (inFlight.current) return;
          if (history !== null) {
            setHistory(null);
            return;
          }
          inFlight.current = true;
          setBusy(true);
          setError(null);
          void actions
            .history(detail.id)
            .then(setHistory)
            .catch((e) => {
              setHistory(null);
              setError(
                bookingError(
                  e instanceof BusinessError
                    ? e.code
                    : 'DEPENDENCY_UNAVAILABLE',
                ),
              );
            })
            .finally(() => {
              inFlight.current = false;
              setBusy(false);
            });
        }}
      />
      {history && (
        <View>
          {history.length === 0 ? (
            <AppText>No hay reprogramaciones registradas.</AppText>
          ) : (
            history.map((e, i) => (
              <AppText key={i}>
                {new Date(e.oldStartsAt).toLocaleString('es-PE', {
                  timeZone: 'America/Lima',
                })}{' '}
                →{' '}
                {new Date(e.newStartsAt).toLocaleString('es-PE', {
                  timeZone: 'America/Lima',
                })}{' '}
                · {e.capacity}
                {e.reason ? ` · ${e.reason}` : ''}
              </AppText>
            ))
          )}
        </View>
      )}
      {error && !expanded && (
        <AppText tone="error" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
    </View>
  );
}
export function ReschedulePolicyContent(p: {
  value: string;
  checked: boolean;
  busy: boolean;
  error: string | null;
  saved: boolean;
  onChange: (v: string) => void;
  onRead: () => void;
  onSave: () => void;
}) {
  return (
    <View style={{ gap: tokens.space.md }}>
      <AppText>Antelación para reprogramar en esta barbería</AppText>
      <AppButton
        label="Consultar antelación de reprogramación"
        onPress={p.onRead}
        disabled={p.busy}
      />
      <AppTextField
        id="reschedule-policy"
        label="Antelación mínima de reprogramación (minutos)"
        value={p.value}
        onChangeText={p.onChange}
        disabled={p.busy || !p.checked}
        keyboardType="number-pad"
      />
      <AppButton
        label="Guardar antelación de reprogramación"
        onPress={p.onSave}
        disabled={p.busy || !p.checked || !/^\d+$/.test(p.value)}
      />
      {p.saved && (
        <AppText accessibilityLiveRegion="polite">
          Política de reprogramación guardada.
        </AppText>
      )}
      {p.error && (
        <AppText tone="error" accessibilityLiveRegion="polite">
          {p.error}
        </AppText>
      )}
    </View>
  );
}
export function ReschedulePolicyControl({
  barbershopId,
  autoLoad = false,
  renderContent,
}: {
  barbershopId: string;
  autoLoad?: boolean;
  renderContent?: (
    props: Parameters<typeof ReschedulePolicyContent>[0],
  ) => ReactNode;
}) {
  const actions = useContext(BookingContext)?.reschedule;
  const [value, setValue] = useState(''),
    [checked, setChecked] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null),
    [saved, setSaved] = useState(false);
  const inFlight = useRef(false);
  useInitialRead(autoLoad, barbershopId, () => void run(false));
  if (!actions) return null;
  async function run(save: boolean) {
    if (!actions || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const result = await (save
        ? actions.setPolicy({ barbershopId, advanceMin: Number(value) })
        : actions.readPolicy(barbershopId));
      setValue(String(result.advanceMin));
      setChecked(true);
      setSaved(save);
    } catch (e) {
      const code =
        e instanceof BusinessError ? e.code : 'DEPENDENCY_UNAVAILABLE';
      setError(bookingError(code));
      if (['UNAUTHENTICATED', 'FORBIDDEN', 'NOT_AVAILABLE'].includes(code)) {
        setValue('');
        setChecked(false);
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  const props = {
    value,
    checked,
    busy,
    error,
    saved,
    onChange: (v: string) => {
      setValue(v);
      setSaved(false);
    },
    onRead: () => void run(false),
    onSave: () => void run(true),
  };
  const Content = renderContent ?? ReschedulePolicyContent;
  return <Content {...props} />;
}
