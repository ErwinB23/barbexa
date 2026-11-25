import { useCallback, useEffect, useRef, useState } from 'react';
import type { ShopClosure } from '../domain/shop-closure';
import type { ShopClosuresApplication } from '../application/shop-closures';
import { BusinessError } from '../domain/values';
import { ShopSettingsIcon } from './shop-settings-web';
import { Section } from '../../../shared/ui/page-header';
import { AppText } from '../../../shared/ui/app-text';
import { AppButton } from '../../../shared/ui/app-button';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { StatusMessage } from '../../../shared/ui/status-message';
export function ShopClosuresContent(p: {
  premium?: boolean;
  rows: readonly ShopClosure[];
  loaded: boolean;
  busy: boolean;
  uncertain: boolean;
  nextCursor: string | null;
  selected: string | null;
  reason: string;
  error: string | null;
  success: string;
  onRead: () => void;
  onMore: () => void;
  onSelect: (id: string) => void;
  onCancel: () => void;
  onReason: (value: string) => void;
  onConfirm: () => void;
}) {
  return (
    <Section
      title="Cierres del local registrados"
      description="Afectan a toda la barbería. Aquí puedes consultar o retirar cierres ya registrados."
    >
      <AppText>
        Para crear un cierre, usa «Registrar un cierre o una ausencia» y elige
        «Toda la barbería». Retirar un cierre conserva su historial; los
        horarios y bloqueos personales siguen vigentes.
      </AppText>
      {p.busy && (
        <StatusMessage
          state="loading"
          message="Consultando o retirando el cierre…"
        />
      )}
      {p.error && (
        <StatusMessage
          state="error"
          message={p.error}
          onRetry={() => {
            if (!p.busy) p.onRead();
          }}
          retryLabel="Volver a consultar cierres"
        />
      )}
      {!!p.success && <StatusMessage state="success" message={p.success} />}
      <AppButton
        label="Consultar cierres del establecimiento"
        disabled={p.busy}
        onPress={p.onRead}
      />
      {p.loaded &&
        !p.rows.length &&
        (p.premium ? (
          <div className="bx-date-empty" role="status">
            <ShopSettingsIcon name="calendar" />
            <p>No hay cierres administrativos registrados.</p>
          </div>
        ) : (
          <StatusMessage
            state="empty"
            message="No hay cierres administrativos registrados."
          />
        ))}
      {p.rows.map((c) => (
        <Section key={c.id} title={c.reason || 'Cierre de la barbería'}>
          <AppText>Afecta a todos los profesionales del local.</AppText>
          <AppText>
            {new Date(c.startsAt).toLocaleString('es-PE', {
              timeZone: 'America/Lima',
            })}{' '}
            —{' '}
            {new Date(c.endsAt).toLocaleString('es-PE', {
              timeZone: 'America/Lima',
            })}
          </AppText>
          {c.reason && <AppText>Motivo original: {c.reason}</AppText>}
          <AppText>{c.status === 'active' ? 'Activo' : 'Retirado'}</AppText>
          {c.withdrawal && (
            <AppText>
              Retirada: {c.withdrawal.reason} ·{' '}
              {new Date(c.withdrawal.occurredAt).toLocaleString('es-PE', {
                timeZone: 'America/Lima',
              })}
            </AppText>
          )}
          {c.status === 'active' && (
            <AppButton
              label={`Retirar cierre ${c.id}`}
              variant="danger"
              disabled={p.busy || p.uncertain}
              onPress={() => p.onSelect(c.id)}
            />
          )}
          {p.selected === c.id && c.status === 'active' && (
            <>
              <AppText>
                Confirma la retirada lógica de este cierre. Sus fechas y el
                motivo original se conservarán; las reservas no se modificarán.
              </AppText>
              <AppTextField
                id="closure-withdrawal-reason"
                label="Motivo obligatorio de retirada"
                hint="Máximo 2000 caracteres."
                value={p.reason}
                onChangeText={p.onReason}
                disabled={p.busy || p.uncertain}
              />
              <AppButton
                label="Confirmar retirada del cierre"
                variant="danger"
                disabled={
                  p.busy ||
                  p.uncertain ||
                  !p.reason.trim() ||
                  p.reason.length > 2000
                }
                onPress={p.onConfirm}
              />
              <AppButton
                label="Volver sin retirar el cierre"
                disabled={p.busy}
                onPress={p.onCancel}
              />
            </>
          )}
        </Section>
      ))}
      {p.nextCursor && (
        <AppButton
          label="Cargar más cierres"
          disabled={p.busy || p.uncertain}
          onPress={p.onMore}
        />
      )}
    </Section>
  );
}
export function ShopClosuresPanel({
  application: app,
  newRequestId,
  premium = false,
}: {
  premium?: boolean;
  application: ShopClosuresApplication;
  newRequestId: () => string;
}) {
  const stamp = app.scopeKey();
  const [rows, setRows] = useState<readonly ShopClosure[]>([]),
    [loaded, setLoaded] = useState(false),
    [busy, setBusy] = useState(false),
    [uncertain, setUncertain] = useState(false),
    [nextCursor, setNextCursor] = useState<string | null>(null),
    [selected, setSelected] = useState<string | null>(null),
    [reason, setReason] = useState(''),
    [error, setError] = useState<string | null>(null),
    [success, setSuccess] = useState('');
  const mounted = useRef(false),
    pending = useRef(false);
  const run = useCallback(
    async (
      cursor: string | null,
      withdrawal?: { closureId: string; requestId: string; reason: string },
    ) => {
      if (pending.current) return;
      pending.current = true;
      setBusy(true);
      setError(null);
      setSuccess('');
      try {
        if (withdrawal) {
          const result = await app.withdraw(withdrawal);
          if (!mounted.current || app.scopeKey() !== stamp) return;
          setRows((old) =>
            old.map((c) => (c.id === result.closure.id ? result.closure : c)),
          );
          setSelected(null);
          setReason('');
          setSuccess(
            result.replayed
              ? 'El cierre ya estaba retirado. No se duplicaron cambios ni auditorías.'
              : 'Cierre retirado. Su historial y las reservas se conservaron.',
          );
        } else {
          const page = await app.list(cursor);
          if (!mounted.current || app.scopeKey() !== stamp) return;
          setRows((old) =>
            cursor
              ? [
                  ...old.filter(
                    (c) => !page.closures.some((v) => v.id === c.id),
                  ),
                  ...page.closures,
                ]
              : page.closures,
          );
          setNextCursor(page.nextCursor);
          setLoaded(true);
          setSelected(null);
        }
        setUncertain(false);
      } catch (failure) {
        if (!mounted.current || app.scopeKey() !== stamp) return;
        const code =
          failure instanceof BusinessError
            ? failure.code
            : 'DEPENDENCY_UNAVAILABLE';
        setUncertain(true);
        if (['FORBIDDEN', 'UNAUTHENTICATED', 'NOT_AVAILABLE'].includes(code)) {
          setRows([]);
          setLoaded(false);
          setSelected(null);
          setReason('');
        }
        setError(
          code === 'INVALID_INPUT'
            ? 'Escribe un motivo válido de hasta 2000 caracteres.'
            : code === 'FORBIDDEN' || code === 'UNAUTHENTICATED'
              ? 'Tu sesión o permisos actuales no permiten gestionar estos cierres.'
              : code === 'NOT_AVAILABLE'
                ? 'El cierre no está disponible en la barbería seleccionada.'
                : withdrawal
                  ? 'Resultado incierto: consulta de nuevo los cierres antes de realizar otra operación.'
                  : 'No pudimos consultar los cierres. Puedes volver a intentarlo.',
        );
      } finally {
        pending.current = false;
        if (mounted.current && app.scopeKey() === stamp) setBusy(false);
      }
    },
    [app, stamp],
  );
  useEffect(() => {
    let active = true;
    mounted.current = true;
    void Promise.resolve().then(() => {
      if (active) return run(null);
    });
    return () => {
      active = false;
      mounted.current = false;
    };
  }, [run]);
  return (
    <ShopClosuresContent
      premium={premium}
      rows={rows}
      loaded={loaded}
      busy={busy}
      uncertain={uncertain}
      nextCursor={nextCursor}
      selected={selected}
      reason={reason}
      error={error}
      success={success}
      onRead={() => {
        void run(null);
      }}
      onMore={() => {
        if (nextCursor) void run(nextCursor);
      }}
      onSelect={(id) => {
        setSelected(id);
        setReason('');
        setSuccess('');
      }}
      onCancel={() => setSelected(null)}
      onReason={setReason}
      onConfirm={() => {
        if (uncertain || !selected) return;
        try {
          void run(null, {
            closureId: selected,
            requestId: newRequestId(),
            reason,
          });
        } catch {
          setError(
            'No se pudo preparar la operación. Vuelve a consultar los cierres.',
          );
        }
      }}
    />
  );
}
