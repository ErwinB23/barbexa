import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform, View } from 'react-native';
import { ReceivedInvitationsWeb } from './received-invitations.web';
import { Section } from '../../../shared/ui/page-header';
import { AppText } from '../../../shared/ui/app-text';
import { AppButton } from '../../../shared/ui/app-button';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { tokens } from '../../../shared/ui/tokens';
import { BusinessError } from '../domain/values';
import type { AdminInvitation } from '../domain/admin-invitations';
import type { AdminInvitationsApplication } from '../application/admin-invitations';
type Mode = 'incoming' | 'outgoing';
export interface AdminInvitationViewProps {
  inApp?: boolean;
  audience?: Mode;
  admin: boolean;
  email: string;
  mode: Mode;
  rows: readonly AdminInvitation[] | null;
  busy: boolean;
  uncertain: boolean;
  error: string | null;
  message: string | null;
  onEmail: (value: string) => void;
  onMode: (mode: Mode) => void;
  onLoad: () => void;
  onInvite: () => void;
  onRespond: (id: string, decision: 'accept' | 'reject') => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
}
type Props = AdminInvitationViewProps;
function InvitationRenderer(p: {
  view: Props;
  render: (view: Props) => ReactNode;
}) {
  return p.render(p.view);
}
const statuses = {
  pending: 'Pendiente de aceptación',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
  expired: 'Caducada',
};
const mailStatus = {
  pending: 'Aviso por correo pendiente',
  sending: 'Aviso en proceso',
  sent: 'Correo aceptado por el servicio; no acredita lectura',
  failed: 'No se pudo enviar el aviso',
  unknown:
    'Resultado del correo no confirmado; no se reenviará automáticamente',
};
export function AdminInvitationContent(p: Props) {
  if (Platform.OS === 'web' && p.audience === 'incoming')
    return (
      <ReceivedInvitationsWeb
        kind="administrator"
        rows={p.rows}
        busy={p.busy}
        error={p.error}
        message={p.message}
        onLoad={p.onLoad}
        onRespond={p.onRespond}
      />
    );
  return (
    <Section title="Invitaciones de administración">
      <AppText>
        Solo una cuenta confirmada puede aceptar. La invitación no concede
        permisos; la invitación caduca a los siete días.
      </AppText>
      {p.inApp && (
        <AppText>
          La persona recibirá un aviso en BARBEXA y podrá aceptar en «Mis
          invitaciones recibidas». Solo el propietario puede invitar
          administradores secundarios; el límite es de dos.
        </AppText>
      )}
      {p.audience !== 'outgoing' && (
        <AppButton
          label="Mis invitaciones de administrador"
          variant={p.mode === 'incoming' ? 'primary' : 'secondary'}
          onPress={() => p.onMode('incoming')}
          disabled={p.busy}
        />
      )}
      {p.admin && (
        <>
          <AppButton
            label="Invitaciones enviadas de esta barbería"
            variant={p.mode === 'outgoing' ? 'primary' : 'secondary'}
            onPress={() => p.onMode('outgoing')}
            disabled={p.busy}
          />
          <AppTextField
            id="admin-invitation-email"
            label="Correo de una cuenta registrada y confirmada"
            value={p.email}
            onChangeText={p.onEmail}
            disabled={p.busy || p.uncertain}
          />
          <AppButton
            label={
              p.uncertain
                ? 'Reintentar la misma invitación'
                : 'Invitar como administrador'
            }
            onPress={p.onInvite}
            disabled={p.busy || !p.email.trim()}
          />
        </>
      )}
      <AppButton
        label={
          p.busy
            ? 'Consultando…'
            : 'Consultar / actualizar invitaciones de administración'
        }
        variant="secondary"
        onPress={p.onLoad}
        disabled={p.busy}
      />
      {p.error && (
        <AppText tone="error" accessibilityLiveRegion="polite">
          {p.error}
        </AppText>
      )}
      {p.message && (
        <AppText accessibilityLiveRegion="polite">{p.message}</AppText>
      )}
      {p.uncertain && (
        <AppText>
          No pudimos confirmar el resultado. Reintenta con el mismo
          destinatario.
        </AppText>
      )}
      {p.rows === null ? (
        <AppText>Aún no has consultado estas invitaciones.</AppText>
      ) : p.rows.length === 0 ? (
        <AppText>No hay invitaciones de administración en esta lista.</AppText>
      ) : (
        p.rows.map((i) => (
          <View key={i.id} style={{ gap: tokens.space.sm }}>
            <AppText variant="action">
              {i.barbershopName} · Administrador · {statuses[i.status]}
            </AppText>
            <AppText>Destinatario: {i.recipientName}</AppText>
            <AppText>
              Válida hasta{' '}
              {new Date(i.expiresAt).toLocaleString('es-PE', {
                timeZone: 'America/Lima',
              })}{' '}
              (Lima)
            </AppText>
            <AppText>
              {p.inApp ? 'Disponible en BARBEXA' : mailStatus[i.deliveryStatus]}
            </AppText>
            {i.status === 'pending' &&
              (p.mode === 'incoming' ? (
                <>
                  <AppButton
                    label="Aceptar administración"
                    onPress={() => p.onRespond(i.id, 'accept')}
                    disabled={p.busy}
                  />
                  <AppButton
                    label="Rechazar administración"
                    variant="secondary"
                    onPress={() => p.onRespond(i.id, 'reject')}
                    disabled={p.busy}
                  />
                </>
              ) : p.admin ? (
                <>
                  <AppButton
                    label="Cancelar invitación de administrador"
                    variant="danger"
                    onPress={() => p.onCancel(i.id)}
                    disabled={p.busy}
                  />
                  {!p.inApp && i.deliveryStatus === 'failed' && (
                    <AppButton
                      label="Reintentar aviso por correo"
                      variant="secondary"
                      onPress={() => p.onRetry(i.id)}
                      disabled={p.busy}
                    />
                  )}
                </>
              ) : null)}
          </View>
        ))
      )}
    </Section>
  );
}
function message(error: unknown) {
  const code =
    error instanceof BusinessError ? error.code : 'DEPENDENCY_UNAVAILABLE';
  return {
    INVALID_INPUT: 'Revisa el correo y la información solicitada.',
    PROFILE_REQUIRED:
      'La persona debe registrarse, confirmar su correo y completar su perfil antes de ser invitada.',
    CONFLICT: 'La invitación ya existe, cambió o caducó. Actualiza la lista.',
    FORBIDDEN: 'No tienes permiso en esta barbería.',
    UNAUTHENTICATED: 'Verifica tu sesión para continuar.',
    NOT_AVAILABLE: 'La invitación no está disponible.',
    DEPENDENCY_UNAVAILABLE:
      'No pudimos verificar el resultado. Conservamos el formulario.',
  }[code];
}
export function AdminInvitationsPanel({
  application: app,
  audience,
  canManage = true,
  render,
}: {
  application: AdminInvitationsApplication;
  audience?: Mode;
  canManage?: boolean;
  render?: (props: AdminInvitationViewProps) => ReactNode;
}) {
  const [email, setEmail] = useState(''),
    [selectedMode, setMode] = useState<Mode>('incoming'),
    [rows, setRows] = useState<readonly AdminInvitation[] | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null),
    [info, setInfo] = useState<string | null>(null);
  const running = useRef(false),
    stamp = app.scopeKey();
  const scope = app.getScope(),
    admin =
      canManage &&
      audience !== 'incoming' &&
      scope?.role === 'administrator' &&
      !!scope.barbershopId;
  const mode = audience ?? selectedMode;
  const run = useCallback(
    async (work?: () => Promise<AdminInvitation>) => {
      if (running.current) return;
      running.current = true;
      setBusy(true);
      setError(null);
      setInfo(null);
      try {
        const result = work ? await work() : null;
        if (app.scopeKey() !== stamp) return;
        if (result) {
          setInfo(
            result.status === 'accepted'
              ? 'Invitación aceptada. Actualiza tus barberías para acceder.'
              : result.status === 'pending'
                ? app.delivery === 'in-app'
                  ? 'Invitación enviada dentro de BARBEXA. La persona debe aceptarla para obtener acceso.'
                  : 'Invitación creada. La recepción del correo se verifica por separado.'
                : statuses[result.status],
          );
          if (result.status === 'pending') setEmail('');
        }
        const list = await (mode === 'incoming'
          ? app.loadOwn()
          : app.loadOutgoing());
        if (app.scopeKey() === stamp) setRows(list);
      } catch (e) {
        if (app.scopeKey() !== stamp) return;
        setError(message(e));
        if (
          e instanceof BusinessError &&
          ['FORBIDDEN', 'UNAUTHENTICATED', 'NOT_AVAILABLE'].includes(e.code)
        )
          setRows(null);
      } finally {
        running.current = false;
        if (app.scopeKey() === stamp) setBusy(false);
      }
    },
    [app, stamp, mode],
  );
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active && audience === 'incoming') return run();
    });
    return () => {
      active = false;
    };
  }, [audience, run]);
  if (render)
    return (
      <InvitationRenderer
        render={render}
        view={{
          inApp: app.delivery === 'in-app',
          audience,
          admin,
          email,
          mode,
          rows,
          busy,
          uncertain:
            audience === 'incoming' ? false : app.hasPendingInvitation(),
          error,
          message: info,
          onEmail: setEmail,
          onMode: (m) => {
            setMode(m);
            setRows(null);
            setError(null);
            setInfo(null);
          },
          onLoad: () => void run(),
          onInvite: () => void run(() => app.invite(email)),
          onRespond: (id, d) => void run(() => app.respond(id, d)),
          onCancel: (id) => void run(() => app.cancel(id)),
          onRetry: (id) => void run(() => app.retryMail(id)),
        }}
      />
    );
  return (
    <AdminInvitationContent
      inApp={app.delivery === 'in-app'}
      audience={audience}
      admin={admin}
      email={email}
      mode={mode}
      rows={rows}
      busy={busy}
      uncertain={audience === 'incoming' ? false : app.hasPendingInvitation()}
      error={error}
      message={info}
      onEmail={setEmail}
      onMode={(m) => {
        setMode(m);
        setRows(null);
        setError(null);
        setInfo(null);
      }}
      onLoad={() => void run()}
      onInvite={() => void run(() => app.invite(email))}
      onRespond={(id, d) => void run(() => app.respond(id, d))}
      onCancel={(id) => void run(() => app.cancel(id))}
      onRetry={(id) => void run(() => app.retryMail(id))}
    />
  );
}
