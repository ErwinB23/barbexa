import { SuccessToast } from '../../../shared/ui/success-toast';
import type { ProfessionalProfileView } from './use-professional-profile';
import { WorkspaceIcon } from '../../../shared/ui/workspace-icon.web';
import { ShopSettingsIcon } from './shop-settings-web';
import { professionalProfileStyles } from './professional-profile-web.styles';
function SocialIcon({ name }: { name: 'instagram' | 'tiktok' | 'facebook' }) {
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
      {name === 'instagram' ? (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17.5 6.5h.01" />
        </>
      ) : name === 'tiktok' ? (
        <path d="M14 3v12a4 4 0 1 1-4-4m4-8c1 4 3 5 6 5M14 3h3v12a7 7 0 1 1-7-7" />
      ) : (
        <path d="M15 22V13h4l1-4h-5V6c0-2 1-2 4-2V1h-4c-3 0-5 2-5 5v3H6v4h4v9" />
      )}
    </svg>
  );
}
const socialNames = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
} as const;
export function ProfessionalProfileWeb(p: ProfessionalProfileView) {
  const profile = p.profile;
  return (
    <div className="bx-professional-profile">
      <style>{professionalProfileStyles}</style>
      <aside className="bx-pp-identity">
        <div className="bx-pp-cover" />
        <div className="bx-pp-avatar">
          <WorkspaceIcon name="user" />
        </div>
        <div className="bx-pp-person">
          <h2>{profile?.professionalName ?? 'Mi perfil profesional'}</h2>
          <p>{profile ? 'Barbero profesional' : 'Perfil por consultar'}</p>
          {profile && (
            <span className="bx-pp-active">
              <span />
              Activo
            </span>
          )}
        </div>
        <dl>
          <div>
            <WorkspaceIcon name="shop" />
            <span>
              <dt>Barbería</dt>
              <dd>{profile?.barbershopName ?? 'Por consultar'}</dd>
            </span>
          </div>
          <div>
            <WorkspaceIcon name="calendar" />
            <span>
              <dt>Miembro desde</dt>
              <dd>
                {profile?.memberSince
                  ? new Intl.DateTimeFormat('es-PE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'America/Lima',
                    }).format(new Date(profile.memberSince))
                  : profile
                    ? 'Fecha no registrada'
                    : 'Por consultar'}
              </dd>
            </span>
          </div>
        </dl>
      </aside>
      <section
        className="bx-pp-form"
        aria-labelledby="professional-profile-title"
      >
        <header className="bx-pp-heading">
          <span className="bx-pp-icon">
            <WorkspaceIcon name="user" />
          </span>
          <div>
            <h2 id="professional-profile-title">
              Mi perfil profesional en esta barbería
            </h2>
            <p>
              Actualiza tu información profesional y consulta los datos
              guardados de tu perfil.
            </p>
          </div>
        </header>
        {p.busy && (
          <p className="bx-pp-feedback" role="status">
            Verificando mi perfil profesional…
          </p>
        )}
        {!!p.error && (
          <p className="bx-pp-feedback bx-pp-feedback--error" role="alert">
            {p.error}
          </p>
        )}
        {p.saved && !p.error && (
          <SuccessToast
            message={
              p.extended
                ? 'Perfil profesional actualizado'
                : 'Nombre profesional actualizado'
            }
            description="Tus cambios se guardaron correctamente."
          />
        )}
        {!profile && p.checked && !p.busy && !p.error && (
          <p className="bx-pp-feedback" role="status">
            No hay un perfil profesional activo en esta barbería.
          </p>
        )}
        {profile && !p.extended && (
          <p className="bx-pp-feedback" role="status">
            Puedes actualizar tu nombre. La descripción y las redes aún no están
            disponibles para guardar en este entorno.
          </p>
        )}
        <div className="bx-pp-fields">
          <label htmlFor="self-professional-name">
            Mi nombre profesional <span aria-hidden="true">*</span>
            <input
              id="self-professional-name"
              type="text"
              required
              aria-required="true"
              aria-describedby="professional-name-hint"
              autoComplete="off"
              value={p.draft.professionalName}
              disabled={p.busy || !profile}
              onChange={(e) => p.onChange('professionalName', e.target.value)}
            />
          </label>
          <p id="professional-name-hint" className="bx-pp-hint">
            Este nombre pertenece solo a tu perfil de la barbería seleccionada.
          </p>
          <label htmlFor="professional-description">
            Descripción profesional
            <textarea
              id="professional-description"
              rows={4}
              aria-describedby="professional-description-count"
              value={p.draft.description}
              disabled={p.busy || !profile || !p.extended}
              onChange={(e) =>
                p.onChange(
                  'description',
                  Array.from(e.target.value).slice(0, 250).join(''),
                )
              }
            />
          </label>
          <p id="professional-description-count" className="bx-pp-count">
            {Array.from(p.draft.description).length} / 250
          </p>
          <div className="bx-pp-social-heading">
            <span className="bx-pp-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="5" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m9 11 6-4m-6 6 6 4" />
              </svg>
            </span>
            <div>
              <h3>Mis redes sociales</h3>
              <p>
                Comparte tu usuario o un enlace HTTPS a tu perfil. Estos campos
                son opcionales.
              </p>
            </div>
          </div>
          <div className="bx-pp-social-fields">
            {(['instagram', 'tiktok', 'facebook'] as const).map((key) => (
              <div key={key}>
                <span className="bx-pp-icon">
                  <SocialIcon name={key} />
                </span>
                <label htmlFor={`professional-${key}`}>
                  {socialNames[key]}
                  <input
                    id={`professional-${key}`}
                    type="text"
                    maxLength={250}
                    placeholder="@usuario o enlace del perfil"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete="off"
                    value={p.draft[key] ?? ''}
                    disabled={p.busy || !profile || !p.extended}
                    onChange={(e) => p.onChange(key, e.target.value)}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
        <footer className="bx-pp-actions">
          <button
            type="button"
            className="bx-pp-save"
            disabled={p.busy || !profile || !p.draft.professionalName.trim()}
            onClick={p.onSave}
          >
            <ShopSettingsIcon name="save" />
            Guardar mi perfil profesional
          </button>
          <button type="button" disabled={p.busy} onClick={p.onRead}>
            <WorkspaceIcon name="search" />
            Consultar mi perfil profesional
          </button>
        </footer>
        {p.preview && profile && (
          <section
            className="bx-pp-preview"
            aria-label="Vista previa del perfil guardado"
          >
            <header>
              <h3>Vista previa del perfil guardado</h3>
              <button type="button" onClick={p.onPreviewClose}>
                Cerrar vista previa
              </button>
            </header>
            <h4>{profile.professionalName}</h4>
            <p>{profile.barbershopName}</p>
            {p.extended && (
              <>
                <p>{profile.description || 'Sin descripción registrada.'}</p>
                <dl>
                  {(['instagram', 'tiktok', 'facebook'] as const)
                    .filter((k) => profile[k])
                    .map((k) => (
                      <div key={k}>
                        <dt>{socialNames[k]}</dt>
                        <dd>
                          {profile[k]!.startsWith('https://') ? (
                            <a
                              href={profile[k]!}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                            >
                              {profile[k]}
                            </a>
                          ) : (
                            profile[k]
                          )}
                        </dd>
                      </div>
                    ))}
                </dl>
              </>
            )}
            {p.dirty && (
              <p className="bx-pp-hint">
                La vista previa muestra lo guardado. Tus cambios pendientes se
                conservan en el formulario.
              </p>
            )}
          </section>
        )}
      </section>
    </div>
  );
}
