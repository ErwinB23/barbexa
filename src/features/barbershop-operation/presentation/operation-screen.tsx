import {
  useCallback,
  useEffect,
  useState,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Platform, View } from 'react-native';
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
import { SuccessToast } from '../../../shared/ui/success-toast';
import { webPart } from '../../../shared/ui/web-part';
import type {
  OperationApplication,
  ManagementData,
  BookingPolicies,
} from '../application/operation-application';
import type { Hours, StaffInvitation, Service } from '../domain/types';
import { BusinessError, utcInstant } from '../domain/values';
import { SelfProfessional } from './self-professional';
import { ReceivedInvitationsWeb } from './received-invitations.web';
import { AdminInvitationsPanel } from './admin-invitations';
import { OwnSummaryPanel } from './own-summary';
import { SelfSchedulePanel } from './self-schedule';
import type { AuthorityPermissions } from '../domain/team-authority';
import { ShopSettingsWeb, ShopSettingsIcon } from './shop-settings-web';
import { shopSettingsStyles } from './shop-settings-web.styles';
import type { ShopNameContentProps } from './shop-name-editor.web';
import { TeamManagementWeb } from './team-management-web';
import {
  newestInvitations,
  invitationDate,
  professionalActivity,
} from './invitation-history';
import {
  serviceCategories,
  serviceVisualCategory,
  ServicesCatalogWeb,
} from './services-catalog-web';
import { WeeklyScheduleWeb, ScheduleTimeSelect } from './weekly-schedule-web';
import { AvailabilityScopeWeb } from './availability-scope.web';
import {
  AvailabilityToolsWeb,
  AvailabilityPanelHeading,
} from './availability-tools.web';
import { validateWeeklyDraft, scheduleClock } from './weekly-schedule-draft';
import { parseServiceDraft, ServiceDraftError } from './service-draft';
export type OperationPage =
  'barbershop-admin' | 'staff' | 'services' | 'schedules' | 'payments-rules';
const messages: Record<string, string> = {
  INVALID_INPUT: 'Revisa los campos y los intervalos ingresados.',
  FORBIDDEN:
    'Tu contexto actual no permite esta operación. Revisa tus barberías.',
  UNAUTHENTICATED: 'Verifica tu sesión antes de continuar.',
  CONFLICT:
    'No se pudo guardar: hay una operación pendiente, una invitación duplicada o una cita comprometida.',
  NOT_AVAILABLE: 'La información solicitada ya no está disponible.',
  PROFILE_REQUIRED: 'Completa tu perfil antes de continuar.',
};
export function OperationFeedback({
  loading,
  error,
  errorMessage,
  success,
  successMessage = 'Cambios guardados.',
  onRetry,
}: {
  loading: boolean;
  error: string | null;
  errorMessage?: string | null;
  success: boolean;
  successMessage?: string;
  onRetry: () => void;
}) {
  return (
    <>
      {loading && (
        <StatusMessage state="loading" message="Consultando información…" />
      )}
      {error && (
        <>
          <StatusMessage
            state="error"
            message={
              errorMessage ??
              messages[error] ??
              'No se pudo conectar. Conservamos el formulario; puedes reintentar.'
            }
            onRetry={() => {
              if (!loading) onRetry();
            }}
          />
        </>
      )}
      {success &&
        !loading &&
        !error &&
        (Platform.OS === 'web' ? (
          <SuccessToast message={successMessage} />
        ) : (
          <StatusMessage state="success" message={successMessage} />
        ))}
    </>
  );
}
const number = (s: string, min = 0) => {
  if (!/^\d+$/.test(s) || !Number.isSafeInteger(Number(s)) || Number(s) < min)
    throw new BusinessError('INVALID_INPUT');
  return Number(s);
};
const time = (s: string) => {
  if (!/^\d{2}:\d{2}$/.test(s)) throw new BusinessError('INVALID_INPUT');
  const [h, m] = s.split(':').map(Number);
  if (h > 24 || m > 59 || (h === 24 && m !== 0))
    throw new BusinessError('INVALID_INPUT');
  return h * 60 + m;
};
const clock = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
const days = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
const invitationLabel = {
  pending: 'Pendiente de respuesta',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
} as const;
const publicationLabel = {
  draft: 'Borrador',
  published: 'Publicada',
  paused: 'Pausada',
  withdrawn: 'Retirada',
} as const;
export function OperationScreen({
  application: app,
  page,
  title,
  onNavigate,
  onContext,
  staffView,
  createOnly = false,
  onAgenda,
  permissions,
  authorityPanel,
  administrationPanel,
  shopNameEditor,
  shopClosuresPanel,
  paymentsAndRules,
}: {
  application: OperationApplication;
  page: OperationPage;
  title: string;
  onNavigate: (page: OperationPage) => void;
  onContext: () => void;
  staffView?: 'incoming' | 'team' | 'professional';
  createOnly?: boolean;
  onAgenda?: () => void;
  permissions?: AuthorityPermissions;
  shopNameEditor?: ReactNode;
  shopClosuresPanel?: ReactNode;
  paymentsAndRules?: ReactNode;
  authorityPanel?: (
    data: ManagementData | null,
    loading: boolean,
    reload: () => Promise<unknown>,
  ) => ReactNode;
  administrationPanel?: (
    data: ManagementData | null,
    loading: boolean,
    reload: () => Promise<unknown>,
  ) => ReactNode;
}) {
  const scope = app.getScope(),
    admin =
      scope?.role === 'administrator' &&
      !!scope.barbershopId &&
      (permissions?.editServices ?? true);
  const web = Platform?.OS === 'web';
  const separated = web && staffView !== undefined;
  const incoming = !separated || staffView === 'incoming';
  const team =
    (!separated || staffView === 'team') && (permissions?.manageTeam ?? true);
  const professional = !separated || staffView === 'professional';
  const loadManagement =
    admin && !createOnly && (!separated || staffView === 'team');
  const staffSchedule =
    scope?.role === 'barber' && !!scope.barbershopId && !!app.selfSchedule;
  const pages = [
    {
      path: 'barbershop-admin',
      label: web && !admin ? 'Crear una barbería' : 'Barbería',
      visible: true,
    },
    {
      path: 'staff',
      label: web ? 'Gestión de equipo y personal' : 'Personal e invitaciones',
      visible: !web || (admin && (permissions?.manageTeam ?? true)),
    },
    { path: 'services', label: 'Servicios', visible: !web || admin },
    {
      path: 'schedules',
      label: web && !admin ? 'Mis horarios' : 'Horarios',
      visible: !web || admin || staffSchedule,
    },
    {
      path: 'payments-rules',
      label: 'Pagos y reglas',
      visible: admin && !createOnly,
    },
  ] as const;
  const [data, setData] = useState<ManagementData | null>(null),
    [own, setOwn] = useState<readonly StaffInvitation[]>([]),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null),
    [saved, setSaved] = useState(false);
  const [savedMessage, setSavedMessage] = useState('Cambios guardados.');
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [name, setName] = useState(''),
    [contact, setContact] = useState(''),
    [address, setAddress] = useState('');
  const [policies, setPolicies] = useState<
    Record<keyof BookingPolicies, string>
  >({
    minimumNoticeMin: '',
    bookingHorizonDays: '',
    maxFuturePerClient: '',
    slotStepMin: '',
    bufferMin: '',
    cancellationAdvanceMin: '120',
  });
  const [removingService, setRemovingService] = useState<Service | null>(null);
  const [serviceCategory, setServiceCategory] =
    useState<Service['category']>('Otros');
  const [serviceId, setServiceId] = useState<string | undefined>(),
    [serviceName, setServiceName] = useState(''),
    [description, setDescription] = useState(''),
    [price, setPrice] = useState(''),
    [duration, setDuration] = useState(''),
    [active, setActive] = useState(true);
  const [member, setMember] = useState(''),
    [professionalName, setProfessionalName] = useState(''),
    [barber, setBarber] = useState<string | null>(null),
    [capabilities, setCapabilities] = useState<readonly string[]>([]),
    [email, setEmail] = useState('');
  const [hours, setHours] = useState<readonly Hours[]>([]),
    [weekday, setWeekday] = useState(1),
    [opens, setOpens] = useState(''),
    [closes, setCloses] = useState('');
  const [exceptionDate, setExceptionDate] = useState(''),
    [reason, setReason] = useState('');
  const stamp = app.scopeKey();
  const load = useCallback(async () => {
    try {
      const [management, invitations] = await Promise.all([
        loadManagement ? app.load() : Promise.resolve(null),
        incoming ? app.listOwnInvitations() : Promise.resolve([]),
      ]);
      if (app.scopeKey() !== stamp) return;
      setData(management);
      setOwn(invitations);
      if (management?.settings) {
        setContact(management.settings.publicContact);
        setAddress(management.settings.address);
        setPolicies(
          Object.fromEntries(
            Object.entries(management.settings.policies).map(([k, v]) => [
              k,
              String(v),
            ]),
          ) as Record<keyof BookingPolicies, string>,
        );
      }
      return true;
    } catch (e) {
      if (app.scopeKey() === stamp) setData(null);
      if (app.scopeKey() === stamp)
        setError(
          e instanceof BusinessError ? e.code : 'DEPENDENCY_UNAVAILABLE',
        );
      return false;
    } finally {
      if (app.scopeKey() === stamp) setLoading(false);
    }
  }, [
    app,
    loadManagement,
    incoming,
    stamp,
    setContact,
    setAddress,
    setPolicies,
    setError,
  ]);
  function reload() {
    setLoading(true);
    setError(null);
    return load();
  }
  useEffect(() => {
    // The route starts an external request after commit; state changes occur in its async callback.
    let mounted = true;
    void Promise.resolve().then(() => {
      if (mounted) return load();
    });
    return () => {
      mounted = false;
    };
  }, [load]);
  async function save(
    work: () => Promise<unknown>,
    caption?: (result: unknown) => string,
  ) {
    if (busy) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    setServiceError(null);
    try {
      const result = await work();
      if (app.scopeKey() !== stamp) return;
      if (await reload()) {
        setSavedMessage(caption ? caption(result) : 'Cambios guardados.');
        setSaved(true);
      }
    } catch (e) {
      if (app.scopeKey() === stamp && e instanceof ServiceDraftError)
        setServiceError(e.message);
      if (app.scopeKey() === stamp)
        setError(
          e instanceof ServiceDraftError
            ? 'INVALID_INPUT'
            : e instanceof BusinessError
              ? e.code
              : 'DEPENDENCY_UNAVAILABLE',
        );
    } finally {
      if (app.scopeKey() === stamp) setBusy(false);
    }
  }
  const disabled = busy || loading;
  const field = (
    id: string,
    label: string,
    value: string,
    change: (v: string) => void,
    hint?: string,
    inputMode?: 'text' | 'email' | 'numeric' | 'decimal',
  ) => (
    <AppTextField
      key={id}
      id={id}
      label={label}
      value={value}
      onChangeText={change}
      hint={hint}
      inputMode={inputMode}
      disabled={disabled}
      autoCapitalize="none"
    />
  );
  const chooseBarber = (id: string | null) => {
    setBarber(id);
    setCapabilities(
      data?.capabilities
        .filter((c) => c.barberId === id)
        .map((c) => c.serviceId) ?? [],
    );
    setHours(
      data?.hours
        .filter((h) => h.barberId === id)
        .map(({ weekday, opensMin, closesMin }) => ({
          weekday,
          opensMin,
          closesMin,
        })) ?? [],
    );
  };
  if (web && admin && !createOnly && page === 'schedules') {
    return (
      <WeeklyScheduleWeb
        title={title}
        data={data}
        barber={barber}
        disabled={disabled}
        loading={loading}
        canEdit={permissions?.editHours ?? true}
        onScope={chooseBarber}
        onContext={onContext}
        onSave={(rows) =>
          void save(() => app.setHours(barber, validateWeeklyDraft(rows)))
        }
        navigation={pages
          .filter((entry) => entry.visible)
          .map(({ path, label }) => (
            <div className="bx-week-tab" key={path}>
              <ShopSettingsIcon
                name={
                  path === 'payments-rules'
                    ? 'layers'
                    : path === 'barbershop-admin'
                      ? 'shop'
                      : path === 'staff'
                        ? 'team'
                        : path === 'services'
                          ? 'scissors'
                          : 'calendar'
                }
              />
              <AppButton
                variant="secondary"
                compact
                selected={page === path}
                label={label}
                disabled={page === path}
                onPress={() => onNavigate(path)}
              />
            </div>
          ))}
        feedback={
          <OperationFeedback
            loading={loading || busy}
            error={error}
            success={saved}
            successMessage={savedMessage}
            onRetry={() => void reload()}
          />
        }
        extras={
          <AvailabilityToolsWeb
            personal={
              app.selfSchedule && (
                <SelfSchedulePanel
                  application={app.selfSchedule}
                  key={stamp}
                  hideWeeklyEditor={admin && page === 'schedules'}
                />
              )
            }
            closures={
              (permissions?.editHours ?? true) &&
              (isValidElement(shopClosuresPanel)
                ? cloneElement(
                    shopClosuresPanel as ReactElement<{ premium?: boolean }>,
                    { premium: true },
                  )
                : shopClosuresPanel)
            }
            form={
              <section className="bx-date-form">
                <AvailabilityPanelHeading
                  icon="calendar"
                  title="Registrar un cierre o una ausencia"
                  description="Excepción de disponibilidad · Una fecha concreta, en hora de Lima."
                />
                <AvailabilityScopeWeb
                  barber={barber}
                  professionals={data?.professionals ?? []}
                  disabled={disabled || !(permissions?.editHours ?? true)}
                  onScope={chooseBarber}
                />
                <label
                  className="bx-availability-date"
                  htmlFor="exception-date"
                >
                  Fecha del cierre o ausencia
                  <input
                    id="exception-date"
                    type="date"
                    value={exceptionDate}
                    disabled={disabled || !(permissions?.editHours ?? true)}
                    onChange={(e) => setExceptionDate(e.target.value)}
                  />
                </label>
                {field(
                  'exception-reason',
                  'Motivo de la excepción',
                  reason,
                  setReason,
                )}
                <div className="bx-date-times">
                  <ScheduleTimeSelect
                    id="exception-start"
                    label="Inicio de la excepción"
                    value={opens ? time(opens) : null}
                    disabled={disabled || !(permissions?.editHours ?? true)}
                    onChange={(value) =>
                      setOpens(value === null ? '' : scheduleClock(value))
                    }
                  />
                  <ScheduleTimeSelect
                    id="exception-end"
                    label="Fin de la excepción"
                    value={closes ? time(closes) : null}
                    end
                    disabled={disabled || !(permissions?.editHours ?? true)}
                    onChange={(value) =>
                      setCloses(value === null ? '' : scheduleClock(value))
                    }
                  />
                </div>
                <div className="bx-date-note">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v6m0-10v.5" />
                  </svg>
                  <p>
                    Se creará una excepción de un solo día en hora de Lima. El
                    horario semanal se edita en el calendario superior.
                  </p>
                </div>
                <AppText>
                  {barber
                    ? `Se bloqueará solo a ${data?.professionals.find((p) => p.id === barber)?.professionalName ?? 'el profesional seleccionado'}.`
                    : 'Se bloqueará a todos los profesionales de esta barbería.'}{' '}
                  Las citas existentes no se cancelan desde este formulario.
                </AppText>
                <div className="bx-date-submit">
                  <span className="bx-date-submit-icon" aria-hidden="true">
                    <ShopSettingsIcon name="calendar" />
                  </span>
                  <AppButton
                    label={
                      barber
                        ? 'Guardar ausencia del profesional'
                        : 'Guardar cierre de la barbería'
                    }
                    disabled={disabled || !(permissions?.editHours ?? true)}
                    onPress={() =>
                      void save(() => {
                        if (
                          !/^\d{4}-\d{2}-\d{2}$/.test(exceptionDate) ||
                          time(closes) <= time(opens)
                        )
                          throw new BusinessError('INVALID_INPUT');
                        const start = new Date(
                            `${exceptionDate}T${opens}:00-05:00`,
                          ).toISOString(),
                          end = new Date(
                            `${exceptionDate}T${closes}:00-05:00`,
                          ).toISOString();
                        return app.setException({
                          barberId: barber,
                          startsAt: utcInstant(start),
                          endsAt: utcInstant(end),
                          reason: reason.trim() || null,
                        });
                      })
                    }
                  />
                </div>
              </section>
            }
          />
        }
      />
    );
  }
  if (web && admin && !createOnly && page === 'services') {
    return (
      <ServicesCatalogWeb
        title={title}
        data={data}
        loading={loading}
        disabled={disabled}
        category={serviceCategory}
        onCategory={setServiceCategory}
        onDelete={(s) =>
          void save(() =>
            app.upsertService({ ...s, active: false, archived: true }),
          )
        }
        serviceId={serviceId}
        serviceName={serviceName}
        description={description}
        price={price}
        duration={duration}
        active={active}
        onName={setServiceName}
        onDescription={setDescription}
        onPrice={setPrice}
        onDuration={setDuration}
        onActive={() => setActive(!active)}
        onNew={() => {
          setServiceCategory('Otros');
          setServiceId(undefined);
          setServiceName('');
          setDescription('');
          setPrice('');
          setDuration('');
          setActive(true);
        }}
        onEdit={(s) => {
          setServiceCategory(s.category ?? serviceVisualCategory(s.name));
          setServiceId(s.id);
          setServiceName(s.name);
          setDescription(s.description);
          setPrice((s.price.amountMinor / 100).toFixed(2));
          setDuration(String(s.durationMin));
          setActive(s.active);
        }}
        onSave={() =>
          void save(() => {
            return app.upsertService({
              ...(serviceId ? { id: serviceId } : {}),
              category: serviceCategory,
              ...parseServiceDraft({ name: serviceName, price, duration }),
              description,
              active,
            });
          })
        }
        onContext={onContext}
        navigation={pages
          .filter((entry) => entry.visible)
          .map(({ path, label }) => (
            <div className="bx-services-tab" key={path}>
              <ShopSettingsIcon
                name={
                  path === 'payments-rules'
                    ? 'layers'
                    : path === 'barbershop-admin'
                      ? 'shop'
                      : path === 'staff'
                        ? 'team'
                        : path === 'services'
                          ? 'scissors'
                          : 'calendar'
                }
              />
              <AppButton
                variant="secondary"
                compact
                selected={page === path}
                label={label}
                disabled={page === path}
                onPress={() => onNavigate(path)}
              />
            </div>
          ))}
        feedback={
          <OperationFeedback
            loading={loading || busy}
            error={error}
            errorMessage={
              serviceError ??
              (error === 'INVALID_INPUT'
                ? 'No se pudo guardar el servicio. Revisa su nombre, precio y duración.'
                : undefined)
            }
            success={saved}
            successMessage={savedMessage}
            onRetry={() => void reload()}
          />
        }
      />
    );
  }
  if (
    web &&
    admin &&
    team &&
    !createOnly &&
    page === 'staff' &&
    staffView === 'team'
  ) {
    return (
      <TeamManagementWeb
        title={title.replace(/^Equipo · /, '')}
        barbershopId={scope?.barbershopId ?? undefined}
        data={data}
        loading={loading}
        disabled={disabled}
        currentUserId={scope?.userId}
        email={email}
        member={member}
        professionalName={professionalName}
        barber={barber}
        capabilities={capabilities}
        onEmail={setEmail}
        onMember={setMember}
        onProfessionalName={setProfessionalName}
        onSelectProfessional={chooseBarber}
        onInvite={() => void save(() => app.invite(email))}
        onResendInvitation={(id) =>
          void save(
            () => app.remindInvitation(id),
            (result) =>
              (result as { created: boolean }).created
                ? 'Aviso reenviado dentro de BARBEXA.'
                : 'Ya se envió un aviso recientemente. Espera un minuto.',
          )
        }
        onCancelInvitation={(id) => void save(() => app.cancelInvitation(id))}
        onActivateMember={() =>
          void save(() =>
            app.setProfessional({
              userId: member,
              professionalName,
              active: true,
            }),
          )
        }
        onToggleProfessional={(profile) =>
          void save(() =>
            app.setProfessional({ ...profile, active: !profile.active }),
          )
        }
        onToggleCapability={(id) =>
          setCapabilities((ids) =>
            ids.includes(id)
              ? ids.filter((value) => value !== id)
              : [...ids, id],
          )
        }
        onSaveCapabilities={() => {
          if (barber)
            void save(() => app.setCapabilities(barber, capabilities));
        }}
        onContext={onContext}
        navigation={pages
          .filter((entry) => entry.visible)
          .map(({ path, label }) => (
            <div className="bx-team-tab" key={path}>
              <ShopSettingsIcon
                name={
                  path === 'payments-rules'
                    ? 'layers'
                    : path === 'barbershop-admin'
                      ? 'shop'
                      : path === 'staff'
                        ? 'team'
                        : path === 'services'
                          ? 'scissors'
                          : 'calendar'
                }
              />
              <AppButton
                variant="secondary"
                compact
                selected={page === path}
                label={label}
                disabled={page === path}
                onPress={() => onNavigate(path)}
              />
            </div>
          ))}
        feedback={
          <OperationFeedback
            loading={loading || busy}
            error={error}
            success={saved}
            successMessage={savedMessage}
            onRetry={() => void reload()}
          />
        }
        administration={
          administrationPanel ? (
            administrationPanel(data, disabled, reload)
          ) : authorityPanel || app.adminInvitations ? (
            <>
              {authorityPanel?.(data, disabled, reload)}
              {app.adminInvitations && (
                <AdminInvitationsPanel
                  application={app.adminInvitations}
                  audience="outgoing"
                  canManage={
                    permissions?.manageAdministrators ?? !app.authority
                  }
                  key={`admin-invitations-${stamp}`}
                />
              )}
            </>
          ) : undefined
        }
      />
    );
  }
  if (web && admin && !createOnly && page === 'barbershop-admin') {
    const renderSettings = (nameProps?: ShopNameContentProps) => (
      <ShopSettingsWeb
        title={title}
        contact={contact}
        address={address}
        policies={policies}
        data={data}
        disabled={disabled}
        loading={loading}
        canPublish={permissions?.publish ?? true}
        name={nameProps}
        nameEditor={nameProps ? undefined : shopNameEditor}
        onContact={setContact}
        onAddress={setAddress}
        onPolicy={(key, value) => setPolicies((p) => ({ ...p, [key]: value }))}
        onContext={onContext}
        onSave={() =>
          void save(() =>
            app.configure({
              publicContact: contact,
              address,
              policies: {
                minimumNoticeMin: number(policies.minimumNoticeMin),
                bookingHorizonDays: number(policies.bookingHorizonDays, 1),
                maxFuturePerClient: number(policies.maxFuturePerClient, 1),
                slotStepMin: number(policies.slotStepMin, 1),
                bufferMin: number(policies.bufferMin),
                cancellationAdvanceMin: number(policies.cancellationAdvanceMin),
              },
            }),
          )
        }
        onPublication={(state) => void save(() => app.setPublication(state))}
        navigation={pages
          .filter((entry) => entry.visible)
          .map(({ path, label }) => (
            <div className="bx-shop-settings-tab" key={path}>
              <ShopSettingsIcon
                name={
                  path === 'payments-rules'
                    ? 'layers'
                    : path === 'barbershop-admin'
                      ? 'shop'
                      : path === 'staff'
                        ? 'team'
                        : path === 'services'
                          ? 'scissors'
                          : 'calendar'
                }
              />
              <AppButton
                variant="secondary"
                compact
                selected={page === path}
                label={label}
                disabled={page === path}
                onPress={() => onNavigate(path)}
              />
            </div>
          ))}
        feedback={
          <OperationFeedback
            loading={loading || busy}
            error={error}
            success={saved}
            successMessage={savedMessage}
            onRetry={() => void reload()}
          />
        }
        extras={authorityPanel?.(data, disabled, reload)}
      />
    );
    // Reuse the existing name controller and its uncertainty/permission handling;
    // only its presentation is composed into this tab.
    return isValidElement(shopNameEditor) &&
      typeof shopNameEditor.type !== 'string'
      ? cloneElement(
          shopNameEditor as ReactElement<{
            render?: (props: ShopNameContentProps) => ReactNode;
          }>,
          { render: renderSettings },
        )
      : renderSettings();
  }
  if (page === 'payments-rules') {
    if (!admin || createOnly)
      return (
        <StatusMessage
          state="error"
          message="No tienes permisos para configurar esta barbería."
          onRetry={onContext}
        />
      );
    const navigation = pages
      .filter((entry) => entry.visible)
      .map(({ path, label }) => {
        const button = (
          <AppButton
            key={path}
            variant="secondary"
            compact
            selected={page === path}
            label={label}
            disabled={page === path}
            onPress={() => onNavigate(path)}
          />
        );
        return web ? (
          <div className="bx-shop-settings-tab" key={path}>
            <ShopSettingsIcon
              name={
                path === 'payments-rules'
                  ? 'layers'
                  : path === 'barbershop-admin'
                    ? 'shop'
                    : path === 'staff'
                      ? 'team'
                      : path === 'services'
                        ? 'scissors'
                        : 'calendar'
              }
            />
            {button}
          </div>
        ) : (
          button
        );
      });
    if (web)
      return (
        <div className="bx-shop-settings-page bx-payments-page">
          <style>
            {shopSettingsStyles +
              `.bx-payments-page{max-width:none;padding:18px clamp(16px,2vw,28px) 28px;box-sizing:border-box;overflow-x:clip;}.bx-payments-page .bx-shop-settings-header{padding-bottom:8px;}.bx-payments-page .bx-shop-settings-header h1{font-size:22px;}.bx-payments-page .bx-shop-settings-header > p{display:none;}.bx-payments-page .bx-shop-settings-header::before,.bx-payments-page .bx-shop-settings-header::after{display:none;}`}
          </style>
          <header className="bx-shop-settings-header">
            <h1>{title}</h1>
            <p>Configura los pagos y las reglas de tu barbería.</p>
            <button
              type="button"
              className="bx-shop-settings-context"
              onClick={onContext}
            >
              Seleccionar o actualizar mis barberías
            </button>
          </header>
          <nav
            className="bx-shop-settings-tabs"
            aria-label="Administrar barbería"
          >
            {navigation}
          </nav>
          {paymentsAndRules}
        </div>
      );
    return (
      <Screen width="wide">
        <PageHeader title={title} subtitle="Pagos y reglas de tu barbería" />
        <ActionRow>{navigation}</ActionRow>
        {paymentsAndRules}
      </Screen>
    );
  }
  return (
    <Screen width="wide">
      <PageHeader
        title={title}
        subtitle={
          separated
            ? staffView === 'incoming'
              ? 'Consulta y responde únicamente las invitaciones dirigidas a tu cuenta.'
              : staffView === 'professional'
                ? 'Tu perfil, horarios y actividad en la barbería seleccionada.'
                : 'Gestiona el equipo de la barbería seleccionada.'
            : page === 'staff'
              ? 'Revisa tus invitaciones y prepara el equipo de tu barbería.'
              : page === 'services'
                ? 'Define lo que ofreces, su precio y el tiempo de atención.'
                : page === 'schedules'
                  ? 'Organiza los horarios del local y de cada profesional.'
                  : 'Configura tu negocio y prepara su oferta para recibir reservas.'
        }
      />
      {(!separated || staffView !== 'incoming') && !createOnly && (
        <AppButton
          label="Seleccionar o actualizar mis barberías"
          variant="ghost"
          onPress={onContext}
        />
      )}
      <OperationFeedback
        loading={loading || busy}
        error={error}
        errorMessage={page === 'services' ? serviceError : undefined}
        success={saved}
        successMessage={savedMessage}
        onRetry={() => void reload()}
      />
      {!createOnly && authorityPanel?.(data, disabled, reload)}
      {(!separated || staffView === 'team') && !createOnly && (
        <ActionRow>
          {pages
            .filter((entry) => entry.visible)
            .map(({ path, label }) => (
              <AppButton
                key={path}
                variant="secondary"
                compact
                selected={page === path}
                label={label}
                disabled={page === path}
                onPress={() => onNavigate(path)}
              />
            ))}
        </ActionRow>
      )}
      {separated && staffView === 'professional' && (
        <ActionRow>
          <AppButton label="Mi agenda profesional" onPress={onAgenda} />
          {app.selfSchedule && (
            <AppButton
              label="Mis horarios"
              onPress={() => onNavigate('schedules')}
            />
          )}
        </ActionRow>
      )}
      {web &&
        !separated &&
        !pages.some((entry) => entry.path === page && entry.visible) && (
          <StatusMessage
            state="empty"
            message="Esta sección requiere permisos en la barbería seleccionada."
          />
        )}
      {page === 'barbershop-admin' && (!web || createOnly || !admin) && (
        <Section title="Crear mi barbería">
          {field('shop-name', 'Nombre de la nueva barbería', name, setName)}
          <AppButton
            label="Crear barbería y ser su administrador"
            disabled={disabled}
            onPress={() => void save(() => app.createShop(name))}
          />
          <AppText>
            Después de crearla, actualiza y selecciona tus barberías.
          </AppText>
        </Section>
      )}
      {web &&
        admin &&
        !createOnly &&
        page === 'barbershop-admin' &&
        shopNameEditor}
      {!admin && !separated && !createOnly && (
        <StatusMessage
          state="empty"
          message="Selecciona una barbería donde seas administrador para configurar su oferta. Las invitaciones propias no requieren una membresía activa."
        />
      )}
      {admin && !createOnly && page === 'barbershop-admin' && (
        <Section title="Configuración de la barbería seleccionada">
          {field('contact', 'Contacto público', contact, setContact)}
          {field('address', 'Dirección pública', address, setAddress)}
          {(
            [
              ['minimumNoticeMin', 'Antelación mínima para reservar (minutos)'],
              ['bookingHorizonDays', 'Días disponibles a futuro'],
              ['maxFuturePerClient', 'Máximo de citas futuras por cliente'],
              ['slotStepMin', 'Separación entre horas de inicio (minutos)'],
              ['bufferMin', 'Descanso después de una cita (minutos)'],
              ['cancellationAdvanceMin', 'Antelación para cancelar (minutos)'],
            ] as const
          ).map(([key, label]) =>
            field(
              key,
              label,
              policies[key],
              (v) => setPolicies((p) => ({ ...p, [key]: v })),
              undefined,
              'numeric',
            ),
          )}
          <AppButton
            label="Guardar configuración"
            disabled={disabled}
            onPress={() =>
              void save(() =>
                app.configure({
                  publicContact: contact,
                  address,
                  policies: {
                    minimumNoticeMin: number(policies.minimumNoticeMin),
                    bookingHorizonDays: number(policies.bookingHorizonDays, 1),
                    maxFuturePerClient: number(policies.maxFuturePerClient, 1),
                    slotStepMin: number(policies.slotStepMin, 1),
                    bufferMin: number(policies.bufferMin),
                    cancellationAdvanceMin: number(
                      policies.cancellationAdvanceMin,
                    ),
                  },
                }),
              )
            }
          />
          <AppText>
            Estado:{' '}
            {data?.settings
              ? publicationLabel[data.settings.publicationState]
              : 'Sin configurar'}
            . Para publicar hacen falta servicios, profesional activo,
            capacidades y horarios válidos.
          </AppText>
          {(permissions?.publish ?? true) &&
            (['published', 'paused', 'withdrawn'] as const).map((state, i) => (
              <AppButton
                key={state}
                variant={
                  state === 'published'
                    ? 'primary'
                    : state === 'withdrawn'
                      ? 'danger'
                      : 'secondary'
                }
                label={
                  [
                    'Publicar barbería',
                    'Pausar nuevas reservas',
                    'Retirar oferta pública',
                  ][i]
                }
                disabled={disabled}
                onPress={() => void save(() => app.setPublication(state))}
              />
            ))}
        </Section>
      )}
      {admin && page === 'services' && (
        <>
          <Section title="Servicios de la barbería">
            {!data?.services.length && (
              <StatusMessage
                state="empty"
                message="Todavía no hay servicios."
              />
            )}
            <ChoiceGrid>
              {data?.services.map((s) => (
                <AppButton
                  key={s.id}
                  variant="secondary"
                  selected={serviceId === s.id}
                  label={`${s.name} · S/ ${(s.price.amountMinor / 100).toFixed(2)} · ${s.durationMin} min · ${s.active ? 'Activo' : 'Inactivo'}`}
                  disabled={disabled}
                  onPress={() => {
                    setServiceCategory(
                      s.category ?? serviceVisualCategory(s.name),
                    );
                    setServiceId(s.id);
                    setServiceName(s.name);
                    setDescription(s.description);
                    setPrice((s.price.amountMinor / 100).toFixed(2));
                    setDuration(String(s.durationMin));
                    setActive(s.active);
                  }}
                />
              ))}
            </ChoiceGrid>
          </Section>
          <Section
            title={serviceId ? 'Editar servicio' : 'Nuevo servicio'}
            description="Los precios se expresan en soles y la duración en minutos."
          >
            {field(
              'service-name',
              'Nombre del servicio',
              serviceName,
              setServiceName,
            )}
            <AppText>Categoría</AppText>
            <ChoiceGrid>
              {serviceCategories
                .filter((category) => category !== 'Todos los servicios')
                .map((category) => (
                  <AppButton
                    key={category}
                    label={category}
                    selected={serviceCategory === category}
                    disabled={disabled}
                    onPress={() => setServiceCategory(category)}
                  />
                ))}
            </ChoiceGrid>
            {field('description', 'Descripción', description, setDescription)}
            {field(
              'price',
              'Precio en soles',
              price,
              setPrice,
              'Ejemplo: 25.50',
              'decimal',
            )}
            {field(
              'duration',
              'Duración en minutos',
              duration,
              setDuration,
              undefined,
              'numeric',
            )}
            <AppButton
              variant={active ? 'secondary' : 'ghost'}
              label={
                active
                  ? 'Servicio activo: desactivar'
                  : 'Servicio inactivo: activar'
              }
              disabled={disabled}
              onPress={() => setActive(!active)}
            />
            <AppButton
              label={serviceId ? 'Guardar servicio' : 'Crear servicio'}
              disabled={disabled}
              onPress={() =>
                void save(() => {
                  return app.upsertService({
                    ...(serviceId ? { id: serviceId } : {}),
                    category: serviceCategory,
                    ...parseServiceDraft({
                      name: serviceName,
                      price,
                      duration,
                    }),
                    description,
                    active,
                  });
                })
              }
            />
            {serviceId && (
              <AppButton
                label="Eliminar del catálogo"
                variant="secondary"
                disabled={disabled}
                onPress={() =>
                  setRemovingService(
                    data?.services.find((s) => s.id === serviceId) ?? null,
                  )
                }
              />
            )}
            {removingService && (
              <>
                <AppText>
                  ¿Eliminar {removingService.name} del catálogo? Las reservas y
                  su historial se conservarán.
                </AppText>
                <AppButton
                  label="Conservar servicio"
                  disabled={disabled}
                  onPress={() => setRemovingService(null)}
                />
                <AppButton
                  label="Confirmar eliminación del catálogo"
                  disabled={disabled}
                  onPress={() => {
                    void save(() =>
                      app.upsertService({
                        ...removingService,
                        active: false,
                        archived: true,
                      }),
                    );
                    setRemovingService(null);
                  }}
                />
              </>
            )}
            <AppButton
              label="Preparar otro servicio"
              variant="ghost"
              disabled={disabled}
              onPress={() => {
                setServiceCategory('Otros');
                setServiceId(undefined);
                setServiceName('');
                setDescription('');
                setPrice('');
                setDuration('');
                setActive(true);
              }}
            />
          </Section>
        </>
      )}
      {page === 'staff' && (
        <>
          {professional && app.ownSummary && (
            <OwnSummaryPanel
              application={app.ownSummary}
              key={`summary-${stamp}`}
            />
          )}
          {(incoming || team) && app.adminInvitations && (
            <AdminInvitationsPanel
              application={app.adminInvitations}
              canManage={permissions?.manageAdministrators ?? !app.authority}
              audience={
                separated
                  ? staffView === 'team'
                    ? 'outgoing'
                    : 'incoming'
                  : undefined
              }
              key={`admin-invitations-${stamp}`}
            />
          )}
          {professional && app.canEditOwnProfessional?.() && (
            <SelfProfessional application={app} key={stamp} />
          )}
          {incoming &&
            (Platform.OS === 'web' ? (
              <ReceivedInvitationsWeb
                kind="barber"
                rows={
                  loading || (error && own.length === 0)
                    ? null
                    : own.filter((i) => i.role === 'barber')
                }
                busy={disabled}
                error={
                  error
                    ? 'No se pudo verificar la lista. Actualiza para volver a intentarlo.'
                    : null
                }
                onLoad={() => void reload()}
                onRespond={(id, decision) =>
                  void save(
                    () => app.respondInvitation(id, decision),
                    () =>
                      decision === 'accept'
                        ? 'Invitación aceptada. Ya puedes seleccionar tu espacio de trabajo.'
                        : 'Invitación rechazada.',
                  )
                }
              />
            ) : (
              <Section title="Mis invitaciones de barbero">
                {!own.some((i) => i.role === 'barber') && (
                  <StatusMessage
                    state="empty"
                    message="No tienes invitaciones."
                  />
                )}
                {own
                  .filter((i) => i.role === 'barber')
                  .map((i) => (
                    <View
                      key={i.id}
                      {...webPart('panel')}
                      style={pageStyles.panel}
                    >
                      <AppText>
                        {i.barbershopName ?? 'Invitación'} · Barbero ·{' '}
                        {invitationLabel[i.status]}
                      </AppText>
                      {i.status === 'pending' && (
                        <>
                          <AppButton
                            label="Aceptar invitación"
                            disabled={disabled}
                            onPress={() =>
                              void save(() =>
                                app.respondInvitation(i.id, 'accept'),
                              )
                            }
                          />
                          <AppButton
                            label="Rechazar invitación"
                            variant="secondary"
                            disabled={disabled}
                            onPress={() =>
                              void save(() =>
                                app.respondInvitation(i.id, 'reject'),
                              )
                            }
                          />
                        </>
                      )}
                    </View>
                  ))}
              </Section>
            ))}
          {admin && team && (
            <>
              <Section
                title="Invitar a un profesional"
                description="La persona debe tener una cuenta. Tendrá acceso a esta barbería cuando acepte su invitación."
              >
                {field(
                  'invite-email',
                  'Correo exacto de una cuenta registrada',
                  email,
                  setEmail,
                )}
                <AppButton
                  label="Invitar como barbero"
                  disabled={disabled}
                  onPress={() => void save(() => app.invite(email))}
                />
                {newestInvitations(
                  data?.invitations ?? [],
                  scope?.barbershopId ?? undefined,
                )
                  .filter((i) => i.role === 'barber')
                  .map((i) => (
                    <View
                      key={i.id}
                      {...webPart('panel')}
                      style={pageStyles.panel}
                    >
                      <AppText>
                        {i.recipientName || 'Nombre no disponible'} ·{' '}
                        {invitationLabel[i.status]}
                      </AppText>
                      {i.status === 'pending' && (
                        <AppText>
                          Correo: {i.recipientEmail || 'Correo no disponible'}
                        </AppText>
                      )}
                      <AppText>Barbería: {i.barbershopName || title}</AppText>
                      <AppText>
                        Fecha de envío: {invitationDate(i.createdAt)} · Lima
                      </AppText>
                      <AppText>
                        {i.status === 'accepted' ? 'Aceptada el' : 'Respuesta'}:{' '}
                        {invitationDate(i.respondedAt)}
                      </AppText>
                      {i.status === 'accepted' && (
                        <AppText>
                          Profesional actualmente: {professionalActivity(i)}
                        </AppText>
                      )}
                      {i.status === 'pending' && (
                        <AppButton
                          label="Reenviar invitación"
                          disabled={disabled}
                          onPress={() =>
                            void save(
                              () => app.remindInvitation(i.id),
                              (result) =>
                                (result as { created: boolean }).created
                                  ? 'Aviso reenviado dentro de BARBEXA.'
                                  : 'Ya se envió un aviso recientemente. Espera un minuto.',
                            )
                          }
                        />
                      )}
                      {i.status === 'pending' && (
                        <AppButton
                          label="Cancelar invitación pendiente"
                          variant="danger"
                          disabled={disabled}
                          onPress={() =>
                            void save(() => app.cancelInvitation(i.id))
                          }
                        />
                      )}
                    </View>
                  ))}
              </Section>
              <Section title="Profesionales y capacidades">
                <AppText>
                  Ser administrador no habilita atención automáticamente. Elige
                  una membresía activa y crea su perfil profesional.
                </AppText>
                {data?.members
                  .filter((m) => m.status === 'active')
                  .map((m, i) => (
                    <AppButton
                      key={m.userId}
                      variant="secondary"
                      selected={member === m.userId}
                      label={`${m.userId === scope?.userId ? 'Mi membresía' : `Miembro ${i + 1}`} · ${m.role === 'administrator' ? 'Administrador' : 'Barbero'}`}
                      disabled={disabled}
                      onPress={() => setMember(m.userId)}
                    />
                  ))}
                {field(
                  'professional-name',
                  'Nombre profesional público',
                  professionalName,
                  setProfessionalName,
                )}
                <AppButton
                  label="Activar perfil profesional del miembro elegido"
                  disabled={disabled || !member}
                  onPress={() =>
                    void save(() =>
                      app.setProfessional({
                        userId: member,
                        professionalName,
                        active: true,
                      }),
                    )
                  }
                />
                {data?.professionals.map((p) => (
                  <View
                    key={p.id}
                    {...webPart('panel')}
                    style={pageStyles.panel}
                  >
                    <AppButton
                      label={`Seleccionar ${p.professionalName}`}
                      variant="secondary"
                      selected={barber === p.id}
                      disabled={disabled}
                      onPress={() => chooseBarber(p.id)}
                    />
                    <AppButton
                      variant={p.active ? 'danger' : 'secondary'}
                      label={
                        p.active
                          ? `Desactivar ${p.professionalName}`
                          : `Activar ${p.professionalName}`
                      }
                      disabled={disabled}
                      onPress={() =>
                        void save(() =>
                          app.setProfessional({ ...p, active: !p.active }),
                        )
                      }
                    />
                  </View>
                ))}
                {barber && (
                  <>
                    <AppText>
                      Selecciona todos los servicios que puede atender este
                      profesional. Guardar reemplaza sus capacidades.
                    </AppText>
                    {data?.services.map((s) => (
                      <AppButton
                        key={s.id}
                        variant="secondary"
                        selected={capabilities.includes(s.id)}
                        label={`${capabilities.includes(s.id) ? 'Seleccionado' : 'Seleccionar'}: ${s.name}`}
                        disabled={disabled}
                        onPress={() =>
                          setCapabilities((ids) =>
                            ids.includes(s.id)
                              ? ids.filter((id) => id !== s.id)
                              : [...ids, s.id],
                          )
                        }
                      />
                    ))}
                    <AppButton
                      label="Guardar capacidades seleccionadas"
                      disabled={disabled}
                      onPress={() =>
                        void save(() =>
                          app.setCapabilities(barber, capabilities),
                        )
                      }
                    />
                  </>
                )}
              </Section>
            </>
          )}
        </>
      )}
      {page === 'schedules' && app.selfSchedule && (
        <SelfSchedulePanel
          application={app.selfSchedule}
          key={stamp}
          hideWeeklyEditor={admin && page === 'schedules'}
        />
      )}
      {web &&
        admin &&
        page === 'schedules' &&
        (permissions?.editHours ?? true) &&
        shopClosuresPanel}
      {admin && page === 'schedules' && (
        <Section title="Horarios y excepciones">
          <AppText>
            Selecciona primero el horario del local o de un profesional. Se
            guardan todos los intervalos de la lista.
          </AppText>
          <AppButton
            label="Editar horario del local"
            variant="secondary"
            selected={barber === null}
            disabled={disabled}
            onPress={() => chooseBarber(null)}
          />
          {data?.professionals.map((p) => (
            <AppButton
              key={p.id}
              variant="secondary"
              selected={barber === p.id}
              label={`Editar horario de ${p.professionalName}`}
              disabled={disabled}
              onPress={() => chooseBarber(p.id)}
            />
          ))}
          <AppText>
            {barber ? 'Horario profesional' : 'Horario del local'}
          </AppText>
          <ActionRow>
            {days.map((label, d) => (
              <AppButton
                key={d}
                variant="secondary"
                compact
                selected={weekday === d}
                label={`${weekday === d ? 'Día seleccionado: ' : ''}${label}`}
                disabled={disabled}
                onPress={() => setWeekday(d)}
              />
            ))}
          </ActionRow>
          {field('opens', 'Inicio (HH:MM)', opens, setOpens)}
          {field('closes', 'Fin (HH:MM)', closes, setCloses)}
          <AppButton
            label="Agregar intervalo a la lista"
            disabled={disabled}
            onPress={() => {
              try {
                const start = time(opens),
                  end = time(closes);
                if (end <= start) throw new BusinessError('INVALID_INPUT');
                setHours((h) => [
                  ...h,
                  { weekday, opensMin: start, closesMin: end },
                ]);
                setError(null);
              } catch {
                setError('INVALID_INPUT');
              }
            }}
          />
          {!hours.length && (
            <StatusMessage
              state="empty"
              message="La lista está vacía. Elige el horario a editar o agrega intervalos."
            />
          )}
          {hours.map((h, i) => (
            <AppButton
              key={`${h.weekday}-${h.opensMin}-${i}`}
              variant="danger"
              label={`Quitar ${days[h.weekday]} ${clock(h.opensMin)}–${clock(h.closesMin)}`}
              disabled={disabled}
              onPress={() => setHours((list) => list.filter((_, n) => n !== i))}
            />
          ))}
          <AppButton
            label="Guardar todos los intervalos"
            disabled={disabled}
            onPress={() => void save(() => app.setHours(barber, hours))}
          />
          <AppText variant="action">Excepción de disponibilidad</AppText>
          {field(
            'exception-date',
            'Fecha (AAAA-MM-DD)',
            exceptionDate,
            setExceptionDate,
          )}
          {field(
            'exception-reason',
            'Motivo de la excepción',
            reason,
            setReason,
          )}
          <AppText>
            {barber
              ? `Afecta solo a ${data?.professionals.find((p) => p.id === barber)?.professionalName ?? 'el profesional seleccionado'}.`
              : 'Afecta a todos los profesionales de la barbería.'}{' '}
            Utiliza las horas de inicio y fin anteriores, en hora de Lima. Las
            citas existentes no se cancelan desde este formulario.
          </AppText>
          <AppButton
            label="Guardar excepción"
            disabled={disabled}
            onPress={() =>
              void save(() => {
                if (
                  !/^\d{4}-\d{2}-\d{2}$/.test(exceptionDate) ||
                  time(closes) <= time(opens)
                )
                  throw new BusinessError('INVALID_INPUT');
                const start = new Date(
                    `${exceptionDate}T${opens}:00-05:00`,
                  ).toISOString(),
                  end = new Date(
                    `${exceptionDate}T${closes}:00-05:00`,
                  ).toISOString();
                return app.setException({
                  barberId: barber,
                  startsAt: utcInstant(start),
                  endsAt: utcInstant(end),
                  reason: reason.trim() || null,
                });
              })
            }
          />
        </Section>
      )}
    </Screen>
  );
}
