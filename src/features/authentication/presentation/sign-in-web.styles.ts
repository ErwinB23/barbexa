// Scoped to the approved Web login. The generated photograph is served locally.
export const loginWebStyles = `
@font-face {
  font-family: "Outfit";
  src: url("/fonts/outfit/Outfit-Variable.ttf") format("truetype");
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}
.ab-login {
  --ivory: #f8f5ef;
  --ink: #171715;
  --bronze: #966019;
  --muted: #605e5b;
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
  height: 100vh;
  height: 100svh;
  min-height: 0;
  overflow-y: auto;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.26fr) minmax(440px, 1fr);
  gap: clamp(28px, 4vw, 64px);
  padding: clamp(24px, 3.4vw, 52px);
  padding-right: clamp(24px, 2vw, 40px);
  background: #292827;
  color: var(--ink);
  font-family: Arial, "Helvetica Neue", sans-serif;
  line-height: 1.4;
}
.ab-login__photograph {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  user-select: none;
}
.ab-login:before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(90deg, #0003, #0000 56%, #0001);
}
.ab-login * {
  box-sizing: border-box;
}
.ab-login button,
.ab-login input {
  font: inherit;
}
.ab-login button,
.ab-login a {
  -webkit-tap-highlight-color: transparent;
}
.ab-login svg {
  display: block;
  flex-shrink: 0;
  width: 25px;
  height: 25px;
}
.ab-login a {
  color: var(--bronze);
  text-underline-offset: 3px;
}
.ab-login button:focus-visible,
.ab-login a:focus-visible {
  outline: 3px solid #b07c32;
  outline-offset: 5px;
}
.ab-login button {
  cursor: pointer;
}
.ab-login button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.ab-login__story {
  color: #e8dfcf;
  text-shadow: 0 1px 3px #0006;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: clamp(79px, calc(8vh + 9px), 119px) clamp(8px, 2.3vw, 34px) 32px;
  min-width: 0;
}
.ab-login__scissors {
  display: flex;
  align-items: center;
  width: 140px;
  height: 70px !important;
  margin: 0 0 12px 64px;
  color: #d5c7af;
}
.ab-login__scissors svg {
  width: 82px;
  height: 82px;
}
.ab-login__scissors:before,
.ab-login__scissors:after {
  content: "";
  flex: 1;
  height: 1px;
  background: currentColor;
  transform: translateY(12px);
}
.ab-login__story h2 {
  font:
    700 clamp(40px, 4.15vw, 66px)/1.12 Georgia,
    "Times New Roman",
    serif;
  margin: 0 0 28px;
  letter-spacing: -1.8px;
}
.ab-login__rule {
  display: block;
  width: 49px;
  height: 3px;
  background: #d7c5a4;
  margin-bottom: 18px;
}
.ab-login__tagline {
  font:
    400 clamp(24px, 2.15vw, 34px)/1.3 Georgia,
    "Times New Roman",
    serif;
  margin: 0 0 24px;
}
.ab-login__rule--gold {
  width: 86px;
  height: 4px;
  background: #b1843e;
  margin-bottom: 22px;
}
.ab-login__description {
  font-size: clamp(18px, 1.55vw, 23px);
  line-height: 1.45;
  max-width: 350px;
  margin: 0;
}
.ab-login__benefits {
  list-style: none;
  padding: 0;
  margin: clamp(70px, 12vh, 130px) 0 0;
  display: grid;
  gap: 28px;
}
.ab-login__benefits li {
  display: flex;
  align-items: center;
  gap: 32px;
  font-size: 18px;
  line-height: 1.4;
}
.ab-login__benefits svg {
  width: 48px;
  height: 48px;
  color: #be9149;
}
.ab-login__benefits span {
  max-width: 175px;
}
.ab-login__card {
  font-family: "Outfit", Arial, sans-serif;
  font-weight: 400;
  width: 100%;
  max-width: 610px;
  align-self: start;
  margin-block: 0;
  justify-self: end;
  min-width: 0;
  min-height: min(980px, calc(100svh - 104px));
  padding: 32px clamp(28px, 2.76vw, 40px) 32px clamp(28px, 3.6vw, 52px);
  border: 1px solid #e5dfd4;
  border-radius: 32px;
  background: linear-gradient(125deg, #faf8f3, #f4f1eb);
  box-shadow: 0 20px 58px #0005;
  display: flex;
  flex-direction: column;
}
.ab-login__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none !important;
  color: #10100f !important;
  align-self: center;
  max-width: 100%;
  margin: 0 0 44px;
}
.ab-login .ab-login__emblem {
  width: 196px;
  height: 100px;
}
.ab-login__brand span {
  font:
    700 clamp(32px, 2.76vw, 42px)/1.15 Georgia,
    "Times New Roman",
    serif;
  letter-spacing: -1.4px;
  text-align: center;
}
.ab-login__brand:after {
  content: "";
  display: block;
  width: 50px;
  height: 4px;
  background: #a77b35;
  margin-top: 11px;
}
.ab-login__card h1 {
  margin: 0 0 2px;
  font-size: clamp(28px, 3.04vw, 44px);
  line-height: 1.16;
  letter-spacing: -1.35px;
  font-weight: 800;
}
.ab-login__subtitle {
  font-size: clamp(16px, 1.4vw, 20px);
  line-height: 1.5;
  color: var(--muted);
  margin: 2px 0 29px;
}
.ab-login__form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.ab-login__field {
  padding-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.ab-login__field label {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}
.ab-login__input-shell {
  display: flex;
  align-items: center;
  min-width: 0;
  min-height: 54px;
  border: 2px solid #d4d2d0;
  border-radius: 14px;
  background: #faf9f7;
  color: #636260;
  overflow: hidden;
  padding-left: 17px;
}
.ab-login__input-shell:focus-within {
  border-color: #9a6b29;
  box-shadow: none;
}
.ab-login__input-shell input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--ink);
  padding: 10.5px 14px;
  font-size: 20px;
  line-height: 1.45;
}
.ab-login__input-shell input::placeholder {
  color: #74716c;
  opacity: 1;
}
.ab-login input:is(:autofill, :-webkit-autofill) {
  -webkit-box-shadow: 0 0 0 1000px #faf9f7 inset !important;
  box-shadow: 0 0 0 1000px #faf9f7 inset !important;
  -webkit-text-fill-color: var(--ink) !important;
  caret-color: var(--ink);
}
.ab-login__floating-field {
  position: relative;
  overflow: visible;
}
.ab-login__floating-field label {
  position: absolute;
  left: 56px;
  top: 50%;
  transform: translateY(-50%);
  padding: 0;
  max-width: calc(100% - 65px);
  font-weight: 400;
  color: #74716c;
  cursor: text;
  transition: top 220ms ease, left 220ms ease, font-size 220ms ease, color 160ms ease;
}
.ab-login__floating-field:focus-within label,
.ab-login__floating-field input:not(:placeholder-shown) ~ label {
  top: -18px;
  left: -2px;
  font-size: 20px;
  font-weight: 600;
  background: transparent;
  color: var(--muted);
}
.ab-login__floating-field:focus-within label {
  color: var(--bronze);
}
.ab-login__input-shell input[type="password"]::placeholder {
  letter-spacing: 4px;
}
.ab-login__input-shell:has(input:disabled) {
  background: #eeeae3;
}
.ab-login__input-shell:has(input[aria-invalid="true"]) {
  border-color: #a73e2b;
}
.ab-login__eye {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 50px;
  min-height: 50px;
  padding: 0;
  border: 0;
  color: #686664;
  background: transparent;
}
.ab-login__eye:hover {
  color: #8b5d23;
  background: #eee8de;
}
.ab-login__eye:focus-visible {
  outline-offset: -4px !important;
  border-radius: 10px;
}
.ab-login__forgot {
  align-self: flex-end;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
  padding: 0 0 3px;
  text-align: right;
}
.ab-login__primary,
.ab-login__google-button {
  width: 100%;
  min-height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 24px !important;
  font-weight: 700 !important;
  padding: 13px 20px;
  line-height: 1.3;
}
.ab-login__primary {
  min-height: 64px;
  font-size: 26px !important;
  margin-top: 8px;
  color: #fffdf6;
  border: 1px solid #a7752b;
  background: linear-gradient(160deg, #ad7c35, #815012);
  box-shadow:
    0 5px 10px #4b2b1726,
    inset 0 1px 0 #fff3;
}
.ab-login__primary:hover:not(:disabled) {
  background: linear-gradient(160deg, #9d6d2b, #71420c);
}
.ab-login__primary svg {
  width: 26px;
  height: 26px;
}
.ab-login__divider {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--muted);
  font-size: 19px;
  margin: 33px 0;
}
.ab-login__divider:before,
.ab-login__divider:after {
  content: "";
  height: 1px;
  background: #c8c3bb;
  flex: 1;
  min-width: 10px;
}
.ab-login__google-button {
  background: #fffefa;
  border: 2px solid #d8d5d0;
  color: #171715;
  box-shadow: 0 2px 5px #0000000d;
  font-size: 22px !important;
}
.ab-login__google-button:hover:not(:disabled) {
  background: #eeeae3;
  border-color: #b1a491;
}
.ab-login__google-button svg {
  width: 30px;
  height: 30px;
}
.ab-login__signup {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  line-height: 1.5;
  margin: 36px 0 0;
  font-size: 19px;
  color: var(--muted);
}
.ab-login__signup a {
  font-weight: 600;
}
.ab-login__message {
  padding: 12px 14px;
  border: 1px solid #d6b991;
  border-radius: 10px;
  background: #f1e8d9;
  color: #583d16;
  font-size: 15px;
  line-height: 1.5;
  overflow-wrap: anywhere;
  margin: 0 0 18px;
}
.ab-login__message--error {
  border-color: #c2897b;
  background: #fff0eb;
  color: #83311e;
}
.ab-login__loading {
  font-size: 15px;
  color: var(--muted);
  margin: 0;
}
.ab-login__cleanup {
  padding: 12px;
  border: 1px solid #9a6b29;
  border-radius: 10px;
  background: transparent;
  color: #704916;
  min-height: 48px;
}
.ab-login__google-note {
  font-size: 14px;
  color: var(--muted);
  margin: 12px 0 0;
  line-height: 1.5;
}
@media (min-width: 1600px) {
  .ab-login {
    grid-template-columns: minmax(0, 1.25fr) minmax(500px, 610px);
    padding-left: max(52px, calc((100vw - 1640px) / 2));
    padding-right: max(52px, calc((100vw - 1640px) / 2));
  }
}
@media (max-width: 1020px) {
  .ab-login {
    grid-template-columns: minmax(0, 1fr) minmax(400px, 1.1fr);
    gap: 24px;
    padding: 26px;
  }
  .ab-login__card {
    min-height: 0;
    padding: 32px 30px;
    border-radius: 28px;
  }
  .ab-login__card h1 {
    font-size: 31px;
  }
  .ab-login__story {
    padding: 30px 8px;
  }
  .ab-login__story h2 {
    font-size: 43px;
  }
  .ab-login__tagline {
    font-size: 28px;
  }
  .ab-login__brand {
    margin-bottom: 30px;
  }
}
@media (max-width: 800px) {
  .ab-login {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 28px 22px;
  }
  .ab-login__story {
    display: none;
  }
  .ab-login__card {
    max-width: 550px;
    padding: 32px 34px;
    align-self: auto;
  }
  .ab-login__card h1 {
    font-size: 34px;
  }
  .ab-login__brand {
    margin-bottom: 30px;
  }
  .ab-login__brand span {
    font-size: 38px;
  }
  .ab-login__subtitle {
    margin-bottom: 26px;
  }
  .ab-login__signup {
    margin-top: 26px;
  }
}
@media (max-width: 420px) {
  .ab-login {
    padding: 16px 12px;
    align-items: flex-start;
  }
  .ab-login__card {
    padding: 26px 22px;
    border-radius: 24px;
  }
  .ab-login .ab-login__emblem {
    height: 76px;
    width: 140px;
  }
  .ab-login__brand {
    margin-bottom: 27px;
  }
  .ab-login__brand span {
    font-size: 33px;
  }
  .ab-login__card h1 {
    font-size: 28px;
    letter-spacing: -0.8px;
  }
  .ab-login__subtitle {
    font-size: 16px;
    margin-bottom: 24px;
  }
  .ab-login__field label {
    font-size: 16px;
  }
  .ab-login__input-shell input {
    font-size: 16px;
    padding-left: 11px;
  }
  .ab-login__input-shell {
    padding-left: 12px;
  }
  .ab-login__floating-field label {
    left: 48px;
  }
  .ab-login__forgot {
    font-size: 15px;
  }
  .ab-login__primary,
  .ab-login__google-button {
    font-size: 18px !important;
    padding: 13px 12px;
    gap: 10px;
    min-height: 56px;
  }
  .ab-login__signup {
    font-size: 16px;
  }
  .ab-login__primary {
    font-size: 19px !important;
  }
  .ab-login__divider {
    font-size: 15px;
    margin: 26px 0;
  }
}
.ab-login__forgot,
.ab-login__signup a {
  position: relative;
}
.ab-login__forgot:before,
.ab-login__signup a:before {
  content: "";
  position: absolute;
  inset: -10px -4px;
}
@media (min-width: 801px) and (max-height: 820px) {
  .ab-login {
    padding-top: 24px;
    padding-bottom: 24px;
  }
  .ab-login__story {
    padding-top: 40px;
    padding-bottom: 24px;
  }
  .ab-login__scissors {
    height: 50px !important;
  }
  .ab-login__scissors svg {
    width: 64px;
    height: 64px;
  }
  .ab-login__story h2 {
    font-size: 48px;
    margin-bottom: 20px;
  }
  .ab-login__tagline {
    font-size: 28px;
    margin-bottom: 18px;
  }
  .ab-login__description {
    font-size: 18px;
  }
  .ab-login__benefits {
    margin-top: 50px;
    gap: 22px;
  }
  .ab-login__benefits li {
    font-size: 16px;
  }
  .ab-login__card {
    min-height: 0;
    padding-top: 24px;
    padding-bottom: 24px;
  }
  .ab-login .ab-login__emblem {
    height: 50px;
    width: 120px;
  }
  .ab-login__brand {
    margin-bottom: 18px;
  }
  .ab-login__brand span {
    font-size: 32px;
  }
  .ab-login__brand:after {
    margin-top: 10px;
    height: 3px;
  }
  .ab-login__card h1 {
    font-size: clamp(26px, 2.4vw, 34px);
  }
  .ab-login__subtitle {
    font-size: 16px;
    margin-bottom: 16px;
  }
  .ab-login__form {
    gap: 14px;
  }
  .ab-login__field label {
    font-size: 16px;
  }
  .ab-login__input-shell input {
    font-size: 18px;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .ab-login__primary,
  .ab-login__google-button {
    min-height: 54px;
    padding-top: 10px;
    padding-bottom: 10px;
    font-size: 20px !important;
  }
  .ab-login__google-button {
    font-size: 18px !important;
  }
  .ab-login__divider {
    margin: 18px 0;
  }
  .ab-login__signup {
    margin-top: 22px;
  }
}
@media (max-width: 360px) {
  .ab-login__google-button {
    font-size: 16px !important;
    gap: 8px;
  }
  .ab-login__google-button svg {
    width: 24px;
    height: 24px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ab-login__floating-field label {
    transition: none;
  }
  .ab-login * {
    scroll-behavior: auto;
  }
}

/* Login-only reference dimensions: real component sizes, isolated from other Auth views. */
@media (max-width: 800px) and (min-height: 820px) {
  .ab-login:not(.ab-signup):not(.ab-recovery) { padding-block: 16px; }
  .ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__brand { margin-bottom: 24px; }
  .ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__divider { margin-block: 24px; }
  .ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__signup { margin-top: 24px; }
}
@media (min-width: 1021px) {
.ab-login:not(.ab-signup):not(.ab-recovery) {
  grid-template-columns: minmax(0, 1.26fr) minmax(352px, 1fr);
  gap: clamp(22.4px, 4vw, 51.2px);
  padding: clamp(19.2px, 3.4vw, 41.6px);
  padding-right: clamp(19.2px, 2vw, 32px)
}
.ab-login:not(.ab-signup):not(.ab-recovery) svg {
  width: 20px;
  height: 20px
}
.ab-login:not(.ab-signup):not(.ab-recovery) a {
  text-underline-offset: 2.4px
}
.ab-login:not(.ab-signup):not(.ab-recovery) button:focus-visible,
.ab-login:not(.ab-signup):not(.ab-recovery) a:focus-visible {
  outline: 2.4px solid #b07c32;
  outline-offset: 4px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__story {
  text-shadow: 0 0.8px 2.4px #0006;
  padding: clamp(63.2px, calc(8vh + 7.2px), 95.2px) clamp(6.4px, 2.3vw, 27.2px) 25.6px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__scissors {
  width: 112px;
  height: 56px !important;
  margin: 0 0 9.6px 51.2px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__scissors svg {
  width: 65.6px;
  height: 65.6px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__scissors:before,
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__scissors:after {
  height: 0.8px;
  transform: translateY(9.6px)
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__story h2 {
  font:
    700 clamp(32px, 4.15vw, 52.8px)/1.12 Georgia,
    "Times New Roman",
    serif;
  margin: 0 0 22.4px;
  letter-spacing: -1.44px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__rule {
  width: 39.2px;
  height: 2.4px;
  margin-bottom: 14.4px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__tagline {
  font:
    400 clamp(19.2px, 2.15vw, 27.2px)/1.3 Georgia,
    "Times New Roman",
    serif;
  margin: 0 0 19.2px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__rule--gold {
  width: 68.8px;
  height: 3.2px;
  margin-bottom: 17.6px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__description {
  font-size: clamp(14.4px, 1.55vw, 18.4px);
  max-width: 280px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__benefits {
  margin: clamp(56px, 12vh, 104px) 0 0;
  gap: 22.4px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__benefits li {
  gap: 25.6px;
  font-size: 14.4px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__benefits svg {
  width: 38.4px;
  height: 38.4px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__benefits span {
  max-width: 140px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__card {
  max-width: 488px;
  min-height: min(784px, calc(100svh - 83.2px));
  padding: 25.6px clamp(22.4px, 2.76vw, 32px) 25.6px clamp(22.4px, 3.6vw, 41.6px);
  border: 0.8px solid #e5dfd4;
  border-radius: 25.6px;
  box-shadow: 0 16px 46.4px #0005
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__brand {
  margin: 0 0 35.2px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__emblem {
  width: 156.8px;
  height: 80px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__brand span {
  font:
    700 clamp(25.6px, 2.76vw, 33.6px)/1.15 Georgia,
    "Times New Roman",
    serif;
  letter-spacing: -1.12px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__brand:after {
  width: 40px;
  height: 3.2px;
  margin-top: 8.8px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__card h1 {
  margin: 0 0 1.6px;
  font-size: clamp(22.4px, 3.04vw, 35.2px);
  letter-spacing: -1.08px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__subtitle {
  font-size: clamp(12.8px, 1.4vw, 16px);
  margin: 1.6px 0 23.2px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__form {
  gap: 17.6px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__field {
  padding-top: 22.4px;
  gap: 4.8px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__field label {
  font-size: 16px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__input-shell {
  min-height: 43.2px;
  border: 1.6px solid #d4d2d0;
  border-radius: 11.2px;
  padding-left: 13.6px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__input-shell:focus-within {
  box-shadow: none
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__input-shell input {
  padding: 8.4px 11.2px;
  font-size: 16px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__floating-field label {
  left: 44.8px;
  max-width: calc(100% - 52px)
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__floating-field:focus-within label,
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__floating-field input:not(:placeholder-shown) ~ label {
  top: -14.4px;
  left: -1.6px;
  font-size: 16px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__input-shell input[type="password"]::placeholder {
  letter-spacing: 3.2px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__eye {
  width: 40px;
  min-height: 40px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__eye:focus-visible {
  outline-offset: -3.2px !important;
  border-radius: 8px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__forgot {
  font-size: 14.4px;
  padding: 0 0 2.4px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__primary,
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__google-button {
  min-height: 48px;
  border-radius: 11.2px;
  gap: 12.8px;
  font-size: 19.2px !important;
  padding: 10.4px 16px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__primary {
  min-height: 51.2px;
  font-size: 20.8px !important;
  margin-top: 6.4px;
  border: 0.8px solid #a7752b;
  box-shadow:
    0 4px 8px #4b2b1726,
    inset 0 0.8px 0 #fff3
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__primary svg {
  width: 20.8px;
  height: 20.8px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__divider {
  gap: 12.8px;
  font-size: 15.2px;
  margin: 26.4px 0
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__divider:before,
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__divider:after {
  height: 0.8px;
  min-width: 8px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__google-button {
  border: 1.6px solid #d8d5d0;
  box-shadow: 0 1.6px 4px #0000000d;
  font-size: 17.6px !important
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__google-button svg {
  width: 24px;
  height: 24px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__signup {
  gap: 4.8px;
  margin: 28.8px 0 0;
  font-size: 15.2px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__message {
  padding: 9.6px 11.2px;
  border: 0.8px solid #d6b991;
  border-radius: 8px;
  font-size: 12px;
  margin: 0 0 14.4px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__loading {
  font-size: 12px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__cleanup {
  padding: 9.6px;
  border: 0.8px solid #9a6b29;
  border-radius: 8px;
  min-height: 38.4px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__google-note {
  font-size: 11.2px;
  margin: 9.6px 0 0
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__forgot:before,
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__signup a:before {
  inset: -8px -3.2px
}
}
@media (min-width: 1280px) {
.ab-login:not(.ab-signup):not(.ab-recovery) {
    grid-template-columns: minmax(0, 1.25fr) minmax(400px, 488px);
    padding-left: max(41.6px, calc((100vw - 1312px) / 2));
    padding-right: max(41.6px, calc((100vw - 1312px) / 2))
}
}
@media (min-width: 1021px) and (max-height: 820px) {
.ab-login:not(.ab-signup):not(.ab-recovery) {
    padding-top: 19.2px;
    padding-bottom: 19.2px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__story {
    padding-top: 32px;
    padding-bottom: 19.2px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__scissors {
    height: 40px !important
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__scissors svg {
    width: 51.2px;
    height: 51.2px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__story h2 {
    font-size: 38.4px;
    margin-bottom: 16px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__tagline {
    font-size: 22.4px;
    margin-bottom: 14.4px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__description {
    font-size: 14.4px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__benefits {
    margin-top: 40px;
    gap: 17.6px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__benefits li {
    font-size: 12.8px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__card {
    padding-top: 19.2px;
    padding-bottom: 19.2px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__emblem {
    height: 40px;
    width: 96px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__brand {
    margin-bottom: 14.4px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__brand span {
    font-size: 25.6px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__brand:after {
    margin-top: 8px;
    height: 2.4px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__card h1 {
    font-size: clamp(20.8px, 2.4vw, 27.2px)
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__subtitle {
    font-size: 12.8px;
    margin-bottom: 12.8px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__form {
    gap: 11.2px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__field label {
    font-size: 12.8px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__input-shell input {
    font-size: 14.4px;
    padding-top: 8px;
    padding-bottom: 8px
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__primary,
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__google-button {
    min-height: 43.2px;
    padding-top: 8px;
    padding-bottom: 8px;
    font-size: 16px !important
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__google-button {
    font-size: 14.4px !important
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__divider {
    margin: 14.4px 0
}
.ab-login:not(.ab-signup):not(.ab-recovery) .ab-login__signup {
    margin-top: 17.6px
}
}
`;
