import { tokens } from '../../../shared/ui/tokens';
import { SuccessToast } from '../../../shared/ui/success-toast';
import { useInitialRead } from './use-initial-read';
import { useContext, useRef, useState, type ReactNode } from 'react';
import { View, Platform } from 'react-native';
import { CareFilterSelects } from './agenda-web';
import { BookingContext } from './booking-context';
import { careView, type CareView } from '../domain/care';
import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
import { AppTextField } from '../../../shared/ui/app-text-field';
export interface CareOperation {
  command: string;
  label: string;
  onSelect: () => void;
}
export interface CareLayoutParts {
  trigger: ReactNode;
  content: ReactNode;
  actions: ReactNode;
  busy: boolean;
  view: CareView | null;
  operations: readonly CareOperation[];
  feedback: ReactNode;
  operationConfirmation?: {
    command: string;
    busy: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  };
}
type PaymentReportActions = { busy: boolean; onSubmit: (code: string) => void };
type PaymentInfoRender = (
  view: CareView,
  report: PaymentReportActions,
) => ReactNode;
function PaymentInfoRenderer(p: {
  render: PaymentInfoRender;
  view: CareView;
  report: PaymentReportActions;
}) {
  return p.render(p.view, p.report);
}
export function CareControl({
  reservationId,
  startsAt,
  renderActions,
  initialView = null,
  renderLayout,
  onReadStart,
  onUpdated,
  renderPaymentInfo,
  confirmOperationsInCard = false,
}: {
  reservationId: string;
  confirmOperationsInCard?: boolean;
  startsAt?: string;
  renderActions?: (view: CareView | null) => ReactNode;
  initialView?: CareView | null;
  onReadStart?: () => void;
  onUpdated?: (view: CareView, mutated: boolean) => void;
  renderLayout?: (parts: CareLayoutParts) => ReactNode;
  renderPaymentInfo?: PaymentInfoRender;
}) {
  const app = useContext(BookingContext),
    [view, setView] = useState<CareView | null>(initialView),
    [busy, setBusy] = useState(false),
    [locked, setLocked] = useState(false),
    [error, setError] = useState(''),
    [choice, setChoice] = useState(''),
    [reason, setReason] = useState(''),
    [yapeCode, setYapeCode] = useState('');
  const [startAlert, setStartAlert] = useState(0);
  const active = useRef(false),
    pending = useRef<Record<string, unknown> | null>(null),
    ticket = useRef(0);
  async function run(command: string, securityCode?: string) {
    if (!app?.care || active.current) return;
    if (
      command === 'report-yape' &&
      !pending.current &&
      (view?.canReportYape !== true || !/^[0-9]{3}$/.test(securityCode ?? ''))
    )
      return;
    active.current = true;
    setBusy(true);
    setError('');
    const seq = ++ticket.current;
    try {
      if (command !== 'read' && !pending.current)
        pending.current = {
          command,
          reservationId,
          requestId: app.cancellationRequestId?.(),
          ...(['receive', 'refund'].includes(command)
            ? { attested: true }
            : {}),
          ...(command === 'refund' ? { reason } : {}),
          ...(command === 'report-yape' ? { securityCode } : {}),
        };
      const result = await app.care(
        pending.current ?? { command: 'read', reservationId },
      );
      if (ticket.current === seq) {
        const next = careView(result, reservationId);
        if (
          command === 'report-yape' &&
          next.yapeReport?.securityCode !== pending.current?.securityCode
        )
          throw { code: 'DEPENDENCY_UNAVAILABLE' };
        setView(next);
        onUpdated?.(next, command !== 'read');
        pending.current = null;
        setChoice('');
      }
    } catch (e) {
      const code = e && typeof e === 'object' && 'code' in e ? e.code : '';
      if (code !== 'DEPENDENCY_UNAVAILABLE') pending.current = null;
      if (
        code === 'UNAUTHENTICATED' ||
        code === 'FORBIDDEN' ||
        code === 'NOT_AVAILABLE'
      ) {
        setView(null);
        setChoice('');
        setReason('');
      }
      setError(
        code === 'DEPENDENCY_UNAVAILABLE'
          ? 'Servicio no disponible o resultado incierto. Reintenta la misma operación; no se declara éxito.'
          : 'La operación no está permitida o cambió el estado. Consulta nuevamente.',
      );
    } finally {
      setLocked(pending.current !== null);
      active.current = false;
      setBusy(false);
    }
  }
  if (!app?.care) return null;
  const trigger = (
    <AppButton
      label="Consultar atención y pago"
      disabled={busy || locked}
      onPress={() => {
        onReadStart?.();
        void run('read');
      }}
    />
  );
  const operations: CareOperation[] = [];
  const offer = (command: string, label: string) =>
    operations.push({
      command,
      label,
      onSelect: () => {
        if (busy || locked) return;
        if (
          command === 'start' &&
          startsAt &&
          Date.now() < Date.parse(startsAt)
        ) {
          setStartAlert((attempt) => attempt + 1);
          return;
        }
        setChoice(command);
      },
    });
  if (view?.permissions.attend && view.attendance === 'confirmed') {
    offer('start', 'Iniciar atención');
    offer('no-show', 'Registrar inasistencia');
  }
  if (view?.permissions.attend && view.attendance === 'in-service')
    offer('complete', 'Completar atención');
  if (view?.permissions.receive && view.payment?.status === 'pending')
    offer('receive', 'Registrar pago recibido');
  if (
    view?.permissions.refund &&
    view.payment?.status === 'paid' &&
    view.attendance === 'cancelled'
  )
    offer('refund', 'Registrar reembolso total externo');
  const feedback = (
    <>
      {startAlert > 0 &&
        (Platform.OS === 'web' ? (
          <SuccessToast
            key={startAlert}
            tone="warning"
            message="Aún no puedes iniciar esta atención"
            description={`La cita está programada para las ${startsAt ? new Date(startsAt).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit' }) : ''}. Podrás iniciarla desde esa hora.`}
          />
        ) : (
          <AppText accessibilityLiveRegion="polite">
            Todavía no puedes iniciar esta atención. Espera a la hora
            programada.
          </AppText>
        ))}
      {!!error && <AppText accessibilityLiveRegion="polite">{error}</AppText>}
      {locked && (
        <AppButton
          label="Reintentar la misma operación"
          disabled={busy}
          onPress={() => void run(String(pending.current?.command))}
        />
      )}
      {view && (
        <>
          {choice &&
            !(
              confirmOperationsInCard &&
              Platform.OS === 'web' &&
              ['start', 'complete', 'receive', 'no-show'].includes(choice)
            ) && (
              <>
                <AppText>
                  {choice === 'receive'
                    ? 'Confirmo que recibí el importe completo fuera de la app.'
                    : choice === 'refund'
                      ? 'Confirmo que realicé el reembolso total fuera de la app. No se moverá dinero.'
                      : 'Confirmar cambio de atención. El servidor verificará horario y permisos actuales.'}
                </AppText>
                {choice === 'refund' && (
                  <AppTextField
                    id={`refund-${reservationId}`}
                    label="Motivo obligatorio"
                    value={reason}
                    onChangeText={setReason}
                    disabled={busy || locked}
                  />
                )}
                <AppButton
                  label="Confirmar operación"
                  disabled={
                    busy || locked || (choice === 'refund' && !reason.trim())
                  }
                  onPress={() => void run(choice)}
                />
                <AppButton
                  label="Volver sin confirmar"
                  disabled={busy || locked}
                  onPress={() => setChoice('')}
                />
              </>
            )}
        </>
      )}
    </>
  );
  const content = (
    <>
      {feedback}
      {view && (
        <>
          <AppText>
            Atención:{' '}
            {view.attendance === null
              ? 'Sin registro previo'
              : {
                  confirmed: 'Pendiente',
                  'in-service': 'En atención',
                  completed: 'Completada',
                  'no-show': 'No asistió',
                  cancelled: 'Cancelada',
                }[view.attendance]}
          </AppText>
          <AppText>
            Pago:{' '}
            {view.payment
              ? `${view.payment.method === 'cash' ? 'Efectivo' : 'Yape'} · ${view.payment.status === 'pending' ? 'Pendiente' : view.payment.status === 'paid' ? 'Recibido' : 'Reembolsado'} · S/ ${(view.payment.amountMinor / 100).toFixed(2)}`
              : 'Sin registro financiero'}
          </AppText>
          {renderPaymentInfo ? (
            <PaymentInfoRenderer
              render={renderPaymentInfo}
              view={view}
              report={{
                busy: busy || locked,
                onSubmit: (code) => void run('report-yape', code),
              }}
            />
          ) : (
            !!view.yapeInstructions && (
              <AppText>Yape: {view.yapeInstructions}</AppText>
            )
          )}
          {view.yapeReport && (
            <AppText accessibilityLiveRegion="polite">
              Código de seguridad Yape: {view.yapeReport.securityCode} ·{' '}
              {view.payment?.status === 'paid'
                ? 'Pago recibido'
                : view.payment?.status === 'refunded'
                  ? 'Pago reembolsado'
                  : view.attendance === 'cancelled'
                    ? 'Aviso registrado antes de la cancelación'
                    : 'Pendiente de verificación por la barbería'}
            </AppText>
          )}
          {!renderPaymentInfo &&
            view.canReportYape === true &&
            !view.yapeReport && (
              <View style={{ gap: tokens.space.md }}>
                <AppTextField
                  id={`yape-code-${reservationId}`}
                  label="Código de seguridad del yapeo (3 dígitos)"
                  value={yapeCode}
                  onChangeText={setYapeCode}
                  disabled={busy || locked}
                />
                <AppText>
                  Ingresa el código de la transferencia realizada. La barbería
                  verificará la recepción.
                </AppText>
                <AppButton
                  label="Confirmar pago"
                  disabled={busy || locked || !/^[0-9]{3}$/.test(yapeCode)}
                  onPress={() => void run('report-yape', yapeCode)}
                />
              </View>
            )}
          {operations.map((o) => (
            <AppButton
              key={o.command}
              label={o.label}
              disabled={busy || locked}
              onPress={o.onSelect}
            />
          ))}
          {view.events.map((e, i) => (
            <AppText key={`${e.occurredAt}-${i}`}>
              {e.kind} ·{' '}
              {new Date(e.occurredAt).toLocaleString('es-PE', {
                timeZone: 'America/Lima',
              })}
              {e.reason ? ` · ${e.reason}` : ''}
            </AppText>
          ))}
        </>
      )}
    </>
  );
  const actions = renderActions?.(busy || locked ? null : view);
  const operationConfirmation =
    confirmOperationsInCard &&
    !locked &&
    Platform.OS === 'web' &&
    ['start', 'complete', 'receive', 'no-show'].includes(choice)
      ? {
          command: choice,
          busy: busy || locked,
          onConfirm: () => void run(choice),
          onCancel: () => {
            if (!busy && !locked) setChoice('');
          },
        }
      : undefined;
  return renderLayout ? (
    // Handlers are deferred UI events; the layout never executes mutations during render.
    // eslint-disable-next-line react-hooks/refs
    renderLayout({
      operationConfirmation,
      operations,
      feedback,
      trigger,
      content,
      actions,
      busy: busy || locked,
      view,
    })
  ) : (
    <View>
      {trigger}
      {content}
      {actions}
    </View>
  );
}
export interface CareSettingsEditor {
  loaded: boolean;
  busy: boolean;
  locked: boolean;
  tolerance: string;
  instructions: string;
  configuredInstructions: string | null;
  dirty: boolean;
  onTolerance: (value: string) => void;
  onInstructions: (value: string) => void;
  onSave: (instructionsOverride?: string) => void;
}
export interface CareSettingsParts {
  read: ReactNode;
  payments: ReactNode;
  attendance: ReactNode;
  save: ReactNode;
  feedback: ReactNode;
  editor: CareSettingsEditor;
}
export function CareSettings({
  barbershopId,
  autoLoad = false,
  renderLayout,
}: {
  barbershopId: string;
  autoLoad?: boolean;
  renderLayout?: (parts: CareSettingsParts) => ReactNode;
}) {
  const app = useContext(BookingContext),
    [tolerance, setTolerance] = useState('10'),
    [instructions, setInstructions] = useState(''),
    [loaded, setLoaded] = useState(false),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [locked, setLocked] = useState(false);
  const lock = useRef(false),
    pending = useRef<Record<string, unknown> | null>(null);
  const [baseline, setBaseline] = useState<{
    instructions: string;
    tolerance: string;
  } | null>(null);
  async function run(save: boolean, instructionsOverride?: string) {
    if (!app?.care || lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage('');
    try {
      if (save && !pending.current)
        pending.current = {
          command: 'configure',
          barbershopId,
          requestId: app.cancellationRequestId?.(),
          noShowToleranceMin: Number(tolerance),
          yapeInstructions:
            (instructionsOverride ?? instructions).trim() || null,
        };
      const raw = await app.care(
        pending.current ?? { command: 'settings', barbershopId },
      );
      const v = raw as {
        barbershopId: string;
        noShowToleranceMin: number;
        yapeInstructions: string | null;
      };
      if (
        v.barbershopId !== barbershopId ||
        !Number.isInteger(v.noShowToleranceMin) ||
        !(v.yapeInstructions === null || typeof v.yapeInstructions === 'string')
      )
        throw Error();
      setTolerance(String(v.noShowToleranceMin));
      setInstructions(v.yapeInstructions ?? '');
      setBaseline({
        instructions: v.yapeInstructions ?? '',
        tolerance: String(v.noShowToleranceMin),
      });
      setLoaded(true);
      pending.current = null;
      setMessage('Configuración consultada o guardada.');
    } catch (e) {
      const code = e && typeof e === 'object' && 'code' in e ? e.code : '';
      if (
        code === 'UNAUTHENTICATED' ||
        code === 'FORBIDDEN' ||
        code === 'NOT_AVAILABLE'
      ) {
        setLoaded(false);
        setInstructions('');
      }
      if (!(
        e &&
        typeof e === 'object' &&
        'code' in e &&
        e.code === 'DEPENDENCY_UNAVAILABLE'
      ))
        pending.current = null;
      setMessage(
        'No se confirmó la configuración. Reintenta; no se declara guardada.',
      );
    } finally {
      setLocked(pending.current !== null);
      lock.current = false;
      setBusy(false);
    }
  }
  useInitialRead(autoLoad, barbershopId, () => void run(false));
  const parts: CareSettingsParts = {
    editor: {
      loaded,
      busy,
      locked,
      tolerance,
      instructions,
      configuredInstructions: baseline?.instructions ?? null,
      dirty:
        !!baseline &&
        (instructions !== baseline.instructions ||
          tolerance !== baseline.tolerance),
      onTolerance: setTolerance,
      onInstructions: setInstructions,
      onSave: (instructionsOverride) => void run(true, instructionsOverride),
    },
    read: (
      <AppButton
        label="Consultar configuración de atención y Yape"
        disabled={busy || locked}
        onPress={() => void run(false)}
      />
    ),
    attendance: loaded ? (
      <AppTextField
        id="no-show-tolerance"
        label="Tolerancia de inasistencia (minutos)"
        value={tolerance}
        onChangeText={setTolerance}
        disabled={busy || locked}
        keyboardType="number-pad"
      />
    ) : null,
    payments: loaded ? (
      <AppTextField
        id="yape-instructions"
        label="Instrucciones Yape (vacío deshabilita Yape)"
        value={instructions}
        onChangeText={setInstructions}
        disabled={busy || locked}
      />
    ) : null,
    save: loaded ? (
      <AppButton
        label="Guardar configuración de mi barbería"
        disabled={busy}
        onPress={() => void run(true)}
      />
    ) : null,
    feedback: <AppText accessibilityLiveRegion="polite">{message}</AppText>,
  };
  const Layout = renderLayout;
  return Layout ? (
    <Layout {...parts} />
  ) : (
    <View>
      {parts.read}
      {parts.attendance}
      {parts.payments}
      {parts.save}
      {parts.feedback}
    </View>
  );
}
export function CareAgendaFilter({
  rows,
  onResult,
}: {
  rows: readonly { id: string }[];
  onResult: (ids: readonly string[] | null) => void;
}) {
  const app = useContext(BookingContext),
    [attendance, setAttendance] = useState('all'),
    [payment, setPayment] = useState('all'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const lock = useRef(false);
  async function apply() {
    if (!app?.care || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      if (attendance === 'all' && payment === 'all') {
        onResult(null);
        return;
      }
      const selected: string[] = [];
      for (let i = 0; i < rows.length; i += 4) {
        const group = await Promise.all(
          rows
            .slice(i, i + 4)
            .map(async (row) =>
              careView(
                await app.care!({ command: 'read', reservationId: row.id }),
                row.id,
              ),
            ),
        );
        for (const v of group)
          if (
            (attendance === 'all' ||
              (attendance === 'absent'
                ? v.attendance === null
                : v.attendance === attendance)) &&
            (payment === 'all' ||
              (payment === 'absent'
                ? v.payment === null
                : v.payment?.status === payment))
          )
            selected.push(v.reservationId);
      }
      onResult(selected);
    } catch {
      setError(
        'No se verificaron los estados. No se aplicó el filtro; vuelve a consultar.',
      );
      onResult(null);
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  if (!app?.care) return null;
  if (Platform.OS === 'web')
    return (
      <CareFilterSelects
        attendance={attendance}
        payment={payment}
        busy={busy}
        onAttendance={setAttendance}
        onPayment={setPayment}
        onApply={() => void apply()}
        error={error}
      />
    );
  return (
    <View>
      <AppText>Filtrar atención</AppText>
      {[
        ['all', 'Todas'],
        ['confirmed', 'Pendiente'],
        ['in-service', 'En atención'],
        ['completed', 'Completada'],
        ['no-show', 'No asistió'],
        ['cancelled', 'Cancelada'],
        ['absent', 'Sin registro'],
      ].map(([value, label]) => (
        <AppButton
          key={value}
          label={label}
          selected={attendance === value}
          disabled={busy}
          onPress={() => setAttendance(value)}
        />
      ))}
      <AppText>Filtrar pago</AppText>
      {[
        ['all', 'Todos'],
        ['pending', 'Pendiente de pago'],
        ['paid', 'Recibido'],
        ['refunded', 'Reembolsado'],
        ['absent', 'Sin registro financiero'],
      ].map(([value, label]) => (
        <AppButton
          key={value}
          label={label}
          selected={payment === value}
          disabled={busy}
          onPress={() => setPayment(value)}
        />
      ))}
      <AppButton
        label="Consultar y aplicar filtros de atención y pago"
        disabled={busy}
        onPress={() => void apply()}
      />
      <AppText>
        Al actualizar la agenda, vuelve a aplicar estos filtros para verificar
        los estados actuales.
      </AppText>
      {!!error && <AppText accessibilityLiveRegion="polite">{error}</AppText>}
    </View>
  );
}
