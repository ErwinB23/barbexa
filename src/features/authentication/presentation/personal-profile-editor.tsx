import { Platform } from 'react-native';
import { SuccessToast } from '../../../shared/ui/success-toast';
import {
  PersonalProfileFormWeb,
  type PersonalProfileFormProps,
} from './personal-profile-form.web';
import { useEffect, useRef, useState } from 'react';
import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { Section } from '../../../shared/ui/page-header';
import { StatusMessage } from '../../../shared/ui/status-message';
import { AuthError } from '../domain/auth-error';
import type { OwnProfile } from '../domain/session-state';
import type { ProfileDetails } from '../application/auth-actions';

export function PersonalProfileForm({
  displayName,
  phone,
  busy,
  error,
  onName,
  onPhone,
  onSave,
  onCancel,
}: PersonalProfileFormProps) {
  if (Platform.OS === 'web')
    return (
      <PersonalProfileFormWeb
        {...{
          displayName,
          phone,
          busy,
          error,
          onName,
          onPhone,
          onSave,
          onCancel,
        }}
      />
    );
  return (
    <Section title="Editar perfil personal">
      <AppTextField
        id="own-profile-name"
        label="Nombre"
        value={displayName}
        onChangeText={onName}
        disabled={busy}
        autoComplete="name"
      />
      <AppTextField
        id="own-profile-phone"
        label="Teléfono (opcional)"
        value={phone}
        onChangeText={onPhone}
        disabled={busy}
        keyboardType="phone-pad"
        autoComplete="tel"
        hint="Deja el campo vacío para retirar el teléfono."
        returnKeyType="done"
        onSubmitEditing={() => {
          if (!busy) onSave();
        }}
      />
      {busy && <StatusMessage state="loading" message="Guardando perfil…" />}
      {error && (
        <AppText tone="error" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
      <AppButton
        label="Guardar perfil"
        disabled={busy}
        onPress={() => {
          if (!busy) onSave();
        }}
      />
      <AppButton
        label="Cancelar edición"
        variant="secondary"
        disabled={busy}
        onPress={() => {
          if (!busy) onCancel();
        }}
      />
    </Section>
  );
}

export function PersonalProfileEditor({
  profile,
  onSave,
}: {
  profile: OwnProfile;
  onSave: (input: ProfileDetails) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [displayName, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const pending = useRef(false),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  function close() {
    setEditing(false);
    setName('');
    setPhone('');
    setError(null);
  }
  async function save() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await onSave({ displayName, phone: phone.trim() || null });
      if (mounted.current) {
        close();
        setSaved(true);
      }
    } catch (failure) {
      if (mounted.current)
        setError(
          failure instanceof AuthError && failure.code === 'invalid-input'
            ? 'Escribe un nombre válido. El teléfono es opcional.'
            : failure instanceof AuthError &&
                failure.code === 'credentials-rejected'
              ? 'Tu sesión ya no permite editar. Vuelve a iniciar sesión.'
              : 'No pudimos guardar el perfil. Conservamos tu edición para reintentar.',
        );
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  if (editing)
    return (
      <PersonalProfileForm
        displayName={displayName}
        phone={phone}
        busy={busy}
        error={error}
        onName={setName}
        onPhone={setPhone}
        onSave={() => {
          void save();
        }}
        onCancel={close}
      />
    );
  return (
    <>
      {saved &&
        (Platform.OS === 'web' ? (
          <SuccessToast
            message="Perfil actualizado"
            description="Tus datos personales se guardaron correctamente."
          />
        ) : (
          <StatusMessage state="success" message="Perfil actualizado." />
        ))}
      <AppButton
        label="Editar perfil"
        variant="secondary"
        onPress={() => {
          setName(profile.displayName);
          setPhone(profile.phone ?? '');
          setError(null);
          setSaved(false);
          setEditing(true);
        }}
      />
    </>
  );
}
