import { useCallback, useEffect, useRef, useState } from 'react';
import { AppButton } from '../../../shared/ui/app-button';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { Section } from '../../../shared/ui/page-header';
import { StatusMessage } from '../../../shared/ui/status-message';
import type { OperationApplication } from '../application/operation-application';
import { BusinessError } from '../domain/values';
import { ProfessionalProfilePanel } from './professional-profile-panel';

export function SelfProfessionalContent({
  available,
  name,
  busy,
  error,
  saved,
  checked = false,
  onName,
  onRead,
  onSave,
}: {
  available: boolean;
  name: string;
  busy: boolean;
  error: string | null;
  saved: boolean;
  checked?: boolean;
  onName: (value: string) => void;
  onRead: () => void;
  onSave: () => void;
}) {
  return (
    <Section title="Mi perfil profesional en esta barbería">
      <AppButton
        label="Consultar mi perfil profesional"
        variant="secondary"
        disabled={busy}
        onPress={onRead}
      />
      {busy && (
        <StatusMessage
          state="loading"
          message="Verificando mi perfil profesional…"
        />
      )}
      {error && (
        <StatusMessage state="error" message={error} onRetry={onRead} />
      )}
      {!available && !busy && !error && checked && (
        <StatusMessage
          state="empty"
          message="No hay un perfil profesional activo para tu cuenta en esta barbería."
        />
      )}
      {!available && !busy && !error && !checked && (
        <StatusMessage
          state="empty"
          message="Consulta tu perfil profesional para verificar su disponibilidad en esta barbería."
        />
      )}
      {available && (
        <>
          <AppTextField
            id="self-professional-name"
            label="Mi nombre profesional"
            value={name}
            onChangeText={onName}
            disabled={busy}
            hint="Este nombre pertenece solo a tu perfil de la barbería seleccionada."
          />
          <AppButton
            label="Guardar mi perfil profesional"
            disabled={busy}
            onPress={() => {
              if (!busy) onSave();
            }}
          />
        </>
      )}
      {saved && (
        <StatusMessage
          state="success"
          message="Nombre profesional actualizado."
        />
      )}
    </Section>
  );
}
export function SelfProfessional({
  application: app,
  shopName,
}: {
  application: OperationApplication;
  shopName?: string;
}) {
  return app.professionalProfile ? (
    <ProfessionalProfilePanel
      key={app.scopeKey()}
      application={app}
      shopName={shopName}
    />
  ) : (
    <LegacySelfProfessional application={app} />
  );
}
function LegacySelfProfessional({
  application: app,
}: {
  application: OperationApplication;
}) {
  const [available, setAvailable] = useState(false),
    [name, setName] = useState('');
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null),
    [saved, setSaved] = useState(false);
  const pending = useRef(false),
    mounted = useRef(true);
  const stamp = app.scopeKey();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const execute = useCallback(
    async (write: boolean, draft?: string) => {
      if (pending.current) return;
      pending.current = true;
      setBusy(true);
      setError(null);
      setSaved(false);
      try {
        const result = write
          ? await app.updateOwnProfessional(draft ?? '')
          : await app.getOwnProfessional();
        if (!mounted.current || app.scopeKey() !== stamp) return;
        setName(result.professionalName);
        setAvailable(true);
        setChecked(true);
        setSaved(write);
      } catch (failure) {
        if (!mounted.current || app.scopeKey() !== stamp) return;
        const code =
          failure instanceof BusinessError
            ? failure.code
            : 'DEPENDENCY_UNAVAILABLE';
        if (['FORBIDDEN', 'UNAUTHENTICATED', 'NOT_AVAILABLE'].includes(code)) {
          setAvailable(false);
          setName('');
        }
        if (code === 'NOT_AVAILABLE') setChecked(true);
        if (code !== 'NOT_AVAILABLE')
          setError(
            code === 'INVALID_INPUT'
              ? 'Escribe un nombre profesional válido.'
              : ['FORBIDDEN', 'UNAUTHENTICATED'].includes(code)
                ? 'Tu sesión o membresía ya no permite acceder a este perfil.'
                : 'No pudimos completar la operación. Puedes reintentar; no se confirmó ningún cambio.',
          );
      } finally {
        pending.current = false;
        if (mounted.current && app.scopeKey() === stamp) setBusy(false);
      }
    },
    [app, stamp],
  );
  return (
    <SelfProfessionalContent
      available={available}
      name={name}
      busy={busy}
      error={error}
      saved={saved}
      checked={checked}
      onName={setName}
      onRead={() => {
        void execute(false);
      }}
      onSave={() => {
        void execute(true, name);
      }}
    />
  );
}
