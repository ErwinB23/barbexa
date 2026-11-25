import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
import { Screen } from '../../../shared/ui/screen';
import { PageHeader } from '../../../shared/ui/page-header';
import { StatusMessage } from '../../../shared/ui/status-message';
import type { ContextState } from '../domain/session-state';
import { useRegistration } from './use-registration';
import { Platform } from 'react-native';
import { ContextContentWeb } from './context-content-web';
const roleLabel = {
  administrator: 'Administrador',
  barber: 'Barbero',
} as const;
export function ContextContent({
  context,
  onSelect,
  onRefresh,
  onChoose,
  onAccount,
  onAgenda,
}: {
  context: ContextState;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  onChoose: () => void;
  onAccount: () => void;
  onAgenda?: () => void;
}) {
  if (Platform.OS === 'web')
    return (
      <ContextContentWeb
        context={context}
        onSelect={onSelect}
        onRefresh={onRefresh}
        onChoose={onChoose}
        onAccount={onAccount}
        onAgenda={onAgenda}
      />
    );
  return (
    <Screen>
      <PageHeader
        title="Tus barberías"
        subtitle="Selecciona dónde vas a trabajar. Tus permisos se mantienen separados en cada barbería."
      />
      {context.kind === 'resolving' ? (
        <StatusMessage
          state="loading"
          message="Comprobando membresías y acceso…"
        />
      ) : context.kind === 'none' ? (
        <AppText>
          No tienes membresías activas autorizadas. Tu cuenta sigue siendo
          válida.
        </AppText>
      ) : context.kind === 'error' ? (
        <AppText tone="error" accessibilityLiveRegion="polite">
          {context.error === 'network-unavailable'
            ? 'No pudimos comprobar la conexión. Reintenta sin usar permisos guardados.'
            : 'No se pudo acceder a la barbería. Actualiza tus membresías; tu sesión sigue activa.'}
        </AppText>
      ) : context.kind === 'selected' ? (
        <>
          <AppText variant="action">
            {context.barbershop?.name ?? 'Barbería seleccionada'}
          </AppText>
          <AppText>{roleLabel[context.context.role]}</AppText>
          <AppText tone="textSecondary">
            Este permiso corresponde únicamente a esta barbería.
          </AppText>
          {context.context.role === 'administrator' && onAgenda && (
            <AppButton
              label={`Ver agenda de ${context.barbershop?.name ?? 'esta barbería'}`}
              onPress={onAgenda}
            />
          )}
          <AppButton label="Cambiar de barbería" onPress={onChoose} />
        </>
      ) : (
        <>
          <AppText>
            Elige una barbería. Tu rol puede ser diferente en cada una.
          </AppText>
          {context.memberships.map((member) => {
            const shop = context.barbershops?.find(
              (v) => v.id === member.barbershopId,
            );
            return shop ? (
              <AppButton
                key={member.id}
                variant="secondary"
                label={`Elegir ${shop.name} (${roleLabel[member.role]})`}
                onPress={() => onSelect(shop.id)}
              />
            ) : null;
          })}
        </>
      )}
      <AppButton
        label="Actualizar barberías"
        variant="secondary"
        onPress={onRefresh}
        disabled={context.kind === 'resolving'}
      />
      <AppButton
        label="Volver a mi cuenta"
        variant="ghost"
        onPress={onAccount}
      />
    </Screen>
  );
}
export function ContextScreen({
  onAccount,
  onAgenda,
}: {
  onAccount: () => void;
  onAgenda?: () => void;
}) {
  const { application, state } = useRegistration();
  const context =
    state.kind === 'ready' ? state.context : ({ kind: 'resolving' } as const);
  return (
    <ContextContent
      context={context}
      onSelect={(id) => {
        void application.selectContext(id).catch(() => {});
      }}
      onRefresh={() => {
        void application.refreshContext().catch(() => {});
      }}
      onChoose={() => {
        void application.chooseContext().catch(() => {});
      }}
      onAccount={onAccount}
      onAgenda={onAgenda}
    />
  );
}
