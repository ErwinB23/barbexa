import { loginWebStyles } from './sign-in-web.styles';

// Reuse the approved Login's actual desktop dimensions, scoped to the other Auth
// variants only. The marker is guarded by the sizing regression tests.
const reference = loginWebStyles.slice(
  loginWebStyles.indexOf(
    '@media (min-width: 1021px)',
    loginWebStyles.indexOf('/* Login-only reference dimensions'),
  ),
);
export const authReferenceStyles =
  reference.replaceAll(
    '.ab-login:not(.ab-signup):not(.ab-recovery)',
    '.ab-login:is(.ab-signup,.ab-recovery)',
  ) +
  `
.ab-login.ab-signup .ab-login__card h1 { font-size: clamp(24px, 1.7vw, 28px); }
@media (min-width: 1021px) {
  .ab-login.ab-signup .ab-login__card { min-height: 0; padding-block: 12px; }
  .ab-login.ab-signup .ab-login__brand { margin-bottom: 8px; }
  .ab-login.ab-signup .ab-login__brand:after { margin-top: 6px; }
  .ab-login.ab-signup .ab-login__subtitle { margin-bottom: 6px; }
  .ab-login.ab-signup .ab-login__divider { margin: 6px 0 2px; }
  .ab-login.ab-signup .ab-login__form { gap: 4px; }
  .ab-login.ab-signup .ab-login__field { padding-top: 24px; }
  .ab-login.ab-signup .ab-login__field + .ab-login__field,
  .ab-login.ab-signup #signup-password-requirements + .ab-login__field { margin-top: 6px; }
  .ab-login.ab-signup .ab-login__eye { min-height: 40px; width: 40px; }
  .ab-login.ab-signup .ab-login__google-button { min-height: 44px; padding-block: 8px; }
  .ab-login.ab-signup .ab-login__primary { min-height: 48px; margin-top: 2px; }
  .ab-login.ab-signup .ab-login__signup { margin-top: 8px; }
  .ab-login.ab-signup .ab-signup__home { min-height: 32px; margin-top: 0; font-size: 16px; }
  .ab-login.ab-signup #signup-password-requirements { line-height: 1.2; }
  .ab-login.ab-signup #signup-password-requirements p { margin-top: 2px !important; }
  .ab-login.ab-signup #signup-password-requirements ul { display: grid; grid-template-columns: 1fr 1fr; column-gap: 12px; }
  .ab-login.ab-signup #signup-password-requirements li:last-child { grid-column: 1 / -1; }
  .ab-login.ab-recovery .ab-login__card { min-height: min(576px, calc(100svh - 83.2px)); }
  .ab-login.ab-recovery .ab-recovery__link { font-size: 16px; gap: 10px; }
  .ab-login.ab-recovery .ab-recovery__hint { font-size: 16px; }
}
`;
