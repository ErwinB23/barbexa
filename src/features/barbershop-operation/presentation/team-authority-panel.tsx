import { useRef, useState, type ReactNode } from 'react';
import { Section, ActionRow } from '../../../shared/ui/page-header';
import { AppText } from '../../../shared/ui/app-text';
import { AppButton } from '../../../shared/ui/app-button';
import { AppTextField } from '../../../shared/ui/app-text-field';
import type { ManagementData } from '../application/operation-application';
import type { TeamAuthorityApplication } from '../application/team-authority';
import type {
  TeamAuthority,
  AuthorityMutation,
} from '../domain/team-authority';
import { BusinessError } from '../domain/values';

export interface TeamAuthorityViewProps {
  authority: TeamAuthority;
  members: ManagementData['members'] | null;
  professionals: ManagementData['professionals'];
  busy: boolean;
  selected: string;
  disposition: 'barber' | 'inactive' | null;
  reason: string;
  uncertain: boolean;
  error: string | null;
  message: string | null;
  onSelect: (id: string) => void;
  onDisposition: (value: 'barber' | 'inactive' | null) => void;
  onReason: (value: string) => void;
  onRemove: () => void;
  onReload: () => void;
}
type Props = TeamAuthorityViewProps;
function AuthorityRenderer(p: {
  view: Props;
  render: (view: Props) => ReactNode;
}) {
  return p.render(p.view);
}
export function TeamAuthorityContent(p: Props) {
  if (!['owner', 'secondary'].includes(p.authority.capacity)) return null;
  if (p.authority.capacity === 'secondary')
    return (
      <Section title="Administrador secundario">
        <AppText>
          Dispones de servicios, horarios, reservas y cobros autorizados en esta
          barbería. La gestión del equipo, la publicación y la administración
          corresponden al principal.
        </AppText>
      </Section>
    );
  const rows = p.members?.filter(
    (m) =>
      m.status === 'active' &&
      m.role === 'administrator' &&
      m.userId !== p.authority.userId,
  );
  const synchronized = !!rows && rows.length === p.authority.secondaryCount;
  const disabled = p.busy || !synchronized;
  return (
    <Section title="Administrador principal · Propietario">
      <AppText>
        Tu cuenta es la propietaria de esta barbería. Solo el principal puede
        nombrar o retirar administradores secundarios.
      </AppText>
      <AppText>
        {p.authority.secondaryCount} de 2 administradores secundarios activos.
      </AppText>
      <AppText>
        {p.authority.secondaryCount === 2
          ? 'Límite de dos secundarios alcanzado.'
          : `Cupos disponibles: ${2 - (p.authority.secondaryCount ?? 0)}.`}{' '}
        Las invitaciones pendientes no reservan cupo; el servidor vuelve a
        comprobarlo al aceptar.
      </AppText>
      {!rows ? (
        <AppText accessibilityLiveRegion="polite">
          Cargando administradores secundarios…
        </AppText>
      ) : !synchronized ? (
        <>
          <AppText accessibilityLiveRegion="polite">
            El equipo cambió. Actualiza los permisos y la lista antes de
            continuar.
          </AppText>
          <AppButton
            label="Actualizar equipo y permisos"
            onPress={p.onReload}
            disabled={p.busy}
          />
        </>
      ) : rows.length === 0 ? (
        <AppText>No hay administradores secundarios.</AppText>
      ) : (
        <>
          <AppText>
            Selecciona a quién retirar la administración. No se elimina su
            cuenta, perfil ni historial.
          </AppText>
          <ActionRow>
            {rows.map((row, index) => (
              <AppButton
                key={row.userId}
                variant="secondary"
                label={
                  p.professionals.find((x) => x.userId === row.userId)
                    ?.professionalName ??
                  `Administrador secundario ${index + 1}`
                }
                selected={p.selected === row.userId}
                disabled={disabled || p.uncertain}
                onPress={() => p.onSelect(row.userId)}
              />
            ))}
          </ActionRow>
          <AppText>Destino de la membresía (selección obligatoria):</AppText>
          <ActionRow>
            <AppButton
              label="Conservar como barbero"
              variant="secondary"
              selected={p.disposition === 'barber'}
              disabled={disabled || p.uncertain}
              onPress={() => p.onDisposition('barber')}
            />
            <AppButton
              label="Desactivar membresía"
              variant="secondary"
              selected={p.disposition === 'inactive'}
              disabled={disabled || p.uncertain}
              onPress={() => p.onDisposition('inactive')}
            />
          </ActionRow>
          <AppText>
            Conservar como barbero exige un perfil profesional activo. La
            desactivación puede ser rechazada si existen citas comprometidas o
            una transferencia pendiente.
          </AppText>
          <AppTextField
            id="secondary-removal-reason"
            label="Motivo de la retirada"
            value={p.reason}
            onChangeText={p.onReason}
            disabled={disabled || p.uncertain}
          />
          <AppButton
            label={
              p.uncertain
                ? 'Reintentar la misma retirada'
                : 'Confirmar retirada de administración'
            }
            variant="danger"
            disabled={
              disabled ||
              (!p.uncertain &&
                (!rows.some((x) => x.userId === p.selected) ||
                  !p.disposition ||
                  !p.reason.trim()))
            }
            onPress={p.onRemove}
          />
        </>
      )}
      {p.uncertain && (
        <AppText accessibilityLiveRegion="polite">
          Resultado no confirmado. Conservamos el mismo intento para evitar
          duplicados; no cambies el destinatario.
        </AppText>
      )}
      {p.error && (
        <AppText tone="error" accessibilityLiveRegion="polite">
          {p.error}
        </AppText>
      )}
      {p.message && (
        <AppText accessibilityLiveRegion="polite">{p.message}</AppText>
      )}
    </Section>
  );
}
export function TeamAuthorityPanel({
  application,
  authority,
  data,
  loading,
  newRequestId,
  onReload,
  render,
}: {
  application: TeamAuthorityApplication;
  authority: TeamAuthority;
  data: ManagementData | null;
  loading: boolean;
  newRequestId: () => string;
  onReload: () => Promise<unknown>;
  render?: (props: TeamAuthorityViewProps) => ReactNode;
}) {
  const [selected, setSelected] = useState('');
  const [disposition, setDisposition] = useState<'barber' | 'inactive' | null>(
    null,
  );
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const running = useRef(false),
    pending = useRef<AuthorityMutation | null>(null);
  const stamp = application.scopeKey();
  async function remove() {
    if (running.current || authority.capacity !== 'owner') return;
    if (!pending.current && (!selected || !disposition || !reason.trim()))
      return;
    running.current = true;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      pending.current ??= {
        action: 'remove-secondary',
        requestId: newRequestId(),
        memberUserId: selected,
        disposition: disposition!,
        reason: reason.trim(),
      };
      await application.execute(pending.current);
      if (application.scopeKey() !== stamp) return;
      pending.current = null;
      setUncertain(false);
      setSelected('');
      setDisposition(null);
      setReason('');
      setMessage(
        'Administración retirada. Se conservaron la cuenta y su historial.',
      );
      await onReload();
    } catch (e) {
      if (application.scopeKey() !== stamp) return;
      const code =
        e instanceof BusinessError ? e.code : 'DEPENDENCY_UNAVAILABLE';
      setUncertain(code === 'DEPENDENCY_UNAVAILABLE');
      if (code !== 'DEPENDENCY_UNAVAILABLE') pending.current = null;
      setError(
        {
          FORBIDDEN: 'No tienes permiso en esta barbería. Revisa tu contexto.',
          UNAUTHENTICATED: 'Verifica tu sesión antes de continuar.',
          CONFLICT:
            'El equipo cambió o existen compromisos que impiden la retirada. Actualiza la lista.',
          INVALID_INPUT: 'Revisa el destino y el motivo de la retirada.',
          NOT_AVAILABLE: 'La membresía ya no está disponible.',
          PROFILE_REQUIRED: 'Se requiere un perfil profesional activo.',
          DEPENDENCY_UNAVAILABLE:
            'No se pudo confirmar la respuesta del servidor.',
        }[code],
      );
    } finally {
      running.current = false;
      if (application.scopeKey() === stamp) setBusy(false);
    }
  }
  const content: Props = {
    authority,
    members: data?.members ?? null,
    professionals: data?.professionals ?? [],
    busy: busy || loading,
    selected,
    disposition,
    reason,
    uncertain,
    error,
    message,
    onSelect: setSelected,
    onDisposition: setDisposition,
    onReason: setReason,
    onRemove: () => void remove(),
    onReload: () => {
      void application.read(true).then(onReload);
    },
  };
  return render ? (
    <AuthorityRenderer view={content} render={render} />
  ) : (
    <TeamAuthorityContent {...content} />
  );
}
