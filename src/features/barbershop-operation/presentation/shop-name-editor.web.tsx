import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { OperationApplication } from '../application/operation-application';
import { BusinessError } from '../domain/values';
import { Section } from '../../../shared/ui/page-header';
import { AppTextField } from '../../../shared/ui/app-text-field';
import { AppButton } from '../../../shared/ui/app-button';
import { StatusMessage } from '../../../shared/ui/status-message';

export interface ShopNameContentProps {
  name: string;
  loaded: boolean;
  busy: boolean;
  uncertain: boolean;
  saved: boolean;
  error: string | null;
  onName: (value: string) => void;
  onRead: () => void;
  onSave: () => void;
}
export function ShopNameContent({
  name,
  loaded,
  busy,
  uncertain,
  saved,
  error,
  onName,
  onRead,
  onSave,
}: ShopNameContentProps) {
  return (
    <Section
      title="Nombre de la barbería seleccionada"
      description="Edita este establecimiento conservando su identidad y sus reservas."
    >
      {busy && (
        <StatusMessage
          state="loading"
          message="Consultando o guardando el nombre…"
        />
      )}
      {error && (
        <StatusMessage
          state="error"
          message={error}
          retryLabel="Volver a consultar"
          onRetry={() => {
            if (!busy) onRead();
          }}
        />
      )}
      {saved && (
        <StatusMessage
          state="success"
          message="Nombre guardado en esta barbería."
        />
      )}
      {loaded && (
        <AppTextField
          id="selected-shop-name"
          label="Nombre de la barbería seleccionada"
          value={name}
          onChangeText={onName}
          disabled={busy || uncertain}
        />
      )}
      <AppButton
        label="Consultar nombre actual"
        variant="secondary"
        disabled={busy}
        onPress={onRead}
      />
      {loaded && (
        <AppButton
          label="Guardar nombre de esta barbería"
          disabled={busy || uncertain || !name.trim()}
          onPress={onSave}
        />
      )}
    </Section>
  );
}

export function ShopNameEditor({
  application: app,
  onRenamed,
  render,
}: {
  application: OperationApplication;
  onRenamed: () => Promise<void>;
  render?: (props: ShopNameContentProps) => ReactNode;
}) {
  const stamp = app.scopeKey();
  const [name, setName] = useState(''),
    [loaded, setLoaded] = useState(false),
    [busy, setBusy] = useState(false),
    [uncertain, setUncertain] = useState(false),
    [error, setError] = useState<string | null>(null),
    [saved, setSaved] = useState(false);
  const pending = useRef(false),
    mounted = useRef(false);
  const run = useCallback(
    async (write: boolean, draft?: string) => {
      if (pending.current) return;
      pending.current = true;
      setBusy(true);
      setError(null);
      setSaved(false);
      try {
        const value = write
          ? await app.renameSelectedShop(draft ?? '')
          : await app.getSelectedShop();
        if (!mounted.current || app.scopeKey() !== stamp) return;
        setName(value.name);
        setLoaded(true);
        setUncertain(false);
        setSaved(write);
        if (write) {
          try {
            await onRenamed();
          } catch {
            if (mounted.current && app.scopeKey() === stamp)
              setError(
                'El nombre se guardó. No se pudo actualizar la navegación; vuelve a consultar o recarga la página.',
              );
          }
        }
      } catch (failure) {
        if (!mounted.current || app.scopeKey() !== stamp) return;
        const code =
          failure instanceof BusinessError
            ? failure.code
            : 'DEPENDENCY_UNAVAILABLE';
        if (['FORBIDDEN', 'UNAUTHENTICATED', 'NOT_AVAILABLE'].includes(code)) {
          setLoaded(false);
          setName('');
        }
        if (write && code === 'DEPENDENCY_UNAVAILABLE') setUncertain(true);
        setError(
          code === 'INVALID_INPUT'
            ? 'Escribe un nombre válido para esta barbería.'
            : ['FORBIDDEN', 'UNAUTHENTICATED'].includes(code)
              ? 'Tu sesión o membresía ya no permite editar esta barbería.'
              : code === 'NOT_AVAILABLE'
                ? 'Esta barbería ya no está disponible en el contexto seleccionado.'
                : write
                  ? 'Resultado incierto: consulta el nombre actual antes de volver a guardar.'
                  : 'No pudimos consultar el nombre. Puedes volver a intentarlo.',
        );
      } finally {
        pending.current = false;
        if (mounted.current && app.scopeKey() === stamp) setBusy(false);
      }
    },
    [app, stamp, onRenamed],
  );
  useEffect(() => {
    let active = true;
    mounted.current = true;
    void Promise.resolve().then(() => {
      if (active) return run(false);
    });
    return () => {
      active = false;
      mounted.current = false;
    };
  }, [run]);
  const contentProps: ShopNameContentProps = {
    name,
    loaded,
    busy,
    uncertain,
    saved,
    error,
    onName: (value) => {
      setName(value);
      setSaved(false);
    },
    onRead: () => {
      void run(false);
    },
    onSave: () => {
      if (!uncertain) void run(true, name);
    },
  };
  // The render prop receives state snapshots and event handlers, never ref values.
  // Refs enclosed by onRead/onSave are accessed only when those events execute.
  // eslint-disable-next-line react-hooks/refs
  return render ? render(contentProps) : <ShopNameContent {...contentProps} />;
}
