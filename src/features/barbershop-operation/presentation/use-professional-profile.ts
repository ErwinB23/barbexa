import { useCallback, useEffect, useRef, useState } from 'react';
import type { OperationApplication } from '../application/operation-application';
import type {
  ProfileDraft,
  ProfessionalProfile,
} from '../domain/professional-profile';
import type { Professional } from '../domain/types';
const empty: ProfileDraft = {
  professionalName: '',
  description: '',
  instagram: null,
  tiktok: null,
  facebook: null,
};
export function useProfessionalProfile(
  app: OperationApplication,
  shopName?: string,
) {
  const [draft, setDraft] = useState<ProfileDraft>(empty),
    [profile, setProfile] = useState<ProfessionalProfile | null>(null),
    [extended, setExtended] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [saved, setSaved] = useState(false),
    [checked, setChecked] = useState(false),
    [preview, setPreview] = useState(false);
  const live = useRef(true),
    pending = useRef(false),
    scope = app.scopeKey();
  const asLegacy = useCallback(
    (p: Professional): ProfessionalProfile => ({
      ...p,
      description: '',
      instagram: null,
      tiktok: null,
      facebook: null,
      memberSince: null,
      barbershopName: shopName ?? 'Barbería seleccionada',
    }),
    [shopName],
  );
  const execute = useCallback(
    async (
      write: boolean,
      input: ProfileDraft,
      keepDraft: boolean,
      full: boolean,
    ) => {
      if (pending.current || !live.current) return;
      pending.current = true;
      setBusy(true);
      setError('');
      setSaved(false);
      try {
        let value: ProfessionalProfile,
          supported = false;
        if (write) {
          if (full && app.professionalProfile) {
            value = await app.professionalProfile.save(input);
            supported = true;
          } else
            value = asLegacy(
              await app.updateOwnProfessional(input.professionalName),
            );
        } else {
          try {
            if (!app.professionalProfile) throw Error('legacy');
            value = await app.professionalProfile.read();
            supported = true;
          } catch (e) {
            const code =
              e && typeof e === 'object' && 'code' in e ? e.code : '';
            if (full || code === 'FORBIDDEN' || code === 'UNAUTHENTICATED')
              throw e;
            value = asLegacy(await app.getOwnProfessional());
          }
        }
        if (!live.current || app.scopeKey() !== scope) return;
        setProfile(value);
        setExtended(supported);
        setChecked(true);
        setSaved(write);
        if (write || !keepDraft)
          setDraft({
            professionalName: value.professionalName,
            description: value.description,
            instagram: value.instagram,
            tiktok: value.tiktok,
            facebook: value.facebook,
          });
      } catch (e) {
        if (!live.current || app.scopeKey() !== scope) return;
        const code = e && typeof e === 'object' && 'code' in e ? e.code : '';
        if (
          ['FORBIDDEN', 'UNAUTHENTICATED', 'NOT_AVAILABLE'].includes(
            String(code),
          )
        ) {
          setProfile(null);
          setDraft(empty);
          setExtended(false);
        }
        setChecked(true);
        setError(
          code === 'INVALID_INPUT'
            ? 'Revisa el nombre, la descripción (máximo 250 caracteres) y las redes sociales.'
            : code === 'NOT_AVAILABLE'
              ? 'No tienes un perfil profesional activo en esta barbería.'
              : ['FORBIDDEN', 'UNAUTHENTICATED'].includes(String(code))
                ? 'Tu sesión o membresía no permite consultar este perfil.'
                : 'No se pudo confirmar la operación. Conservamos tu formulario para que puedas reintentar.',
        );
      } finally {
        pending.current = false;
        if (live.current && app.scopeKey() === scope) setBusy(false);
      }
    },
    [app, scope, asLegacy],
  );
  useEffect(() => {
    live.current = true;
    void Promise.resolve().then(() => {
      if (live.current && app.scopeKey() === scope)
        return execute(false, empty, false, false);
    });
    return () => {
      live.current = false;
    };
  }, [execute, app, scope]);
  const dirty =
    !!profile &&
    (draft.professionalName !== profile.professionalName ||
      draft.description !== profile.description ||
      draft.instagram !== profile.instagram ||
      draft.tiktok !== profile.tiktok ||
      draft.facebook !== profile.facebook);
  return {
    profile,
    draft,
    extended,
    busy,
    error,
    saved,
    checked,
    preview,
    dirty,
    onPreviewClose: () => setPreview(false),
    onChange: (key: keyof ProfileDraft, value: string) => {
      setDraft((d) => ({
        ...d,
        [key]:
          key === 'professionalName' || key === 'description'
            ? value
            : value || null,
      }));
      setSaved(false);
    },
    onRead: () => {
      setPreview(true);
      void execute(false, draft, dirty, extended);
    },
    onSave: () => void execute(true, draft, false, extended),
  };
}
export type ProfessionalProfileView = ReturnType<typeof useProfessionalProfile>;
