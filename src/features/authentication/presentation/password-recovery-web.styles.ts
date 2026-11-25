export const recoveryWebStyles = `
.ab-recovery .ab-login__card {
  --recovery-text-size: clamp(16px, 1.15vw, 19px);
  max-width: 510px;
  min-height: min(720px, calc(100svh - 104px));
  padding: 28px clamp(24px, 2.4vw, 40px) 38px;
  border-radius: 29px;
}
.ab-recovery .ab-login__brand { margin-bottom: 40px; }
.ab-recovery .ab-login__emblem { width: 162px; height: 80px; }
.ab-recovery .ab-login__brand span { font-size: clamp(30px, 2.4vw, 38px); }
.ab-recovery .ab-login__brand:after { height: 3px; margin-top: 14px; }
.ab-recovery .ab-login__card h1 { font-size: clamp(28px, 2.4vw, 39px); letter-spacing: -0.65px; }
.ab-recovery .ab-login__subtitle { font-size: var(--recovery-text-size); margin: 8px 0 8px; }
.ab-recovery .ab-login__form { gap: 10px; }
.ab-recovery__request-form { margin-top: 18px; }
.ab-recovery .ab-login__field { padding-top: 29px; }
.ab-recovery .ab-login__input-shell { min-height: 59px; padding-left: 16px; border-width: 1px; border-radius: 12px; }
.ab-recovery .ab-login__input-shell input { font-size: var(--recovery-text-size); padding: 10px 16px; }
.ab-recovery .ab-login__input-shell svg { width: 22px; height: 22px; flex-shrink: 0; color: var(--bronze); }
.ab-recovery .ab-login__floating-field label { left: 54px; font-size: var(--recovery-text-size); }
.ab-recovery .ab-login__floating-field:focus-within label,
.ab-recovery .ab-login__floating-field input:not(:placeholder-shown) ~ label {
  left: -1px;
  top: -16px;
  max-width: 100%;
  font-size: calc(var(--recovery-text-size) + 1px);
}
.ab-recovery .ab-login__primary {
  min-height: 59px;
  margin-top: 27px;
  gap: 12px;
  font-size: clamp(18px, 1.4vw, 23px) !important;
  border-radius: 12px;
}
.ab-recovery__footer {
  border-top: 1px solid #e4ded4;
  margin-top: 35px;
  padding-top: 15px;
  display: flex;
  justify-content: center;
}
.ab-recovery__link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 0;
  font: inherit;
  font-weight: 600;
  font-size: var(--recovery-text-size);
  color: var(--bronze);
  border: 0;
  background: transparent;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-align: center;
}
.ab-recovery__back svg { width: 22px; height: 22px; flex-shrink: 0; transform: rotate(180deg); }
.ab-recovery__hint { color: var(--muted); font-size: var(--recovery-text-size); margin: 14px 0 0; }
.ab-recovery .ab-login__message { margin: 12px 0 0; }
.ab-recovery .ab-login__loading { margin-top: 8px; }
@media (min-width: 1500px) {
  .ab-login.ab-recovery { grid-template-columns: minmax(0, 1fr) 510px; padding-inline: max(48px, calc((100vw - 1290px) / 2)); }
}
@media (max-width: 800px) {
  .ab-recovery .ab-login__card { min-height: 0; padding: 24px clamp(18px, 5vw, 34px) 28px; }
  .ab-recovery .ab-login__brand { margin-bottom: 25px; }
  .ab-recovery .ab-login__emblem { width: 140px; height: 69px; }
  .ab-recovery__footer { margin-top: 25px; }
}
`;
