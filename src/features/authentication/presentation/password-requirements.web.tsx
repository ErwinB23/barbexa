import { passwordRequirementItems } from './password-requirement-items';

export function PasswordRequirements({
  password,
  id,
  checksOnly = false,
}: {
  password: string;
  id: string;
  checksOnly?: boolean;
}) {
  return (
    <div id={id} style={{ color: 'var(--muted)', fontSize: 14 }}>
      <ul
        role="list"
        aria-label="Requisitos de contraseña"
        style={{ listStyle: 'none', padding: 0, margin: 0 }}
      >
        {passwordRequirementItems(password).map(({ key, label, met }) => (
          <li
            key={key}
            aria-label={
              checksOnly
                ? `${label}. ${met ? 'Cumplido' : 'Pendiente'}`
                : undefined
            }
          >
            <span
              aria-hidden="true"
              style={
                checksOnly
                  ? { display: 'inline-block', width: '1em' }
                  : undefined
              }
            >
              {met ? '✓' : checksOnly ? '' : '○'}{' '}
            </span>
            {label}
            {!checksOnly && (met ? ' · Cumplido' : ' · Pendiente')}
          </li>
        ))}
      </ul>
      <p style={{ margin: '3px 0 0' }}>Recomendamos 12 caracteres o más.</p>
    </div>
  );
}
