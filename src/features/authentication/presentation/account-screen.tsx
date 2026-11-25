import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
import { Screen } from '../../../shared/ui/screen';
import {
  PageHeader,
  Section,
  ActionRow,
  pageStyles,
} from '../../../shared/ui/page-header';
import { StatusMessage } from '../../../shared/ui/status-message';
import { Platform, View, StyleSheet } from 'react-native';
import { tokens } from '../../../shared/ui/tokens';
import type { SessionView } from '../domain/session-state';
import { useRegistration } from './use-registration';
import type { ReactNode } from 'react';
import { PersonalProfileEditor } from './personal-profile-editor';
import { webPart } from '../../../shared/ui/web-part';
import { AccountProfileWeb } from './account-profile-web';
import { SessionLoadingWeb } from './session-loading.web';
export function SessionResolutionContent({
  state,
  onRetry,
}: {
  state: SessionView;
  onRetry: () => void;
}) {
  if (state.kind === 'resolving' && Platform.OS === 'web')
    return <SessionLoadingWeb />;
  if (state.kind === 'resolving')
    return (
      <View style={resolutionStyle.panel}>
        <StatusMessage state="loading" message="Verificando sesión…" />
      </View>
    );
  if (
    state.kind === 'retryable-error' &&
    ['network-unavailable', 'provider-unavailable'].includes(state.error)
  )
    return (
      <View style={resolutionStyle.panel}>
        <AppText accessibilityLiveRegion="polite" tone="error">
          No se pudo verificar la sesión. Comprueba tu conexión y reintenta.
        </AppText>
        <AppButton label="Reintentar sesión" onPress={onRetry} />
      </View>
    );
  return null;
}
export function SessionFeedback() {
  const { application, state } = useRegistration();
  if (
    state.kind !== 'resolving' &&
    !(
      state.kind === 'retryable-error' &&
      ['network-unavailable', 'provider-unavailable'].includes(state.error)
    )
  )
    return null;
  if (state.kind === 'resolving' && Platform.OS === 'web')
    return (
      <View style={resolutionStyle.cover}>
        <SessionLoadingWeb />
      </View>
    );
  return (
    <View style={resolutionStyle.cover}>
      <Screen>
        <SessionResolutionContent
          state={state}
          onRetry={() => {
            void application.restoreAndVerify().catch(() => {});
          }}
        />
      </Screen>
    </View>
  );
}
const resolutionStyle = StyleSheet.create({
  cover: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.color.background,
  },
  panel: {
    padding: tokens.space.lg,
    gap: tokens.space.md,
    backgroundColor: tokens.color.surface,
  },
});
export function AccountContent({
  state,
  onSignOut,
  onHome,
  onContext,
  onOperation,
  onBooking,
  onAgenda,
  onOwn,
  profileEditor,
  workspaceContent,
}: {
  state: SessionView;
  onSignOut: () => void;
  onHome: () => void;
  onContext?: () => void;
  onOperation?: () => void;
  onBooking?: () => void;
  onAgenda?: () => void;
  onOwn?: () => void;
  profileEditor?: ReactNode;
  workspaceContent?: ReactNode;
}) {
  if (state.kind !== 'ready')
    return (
      <Screen>
        <SessionResolutionContent state={state} onRetry={() => {}} />
        <AppButton label="Volver al inicio" onPress={onHome} />
      </Screen>
    );
  if (Platform.OS === 'web')
    return (
      <AccountProfileWeb
        state={state}
        profileEditor={profileEditor}
        workspaceContent={workspaceContent}
        onBooking={onBooking}
        onOwn={onOwn}
      />
    );
  return (
    <Screen webLayout="account">
      <PageHeader
        title="Mi cuenta"
        subtitle="Organiza tus citas y accede a tus barberías."
      />
      <View {...webPart('panel', 'profile')} style={pageStyles.panel}>
        <AppText variant="heading" aria-level={2}>
          {state.profile.displayName}
        </AppText>
        <AppText tone="textSecondary">
          {state.profile.phone ?? 'Sin teléfono registrado'}
        </AppText>
        <AppText tone="textSecondary">
          {state.context?.kind === 'selected'
            ? `${state.context.barbershop?.name ?? 'Barbería seleccionada'} · ${state.context.context.role === 'administrator' ? 'Administrador' : 'Barbero'}`
            : state.context?.kind === 'none'
              ? 'Sin membresías activas. Tu cuenta sigue siendo válida.'
              : 'Selecciona o revisa tu contexto de barbería.'}
        </AppText>
      </View>
      {profileEditor}
      <Section
        title="Tus próximas citas"
        description="Reserva un nuevo horario o consulta las citas que ya confirmaste."
        webLayout="account-shortcut"
      >
        <ActionRow>
          {onBooking && (
            <AppButton label="Reservar una cita" onPress={onBooking} />
          )}
          {onOwn && (
            <AppButton
              label="Mis reservas"
              variant="secondary"
              onPress={onOwn}
            />
          )}
        </ActionRow>
      </Section>
      {workspaceContent !== undefined ? (
        workspaceContent
      ) : (
        <Section
          title="Tu espacio de trabajo"
          description="Gestiona únicamente las barberías en las que tienes permisos. También puedes revisar tus invitaciones."
          webLayout="account-shortcut"
        >
          {onContext && (
            <AppButton
              label="Ver mis barberías"
              variant="secondary"
              onPress={onContext}
            />
          )}
          {onAgenda && state.context.kind === 'selected' && (
            <AppButton
              label="Consultar agenda"
              variant="secondary"
              onPress={onAgenda}
            />
          )}
          {onOperation && (
            <AppButton
              label="Oferta, personal e invitaciones"
              variant="secondary"
              onPress={onOperation}
            />
          )}
        </Section>
      )}
      <AppButton
        label="Cerrar sesión en este dispositivo"
        variant="danger"
        onPress={onSignOut}
      />
      <AppButton label="Volver al inicio" variant="ghost" onPress={onHome} />
    </Screen>
  );
}
export function AccountScreen({
  onSignedOut,
  onHome,
  onContext,
  onOperation,
  onBooking,
  onAgenda,
  onOwn,
  workspaceContent,
}: {
  onSignedOut: () => void;
  onHome: () => void;
  onContext?: () => void;
  onOperation?: () => void;
  onBooking?: () => void;
  onAgenda?: () => void;
  onOwn?: () => void;
  workspaceContent?: ReactNode;
}) {
  const { application, state, callbackError } = useRegistration();
  async function leave() {
    try {
      await application.signOutCurrent();
    } catch {
      /* The public login view reports incomplete cleanup and offers retry. */
    } finally {
      onSignedOut();
    }
  }
  return (
    <AccountContent
      workspaceContent={workspaceContent}
      state={callbackError ? { kind: 'signed-out' } : state}
      profileEditor={
        state.kind === 'ready' && !callbackError ? (
          <PersonalProfileEditor
            key={state.identity.userId}
            profile={state.profile}
            onSave={application.updateOwnProfile}
          />
        ) : null
      }
      onSignOut={() => {
        void leave();
      }}
      onHome={onHome}
      onContext={onContext}
      onOperation={onOperation}
      onBooking={onBooking}
      onAgenda={onAgenda}
      onOwn={onOwn}
    />
  );
}
