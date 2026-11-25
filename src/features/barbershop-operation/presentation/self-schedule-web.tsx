import { SuccessToast } from '../../../shared/ui/success-toast';
import type { SelfScheduleContentProps } from './self-schedule-props';
import { SelfScheduleWeeklyWeb } from './self-schedule-weekly-web';
import { ShopSettingsIcon } from './shop-settings-web';
import { AppButton } from '../../../shared/ui/app-button';
import { weekDays, scheduleClock } from './weekly-schedule-draft';
import { limaScheduleInstant } from '../domain/self-schedule';
import { selfScheduleWebStyles } from './self-schedule-web.styles';

const local = (utc: string) =>
  new Date(Date.parse(utc) - 5 * 3600000)
    .toISOString()
    .slice(0, 16)
    .replace('T', ' ');
export function SelfScheduleWeb(p: SelfScheduleContentProps) {
  let validBlock = false;
  if (p.starts && p.ends) {
    try {
      validBlock = limaScheduleInstant(p.starts) < limaScheduleInstant(p.ends);
    } catch {
      /* Leave malformed or incomplete dates in the draft without writing. */
    }
  }
  return (
    <div className="bx-self-schedule">
      <style>{selfScheduleWebStyles}</style>
      {p.hideWeeklyEditor ? (
        <section className="bx-self-schedule-card bx-availability-personal">
          <header>
            <span className="bx-self-schedule-icon">
              <ShopSettingsIcon name="team" />
            </span>
            <div>
              <h2>Mis bloqueos personales</h2>
              <p>Solo tu cuenta como barbero en esta barbería.</p>
            </div>
          </header>
          <p>
            {p.view
              ? `Afecta únicamente a ${p.view.professional.professionalName}.`
              : 'Consulta tus bloqueos para identificar tu perfil profesional.'}{' '}
            Elegir otro barbero en el selector superior no cambia estos
            bloqueos.
          </p>
          <dl className="bx-date-personal-facts">
            <div>
              <dt>Alcance</dt>
              <dd>Solo mi cuenta</dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>Bloqueos personales</dd>
            </div>
          </dl>
          <AppButton
            label="Consultar mis bloqueos"
            variant="secondary"
            disabled={p.busy}
            onPress={p.onRead}
          />
        </section>
      ) : (
        <div className="bx-self-schedule-top">
          <section
            className="bx-self-schedule-intro bx-self-schedule-card"
            aria-labelledby="self-schedule-title"
          >
            <header>
              <span className="bx-self-schedule-icon">
                <ShopSettingsIcon name="calendar" />
              </span>
              <div>
                <h2 id="self-schedule-title">
                  {p.hideWeeklyEditor
                    ? 'Mis bloqueos personales'
                    : 'Mis horarios y bloqueos'}
                </h2>
                <p>
                  Hora de Lima. Los cambios no pueden afectar tus citas
                  comprometidas.
                </p>
              </div>
            </header>
            <footer>
              <AppButton
                label="Consultar mi disponibilidad"
                variant="secondary"
                disabled={p.busy}
                onPress={p.onRead}
              />
            </footer>
          </section>
          <section
            className="bx-self-schedule-card bx-self-schedule-local"
            aria-labelledby="self-shop-hours-title"
          >
            <header>
              <h2 id="self-shop-hours-title">
                <ShopSettingsIcon name="shop" />
                Horario general del local
              </h2>
              <span className="bx-self-schedule-badge">
                Referencia del local
              </span>
            </header>
            <dl>
              {[...weekDays]
                .sort((a, b) => a.id - b.id)
                .map((day) => {
                  const hours = p.view?.shopHours
                    .filter((h) => h.weekday === day.id)
                    .sort((a, b) => a.opensMin - b.opensMin);
                  return (
                    <div key={day.id}>
                      <dt>
                        <ShopSettingsIcon name="calendar" />
                        {day.name}
                      </dt>
                      <dd>
                        {hours
                          ? hours.length
                            ? hours
                                .map(
                                  (h) =>
                                    `${scheduleClock(h.opensMin)}–${scheduleClock(h.closesMin)}`,
                                )
                                .join(' y ')
                            : 'Sin atención'
                          : 'Por consultar'}
                      </dd>
                    </div>
                  );
                })}
            </dl>
          </section>
        </div>
      )}
      {p.busy && (
        <div className="bx-self-schedule-feedback" role="status">
          <ShopSettingsIcon name="refresh" />
          <p>Verificando disponibilidad propia…</p>
        </div>
      )}
      {p.error && (
        <div
          className="bx-self-schedule-feedback bx-self-schedule-feedback--error"
          role="alert"
        >
          <ShopSettingsIcon name="cancel" />
          <div>
            <strong>No se pudo confirmar la operación</strong>
            <p>{p.error}</p>
          </div>
          <AppButton
            label="Consultar disponibilidad actual"
            variant="secondary"
            disabled={p.busy}
            onPress={p.onRead}
          />
        </div>
      )}
      {p.saved && !p.error && (
        <SuccessToast
          message="Disponibilidad propia actualizada"
          description="El cambio en tu disponibilidad se guardó correctamente."
        />
      )}
      {!p.view && !p.busy && !p.error && (
        <div className="bx-self-schedule-feedback" role="status">
          <ShopSettingsIcon name="calendar" />
          <p>
            Consulta tu disponibilidad para verificar tus horarios y bloqueos.
          </p>
        </div>
      )}
      {p.view && (
        <>
          {!p.hideWeeklyEditor && <SelfScheduleWeeklyWeb {...p} />}
          {p.hideWeeklyEditor && (
            <p>
              Estos bloqueos corresponden a tu cuenta en esta barbería, no al
              profesional del selector superior.
            </p>
          )}
          <section
            className="bx-self-schedule-card bx-self-schedule-blocks"
            aria-labelledby="self-blocks-title"
          >
            <header className="bx-self-schedule-section-heading">
              <span className="bx-self-schedule-icon">
                <ShopSettingsIcon name="cancel" />
              </span>
              <div>
                <h2 id="self-blocks-title">
                  {p.hideWeeklyEditor
                    ? 'Registrar o editar mi bloqueo'
                    : 'Mis bloqueos'}
                </h2>
                <p>
                  Reserva tiempo para descansos, ausencias u otros compromisos
                  personales.
                </p>
              </div>
              <span className="bx-self-schedule-badge">Hora de Lima</span>
            </header>
            {!p.view.blocks.length ? (
              <p className="bx-self-schedule-block-empty">
                No tienes bloqueos propios registrados.
              </p>
            ) : (
              <ul
                className="bx-self-schedule-block-list"
                aria-label="Bloqueos personales registrados"
              >
                {p.view.blocks
                  .map((b, index) => ({ b, index }))
                  .sort(
                    (a, b) =>
                      Date.parse(a.b.startsAt) - Date.parse(b.b.startsAt),
                  )
                  .map(({ b, index }) => (
                    <li key={b.id}>
                      <span className="bx-self-schedule-icon">
                        <ShopSettingsIcon name="calendar" />
                      </span>
                      <div>
                        <strong>
                          {local(b.startsAt)} → {local(b.endsAt)}
                        </strong>
                        {b.reason && <p>{b.reason}</p>}
                      </div>
                      <div className="bx-self-schedule-block-actions">
                        <AppButton
                          label={`Editar bloqueo ${index + 1}`}
                          variant="secondary"
                          disabled={p.busy}
                          onPress={() => {
                            if (!p.busy) p.onSelectBlock(b);
                          }}
                        />
                        <AppButton
                          label={`Retirar bloqueo ${index + 1}`}
                          variant="danger"
                          disabled={p.busy}
                          onPress={() => {
                            if (!p.busy) p.onRemoveBlock(b.id);
                          }}
                        />
                      </div>
                    </li>
                  ))}
              </ul>
            )}
            <div className="bx-self-schedule-block-fields">
              <label htmlFor="self-block-start">
                <span>Inicio de bloqueo</span>
                <input
                  id="self-block-start"
                  type="datetime-local"
                  step={60}
                  value={p.starts.replace(' ', 'T')}
                  disabled={p.busy}
                  onChange={(e) => p.onStarts(e.target.value.replace('T', ' '))}
                />
              </label>
              <label htmlFor="self-block-end">
                <span>Fin de bloqueo</span>
                <input
                  id="self-block-end"
                  type="datetime-local"
                  step={60}
                  value={p.ends.replace(' ', 'T')}
                  disabled={p.busy}
                  onChange={(e) => p.onEnds(e.target.value.replace('T', ' '))}
                />
              </label>
              <label
                className="bx-self-schedule-reason"
                htmlFor="self-block-reason"
              >
                <span>Motivo del bloqueo (opcional)</span>
                <input
                  id="self-block-reason"
                  type="text"
                  placeholder="Escribe el motivo del bloqueo"
                  value={p.reason}
                  disabled={p.busy}
                  onChange={(e) => p.onReason(e.target.value)}
                />
              </label>
            </div>
            {p.starts && p.ends && !validBlock && (
              <p className="bx-self-schedule-invalid" role="status">
                Indica fechas válidas. El inicio del bloqueo debe ser anterior
                al final.
              </p>
            )}
            <div className="bx-self-schedule-block-footer">
              <AppButton
                label="Guardar mi bloqueo"
                disabled={p.busy || !validBlock}
                onPress={() => {
                  if (!p.busy && validBlock) p.onSaveBlock();
                }}
              />
              <AppButton
                label="Preparar otro bloqueo"
                variant="secondary"
                disabled={p.busy}
                onPress={() => {
                  if (!p.busy) p.onNewBlock();
                }}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
