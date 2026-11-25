import { PaymentChoice } from './payment-choice';
import { CareControl } from './care-control';
import { useEffect, type ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { AppText } from '../../../shared/ui/app-text';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { AppButton } from '../../../shared/ui/app-button';
import { Screen } from '../../../shared/ui/screen';
import {
  PageHeader,
  Section,
  ActionRow,
  ChoiceGrid,
  pageStyles,
} from '../../../shared/ui/page-header';
import { StatusMessage } from '../../../shared/ui/status-message';
import { tokens } from '../../../shared/ui/tokens';
import { webPart } from '../../../shared/ui/web-part';
import { useBooking } from './booking-context';
import type {
  BookingApplication,
  BookingView,
} from '../application/booking-application';
import type { BookingDetail } from '../domain/types';
import { bookingError, bookingTime } from './booking-format';
import { BookingContentWeb } from './booking-content.web';
import {
  BookingConfirmationWeb,
  ConfirmationAction,
} from './booking-confirmation.web';
import { useConfirmationBookmark } from './use-confirmation-bookmark';
export { bookingError, bookingTime } from './booking-format';
export const soles = (amountMinor: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(
    amountMinor / 100,
  );
const dateTime = (utc: string) =>
  new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(utc));
export function BookingCard({
  detail,
  children,
}: {
  detail: BookingDetail;
  children?: ReactNode | ((canChange: boolean) => ReactNode);
}) {
  return (
    <View {...webPart('panel')} style={pageStyles.panel}>
      <AppText variant="heading">{detail.shopNameSnapshot}</AppText>
      <AppText
        variant="action"
        tone={detail.state === 'confirmed' ? 'success' : 'textSecondary'}
      >
        {detail.state === 'confirmed' ? 'Cita confirmada' : 'Cita cancelada'}
      </AppText>
      <AppText variant="action">
        {dateTime(detail.startsAt)} · hora de Lima
      </AppText>
      <AppText>Profesional: {detail.barberNameSnapshot}</AppText>
      <AppText>Cliente: {detail.clientDisplayNameSnapshot}</AppText>
      {detail.items.map((i) => (
        <View key={i.serviceId} style={styles.item}>
          <AppText>
            {i.nameSnapshot} · {i.durationMin} min ·{' '}
            {soles(i.priceSnapshot.amountMinor)}
          </AppText>
          {!!i.descriptionSnapshot && (
            <AppText variant="caption" tone="textSecondary">
              {i.descriptionSnapshot}
            </AppText>
          )}
        </View>
      ))}
      <AppText variant="heading">
        Total confirmado: {soles(detail.total.amountMinor)} ·{' '}
        {detail.durationMin} minutos
      </AppText>
      <AppText variant="caption" tone="textSecondary">
        Antelación de cancelación de esta cita:{' '}
        {detail.policySnapshot.cancellationAdvanceMin} minutos.
      </AppText>
      <AppText variant="caption" tone="textSecondary" selectable>
        Código de cita: {detail.id}
      </AppText>
      <CareControl
        key={detail.id}
        reservationId={detail.id}
        startsAt={detail.startsAt}
        renderActions={
          Platform.OS === 'web' && typeof children === 'function'
            ? (view) =>
                children(
                  view !== null &&
                    (view.attendance === null ||
                      view.attendance === 'confirmed'),
                )
            : undefined
        }
      />
      {typeof children === 'function'
        ? Platform.OS !== 'web' && children(true)
        : children}
    </View>
  );
}
export function BookingContent({
  state,
  application: app,
  careEnabled = false,
  onOwn,
  onAnother,
}: {
  careEnabled?: boolean;
  state: BookingView;
  application: BookingApplication;
  onOwn: () => void;
  onAnother?: () => void;
}) {
  const busy = [
      'loading-shops',
      'loading-offer',
      'loading-slots',
      'confirming',
    ].includes(state.phase),
    locked = busy || state.uncertain || !!state.result;
  const selected =
      state.offer?.services.filter((s) => state.serviceIds.includes(s.id)) ??
      [],
    estimated = selected.reduce((a, s) => a + s.price.amountMinor, 0),
    minutes = selected.reduce((a, s) => a + s.durationMin, 0);
  const pending = state.uncertain;
  if (Platform.OS === 'web')
    return (
      <BookingContentWeb
        state={state}
        application={app}
        careEnabled={careEnabled}
        onOwn={onOwn}
        confirmed={
          state.result ? (
            state.result.detail.state === 'confirmed' ? (
              <BookingConfirmationWeb
                detail={state.result.detail}
                replayed={state.result.replayed}
                onOwn={onOwn}
                onAnother={onAnother ?? (() => app.startAnother())}
                care={
                  <CareControl
                    key={state.result.detail.id}
                    reservationId={state.result.detail.id}
                    startsAt={state.result.detail.startsAt}
                    renderLayout={({ trigger, content, actions }) => (
                      <>
                        <ConfirmationAction icon="reservations">
                          {trigger}
                        </ConfirmationAction>
                        <div className="bx-confirm-care-content">
                          {content}
                          {actions}
                        </div>
                      </>
                    )}
                  />
                }
              />
            ) : (
              <BookingCard detail={state.result.detail} />
            )
          ) : undefined
        }
      />
    );
  return (
    <Screen>
      <PageHeader
        title="Reservar una cita"
        subtitle="Elige tus servicios y encuentra el horario que mejor te viene."
      />
      <ActionRow>
        <AppButton label="Mis reservas" variant="secondary" onPress={onOwn} />
      </ActionRow>
      {busy && (
        <StatusMessage
          state="loading"
          message={
            state.phase === 'confirming'
              ? 'Confirmando tu cita…'
              : 'Consultando disponibilidad…'
          }
        />
      )}
      {state.error && (
        <StatusMessage
          state="error"
          message={bookingError(
            state.error.code,
            state.error.professionalUnavailable,
          )}
          onRetry={() =>
            void (pending
              ? app.confirm()
              : state.offer
                ? app.querySlots()
                : app.loadShops())
          }
          retryLabel={
            pending ? 'Reintentar la misma solicitud' : 'Reintentar consulta'
          }
        />
      )}
      {pending && (
        <AppText accessibilityLiveRegion="polite">
          No sabemos aún si se confirmó la cita. El reintento conserva la misma
          solicitud y no crea una segunda reserva. Si recargas o cierras sesión,
          consulta Mis reservas antes de reservar otra vez.
        </AppText>
      )}
      {state.result ? (
        <>
          <StatusMessage
            state="success"
            message={
              state.result.replayed
                ? 'Reserva recuperada sin duplicarla.'
                : 'Tu reserva está confirmada.'
            }
          />
          <BookingCard detail={state.result.detail} />
          <AppButton
            label="Reservar otra cita"
            onPress={() => app.startAnother()}
          />
        </>
      ) : (
        <>
          <Section title="1. Elige una barbería">
            {state.shopsQueried &&
              !state.shops.length &&
              state.phase !== 'loading-shops' && (
                <StatusMessage
                  state="empty"
                  message="No hay barberías publicadas para reservar."
                />
              )}
            <ChoiceGrid>
              {state.shops.map((s) => (
                <AppButton
                  key={s.barbershopId}
                  variant="secondary"
                  selected={state.offer?.barbershopId === s.barbershopId}
                  label={`${state.offer?.barbershopId === s.barbershopId ? 'Seleccionada: ' : ''}${s.name}${s.publicationState === 'paused' ? ' · Pausada' : ''}`}
                  disabled={locked}
                  onPress={() => void app.chooseShop(s.barbershopId)}
                />
              ))}
            </ChoiceGrid>
            {state.hasMore && (
              <AppButton
                label="Ver más barberías"
                variant="ghost"
                disabled={locked}
                onPress={() =>
                  void app.loadShops(state.shops.at(-1)?.barbershopId ?? null)
                }
              />
            )}
            {!state.offer && (
              <AppButton
                label="Actualizar barberías disponibles"
                variant="ghost"
                disabled={busy || pending}
                onPress={() => void app.loadShops()}
              />
            )}
          </Section>
          {state.offer && (
            <>
              <AppText>
                {state.offer.address} · {state.offer.publicContact}
              </AppText>
              {state.offer.publicationState === 'paused' && (
                <StatusMessage
                  state="empty"
                  message="Esta barbería está pausada y no acepta citas nuevas."
                />
              )}
              <Section title="2. Selecciona uno o varios servicios">
                {!state.offer.services.length && (
                  <StatusMessage
                    state="empty"
                    message="No hay servicios activos disponibles."
                  />
                )}
                <ChoiceGrid>
                  {state.offer.services
                    .filter((s) => s.active)
                    .map((s) => (
                      <AppButton
                        key={s.id}
                        variant="secondary"
                        selected={state.serviceIds.includes(s.id)}
                        label={`${state.serviceIds.includes(s.id) ? 'Seleccionado: ' : ''}${s.name} · ${soles(s.price.amountMinor)} · ${s.durationMin} min`}
                        disabled={locked}
                        onPress={() => {
                          app.setServices(
                            state.serviceIds.includes(s.id)
                              ? state.serviceIds.filter((id) => id !== s.id)
                              : [...state.serviceIds, s.id],
                          );
                        }}
                      />
                    ))}
                </ChoiceGrid>
              </Section>
              <Section title="3. Elige profesional y fecha">
                <ChoiceGrid>
                  <AppButton
                    variant="secondary"
                    selected={state.barberId === null}
                    label={
                      state.barberId === null
                        ? 'Seleccionado: cualquier profesional disponible'
                        : 'Cualquier profesional disponible'
                    }
                    disabled={locked}
                    onPress={() => app.setProfessional(null)}
                  />
                  {state.offer.professionals
                    .filter(
                      (p) =>
                        p.active &&
                        state.serviceIds.every((id) =>
                          state.offer?.capabilities.some(
                            (c) => c.barberId === p.id && c.serviceId === id,
                          ),
                        ),
                    )
                    .map((p) => (
                      <AppButton
                        key={p.id}
                        variant="secondary"
                        selected={state.barberId === p.id}
                        label={`${state.barberId === p.id ? 'Seleccionado: ' : ''}${p.professionalName}`}
                        disabled={locked}
                        onPress={() => app.setProfessional(p.id)}
                      />
                    ))}
                </ChoiceGrid>
                <AppTextField
                  id="booking-date"
                  label="Fecha (AAAA-MM-DD)"
                  hint="Todos los horarios corresponden a Lima."
                  value={state.date}
                  onChangeText={app.setDate}
                  disabled={locked}
                  autoCapitalize="none"
                />
                {!!selected.length && (
                  <AppText>
                    Estimado: {soles(estimated)} · {minutes} minutos. Las
                    condiciones vigentes se revisan al confirmar.
                  </AppText>
                )}
                <AppButton
                  label="Consultar horarios"
                  disabled={
                    locked ||
                    !selected.length ||
                    state.offer.publicationState !== 'published'
                  }
                  onPress={() => void app.querySlots()}
                />
              </Section>
              {state.slotsQueried && (
                <AppText variant="heading">4. Elige un horario</AppText>
              )}
              {state.slotsQueried &&
                !state.slots.length &&
                state.phase !== 'loading-slots' && (
                  <StatusMessage
                    state="empty"
                    message="No hay horarios disponibles para esta selección. Prueba otra fecha o profesional."
                  />
                )}
              <ChoiceGrid>
                {state.slots.map((slot) => (
                  <AppButton
                    key={slot.startsAt}
                    variant="secondary"
                    selected={state.startsAt === slot.startsAt}
                    label={`${state.startsAt === slot.startsAt ? 'Seleccionado: ' : ''}${bookingTime(slot.startsAt)}–${bookingTime(slot.endsAt)} · hora Lima`}
                    disabled={locked}
                    onPress={() => app.chooseSlot(slot.startsAt)}
                  />
                ))}
              </ChoiceGrid>
              {state.startsAt && (
                <View {...webPart('panel', 'review')} style={styles.panel}>
                  <AppText variant="heading">Revisa tu cita</AppText>
                  {careEnabled && (
                    <PaymentChoice
                      key={state.offer.barbershopId}
                      barbershopId={state.offer.barbershopId}
                      selected={state.paymentMethod}
                      disabled={locked}
                      onSelect={(method) => app.choosePayment(method)}
                    />
                  )}
                  <AppText>{dateTime(state.startsAt)} · Lima</AppText>
                  <AppText>
                    {state.offer.name} ·{' '}
                    {state.barberId
                      ? state.offer.professionals.find(
                          (p) => p.id === state.barberId,
                        )?.professionalName
                      : 'Se asignará un profesional disponible'}
                  </AppText>
                  {selected.map((s) => (
                    <AppText key={s.id}>{s.name}</AppText>
                  ))}
                  <AppText>
                    Estimado: {soles(estimated)} · {minutes} minutos
                  </AppText>
                  <AppButton
                    label={
                      pending
                        ? 'Reintentar la misma confirmación'
                        : 'Confirmar reserva'
                    }
                    disabled={
                      busy || (careEnabled && !pending && !state.paymentMethod)
                    }
                    onPress={() => {
                      if (!careEnabled || pending || state.paymentMethod)
                        void app.confirm();
                    }}
                  />
                </View>
              )}
            </>
          )}
        </>
      )}
    </Screen>
  );
}
export function BookingScreen({ onOwn }: { onOwn: () => void }) {
  const { application, state } = useBooking();
  const bookmark = useConfirmationBookmark(application);
  useEffect(() => {
    void application.loadShops();
  }, [application]);
  if (
    Platform.OS === 'web' &&
    !state.result &&
    (bookmark.loading || bookmark.error)
  )
    return (
      <Screen>
        <PageHeader title="Tu reserva" />
        <StatusMessage
          state={bookmark.loading ? 'loading' : 'error'}
          message={
            bookmark.loading
              ? 'Recuperando los datos de tu reserva…'
              : 'No pudimos recuperar esta reserva confirmada. Consulta Mis reservas antes de crear otra.'
          }
          onRetry={bookmark.retry}
        />
        <AppButton label="Ir a mis reservas" onPress={onOwn} />
        {bookmark.error && (
          <AppButton
            label="Preparar otra reserva"
            variant="secondary"
            onPress={() => {
              bookmark.forget();
              application.startAnother();
            }}
          />
        )}
      </Screen>
    );
  return (
    <BookingContent
      application={application}
      state={state}
      careEnabled={!!application.care}
      onAnother={() => {
        bookmark.forget();
        application.startAnother();
      }}
      onOwn={onOwn}
    />
  );
}
const styles = StyleSheet.create({
  panel: {
    gap: tokens.space.md,
    padding: tokens.space.xl,
    backgroundColor: tokens.color.tint,
    borderWidth: 1,
    borderColor: tokens.color.action,
    borderRadius: tokens.radius.panel,
  },
  item: {
    gap: tokens.space.xs,
    borderTopWidth: 1,
    borderTopColor: tokens.color.border,
    paddingTop: tokens.space.md,
  },
});
