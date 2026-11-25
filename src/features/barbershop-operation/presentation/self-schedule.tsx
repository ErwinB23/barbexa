import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { SelfScheduleWeb } from './self-schedule-web';
import { preparePersonalInterval } from './self-schedule-options';
import type { SelfScheduleContentProps } from './self-schedule-props';
import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { Section } from '../../../shared/ui/page-header';
import { StatusMessage } from '../../../shared/ui/status-message';
import type { Hours } from '../domain/types';
import { BusinessError } from '../domain/values';
import {
  limaScheduleInstant,
  scheduleClockMinutes,
  scheduleHours,
  type OwnSchedule,
} from '../domain/self-schedule';
import type { SelfScheduleApplication } from '../application/self-schedule';
const days = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
const clock = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
const local = (utc: string) =>
  new Date(Date.parse(utc) - 5 * 3600000)
    .toISOString()
    .slice(0, 16)
    .replace('T', ' ');
export function SelfScheduleContent(p: SelfScheduleContentProps) {
  if (Platform.OS === 'web') return <SelfScheduleWeb {...p} />;
  const field = (
    id: string,
    label: string,
    value: string,
    onChangeText: (v: string) => void,
  ) => (
    <AppTextField
      id={id}
      label={label}
      value={value}
      onChangeText={onChangeText}
      disabled={p.busy}
    />
  );
  return (
    <Section
      title={
        p.hideWeeklyEditor
          ? 'Mis bloqueos personales'
          : 'Mis horarios y bloqueos'
      }
    >
      <AppText>
        Hora de Lima. Los cambios no pueden afectar tus citas comprometidas.
      </AppText>
      {p.hideWeeklyEditor && (
        <AppText>
          Solo afecta a tu cuenta como barbero en esta barbería. El selector
          superior no cambia estos bloqueos.
        </AppText>
      )}
      <AppButton
        label="Consultar mi disponibilidad"
        variant="secondary"
        disabled={p.busy}
        onPress={p.onRead}
      />
      {p.busy && (
        <StatusMessage
          state="loading"
          message="Verificando disponibilidad propia…"
        />
      )}
      {p.error && (
        <StatusMessage state="error" message={p.error} onRetry={p.onRead} />
      )}
      {!p.view && !p.busy && !p.error && (
        <StatusMessage
          state="empty"
          message="Consulta tu disponibilidad para verificar tus horarios y bloqueos."
        />
      )}
      {p.view && (
        <>
          <AppText variant="heading">Horario general del local</AppText>
          {!p.view.shopHours.length && (
            <AppText>El local aún no tiene intervalos generales.</AppText>
          )}
          {p.view.shopHours.map((h, i) => (
            <AppText key={i}>
              {days[h.weekday]} · {clock(h.opensMin)}–{clock(h.closesMin)}
            </AppText>
          ))}
          {!p.hideWeeklyEditor && (
            <>
              <AppText variant="heading">Mis intervalos semanales</AppText>
              {!p.hours.length && (
                <AppText>
                  No tienes intervalos en el formulario. Guardar esta lista
                  retirará tus horarios si no afecta citas.
                </AppText>
              )}
              {p.hours.map((h, i) => (
                <Section
                  key={i}
                  title={`${days[h.weekday]} · ${clock(h.opensMin)}–${clock(h.closesMin)}`}
                >
                  <AppButton
                    label={`Retirar intervalo ${i + 1}`}
                    variant="secondary"
                    disabled={p.busy}
                    onPress={() => p.onRemoveHour(i)}
                  />
                </Section>
              ))}
              {field(
                'self-day',
                'Día (0 domingo a 6 sábado)',
                p.weekday,
                p.onWeekday,
              )}
              {field(
                'self-opens',
                'Inicio semanal (HH:mm)',
                p.opens,
                p.onOpens,
              )}
              {field(
                'self-closes',
                'Fin semanal (HH:mm, hasta 24:00)',
                p.closes,
                p.onCloses,
              )}
              <AppButton
                label="Añadir intervalo a mi lista"
                variant="secondary"
                disabled={p.busy}
                onPress={p.onAdd}
              />
              <AppButton
                label="Guardar mis horarios"
                disabled={p.busy}
                onPress={() => {
                  if (!p.busy) p.onSaveHours();
                }}
              />
            </>
          )}
          <AppText variant="heading">Mis bloqueos</AppText>
          {!p.view.blocks.length && (
            <AppText>No tienes bloqueos propios registrados.</AppText>
          )}
          {p.view.blocks.map((b, i) => (
            <Section
              key={b.id}
              title={`${local(b.startsAt)} → ${local(b.endsAt)}`}
            >
              {b.reason && <AppText>{b.reason}</AppText>}
              <AppButton
                label={`Editar bloqueo ${i + 1}`}
                variant="secondary"
                disabled={p.busy}
                onPress={() => p.onSelectBlock(b)}
              />
              <AppButton
                label={`Retirar bloqueo ${i + 1}`}
                variant="danger"
                disabled={p.busy}
                onPress={() => {
                  if (!p.busy) p.onRemoveBlock(b.id);
                }}
              />
            </Section>
          ))}
          {field(
            'self-block-start',
            'Inicio de bloqueo (AAAA-MM-DD HH:mm)',
            p.starts,
            p.onStarts,
          )}
          {field(
            'self-block-end',
            'Fin de bloqueo (AAAA-MM-DD HH:mm)',
            p.ends,
            p.onEnds,
          )}
          {field(
            'self-block-reason',
            'Motivo del bloqueo (opcional)',
            p.reason,
            p.onReason,
          )}
          <AppButton
            label="Guardar mi bloqueo"
            disabled={p.busy}
            onPress={() => {
              if (!p.busy) p.onSaveBlock();
            }}
          />
          <AppButton
            label="Preparar otro bloqueo"
            variant="secondary"
            disabled={p.busy}
            onPress={p.onNewBlock}
          />
        </>
      )}
      {p.saved && (
        <StatusMessage
          state="success"
          message="Disponibilidad propia actualizada."
        />
      )}
    </Section>
  );
}
export function SelfSchedulePanel({
  application: app,
  hideWeeklyEditor = false,
}: {
  application: SelfScheduleApplication;
  hideWeeklyEditor?: boolean;
}) {
  const [view, setView] = useState<OwnSchedule | null>(null),
    [hours, setHours] = useState<readonly Hours[]>([]);
  const [weekday, setWeekday] = useState('1'),
    [opens, setOpens] = useState(''),
    [closes, setCloses] = useState('');
  const [starts, setStarts] = useState(''),
    [ends, setEnds] = useState(''),
    [reason, setReason] = useState(''),
    [blockId, setBlockId] = useState('');
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null),
    [saved, setSaved] = useState(false);
  const pending = useRef(false),
    mounted = useRef(true),
    stamp = app.scopeKey();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  function clearBlock() {
    setBlockId('');
    setStarts('');
    setEnds('');
    setReason('');
  }
  async function run(
    work: () => Promise<OwnSchedule>,
    resetHours: boolean,
    clear = false,
    success = false,
  ) {
    if (pending.current || !mounted.current || app.scopeKey() !== stamp) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const result = await work();
      if (!mounted.current || app.scopeKey() !== stamp) return;
      setView(result);
      if (resetHours) setHours(result.hours);
      if (clear) clearBlock();
      setSaved(success);
    } catch (e) {
      if (!mounted.current || app.scopeKey() !== stamp) return;
      const code =
        e instanceof BusinessError ? e.code : 'DEPENDENCY_UNAVAILABLE';
      if (['FORBIDDEN', 'UNAUTHENTICATED', 'NOT_AVAILABLE'].includes(code)) {
        setView(null);
        setHours([]);
        clearBlock();
      }
      setError(
        code === 'INVALID_INPUT'
          ? 'Revisa días, horas y fechas; el inicio debe ser anterior al fin.'
          : code === 'CONFLICT'
            ? 'Otro cambio o una cita comprometida impide guardar. Consulta la disponibilidad actual antes de reintentar.'
            : ['FORBIDDEN', 'UNAUTHENTICATED', 'NOT_AVAILABLE'].includes(code)
              ? 'Tu sesión o membresía no permite acceder a esta disponibilidad.'
              : 'No pudimos confirmar el cambio. Conservamos tu formulario; consulta el estado antes de reintentar.',
      );
    } finally {
      pending.current = false;
      if (mounted.current && app.scopeKey() === stamp) setBusy(false);
    }
  }
  function add() {
    try {
      if (!/^[0-6]$/.test(weekday)) throw new BusinessError('INVALID_INPUT');
      if (Platform.OS === 'web' && view) {
        setHours(preparePersonalInterval(view, hours, weekday, opens, closes));
        setError(null);
        setSaved(false);
        return;
      }
      setHours(
        scheduleHours([
          ...hours,
          {
            weekday: Number(weekday),
            opensMin: scheduleClockMinutes(opens),
            closesMin: scheduleClockMinutes(closes, true),
          },
        ]),
      );
      setError(null);
      setSaved(false);
    } catch {
      setError(
        'Revisa el día y el intervalo: debe estar dentro del horario del local y no solaparse con otro.',
      );
    }
  }
  return (
    <SelfScheduleContent
      hideWeeklyEditor={hideWeeklyEditor}
      view={view}
      hours={hours}
      weekday={weekday}
      opens={opens}
      closes={closes}
      starts={starts}
      ends={ends}
      reason={reason}
      busy={busy}
      error={error}
      saved={saved}
      onWeekday={setWeekday}
      onOpens={setOpens}
      onCloses={setCloses}
      onRead={() => {
        void run(app.read, true);
      }}
      onAdd={add}
      onRemoveHour={(i) => {
        setHours(hours.filter((_, n) => n !== i));
        setSaved(false);
      }}
      onSaveHours={() => {
        if (view)
          void run(() => app.setHours(view.version, hours), true, false, true);
      }}
      onStarts={setStarts}
      onEnds={setEnds}
      onReason={setReason}
      onNewBlock={clearBlock}
      onSelectBlock={(b) => {
        setBlockId(b.id);
        setStarts(local(b.startsAt));
        setEnds(local(b.endsAt));
        setReason(b.reason ?? '');
        setSaved(false);
      }}
      onSaveBlock={() => {
        if (view)
          void run(
            () => {
              const id = blockId || app.newBlockId();
              setBlockId(id);
              return app.saveBlock(view.version, {
                id,
                startsAt: limaScheduleInstant(starts),
                endsAt: limaScheduleInstant(ends),
                reason: reason.trim() || null,
              });
            },
            false,
            true,
            true,
          );
      }}
      onRemoveBlock={(id) => {
        if (view)
          void run(
            () => app.removeBlock(view.version, id),
            false,
            id === blockId,
            true,
          );
      }}
    />
  );
}
