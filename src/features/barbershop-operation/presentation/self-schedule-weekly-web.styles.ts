export const selfScheduleWeeklyStyles = `
.bx-self-week { min-width:0; margin:12px 0; border:1px solid var(--bx-line); border-radius:18px; background:var(--bx-canvas); color:var(--bx-ink); font-family:var(--bx-font); box-shadow:0 4px 16px #52351207; overflow:hidden; }
.bx-self-week *, .bx-self-week *::before { box-sizing:border-box; }
.bx-self-week-heading { display:flex; align-items:center; flex-wrap:wrap; gap:12px; padding:20px; background:linear-gradient(115deg,#fffdfa,#f8eedf); }
.bx-self-week-icon { display:grid; place-items:center; width:46px; height:46px; flex:none; border-radius:13px; background:#f7e7c7; color:var(--bx-action); }
.bx-self-week-icon svg { width:26px; height:26px; }
.bx-self-week-heading > div { flex:1 1 230px; min-width:0; }
.bx-self-week h3 { font-size:20px; letter-spacing:-.025em; margin:0 0 5px; }
.bx-self-week p { font-size:13px; line-height:1.6; margin:0; color:var(--bx-muted); }
.bx-self-week-zone { font-size:11px; color:var(--bx-action); background:#fff7e8; border-radius:20px; padding:6px 10px; }
.bx-self-week-editor, .bx-self-week-preview { padding:20px; }
.bx-self-week-preview { border-top:1px solid var(--bx-line); }
.bx-self-week .bx-self-week-step { font-size:14px; font-weight:650; color:var(--bx-ink); margin-bottom:14px; }
.bx-self-week-fields { display:grid; grid-template-columns:1.2fr 1fr 1fr; gap:14px; margin-bottom:14px; }
.bx-self-week-fields label { display:grid; gap:7px; min-width:0; font-size:12px; font-weight:600; }
.bx-self-week-fields select { width:100%; min-width:0; min-height:44px; border:1px solid var(--bx-line); border-radius:11px; padding:10px 12px; color:var(--bx-ink); background:#fffdfa; font:inherit; font-size:14px; cursor:pointer; }
.bx-self-week-fields select:disabled { opacity:.6; cursor:not-allowed; }
.bx-self-week .bx-self-week-hint { margin-top:12px; font-size:12px; }
.bx-self-week ul { padding:0; margin:0; list-style:none; }
.bx-self-week li { display:grid; grid-template-columns:110px minmax(0,1fr); gap:12px; align-items:center; border-top:1px solid var(--bx-line); padding:12px 0; }
.bx-self-week li > strong { font-size:13px; }
.bx-self-week-intervals { display:flex; flex-wrap:wrap; gap:8px; min-width:0; }
.bx-self-week-interval { display:flex; align-items:center; gap:10px; padding:5px 5px 5px 12px; border:1px solid var(--bx-line); border-radius:11px; background:#fffaf1; }
.bx-self-week-interval > span { display:flex; align-items:center; gap:7px; font-size:13px; font-weight:550; }
.bx-self-week-interval svg { width:16px; height:16px; color:var(--bx-action); flex:none; }
.bx-self-week-interval button { display:grid; place-items:center; width:36px; height:36px; border:1px solid var(--bx-line); border-radius:8px; background:#fffdfa; cursor:pointer; }
.bx-self-week-interval button:hover:not(:disabled) { background:#f7e7c7; }
.bx-self-week-interval button:focus-visible { outline:2px solid var(--bx-action); outline-offset:2px; }
.bx-self-week-interval button:disabled { opacity:.5; cursor:not-allowed; }
.bx-self-week-empty { padding:14px; border:1px dashed var(--bx-line); border-radius:11px; background:#fffaf1; }
.bx-self-week-footer { display:flex; flex-wrap:wrap; align-items:center; gap:16px; margin-top:16px; }
.bx-self-week-footer > p { flex:1 1 250px; font-size:12px; }
@media(max-width:600px) { .bx-self-week-fields { grid-template-columns:1fr 1fr; } .bx-self-week-fields > label:first-child { grid-column:1/-1; } .bx-self-week li { grid-template-columns:1fr; gap:8px; } .bx-self-week-heading,.bx-self-week-editor,.bx-self-week-preview { padding:16px; } .bx-self-week-footer > div { width:100%; } }
`;
