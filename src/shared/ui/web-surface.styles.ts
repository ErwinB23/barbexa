export const webSurfaceStyles = `
@font-face {
  font-family: Outfit;
  src: url('/fonts/outfit/Outfit-Variable.ttf') format('truetype');
  font-weight: 100 900;
  font-display: swap;
}

.bx-web {
  --bx-canvas: #f8f5ef;
  --bx-panel: #fffdfa;
  --bx-ink: #211c18;
  --bx-muted: #655d54;
  --bx-line: #e1d7c9;
  --bx-control: #8c7c6b;
  --bx-rail: #211b17;
  --bx-rail-text: #f1e6d6;
  --bx-gold: #e5b873;
  --bx-action: #805421;
  --bx-action-dark: #613b16;
  --bx-tint: #f2e7d6;
  --bx-focus: #85551c;
  --bx-error: #a12726;
  --bx-success: #22633d;
  --bx-radius: 16px;
  --bx-shadow: 0 3px 14px #42230e0a;
  --bx-font: Outfit, system-ui, sans-serif;
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  width: 100%;
  flex-direction: column;
  background: var(--bx-canvas);
  color: var(--bx-ink);
  font-family: var(--bx-font);
}
.bx-web :focus-visible {
  outline: 2px solid var(--bx-focus) !important;
  outline-offset: 3px;
}
/* Fields keep their normal/focused border; reserve the outer ring for actions. */
.bx-web input:focus,
.bx-web textarea:focus,
.bx-web select:focus {
  outline: none !important;
  outline-offset: 0 !important;
}
/* Mask the browser's autofill paint without disabling saved suggestions. */
.bx-web input:is(:autofill, :-webkit-autofill),
.bx-web textarea:is(:autofill, :-webkit-autofill) {
  -webkit-box-shadow: 0 0 0 1000px var(--bx-autofill-background, var(--bx-panel)) inset !important;
  box-shadow: 0 0 0 1000px var(--bx-autofill-background, var(--bx-panel)) inset !important;
  -webkit-text-fill-color: var(--bx-autofill-text, var(--bx-ink)) !important;
  caret-color: var(--bx-autofill-text, var(--bx-ink));
}
.bx-web .bx-private-search {
  --bx-autofill-background: #302821;
  --bx-autofill-text: #fff8ee;
}
.bx-web [data-bx-part='screen'] { background: var(--bx-canvas) !important; }
.bx-web [data-bx-part='scroll'] > div {
  padding: clamp(1.25rem, 3.3vw, 3.5rem) !important;
  gap: clamp(1rem, 2vw, 1.75rem) !important;
}
.bx-web [data-bx-part='text'] {
  font-family: var(--bx-font) !important;
  overflow-wrap: anywhere;
}
.bx-web [data-bx-tone='text'] { color: var(--bx-ink) !important; }
.bx-web [data-bx-tone='textSecondary'] { color: var(--bx-muted) !important; }
.bx-web [data-bx-tone='error'] { color: var(--bx-error) !important; }
.bx-web [data-bx-tone='success'] { color: var(--bx-success) !important; }
.bx-web [data-bx-part='text'][data-bx-variant='title'] {
  font-size: clamp(1.85rem, 3.6vw, 2.9rem) !important;
  line-height: 1.08 !important;
  letter-spacing: -.035em;
  font-weight: 750 !important;
}
.bx-web [data-bx-part='text'][data-bx-variant='heading'] {
  line-height: 1.22 !important;
  letter-spacing: -.017em;
}
.bx-web [data-bx-part='header'] {
  border-bottom: 1px solid var(--bx-line);
  padding: 0 0 clamp(1rem, 2.5vw, 1.65rem) !important;
  gap: .55rem !important;
}
.bx-web [data-bx-part='section'], .bx-web [data-bx-part='panel'] {
  border: 1px solid var(--bx-line) !important;
  border-radius: var(--bx-radius) !important;
  padding: clamp(1rem, 2.4vw, 1.6rem) !important;
  background: var(--bx-panel) !important;
  box-shadow: var(--bx-shadow);
}
.bx-web [data-bx-part='section'] [data-bx-part='section'],
.bx-web [data-bx-part='section'] [data-bx-part='panel'] {
  background: var(--bx-canvas) !important;
  box-shadow: none;
}
.bx-web [data-bx-part='panel'][data-bx-variant='profile'] {
  border-top: 3px solid var(--bx-action) !important;
  background: linear-gradient(140deg, var(--bx-panel), var(--bx-tint)) !important;
}
.bx-web [data-bx-part='panel'][data-bx-variant='review'] {
  border-color: var(--bx-control) !important;
}
.bx-web [data-bx-part='choices'] > div { min-width: min(100%, 14rem) !important; }
.bx-web [data-bx-part='button'], .bx-web .bx-action {
  box-sizing: border-box;
  min-height: 48px;
  min-width: 48px;
  max-width: 100%;
  border: 1px solid var(--bx-line) !important;
  border-radius: 10px !important;
  background: var(--bx-panel) !important;
  text-align: center;
  overflow-wrap: anywhere;
}
.bx-web [data-bx-part='button'][data-bx-variant='primary'], .bx-web .bx-action--primary {
  border-color: var(--bx-action-dark) !important;
  background: linear-gradient(155deg, var(--bx-action), var(--bx-action-dark)) !important;
  color: white;
  box-shadow: 0 3px 8px #43240822;
}
.bx-web [data-bx-part='button'][data-bx-variant='ghost'] {
  border-color: transparent !important;
  background: transparent !important;
}
.bx-web [data-bx-part='button'][data-bx-variant='danger'] {
  border-color: var(--bx-error) !important;
  background: #fff1ed !important;
}
.bx-web [data-bx-part='button'][aria-pressed='true'],
.bx-web [data-bx-part='button'][aria-disabled='true'] {
  border-color: var(--bx-control) !important;
  background: var(--bx-tint) !important;
  box-shadow: none;
}
.bx-web [data-bx-part='button']:hover:not([aria-disabled='true']), .bx-web .bx-action:hover {
  box-shadow: 0 0 0 1px var(--bx-control);
}
.bx-web [data-bx-part='field'] {
  font-family: var(--bx-font) !important;
  color: var(--bx-ink) !important;
  border: 1px solid var(--bx-control) !important;
  background: var(--bx-panel) !important;
  border-radius: 10px !important;
  max-width: 100%;
}
.bx-web [data-bx-part='field'][aria-invalid='true'] { border-color: var(--bx-error) !important; }
.bx-web [data-bx-part='field']:disabled { background: var(--bx-tint) !important; }
.bx-web [data-bx-part='status'] {
  border-left-color: var(--bx-action) !important;
  background: var(--bx-tint) !important;
}
.bx-web [data-bx-part='status'][data-bx-variant='error'] {
  border-left-color: var(--bx-error) !important;
  background: #fff1ed !important;
}
.bx-web [data-bx-part='status'][data-bx-variant='success'] {
  border-left-color: var(--bx-success) !important;
  background: #edf4ec !important;
}

.bx-workspace {
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
}
.bx-main {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
}
.bx-rail {
  display: flex;
  flex-direction: column;
  flex: 0 0 clamp(13rem, 22vw, 16rem);
  min-height: 0;
  overflow: auto;
  gap: 1.6rem;
  padding: 1.5rem 1rem;
  background: var(--bx-rail);
  color: var(--bx-rail-text);
  box-sizing: border-box;
}
.bx-brand {
  display: inline-flex;
  gap: .7rem;
  align-items: center;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -.015em;
}
.bx-brand--official img { width:52px; height:52px; object-fit:contain; flex:none; }
.bx-rail .bx-brand--official { flex-wrap:wrap; }
.bx-rail .bx-brand--official img { width:40px; height:40px; }
.bx-brand svg, .bx-rail nav svg { width: 1.15rem; height: 1.15rem; flex: none; color: var(--bx-gold); }
.bx-rail nav { display: grid; gap: .4rem; }
.bx-rail a {
  display: flex;
  align-items: center;
  gap: .55rem;
  box-sizing: border-box;
  min-height: 48px;
  min-width: 0;
  padding: .6rem .7rem;
  border-radius: 9px;
  color: var(--bx-rail-text);
  font-size: .94rem;
  text-decoration: none;
  overflow-wrap: anywhere;
  border: 1px solid transparent;
}
.bx-rail a[aria-current='page'], .bx-rail a:hover {
  background: #3a2c21;
  border-color: #9a7349;
  color: var(--bx-gold);
}
.bx-rail a.bx-brand { font-size: 1.15rem; }
.bx-web .bx-rail a:focus-visible { outline-color: var(--bx-gold) !important; }
.bx-rail-context { margin-top: auto; padding: 1rem .25rem 0; border-top: 1px solid #625246; }
.bx-rail-context strong, .bx-rail-context span { display: block; overflow-wrap: anywhere; }
.bx-rail-context span { color: #d6c0a9; font-size: .875rem; }
.bx-rail-context a { padding-inline: .25rem; margin-top: .45rem; }

.bx-home { display: flex; flex: 1; flex-direction: column; overflow: auto; }
.bx-home-header, .bx-home-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: .75rem;
  padding: .8rem clamp(1rem, 5vw, 5rem);
}
.bx-home-header, .bx-home-footer { background: var(--bx-rail); color: var(--bx-rail-text); }
.bx-home-footer a { color: var(--bx-rail-text); display: inline-flex; align-items: center; min-height: 44px; }
.bx-home-hero {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  background: var(--bx-canvas);
}
.bx-home-copy { align-self: center; padding: clamp(1.5rem, 6vw, 7rem); }
.bx-home-copy h1 { font-size: clamp(2.55rem, 6.5vw, 6.15rem); line-height: .98; letter-spacing: -.052em; margin: 0; font-weight: 750; }
.bx-home-copy p { max-width: 33rem; color: var(--bx-muted); line-height: 1.55; font-size: clamp(1rem, 2vw, 1.25rem); }
.bx-home-image { width: 100%; height: 100%; min-height: 29rem; object-fit: cover; object-position: 50% 50%; }
.bx-home-actions { display: flex; flex-wrap: wrap; gap: .65rem; margin-top: 1.4rem; }
.bx-web .bx-action { display: inline-flex; gap: .65rem; justify-content: center; align-items: center; padding: .55rem 1.1rem; text-decoration: none; font-weight: 650; color: var(--bx-ink); }
.bx-web .bx-action--primary { color: white; }
.bx-action svg { width: 1rem; height: 1rem; }
.bx-home-header .bx-action { background: transparent !important; color: var(--bx-rail-text); border-color: #9a7349 !important; }
.bx-home-header a:focus-visible, .bx-home-footer a:focus-visible { outline-color: var(--bx-gold) !important; }

@media (min-width: 71rem) {
  .bx-web [data-bx-part='scroll'][data-bx-variant='account'] > div {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: start;
  }
  .bx-web [data-bx-part='scroll'][data-bx-variant='account'] > div > * { grid-column: 1 / -1; }
  .bx-web [data-bx-part='scroll'][data-bx-variant='account'] > div > [data-bx-variant='account-shortcut'] { grid-column: auto; }
}

@media (max-width: 52rem) {
  .bx-workspace { flex-direction: column; }
  .bx-rail { flex: none; padding: .75rem 1rem; gap: .65rem; overflow: visible; }
  .bx-rail nav { display: flex; flex-wrap: wrap; gap: .25rem; }
  .bx-rail a { padding: .4rem .55rem; }
  .bx-rail-context { display: flex; flex-wrap: wrap; align-items: baseline; gap: .25rem .65rem; padding: .6rem .25rem 0; }
  .bx-home-hero { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(min-content, 1fr) auto; }
  .bx-home-copy { padding: 2.25rem clamp(1rem, 6vw, 2.5rem); }
  .bx-home-image { min-height: 0; height: clamp(12rem, 44vw, 23rem); }
}
@media (max-width: 30rem) {
  .bx-web [data-bx-part='actions'] > *, .bx-home-actions > * { flex: 1 1 auto; }
  .bx-rail nav > a { flex: 1 0 40%; }
}
`;
