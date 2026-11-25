export interface PersonalProfileFormProps {
  displayName: string;
  phone: string;
  busy: boolean;
  error: string | null;
  onName: (value: string) => void;
  onPhone: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}
export function ProfileEditIcon({
  name,
}: {
  name: 'pencil' | 'check' | 'close' | 'layers';
}) {
  const paths = {
    pencil: 'm15 4 5 5M4 15 16 3a2 2 0 0 1 5 5L9 20l-6 1ZM4 15l5 5',
    check: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m-5 9 3 3 7-7',
    close: 'm6 6 12 12M18 6 6 18',
    layers: 'm12 2 10 5-10 5L2 7Zm-10 10 10 5 10-5M2 17l10 5 10-5',
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
export function PersonalProfileFormWeb(p: PersonalProfileFormProps) {
  return (
    <form
      className="bx-account-personal-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!p.busy) p.onSave();
      }}
      aria-busy={p.busy}
    >
      <label htmlFor="own-profile-name">
        Nombre
        <input
          id="own-profile-name"
          autoComplete="name"
          value={p.displayName}
          disabled={p.busy}
          onChange={(e) => p.onName(e.target.value)}
          required
        />
      </label>
      <label htmlFor="own-profile-phone">
        Teléfono (opcional)
        <input
          id="own-profile-phone"
          type="tel"
          autoComplete="tel"
          value={p.phone}
          disabled={p.busy}
          onChange={(e) => p.onPhone(e.target.value)}
          aria-describedby="own-profile-phone-hint"
        />
      </label>
      <p id="own-profile-phone-hint" className="bx-account-form-hint">
        Deja el campo vacío para retirar el teléfono.
      </p>
      {p.busy && (
        <p className="bx-account-form-message" role="status">
          Guardando perfil…
        </p>
      )}
      {p.error && (
        <p className="bx-account-form-message is-error" role="alert">
          {p.error}
        </p>
      )}
      <div className="bx-account-form-actions">
        <button type="submit" disabled={p.busy}>
          <ProfileEditIcon name="check" />
          Guardar perfil
        </button>
        <button
          type="button"
          disabled={p.busy}
          onClick={() => {
            if (!p.busy) p.onCancel();
          }}
        >
          <ProfileEditIcon name="close" />
          Cancelar edición
        </button>
      </div>
    </form>
  );
}
