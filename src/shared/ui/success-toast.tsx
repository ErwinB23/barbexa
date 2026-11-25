import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const styles = `
.bx-success-toast { position:fixed; z-index:1000; top:20px; right:24px; width:350px; max-width:calc(100vw - 32px); display:flex; align-items:flex-start; gap:12px; padding:16px; border:1px solid #cbdcba; border-radius:15px; background:#f2f8eb; color:#294c25; box-shadow:0 8px 26px #23321b1f; font-family:Outfit,system-ui,sans-serif; box-sizing:border-box; }
.bx-success-toast-icon { flex:none; display:grid; place-items:center; width:34px; height:34px; border-radius:50%; background:#dcebcf; }
.bx-success-toast-icon svg { width:21px; height:21px; }
.bx-success-toast-copy { flex:1; min-width:0; line-height:1.4; }
.bx-success-toast-copy strong { display:block; font-size:14px; font-weight:650; }
.bx-success-toast-copy p { margin:4px 0 0; font-size:12px; color:#4f6245; overflow-wrap:anywhere; }
.bx-success-toast button { flex:none; display:grid; place-items:center; width:32px; height:32px; margin:-4px -4px 0 0; padding:0; border:0; border-radius:8px; background:transparent; color:#4b5c40; cursor:pointer; }
.bx-success-toast button:hover { background:#e2ecd9; }
.bx-success-toast button:focus-visible { outline:2px solid #805421; outline-offset:2px; }
.bx-success-toast button svg { width:16px; height:16px; }
.bx-success-toast--warning { background:#fff4db; border-color:#e8ca87; color:#805712; }
.bx-success-toast--warning .bx-success-toast-icon { background:#f9e2ac; }
.bx-success-toast--warning .bx-success-toast-copy p,.bx-success-toast--warning button { color:#806331; }
.bx-success-toast--warning button:hover { background:#f7e5be; }
@media(max-width:600px) { .bx-success-toast { top:12px; right:16px; } }
`;
export function SuccessToast({
  message,
  tone = 'success',
  description = 'La operación se completó correctamente.',
}: {
  message: string;
  tone?: 'success' | 'warning';
  description?: string;
}) {
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hovered = useRef(false),
    focused = useRef(false);
  const stop = () => clearTimeout(timer.current);
  const resume = () => {
    stop();
    if (!hovered.current && !focused.current)
      timer.current = setTimeout(() => setVisible(false), 5000);
  };
  useEffect(() => {
    timer.current = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer.current);
  }, []);
  if (!visible) return null;
  const toast = (
    <div
      className={`bx-success-toast${tone === 'warning' ? ' bx-success-toast--warning' : ''}`}
      onMouseEnter={() => {
        hovered.current = true;
        stop();
      }}
      onMouseLeave={() => {
        hovered.current = false;
        resume();
      }}
      onFocusCapture={() => {
        focused.current = true;
        stop();
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          focused.current = false;
          resume();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          stop();
          setVisible(false);
        }
      }}
    >
      <style>{styles}</style>
      <span className="bx-success-toast-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          {tone === 'warning' ? (
            <path d="M12 7v6m0 4h.01" />
          ) : (
            <path d="m8 12 3 3 5-6" />
          )}
        </svg>
      </span>
      <div
        className="bx-success-toast-copy"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <strong>{message}</strong>
        <p>{description}</p>
      </div>
      <button
        type="button"
        aria-label="Cerrar notificación"
        onClick={() => {
          stop();
          setVisible(false);
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
  return typeof document === 'undefined'
    ? toast
    : createPortal(toast, document.body);
}
