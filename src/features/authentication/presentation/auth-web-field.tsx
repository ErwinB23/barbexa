import { useState } from 'react';
import { LoginIcon } from './login-icons.web';

export function AuthWebField({
  id,
  label,
  icon,
  value,
  change,
  busy,
  type = 'text',
  autoComplete,
  required = true,
  descriptionId,
}: {
  id: string;
  label: string;
  icon: 'user' | 'mail' | 'phone' | 'lock';
  value: string;
  change: (value: string) => void;
  busy: boolean;
  type?: 'text' | 'email' | 'tel' | 'password';
  autoComplete: string;
  required?: boolean;
  descriptionId?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="ab-login__field">
      <div className="ab-login__input-shell ab-login__floating-field">
        <LoginIcon name={icon} />
        <input
          id={id}
          name={id.replace('sign-up-', '')}
          type={visible ? 'text' : type}
          value={value}
          onChange={(event) => change(event.target.value)}
          placeholder=" "
          autoComplete={autoComplete}
          autoCapitalize={type === 'text' ? undefined : 'none'}
          spellCheck={type === 'text'}
          required={required}
          disabled={busy}
          aria-describedby={descriptionId}
        />
        <label htmlFor={id}>{label}</label>
        {type === 'password' && (
          <button
            type="button"
            className="ab-login__eye"
            aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`}
            aria-pressed={visible}
            aria-controls={id}
            disabled={busy}
            onClick={() => setVisible((current) => !current)}
          >
            <LoginIcon name={visible ? 'eye-off' : 'eye'} />
          </button>
        )}
      </div>
    </div>
  );
}
