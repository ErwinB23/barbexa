import type { ReactNode } from 'react';
import { ShopSettingsIcon } from './shop-settings-web';
import { availabilityToolsStyles } from './availability-tools-web.styles';
export function AvailabilityPanelHeading({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: 'calendar' | 'team' | 'shop';
}) {
  return (
    <header className="bx-date-panel-heading">
      <span className="bx-date-icon bx-date-icon--gold">
        <ShopSettingsIcon name={icon} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}
export function AvailabilityToolsWeb({
  form,
  personal,
  closures,
}: {
  form: ReactNode;
  personal?: ReactNode;
  closures?: ReactNode;
}) {
  return (
    <section className="bx-date-tools" aria-labelledby="date-tools-title">
      <style>{availabilityToolsStyles}</style>
      <header className="bx-date-heading">
        <span className="bx-date-icon bx-date-icon--gold">
          <ShopSettingsIcon name="calendar" />
        </span>
        <div>
          <h2 id="date-tools-title">Bloqueos y cierres por fecha</h2>
          <p>Ausencias personales y cierres del local</p>
        </div>
      </header>
      <div className="bx-date-guide" aria-label="Cómo funciona cada apartado">
        <article>
          <span className="bx-date-icon">
            <ShopSettingsIcon name="team" />
          </span>
          <div>
            <h3>Mis bloqueos personales</h3>
            <p>
              Solo tu cuenta como barbero. Para tus descansos o ausencias. No
              depende del profesional seleccionado arriba.
            </p>
          </div>
        </article>
        <article>
          <span className="bx-date-icon">
            <ShopSettingsIcon name="calendar" />
          </span>
          <div>
            <h3>Registrar cierre o ausencia</h3>
            <p>
              El destino que elijas. Selecciona toda la barbería o un
              profesional y bloquea una fecha y unas horas.
            </p>
          </div>
        </article>
        <article>
          <span className="bx-date-icon">
            <ShopSettingsIcon name="shop" />
          </span>
          <div>
            <h3>Cierres del local registrados</h3>
            <p>
              Toda la barbería. Consulta cierres existentes o retíralos. No
              incluye los bloqueos personales.
            </p>
          </div>
        </article>
      </div>
      <div className="bx-date-guidance">
        <ShopSettingsIcon name="calendar" />
        <p>
          Consulta tu disponibilidad para verificar tus horarios y bloqueos.
        </p>
      </div>
      <div className="bx-date-layout">
        <div className="bx-date-main">{form}</div>
        <aside
          className="bx-date-sidebar"
          aria-label="Consultas de bloqueos personales y cierres del local"
        >
          {personal}
          {closures && (
            <div className="bx-date-closures">
              <span
                className="bx-date-icon bx-date-icon--gold bx-date-closures-icon"
                aria-hidden="true"
              >
                <ShopSettingsIcon name="shop" />
              </span>
              {closures}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
