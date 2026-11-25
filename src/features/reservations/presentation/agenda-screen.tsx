import { AdminBookingCardWeb } from './admin-booking-card.web';
import type { CareView } from '../domain/care';
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import type { BookingDetail } from '../domain/types';
import { AgendaWeb } from './agenda-web';
import { CancellationControl } from './cancellation-control';
import { RescheduleControl } from './reschedule-control';
import type {
  AgendaApplication,
  AgendaFilters,
} from '../application/agenda-application';
import { Screen } from '../../../shared/ui/screen';
import { PageHeader, Section, ActionRow } from '../../../shared/ui/page-header';
import { AppText } from '../../../shared/ui/app-text';
import { AppButton } from '../../../shared/ui/app-button';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { StatusMessage } from '../../../shared/ui/status-message';
import { CareAgendaFilter } from './care-control';
import { BookingCard } from './booking-screen';
export function AgendaContent({
  state,
  administrator,
  onDate,
  onFilter,
  onRefresh,
  onContext,
  date,
  extraFilters,
  settings,
  shopName,
}: {
  state: ReturnType<AgendaApplication['getSnapshot']>;
  administrator: boolean;
  date: string;
  extraFilters?: ReactNode;
  settings?: ReactNode;
  shopName?: string;
  onDate: (v: string) => void;
  onFilter: (v: Partial<AgendaFilters>) => void;
  onRefresh: () => void;
  onContext: () => void;
}) {
  const [careRecords, setCareRecords] = useState<{
    source: typeof state.rows;
    values: Record<string, CareView>;
  } | null>(null);
  const careViews =
    careRecords?.source === state.rows ? careRecords.values : {};
  const professionals = [
    ...new Map(
      state.rows.map((r) => [r.barberId, r.barberNameSnapshot]),
    ).entries(),
  ];
  const card = (r: BookingDetail) =>
    Platform.OS === 'web' && administrator ? (
      <AdminBookingCardWeb
        key={r.id}
        detail={r}
        onCare={(view) =>
          setCareRecords((previous) => ({
            source: state.rows,
            values: {
              ...(previous?.source === state.rows ? previous.values : {}),
              [r.id]: view,
            },
          }))
        }
      />
    ) : (
      <BookingCard key={r.id} detail={r}>
        {(canChange) => (
          <>
            {canChange && <CancellationControl detail={r} staff />}
            <RescheduleControl detail={r} staff canChange={canChange} />
          </>
        )}
      </BookingCard>
    );
  const groups = [
    ...new Map(
      state.rows.map((row) => [row.barberId, row.barberNameSnapshot]),
    ).entries(),
  ].sort((a, b) => a[1].localeCompare(b[1], 'es'));
  const cards =
    state.phase !== 'ready'
      ? null
      : administrator
        ? groups.map(([id, name]) => {
            const rows = state.rows
              .filter((row) => row.barberId === id)
              .slice()
              .sort(
                (a, b) =>
                  Date.parse(b.startsAt) - Date.parse(a.startsAt) ||
                  a.id.localeCompare(b.id),
              );
            return Platform.OS === 'web' ? (
              <details className="bx-agenda-professional" key={id} open>
                <summary>
                  <span
                    className="bx-agenda-professional-avatar"
                    aria-hidden="true"
                  >
                    {name.trim().charAt(0).toUpperCase()}
                  </span>
                  <strong>{name}</strong>
                  <span className="bx-agenda-count">
                    {rows.length} {rows.length === 1 ? 'cita' : 'citas'}
                  </span>
                  <span className="bx-agenda-chevron" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <div className="bx-agenda-professional-list">
                  {rows.map(card)}
                </div>
              </details>
            ) : (
              <Section
                key={id}
                title={`${name} · ${rows.length} ${rows.length === 1 ? 'cita' : 'citas'}`}
              >
                {rows.map(card)}
              </Section>
            );
          })
        : state.rows
            .slice()
            .sort(
              (a, b) =>
                Date.parse(b.startsAt) - Date.parse(a.startsAt) ||
                a.id.localeCompare(b.id),
            )
            .map(card);
  if (Platform.OS === 'web')
    return (
      <AgendaWeb
        state={state}
        administrator={administrator}
        shopName={shopName}
        careViews={careViews}
        date={date}
        professionals={professionals}
        onDate={onDate}
        onFilter={onFilter}
        onRefresh={onRefresh}
        onContext={onContext}
        extraFilters={extraFilters}
      >
        {cards}
      </AgendaWeb>
    );
  return (
    <Screen width="wide">
      <PageHeader
        title={administrator ? 'Agenda de tu barbería' : 'Mi agenda'}
      />
      <AppText>
        {administrator
          ? `Citas de ${shopName ?? 'la barbería seleccionada'}`
          : 'Solo tus citas asignadas'}{' '}
        · hora de Lima
      </AppText>
      <Section title="Consultar citas">
        <AppTextField
          id="agenda-date"
          label="Fecha (AAAA-MM-DD)"
          value={date}
          onChangeText={onDate}
        />
        <AppButton
          label="Consultar / actualizar agenda"
          onPress={onRefresh}
          disabled={state.phase === 'loading'}
        />
        <AppButton
          label="Cambiar barbería"
          variant="ghost"
          onPress={onContext}
        />
      </Section>
      <ActionRow>
        <AppButton
          label="Todos los estados"
          variant="secondary"
          compact
          selected={state.filters.state === null}
          onPress={() => onFilter({ state: null })}
        />
        <AppButton
          label="Solo confirmadas"
          variant="secondary"
          compact
          selected={state.filters.state === 'confirmed'}
          onPress={() => onFilter({ state: 'confirmed' })}
        />
        <AppButton
          label="Solo canceladas"
          variant="secondary"
          compact
          selected={state.filters.state === 'cancelled'}
          onPress={() => onFilter({ state: 'cancelled' })}
        />
      </ActionRow>
      {administrator && (
        <ActionRow>
          <AppButton
            label="Todos los profesionales"
            variant="secondary"
            compact
            selected={state.filters.barberId === null}
            onPress={() => onFilter({ barberId: null })}
          />
          {professionals.map(([id, name]) => (
            <AppButton
              key={id}
              variant="secondary"
              compact
              selected={state.filters.barberId === id}
              label={`Solo ${name}`}
              onPress={() => onFilter({ barberId: id })}
            />
          ))}
        </ActionRow>
      )}
      {state.phase === 'loading' && (
        <StatusMessage
          state="loading"
          message="Consultando agenda autorizada…"
        />
      )}
      {state.phase === 'error' && (
        <StatusMessage
          state="error"
          onRetry={onRefresh}
          message={
            state.error === 'INVALID_INPUT'
              ? 'Revisa la fecha ingresada.'
              : state.error === 'FORBIDDEN'
                ? 'No tienes permiso para consultar esta agenda. Actualiza tus barberías.'
                : 'No pudimos consultar la agenda. Vuelve a intentarlo.'
          }
        />
      )}
      {state.phase === 'ready' && !state.rows.length && (
        <StatusMessage
          state="empty"
          message="No hay citas para estos filtros."
        />
      )}
      {cards}
      {state.rows.length === 200 && (
        <AppText>
          Se muestran las primeras 200 citas del día. Filtra por profesional o
          estado.
        </AppText>
      )}
    </Screen>
  );
}
export function AgendaScreen({
  application,
  administrator,
  barbershopId,
  shopName,
  onContext,
}: {
  barbershopId?: string;
  shopName?: string;
  application: AgendaApplication;
  administrator: boolean;
  onContext: () => void;
}) {
  const state = useSyncExternalStore(
      application.subscribe,
      application.getSnapshot,
      application.getSnapshot,
    ),
    [date, setDate] = useState(state.filters.localDate);
  useEffect(() => {
    void application.load();
  }, [application]);
  function filter(values: Partial<AgendaFilters>) {
    try {
      application.setFilters({ ...state.filters, ...values, localDate: date });
      void application.load();
    } catch {
      setInvalid(true);
    }
  }
  const [invalid, setInvalid] = useState(false);
  const [careFilter, setCareFilter] = useState<{
    source: typeof state.rows;
    ids: readonly string[] | null;
  } | null>(null);
  const extraFilters = administrator ? (
    <CareAgendaFilter
      rows={state.rows}
      onResult={(ids) => setCareFilter({ source: state.rows, ids })}
    />
  ) : undefined;
  return (
    <>
      {Platform.OS !== 'web' && <>{extraFilters}</>}
      <AgendaContent
        extraFilters={extraFilters}
        state={
          invalid
            ? { ...state, phase: 'error', rows: [], error: 'INVALID_INPUT' }
            : careFilter?.source === state.rows && careFilter.ids
              ? {
                  ...state,
                  rows: state.rows.filter((row) =>
                    careFilter.ids!.includes(row.id),
                  ),
                }
              : state
        }
        administrator={administrator}
        shopName={shopName}
        date={date}
        onDate={(v) => {
          setDate(v);
          setInvalid(false);
        }}
        onFilter={(v) => {
          setInvalid(false);
          filter(v);
        }}
        onRefresh={() => {
          setInvalid(false);
          filter({});
        }}
        onContext={onContext}
      />
    </>
  );
}
