import { useEffect, useState, type ReactNode } from 'react';
import type { CareSettingsParts } from './care-control';
import type { ReschedulePolicyContent } from './reschedule-control';
import { paymentsRulesStyles } from './payments-rules-web.styles';

const paths = {
  settings:
    'M10 3h4l1 3 3 1 3 3-2 2 1 4-3 3-3-1-2 3-4-1-1-3-3-1-1-4 3-2 1-4 3-1ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2Z',
  phone: 'M7 3h10v18H7ZM11 18h2',
  upload:
    'M7 18H6a4 4 0 0 1-1-8 7 7 0 0 1 13-2 5 5 0 0 1 0 10h-1m-5 3V11m-4 4 4-4 4 4',
  trash: 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15m-8 4v7m4-7v7',
  close: 'm6 6 12 12M6 18 18 6',
  qr: 'M3 3h6v6H3ZM15 3h6v6h-6ZM3 15h6v6H3Zm12 0h3v3h3v3h-6v-3m6-6v2m-9-2v2',
  card: 'M3 5h18v14H3ZM3 10h18M6 15h4',
  clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  calendar: 'M4 5h16v16H4ZM8 2v6m8-6v6M4 11h16',
  shield: 'm12 3 9 4v6c0 5-9 9-9 9s-9-4-9-9V7Zm-5 9 3 3 6-6',
  save: 'M4 3h13l4 4v14H3V3Zm3 0v6h10V3M7 21v-8h10v8',
  coins:
    'M20 6c0 2-4 3-8 3S4 8 4 6s4-3 8-3 8 1 8 3ZM4 6v5c0 2 4 3 8 3s8-1 8-3V6M4 11v5c0 2 4 3 8 3s8-1 8-3v-5',
} as const;
function Icon({ name }: { name: keyof typeof paths }) {
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
function Heading({
  icon,
  title,
  description,
}: {
  icon: keyof typeof paths;
  title: string;
  description: string;
}) {
  return (
    <div className="bx-pr-heading">
      <span className="bx-pr-icon">
        <Icon name={icon} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}
export function MinuteInput(p: {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  max?: number;
  onChange: (v: string) => void;
}) {
  return (
    <label className="bx-pr-field" htmlFor={p.id}>
      {p.label}
      <span className="bx-pr-number">
        <input
          id={p.id}
          type="number"
          min="0"
          max={p.max ?? Number.MAX_SAFE_INTEGER}
          step="1"
          inputMode="numeric"
          value={p.value}
          disabled={p.disabled}
          onChange={(e) => p.onChange(e.target.value)}
        />
        <span>minutos</span>
      </span>
    </label>
  );
}
export function ReservationRuleWeb(
  p: Parameters<typeof ReschedulePolicyContent>[0],
) {
  const n = Number(p.value),
    valid = /^\d+$/.test(p.value) && Number.isSafeInteger(n);
  return (
    <div className="bx-pr-rule-body">
      <MinuteInput
        id="reschedule-policy"
        label="Antelación mínima de reprogramación"
        value={p.checked ? p.value : ''}
        disabled={p.busy || !p.checked}
        onChange={p.onChange}
      />
      <p className="bx-pr-hint">
        Tiempo mínimo antes de la cita para solicitar un cambio de fecha u hora.
      </p>
      {p.checked && valid && (
        <p className="bx-pr-example">
          Equivale a {Math.floor(n / 60)} h {n % 60} min.
        </p>
      )}
      {!p.checked && (
        <p className="bx-pr-hint">
          {p.busy
            ? 'Cargando la regla de reprogramación…'
            : 'Consulta la regla actual para reintentar la carga.'}
        </p>
      )}
      <div className="bx-pr-rule-actions">
        <button
          type="button"
          disabled={p.busy}
          onClick={p.onRead}
          aria-label="Consultar antelación de reprogramación"
          title="Consultar antelación de reprogramación"
        >
          Actualizar regla
        </button>
        <button
          type="button"
          disabled={p.busy || !p.checked || !valid}
          onClick={p.onSave}
          aria-label="Guardar antelación de reprogramación"
        >
          Guardar reprogramación
        </button>
      </div>
      <div role="status">
        {p.saved ? 'Política de reprogramación guardada.' : ''}
      </div>
      {p.error && <p role="alert">{p.error}</p>}
    </div>
  );
}
export function PaymentsRulesWeb({
  parts,
  reservations,
}: {
  parts: CareSettingsParts;
  reservations: ReactNode;
}) {
  const e = parts.editor;
  const [editing, setEditing] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const disabled = !e.loaded || e.busy || e.locked;
  const n = Number(e.tolerance),
    valid =
      /^\d+$/.test(e.tolerance) && Number.isInteger(n) && n >= 0 && n <= 1440;
  const yape = e.loaded && !!e.configuredInstructions?.trim();
  const total = 600 + n,
    time = `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  return (
    <div className="bx-pr">
      <style>{paymentsRulesStyles}</style>
      <header className="bx-pr-title">
        <h2>Pagos y reglas</h2>
        <p>
          Configura los métodos de pago de tu barbería y establece las reglas de
          atención y reservas.
        </p>
      </header>
      <section className="bx-pr-banner">
        <Icon name="card" />
        <div>
          <h3>Configuración de pagos y políticas</h3>
          <p>
            Administra tus medios de pago y define las reglas que se aplicarán
            en tus citas.
          </p>
        </div>
        <span className="bx-pr-terminal" aria-hidden="true">
          <Icon name="card" />
        </span>
      </section>
      <div className="bx-pr-grid">
        <section className="bx-pr-card bx-pr-payments">
          <Heading
            icon="card"
            title="Configuración de pagos"
            description="Gestiona los métodos de pago disponibles en tu barbería."
          />
          <div className="bx-pr-method">
            <span className="bx-pr-icon">
              <Icon name="coins" />
            </span>
            <div>
              <h4>Efectivo</h4>
              <p>Pago directo en la barbería.</p>
            </div>
            <span className="bx-pr-badge">✓ Habilitado</span>
            <span
              className="bx-pr-switch is-on is-fixed"
              role="img"
              aria-label="Efectivo siempre disponible"
              title="El efectivo siempre está disponible"
            >
              <i />
            </span>
          </div>
          <div className="bx-pr-method">
            <span className="bx-pr-yape" aria-hidden="true">
              S/
            </span>
            <div>
              <h4>Yape</h4>
              <p>Pago al número y titular registrados.</p>
            </div>
            <span className={`bx-pr-badge ${yape ? '' : 'is-neutral'}`}>
              {!e.loaded
                ? 'Sin consultar'
                : yape
                  ? 'Habilitado'
                  : 'Deshabilitado'}
            </span>
            <button
              type="button"
              className={`bx-pr-switch ${e.instructions.trim() ? 'is-on' : ''}`}
              role="switch"
              aria-label="Habilitar Yape"
              aria-checked={!!e.instructions.trim()}
              disabled={disabled}
              onClick={() => {
                if (e.instructions.trim()) setConfirmDisable(true);
                else if (e.configuredInstructions?.trim())
                  e.onInstructions(e.configuredInstructions);
                else setEditing(true);
              }}
            >
              <i />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setEditing((v) => !v)}
              aria-expanded={editing}
              aria-controls="yape-editor"
            >
              {editing ? 'Cerrar edición' : 'Editar datos'}
            </button>
          </div>
          {confirmDisable && (
            <div
              className="bx-pr-confirm"
              role="group"
              aria-labelledby="yape-disable-title"
              aria-describedby="yape-disable-description"
            >
              <h4 id="yape-disable-title">¿Deshabilitar Yape?</h4>
              <p id="yape-disable-description">
                Se vaciarán las instrucciones del formulario. Yape se
                deshabilitará cuando guardes la configuración.
              </p>
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  e.onInstructions('');
                  setEditing(false);
                  setConfirmDisable(false);
                }}
              >
                Deshabilitar al guardar
              </button>
              <button type="button" onClick={() => setConfirmDisable(false)}>
                Conservar Yape
              </button>
            </div>
          )}
          <div className="bx-pr-payment-strip">
            <div>
              <Icon name="shield" />
              <span>
                <strong>Confirmación del pago</strong>
                <small>Manual · efectivo y Yape</small>
              </span>
            </div>
            <div>
              <Icon name="coins" />
              <span>
                <strong>Registro por cita</strong>
                <small>Atención y pago separados</small>
              </span>
            </div>
            <div className="bx-pr-read">{parts.read}</div>
          </div>
          <p className="bx-pr-hint" role="status">
            {e.dirty
              ? 'Cambios sin guardar en pagos o atención.'
              : e.loaded
                ? 'Configuración consultada. Los cambios se aplican al guardar.'
                : e.busy
                  ? 'Cargando la configuración de tu barbería…'
                  : 'No se ha cargado la configuración. Pulsa Consultar configuración para reintentar.'}
          </p>
        </section>
        <section className="bx-pr-card bx-pr-payment-rules">
          <Heading
            icon="shield"
            title="Reglas de pago"
            description="Cómo se registran los pagos de tus citas."
          />
          <div className="bx-pr-info">
            <Icon name="card" />
            <div>
              <h4>Confirmación manual</h4>
              <p>
                Efectivo y Yape se registran como recibidos cuando el personal
                autorizado confirma el pago.
              </p>
            </div>
          </div>
          <div className="bx-pr-info">
            <Icon name="clock" />
            <div>
              <h4>Método y estado son distintos</h4>
              <p>
                Elegir Yape o efectivo no significa que el pago ya se haya
                recibido.
              </p>
            </div>
          </div>
          <div className="bx-pr-info">
            <Icon name="shield" />
            <div>
              <h4>Devoluciones autorizadas</h4>
              <p>
                Los reembolsos se registran desde la atención de cada cita,
                según los permisos disponibles.
              </p>
            </div>
          </div>
        </section>
        {editing && e.loaded && (
          <div className="bx-yape-region">
            <YapeEditor
              editor={e}
              validTolerance={valid}
              feedback={parts.feedback}
              onClose={() => setEditing(false)}
            />
          </div>
        )}
        <section className="bx-pr-card bx-pr-attendance">
          <Heading
            icon="clock"
            title="Reglas de atención"
            description="Define la tolerancia antes de registrar una inasistencia."
          />
          <MinuteInput
            id="no-show-tolerance"
            label="Tolerancia de inasistencia"
            max={1440}
            value={e.loaded ? e.tolerance : ''}
            disabled={disabled}
            onChange={e.onTolerance}
          />
          <p className="bx-pr-hint">
            Tiempo de espera después de la hora programada antes de poder
            registrar una inasistencia. Entre 0 y 1440 minutos.
          </p>
          {e.loaded && valid && (
            <details className="bx-pr-example-details">
              <summary>Ver ejemplo de tolerancia</summary>
              <p className="bx-pr-example">
                Ejemplo: para una cita a las 10:00, podrás registrar la
                inasistencia desde las {time}
                {n >= 840 ? ' del día siguiente' : ''}, si las demás condiciones
                lo permiten.
              </p>
            </details>
          )}
          {e.loaded && !valid && (
            <p role="alert">Introduce minutos enteros entre 0 y 1440.</p>
          )}
        </section>
        <section className="bx-pr-card bx-pr-reservations">
          <Heading
            icon="calendar"
            title="Reglas de reservas"
            description="Configura el tiempo mínimo para solicitar una reprogramación."
          />
          {reservations}
        </section>
      </div>
      <footer className="bx-pr-footer">
        <p>
          Este guardado actualiza Yape y la tolerancia de inasistencia. La
          reprogramación se guarda por separado en su tarjeta.
        </p>
        <button
          type="button"
          className="bx-pr-save"
          disabled={
            e.busy ||
            !e.loaded ||
            (!e.locked && (!valid || e.instructions.length > 2000))
          }
          onClick={() => e.onSave()}
        >
          <Icon name="save" />
          {e.locked
            ? 'Reintentar guardado pendiente'
            : 'Guardar configuración de mi barbería'}
        </button>
        {(!editing || !e.loaded) && <div role="status">{parts.feedback}</div>}
      </footer>
    </div>
  );
}
function YapeEditor({
  editor,
  validTolerance,
  feedback,
  onClose,
}: {
  editor: CareSettingsParts['editor'];
  validTolerance: boolean;
  feedback: ReactNode;
  onClose: () => void;
}) {
  const saved =
    /^Titular de Yape: ([^\n]+)\nNúmero de Yape: (9\d{8})(?:\n\n([\s\S]*))?$/.exec(
      editor.instructions,
    );
  const [holder, setHolder] = useState(saved?.[1] ?? '');
  const [phone, setPhone] = useState(saved?.[2] ?? '');
  const [notes] = useState(saved ? (saved[3] ?? '') : editor.instructions);
  const [qr, setQr] = useState<string | null>(null);
  const [fileError, setFileError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const number = phone.replace(/\s/g, '');
  const validPhone = /^9\d{8}$/.test(number);
  const instructions = [
    `Titular de Yape: ${holder.trim()}\nNúmero de Yape: ${number}`,
    notes.trim(),
  ]
    .filter(Boolean)
    .join('\n\n');
  const disabled = editor.busy || editor.locked;
  const phoneError = (submitted || phone.length > 0) && !validPhone;
  useEffect(() => {
    if (qr) return () => URL.revokeObjectURL(qr);
  }, [qr]);

  function selectFile(file: File | undefined) {
    if (!file || disabled) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFileError('Selecciona una imagen JPG, PNG o WEBP.');
      return;
    }
    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setFileError('Selecciona una imagen de hasta 5 MB.');
      return;
    }
    setFileError('');
    setQr(URL.createObjectURL(file));
  }

  return (
    <form
      id="yape-editor"
      className="bx-pr-card bx-yape-editor"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (editor.locked || editor.busy) return;
        setSubmitted(true);
        if (
          holder.trim() &&
          validPhone &&
          validTolerance &&
          instructions.length <= 2000
        ) {
          editor.onSave(instructions);
        }
      }}
    >
      <section className="bx-yape-fields">
        <Heading
          icon="settings"
          title="Datos de tu Yape"
          description="Configura la cuenta en la que recibirás los pagos."
        />
        <label className="bx-yape-field">
          Nombre del Yape (titular)
          <span>
            <Icon name="user" />
            <input
              required
              value={holder}
              placeholder="Nombre del titular"
              disabled={disabled}
              aria-invalid={submitted && !holder.trim()}
              onChange={(event) => setHolder(event.target.value)}
            />
          </span>
        </label>
        {submitted && !holder.trim() && (
          <p className="bx-yape-error" role="alert">
            Ingresa el nombre del titular.
          </p>
        )}
        <label className="bx-yape-field">
          Número de Yape
          <span>
            <Icon name="phone" />
            <input
              required
              type="tel"
              value={phone}
              placeholder="Ingresa tu número de Yape"
              disabled={disabled}
              aria-invalid={phoneError}
              aria-describedby="yape-phone-help"
              onChange={(event) => setPhone(event.target.value)}
            />
          </span>
        </label>
        <p
          id="yape-phone-help"
          className={phoneError ? 'bx-yape-error' : 'bx-pr-hint'}
        >
          {phoneError
            ? 'Ingresa un celular peruano de 9 dígitos que empiece con 9.'
            : 'Celular asociado a la cuenta de Yape.'}
        </p>
        <h4>Código QR de Yape</h4>
        <div className="bx-yape-upload-row">
          <label
            className="bx-yape-upload"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              selectFile(event.dataTransfer.files[0]);
            }}
          >
            <Icon name="upload" />
            <strong>Sube el código QR de tu Yape</strong>
            <small>JPG, PNG o WEBP · Máx. 5 MB</small>
            <span>{qr ? 'Reemplazar archivo' : 'Seleccionar archivo'}</span>
            <input
              type="file"
              aria-label={
                qr ? 'Reemplazar archivo QR' : 'Seleccionar archivo QR'
              }
              accept="image/jpeg,image/png,image/webp"
              disabled={disabled}
              onChange={(event) => {
                selectFile(event.currentTarget.files?.[0]);
                event.currentTarget.value = '';
              }}
            />
          </label>
          {qr && (
            <div className="bx-yape-uploaded">
              <img
                src={qr}
                alt="Código QR seleccionado"
                onError={() => {
                  setQr(null);
                  setFileError(
                    'No se pudo leer la imagen. Selecciona otro archivo.',
                  );
                }}
              />
              <button
                type="button"
                disabled={disabled}
                aria-label="Retirar código QR"
                onClick={() => {
                  setQr(null);
                  setFileError('');
                }}
              >
                <Icon name="trash" />
              </button>
            </div>
          )}
        </div>
        {fileError && (
          <p className="bx-yape-error" role="alert">
            {fileError}
          </p>
        )}
        <p className="bx-pr-hint">
          El QR solo se muestra en esta vista previa. Todavía no se puede
          guardar.
        </p>
        {instructions.length > 2000 && (
          <p className="bx-yape-error" role="alert">
            Reduce las instrucciones a un máximo de 2000 caracteres, incluido el
            titular y el número.
          </p>
        )}
        {!validTolerance && (
          <p className="bx-yape-error" role="alert">
            Corrige la tolerancia de inasistencia para guardar.
          </p>
        )}
        {!editor.configuredInstructions?.trim() && (
          <p className="bx-pr-hint">
            Al guardar el titular y el número, Yape quedará habilitado.
          </p>
        )}
        <div className="bx-yape-actions">
          <button
            type="submit"
            className="bx-pr-save"
            disabled={disabled || !validTolerance}
          >
            <Icon name="save" />
            Guardar cambios
          </button>
          <button type="button" disabled={editor.busy} onClick={onClose}>
            <Icon name="close" />
            Cancelar
          </button>
        </div>
        <div role="status">{feedback}</div>
      </section>
      <section
        className="bx-yape-preview"
        aria-label="Vista previa para tus clientes"
      >
        <Heading
          icon="eye"
          title="Vista previa para tus clientes"
          description="Así se presentarían los datos de pago."
        />
        <div className="bx-yape-payment">
          <div className="bx-yape-brand">
            <span>S/</span> yape
          </div>
          <div className="bx-yape-payment-body">
            <h4>Paga con Yape</h4>
            <p>
              {qr
                ? 'Usa el número de Yape o escanea el código QR.'
                : 'Realiza tu pago al siguiente número.'}
            </p>
            <dl>
              <div>
                <Icon name="user" />
                <dt>Titular</dt>
                <dd>{holder.trim() || 'Sin registrar'}</dd>
              </div>
              <div>
                <Icon name="phone" />
                <dt>Número de Yape</dt>
                <dd>
                  {validPhone
                    ? number.match(/.{3}/g)?.join(' ')
                    : 'Sin registrar'}
                </dd>
              </div>
            </dl>
            {qr ? (
              <img
                className="bx-yape-qr"
                src={qr}
                alt="Vista previa del código QR de Yape"
              />
            ) : (
              <div className="bx-yape-qr-empty">
                <Icon name="qr" />
                Código QR no registrado
              </div>
            )}
            <p className="bx-yape-reminder">
              Verifica el destinatario antes de pagar. La recepción se confirma
              manualmente.
            </p>
          </div>
        </div>
      </section>
    </form>
  );
}
