import { useState } from 'react';
import type { CareView } from '../domain/care';
import { clientYapePaymentStyles } from './client-yape-payment.web.styles';

export function ClientYapePayment({
  view,
  cancelled,
  report,
}: {
  view: CareView;
  cancelled: boolean;
  report: { busy: boolean; onSubmit: (code: string) => void };
}) {
  const [copyMessage, setCopyMessage] = useState('');
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  if (view.payment?.method !== 'yape') return null;
  const instructions = view.yapeInstructions ?? '';
  const match =
    /^Titular de Yape: ([^\n]+)\nNúmero de Yape: (9\d{8})(?:\n\n([\s\S]*))?$/.exec(
      instructions,
    );
  const holder = match?.[1];
  const phone = match?.[2];
  const notes = match ? match[3] : instructions;
  const pending =
    !cancelled &&
    view.attendance !== 'cancelled' &&
    view.payment.status === 'pending';
  async function copyPhone() {
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(phone);
      setCopyMessage('Número copiado.');
    } catch {
      setCopyMessage('Selecciona el número para copiarlo.');
    }
  }
  return (
    <section className="bx-client-yape" aria-label="Pago con Yape">
      <style>{clientYapePaymentStyles}</style>
      <header className="bx-client-yape-brand">
        <span>S/</span>
        <strong>yape</strong>
      </header>
      <div className="bx-client-yape-body">
        <h3>{pending ? 'Paga con Yape' : 'Tu pago con Yape'}</h3>
        <p>
          {pending
            ? 'Realiza el pago al número registrado por la barbería.'
            : 'Consulta los datos y el estado de tu pago.'}
        </p>
        <div className="bx-client-yape-total">
          <span>Importe de la cita</span>
          <strong>
            {new Intl.NumberFormat('es-PE', {
              style: 'currency',
              currency: 'PEN',
            }).format(view.payment.amountMinor / 100)}
          </strong>
        </div>
        <dl>
          <div>
            <dt>Titular</dt>
            <dd>{holder || 'Consulta las instrucciones de la barbería'}</dd>
          </div>
          <div>
            <dt>Número de Yape</dt>
            <dd>
              {phone
                ? phone.match(/.{3}/g)?.join(' ')
                : 'Consulta las instrucciones de la barbería'}
            </dd>
            {phone && (
              <button
                type="button"
                onClick={() => void copyPhone()}
                aria-label="Copiar número de Yape"
              >
                Copiar
              </button>
            )}
          </div>
        </dl>
        <div role="status" className="bx-client-yape-copy">
          {copyMessage}
        </div>
        <div className="bx-client-yape-qr">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M3 3h6v6H3ZM15 3h6v6h-6ZM3 15h6v6H3Zm12 0h3v3h3v3h-6v-3m6-6v2m-9-2v2" />
          </svg>
          <span>Código QR todavía no disponible</span>
          {pending && phone && (
            <small>Puedes pagar usando el número de Yape.</small>
          )}
        </div>
        {notes && (
          <div className="bx-client-yape-instructions">
            <h4>Instrucciones de la barbería</h4>
            <p>{notes}</p>
          </div>
        )}
        {pending && !view.yapeReport && (
          <form
            className="bx-client-yape-report"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
              if (
                /^[0-9]{3}$/.test(code) &&
                view.canReportYape === true &&
                !report.busy
              )
                report.onSubmit(code);
            }}
          >
            <label>
              Código de seguridad del yapeo
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={3}
                placeholder="3 dígitos"
                value={code}
                disabled={report.busy || view.canReportYape !== true}
                aria-invalid={submitted && !/^[0-9]{3}$/.test(code)}
                onChange={(event) => setCode(event.target.value)}
              />
            </label>
            {submitted && !/^[0-9]{3}$/.test(code) && (
              <p role="alert">Ingresa los 3 dígitos del código de tu yapeo.</p>
            )}
            <small>
              Después de transferir, envía el código para que la barbería revise
              el pago.
            </small>
            <button
              type="submit"
              disabled={report.busy || view.canReportYape !== true}
            >
              {report.busy ? 'Procesando…' : 'Confirmar pago'}
            </button>
            {view.canReportYape === undefined && (
              <p role="status">
                El envío del código está pendiente de activación. Contacta con
                la barbería para verificar tu pago.
              </p>
            )}
          </form>
        )}
        {!instructions.trim() && (
          <p className="bx-client-yape-notice">
            Contacta con la barbería para consultar sus datos de pago.
          </p>
        )}
        <p className="bx-client-yape-notice">
          {pending
            ? 'Verifica el titular antes de pagar. La barbería confirmará manualmente la recepción.'
            : cancelled || view.attendance === 'cancelled'
              ? 'Esta cita está cancelada. Contacta con la barbería antes de realizar una transferencia.'
              : view.payment.status === 'paid'
                ? 'La barbería confirmó la recepción del pago.'
                : 'La barbería registró el reembolso del pago.'}
        </p>
      </div>
    </section>
  );
}
