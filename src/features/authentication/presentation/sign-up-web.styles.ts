export const signUpWebStyles = `
.ab-signup-scroll {
  height: 100vh;
  height: 100svh;
  overflow-y: auto;
}
.ab-login.ab-signup {
  height: auto;
  min-height: 100vh;
  min-height: 100svh;
  overflow: visible;
  padding-block: clamp(16px, 2.5svh, 32px);
}
.ab-signup .ab-login__card {
  --signup-field-text: clamp(16px, 1.05vw, 17px);
  --signup-field-inset: 14px;
  min-height: 0;
  max-width: 560px;
  padding: 18px clamp(28px, 2.65vw, 44px) 20px;
  align-self: center;
  border-radius: 30px;
}
.ab-signup .ab-login__brand { margin-bottom: 16px; }
.ab-signup .ab-login__emblem { width: 128px; height: 59px; }
.ab-signup .ab-login__brand span { font-size: clamp(28px, 2vw, 32px); }
.ab-signup .ab-login__brand:after { width: 41px; height: 3px; margin-top: 10px; }
.ab-signup .ab-login__card h1 { font-size: clamp(30px, 2.4vw, 40px); letter-spacing: -0.8px; }
.ab-signup .ab-login__subtitle { font-size: var(--signup-field-text); line-height: 1.4; margin: 3px 0 13px; }
.ab-signup .ab-login__divider { font-size: clamp(14px, 1.05vw, 17px); margin: 12px 0 2px; gap: 16px; }
.ab-signup .ab-login__form { gap: 5px; }
.ab-signup .ab-login__field { padding-top: 28px; }
.ab-signup .ab-login__field + .ab-login__field,
.ab-signup #signup-password-requirements + .ab-login__field { margin-top: 12px; }
.ab-signup .ab-login__input-shell {
  min-height: 46px;
  padding-left: var(--signup-field-inset);
  border-width: 1px;
  border-radius: 12px;
}
.ab-signup .ab-login__input-shell input {
  font-size: var(--signup-field-text);
  padding: 7px var(--signup-field-inset);
}
.ab-signup .ab-login__input-shell svg { width: 22px; height: 22px; flex-shrink: 0; }
.ab-signup .ab-login__floating-field label {
  left: calc(22px + 2 * var(--signup-field-inset));
  font-size: var(--signup-field-text);
}
.ab-signup .ab-login__floating-field:focus-within label,
.ab-signup .ab-login__floating-field input:not(:placeholder-shown) ~ label {
  top: -16px;
  left: -1px;
  max-width: 100%;
  font-size: calc(var(--signup-field-text) + 2px);
}
.ab-signup .ab-login__eye { min-height: 44px; width: 46px; }
.ab-signup .ab-login__primary,
.ab-signup .ab-login__google-button { min-height: 46px; border-radius: 12px; font-size: clamp(17px, 1.2vw, 19px) !important; padding: 8px 12px; gap: 10px; }
.ab-signup .ab-login__google-button { border-width: 1px; }
.ab-signup .ab-login__google-button svg { width: 24px; height: 24px; }
.ab-signup .ab-login__primary { margin-top: 8px; font-size: clamp(18px, 1.25vw, 20px) !important; }
.ab-signup .ab-login__signup { font-size: var(--signup-field-text); margin: 14px 0 0; }
.ab-signup .ab-login__signup a { font-weight: 700; }
.ab-signup .ab-signup__home { align-self: center; display: grid; place-items: center; min-height: 44px; margin-top: 2px; color: var(--ink); font-size: var(--signup-field-text); font-weight: 500; text-align: center; text-decoration: none; }
.ab-signup .ab-signup__home:hover { text-decoration: underline; }
.ab-signup .ab-login__message { margin: 0; }
#signup-password-requirements { line-height: 1.3; }
@media (min-width: 1100px) {
  #signup-password-requirements ul { display: grid; grid-template-columns: 1fr 1fr; column-gap: 12px; }
  #signup-password-requirements li:last-child { grid-column: 1 / -1; }
}
@media (min-width: 1500px) {
  .ab-login.ab-signup { grid-template-columns: minmax(0, 1fr) 560px; padding-inline: max(48px, calc((100vw - 1290px) / 2)); }
}
@media (min-width: 1100px) and (max-height: 980px) {
  .ab-login.ab-signup { padding-block: 12px; }
  .ab-signup .ab-login__card { padding-block: 12px; }
  .ab-signup .ab-login__brand { margin-bottom: 7px; }
  .ab-signup .ab-login__emblem { width: 100px; height: 43px; }
  .ab-signup .ab-login__brand:after { margin-top: 4px; }
  .ab-signup .ab-login__subtitle { margin-bottom: 9px; }
  .ab-signup .ab-login__divider { margin-top: 4px; }
  .ab-signup .ab-login__field { padding-top: 24px; }
  .ab-signup .ab-login__floating-field:focus-within label,
  .ab-signup .ab-login__floating-field input:not(:placeholder-shown) ~ label { top: -14px; font-size: 15px; }
  .ab-signup .ab-login__primary { margin-top: 2px; }
  .ab-signup .ab-login__signup { margin-top: 2px; }
  .ab-signup .ab-login__card { padding-bottom: 9px; }
}
@media (max-width: 800px) {
  .ab-signup .ab-login__card { padding-inline: clamp(18px, 5vw, 34px); }
}
@media (max-width: 420px) {
  .ab-signup .ab-login__card { --signup-field-inset: 12px; border-radius: 24px; }
  .ab-signup .ab-login__divider { gap: 10px; }
}
`;
