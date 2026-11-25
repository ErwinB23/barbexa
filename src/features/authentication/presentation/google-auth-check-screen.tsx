import { Screen } from '../../../shared/ui/screen';
import { AppText } from '../../../shared/ui/app-text';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { AppButton } from '../../../shared/ui/app-button';
import type { GoogleAuthCheckView } from '../application/google-auth-check';

export function GoogleAuthCheckSetupContent(p: {
  publicKey: string;
  busy: boolean;
  error: boolean;
  onKey: (value: string) => void;
  onVerify: () => void;
  onLeave: () => void;
}) {
  return (
    <Screen width="form" webSurface="public">
      <AppText variant="heading">Prueba aislada de Google</AppText>
      <AppText>
        Solo Auth de app-barberia-arquitectura · vuoncrtkkkquvddunrxx.
      </AppText>
      <AppText>
        Development LOCAL conserva sus sesiones y datos. No se habilitan
        reservas, perfiles ni barberías en esta prueba.
      </AppText>
      <AppTextField
        id="google-check-public-key"
        label="Clave publishable del Cloud nuevo"
        value={p.publicKey}
        onChangeText={p.onKey}
        disabled={p.busy}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <AppButton
        label={p.busy ? 'Verificando…' : 'Verificar configuración pública'}
        onPress={p.onVerify}
        disabled={p.busy || !p.publicKey.trim()}
      />
      <AppText>
        Verificar configuración no inicia OAuth. Usa tu Gmail solo después de
        autorizar la prueba y sus efectos en Auth.
      </AppText>
      {p.error && (
        <AppText tone="error" accessibilityLiveRegion="polite">
          No se pudo verificar la clave pública o el proveedor. No se inició
          Google.
        </AppText>
      )}
      <AppButton
        label="Volver a Development LOCAL"
        variant="secondary"
        onPress={p.onLeave}
        disabled={p.busy}
      />
    </Screen>
  );
}
export function GoogleAuthCheckContent(p: {
  state: GoogleAuthCheckView;
  busy: boolean;
  onGoogle: () => void;
  onVerify: () => void;
  onLogout: () => void;
  onLeave: () => void;
}) {
  const pending = p.state.kind === 'oauth-pending',
    verified = p.state.kind === 'verified',
    resolving = p.state.kind === 'resolving';
  return (
    <Screen width="form" webSurface="public">
      <AppText variant="heading">Google · Auth Cloud aislado</AppText>
      <AppText>
        Destino: vuoncrtkkkquvddunrxx. Ninguna consulta de negocio está
        habilitada.
      </AppText>
      <AppText accessibilityLiveRegion="polite">
        {pending
          ? 'Esperando el retorno del navegador…'
          : verified
            ? 'Identidad autenticada y sesión verificadas.'
            : resolving
              ? 'Verificando sesión…'
              : p.state.kind === 'error'
                ? 'No se pudo completar la comprobación. Cierra la sesión de prueba antes de volver a LOCAL.'
                : 'Sin sesión en el perfil de prueba.'}
      </AppText>
      <AppText>
        Retorno PKCE verificado: {String(p.state.callbackVerified)}
      </AppText>
      <AppText>
        Identidad verificada por Auth: {String(p.state.identityVerified)}
      </AppText>
      <AppText>Sesión verificada: {String(p.state.sessionVerified)}</AppText>
      <AppText>
        Cierre remoto confirmado:{' '}
        {p.state.logoutConfirmed === null
          ? 'Sin comprobar'
          : String(p.state.logoutConfirmed)}
      </AppText>
      {!pending && !verified && (
        <AppButton
          label="Continuar con Google en Cloud"
          onPress={p.onGoogle}
          disabled={p.busy || resolving}
        />
      )}
      <AppButton
        label="Verificar sesión de prueba"
        variant="secondary"
        onPress={p.onVerify}
        disabled={p.busy || pending || resolving}
      />
      <AppButton
        label={
          pending ? 'Cancelar acceso de prueba' : 'Cerrar sesión de prueba'
        }
        variant="danger"
        onPress={p.onLogout}
        disabled={p.busy || resolving}
      />
      <AppButton
        label="Volver a Development LOCAL"
        variant="secondary"
        onPress={p.onLeave}
        disabled={p.busy || p.state.kind !== 'signed-out'}
      />
      <AppText>
        No se muestran códigos, tokens, correo personal ni claves. Este cierre
        no cierra tu cuenta de Google en el navegador ni la sesión LOCAL.
      </AppText>
    </Screen>
  );
}
