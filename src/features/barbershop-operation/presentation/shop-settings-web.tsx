import type { ReactNode } from 'react';
import { AppButton } from '../../../shared/ui/app-button';
import type {
  BookingPolicies,
  ManagementData,
} from '../application/operation-application';
import type { PublicationState } from '../domain/types';
import type { ShopNameContentProps } from './shop-name-editor.web';
import { shopSettingsStyles } from './shop-settings-web.styles';

// Local outline icons follow the existing 24px, round-stroke icon system.
const iconPaths = {
  shop: 'M3 10h18l-2-7H5ZM5 10v11h14V10M9 21v-6h6v6M8 3l-1 7m9-7 1 7',
  clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  calendar: 'M4 5h16v16H4ZM8 2v6m8-6v6M4 11h16',
  layers: 'm12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 17l10 5 10-5',
  coffee:
    'M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM16 8h3a3 3 0 0 1 0 6h-3M7 2v3m5-3v3M2 22h17',
  cancel: 'm8 8 8 8m0-8-8 8M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  phone:
    'm7 3 3 5-3 3a16 16 0 0 0 6 6l3-3 5 3c0 3-2 5-5 4A24 24 0 0 1 3 8C2 5 4 3 7 3Z',
  pin: 'M19 9c0 6-7 12-7 12S5 15 5 9a7 7 0 1 1 14 0M14 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  publish: 'm3 10 18-7v18L3 14Zm5 6 2 6h4l-2-7',
  play: 'm8 4 12 8-12 8Z',
  pause: 'M7 4h3v16H7Zm7 0h3v16h-3Z',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  save: 'M4 3h13l4 4v14H3V3Zm3 0v6h10V3M7 21v-8h10v8',
  refresh: 'M20 8a9 9 0 0 0-15-3L2 8m0-6v6h6M4 16a9 9 0 0 0 15 3l3-3m0 6v-6h-6',
  team: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M18 8a3 3 0 0 1 0 6m4 7v-2a4 4 0 0 0-3-4',
  scissors:
    'M7 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0m16 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6 9l14 13M18 9 4 22',
} as const;
export function ShopSettingsIcon({ name }: { name: keyof typeof iconPaths }) {
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
      <path d={iconPaths[name]} />
    </svg>
  );
}
const rules = [
  {
    key: 'minimumNoticeMin',
    label: 'Antelación mínima para reservar',
    unit: 'minutos',
    icon: 'clock',
    hint: 'Tiempo mínimo entre la reserva y el inicio de la cita.',
  },
  {
    key: 'bookingHorizonDays',
    label: 'Días disponibles a futuro',
    unit: 'días',
    icon: 'calendar',
    hint: 'Hasta cuántos días adelante se muestran horarios para reservar.',
  },
  {
    key: 'maxFuturePerClient',
    label: 'Máximo de citas futuras por cliente',
    unit: 'citas',
    icon: 'layers',
    hint: 'Límite de reservas próximas activas por cliente.',
  },
  {
    key: 'slotStepMin',
    label: 'Separación entre horas de inicio',
    unit: 'minutos',
    icon: 'clock',
    hint: 'Intervalo entre los horarios de inicio que se ofrecen.',
  },
  {
    key: 'bufferMin',
    label: 'Descanso después de una cita',
    unit: 'minutos',
    icon: 'coffee',
    hint: 'Tiempo bloqueado después de cada servicio.',
  },
  {
    key: 'cancellationAdvanceMin',
    label: 'Antelación para cancelar',
    unit: 'minutos',
    icon: 'cancel',
    hint: 'Tiempo mínimo antes de la cita para permitir cancelarla.',
  },
] as const;
export function publicationIndicators(
  data: ManagementData | null | undefined,
  loading: boolean,
) {
  if (!data || loading) return [null, null, null, null];
  const services = data.services.filter((s) => s.active);
  // Secondary administrators may receive no team-membership rows. In that
  // projection, do not treat an unverified active professional as an inactive one.
  if (!data.members.length && data.professionals.some((p) => p.active))
    return [services.length > 0, null, null, null];
  const professionals = data.professionals.filter(
    (p) =>
      p.active &&
      data.members.some((m) => m.userId === p.userId && m.status === 'active'),
  );
  const capable = professionals.filter((p) =>
    data.capabilities.some(
      (c) => c.barberId === p.id && services.some((s) => s.id === c.serviceId),
    ),
  );
  return [
    services.length > 0,
    professionals.length > 0,
    capable.length > 0,
    capable.some((p) =>
      data.hours.some((h) => h.barberId === p.id && h.opensMin < h.closesMin),
    ),
  ];
}
function CardHeading({
  icon,
  title,
  description,
}: {
  icon: keyof typeof iconPaths;
  title: string;
  description: string;
}) {
  return (
    <div className="bx-shop-settings-card-heading">
      <span>
        <ShopSettingsIcon name={icon} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
export function ShopSettingsWeb({
  title,
  contact,
  address,
  policies,
  data,
  disabled,
  loading,
  canPublish,
  navigation,
  feedback,
  extras,
  name,
  nameEditor,
  onContact,
  onAddress,
  onPolicy,
  onSave,
  onPublication,
  onContext,
}: {
  title: string;
  contact: string;
  address: string;
  policies: Record<keyof BookingPolicies, string>;
  data?: ManagementData | null;
  disabled: boolean;
  loading: boolean;
  canPublish: boolean;
  navigation: ReactNode;
  feedback: ReactNode;
  extras?: ReactNode;
  name?: ShopNameContentProps;
  nameEditor?: ReactNode;
  onContact: (v: string) => void;
  onAddress: (v: string) => void;
  onPolicy: (k: keyof BookingPolicies, v: string) => void;
  onSave: () => void;
  onPublication: (s: PublicationState) => void;
  onContext?: () => void;
}) {
  const indicators = publicationIndicators(data, loading);
  const state = data?.settings?.publicationState;
  const publication = state
    ? (
        {
          draft: 'Borrador',
          published: 'Publicada',
          paused: 'Pausada',
          withdrawn: 'Retirada',
        } as const
      )[state]
    : loading
      ? 'Consultando…'
      : 'Sin configurar';
  return (
    <div className="bx-shop-settings-page">
      <style>{shopSettingsStyles}</style>
      <header className="bx-shop-settings-header">
        <h1>{title}</h1>
        <p>Configura tu negocio y prepara su oferta para recibir reservas</p>
        {onContext && (
          <button
            type="button"
            className="bx-shop-settings-context"
            onClick={onContext}
          >
            Seleccionar o actualizar mis barberías
          </button>
        )}
      </header>
      <nav
        className="bx-shop-settings-tabs"
        aria-label="Administración de la barbería"
      >
        {navigation}
      </nav>
      <div className="bx-shop-settings-feedback">{feedback}</div>
      <div className="bx-shop-settings-grid">
        <div className="bx-shop-settings-left">
          <section className="bx-shop-settings-card bx-shop-settings-identity">
            <CardHeading
              icon="shop"
              title="Identidad y contacto"
              description="Edita la información principal de tu barbería. Esta se mostrará a tus clientes."
            />
            {name ? (
              <div className="bx-shop-settings-name">
                {name.loaded && (
                  <label className="bx-shop-settings-field">
                    Nombre de la barbería
                    <input
                      id="selected-shop-name"
                      aria-label="Nombre de la barbería"
                      value={name.name}
                      disabled={name.busy || name.uncertain}
                      onChange={(e) => name.onName(e.target.value)}
                      autoComplete="organization"
                    />
                  </label>
                )}
                {name.busy && (
                  <p role="status">Consultando o guardando el nombre…</p>
                )}
                {name.error && (
                  <p role="alert" className="bx-shop-settings-error">
                    {name.error}
                  </p>
                )}
                {name.saved && (
                  <p role="status">Nombre guardado en esta barbería.</p>
                )}
                {name.loaded && (
                  <div className="bx-shop-settings-rename">
                    <p>
                      El nombre se guarda por separado de las reglas de reserva.
                    </p>
                    <AppButton
                      label="Guardar nombre de esta barbería"
                      compact
                      variant="secondary"
                      disabled={
                        name.busy || name.uncertain || !name.name.trim()
                      }
                      onPress={name.onSave}
                    />
                  </div>
                )}
              </div>
            ) : (
              nameEditor
            )}
            <div className="bx-shop-settings-contact-grid">
              <label className="bx-shop-settings-field">
                Contacto público
                <span className="bx-shop-settings-input">
                  <ShopSettingsIcon name="phone" />
                  <input
                    id="contact"
                    value={contact}
                    onChange={(e) => onContact(e.target.value)}
                    disabled={disabled}
                    autoComplete="tel"
                  />
                </span>
              </label>
              <label className="bx-shop-settings-field">
                Dirección pública
                <span className="bx-shop-settings-input">
                  <ShopSettingsIcon name="pin" />
                  <input
                    id="address"
                    value={address}
                    onChange={(e) => onAddress(e.target.value)}
                    disabled={disabled}
                    autoComplete="street-address"
                  />
                </span>
              </label>
            </div>
          </section>
          <section className="bx-shop-settings-card bx-shop-settings-rules">
            <CardHeading
              icon="calendar"
              title="Reglas de reserva"
              description="Define cómo se gestionan las reservas y la disponibilidad de tu barbería."
            />
            <div className="bx-shop-settings-rules-grid">
              {rules.map((rule) => (
                <div className="bx-shop-settings-rule" key={rule.key}>
                  <label htmlFor={rule.key}>
                    <ShopSettingsIcon name={rule.icon} />
                    {rule.label}
                  </label>
                  <div className="bx-shop-settings-number">
                    <input
                      type="text"
                      inputMode="numeric"
                      id={rule.key}
                      aria-label={rule.label}
                      value={policies[rule.key]}
                      disabled={disabled}
                      onChange={(e) => onPolicy(rule.key, e.target.value)}
                      aria-describedby={`${rule.key}-hint ${rule.key}-unit`}
                    />
                    <span id={`${rule.key}-unit`}>{rule.unit}</span>
                  </div>
                  <p id={`${rule.key}-hint`}>{rule.hint}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="bx-shop-settings-right">
          <section className="bx-shop-settings-card bx-shop-settings-readiness">
            <CardHeading
              icon="layers"
              title="Estado de publicación"
              description="Verifica los requisitos para publicar tu barbería."
            />
            <span
              className={`bx-shop-settings-badge bx-shop-settings-badge--${state ?? 'unknown'}`}
            >
              {publication}
            </span>
            <ul>
              {[
                'Servicios configurados',
                'Profesional activo',
                'Capacidades asignadas',
                'Horarios válidos',
              ].map((label, i) => (
                <li key={label}>
                  <span
                    className={`bx-shop-settings-check${indicators[i] === true ? ' is-complete' : ''}`}
                    aria-hidden="true"
                  >
                    {indicators[i] === true
                      ? '✓'
                      : indicators[i] === null
                        ? '–'
                        : ''}
                  </span>
                  <span>
                    {label}
                    <small>
                      {indicators[i] === true
                        ? 'Completo'
                        : indicators[i] === null
                          ? 'Por comprobar'
                          : 'Pendiente'}
                    </small>
                  </span>
                </li>
              ))}
            </ul>
            <p className="bx-shop-settings-server-note">
              La publicación se valida con la información vigente del servidor.
            </p>
          </section>
          <section className="bx-shop-settings-card bx-shop-settings-publication">
            <CardHeading
              icon="publish"
              title="Publicación"
              description="Gestiona la visibilidad de tu barbería en la plataforma."
            />
            {canPublish ? (
              <div className="bx-shop-settings-publication-actions">
                {(['published', 'paused', 'withdrawn'] as const).map((s, i) => (
                  <div
                    className={`bx-shop-settings-icon-action${s === 'withdrawn' ? ' is-danger' : ''}`}
                    key={s}
                  >
                    <ShopSettingsIcon
                      name={(['play', 'pause', 'trash'] as const)[i]}
                    />
                    <AppButton
                      label={
                        [
                          'Publicar barbería',
                          'Pausar nuevas reservas',
                          'Retirar oferta pública',
                        ][i]
                      }
                      variant={
                        s === 'published'
                          ? 'primary'
                          : s === 'withdrawn'
                            ? 'danger'
                            : 'secondary'
                      }
                      disabled={disabled}
                      onPress={() => onPublication(s)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p>
                No tienes permiso para cambiar la publicación en esta barbería.
              </p>
            )}
            <p className="bx-shop-settings-warning">
              ⓘ Retirar la oferta quitará tu barbería del catálogo público y ya
              no recibirá nuevas reservas.
            </p>
          </section>
        </div>
      </div>
      <div className="bx-shop-settings-bottom">
        <div className="bx-shop-settings-icon-action">
          <ShopSettingsIcon name="save" />
          <AppButton
            label="Guardar configuración"
            disabled={disabled}
            onPress={onSave}
          />
        </div>
        {name && (
          <div className="bx-shop-settings-icon-action is-secondary">
            <ShopSettingsIcon name="refresh" />
            <AppButton
              label="Consultar nombre actual"
              variant="secondary"
              disabled={name.busy}
              onPress={name.onRead}
            />
          </div>
        )}
      </div>
      {extras && <div className="bx-shop-settings-extras">{extras}</div>}
    </div>
  );
}
