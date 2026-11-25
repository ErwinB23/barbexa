export const weeklyScheduleStyles = `
.bx-week-page { width:100%; max-width:1500px; min-height:100%; margin:auto; padding:24px clamp(18px,2.8vw,40px) 32px; font-family:var(--bx-font); background:var(--bx-canvas); color:var(--bx-ink); }
.bx-week-page *, .bx-week-page *::before, .bx-week-page *::after { box-sizing:border-box; }
.bx-week-heading { position:relative; padding:18px 0 16px; border-bottom:1px solid var(--bx-line); }
.bx-week-heading::before { content:''; position:absolute; top:0; left:0; width:60px; height:6px; border-radius:6px; background:linear-gradient(90deg,#9e6924,#c3954c); }
.bx-week-heading h1 { margin:0 0 6px; font-size:clamp(28px,2.6vw,38px); line-height:1.15; letter-spacing:-.035em; font-weight:750; overflow-wrap:anywhere; }
.bx-week-heading p { margin:0; color:var(--bx-muted); font-size:14px; line-height:1.5; }
.bx-week-heading > button { margin-top:8px; min-height:28px; padding:0; border:0; background:transparent; color:var(--bx-action); font:inherit; font-size:12px; text-decoration:underline; cursor:pointer; }
.bx-week-tabs { display:flex; flex-wrap:wrap; gap:10px; padding:14px 0; }
.bx-week-tab { position:relative; min-width:0; }
.bx-week-tab > svg { position:absolute; left:14px; top:calc(50% - 9px); width:18px; height:18px; z-index:1; pointer-events:none; color:var(--bx-action); }
.bx-private .bx-week-tab [data-bx-part='button'] { padding:10px 16px 10px 42px !important; min-height:42px; border-radius:12px !important; }
.bx-private .bx-week-tab [data-bx-part='button'][aria-pressed='true'] { opacity:1; background:linear-gradient(130deg,#996724,#79501b) !important; border-color:#b1813e !important; }
.bx-private .bx-week-tab [aria-pressed='true'] [data-bx-part='text'] { color:#fff7e9 !important; }
.bx-week-tab:has([aria-pressed='true']) > svg { color:#fff1d6; }
.bx-week-feedback:empty { display:none; }
.bx-week-feedback { margin-bottom:14px; }
.bx-week-scope { display:flex; flex-wrap:wrap; align-items:center; gap:12px 24px; margin-bottom:18px; }
.bx-week-scope label { display:flex; align-items:center; flex-wrap:wrap; gap:10px; font-size:13px; font-weight:600; }
.bx-week-scope p { margin:0; color:var(--bx-muted); font-size:11px; line-height:1.6; }
.bx-week-page select { min-height:40px; max-width:100%; min-width:0; border:1px solid #d8c7ad; border-radius:10px; padding:8px 10px; background:#fffdfa; color:var(--bx-ink); font:inherit; font-size:13px; }
.bx-week-page select:focus-visible { outline:2px solid var(--bx-action); outline-offset:2px; }
.bx-week-page select:disabled { background:#f1ece3; cursor:not-allowed; }
.bx-week-layout { display:grid; grid-template-columns:minmax(0,1.7fr) minmax(290px,1fr); gap:22px; align-items:start; }
.bx-week-card { min-width:0; border:1px solid #e5d8c7; border-radius:18px; padding:22px; background:linear-gradient(115deg,#fffdfa,#fcf9f3); box-shadow:0 4px 16px #52351207; }
.bx-week-card-title { position:relative; isolation:isolate; display:flex; align-items:center; gap:14px; padding-bottom:16px; }
.bx-week-editor > .bx-week-card-title::after { content:''; position:absolute; z-index:-1; right:-16px; top:-15px; width:150px; height:60px; border-top-right-radius:12px; border-bottom-left-radius:100%; background:linear-gradient(125deg,#c9a26910,#8b5d22b0); pointer-events:none; }
.bx-week-card-title > span { display:grid; place-items:center; flex:none; width:48px; height:48px; border-radius:13px; color:var(--bx-action); background:linear-gradient(130deg,#fae9c6,#fff3d8); }
.bx-week-card-title svg { width:27px; height:27px; }
.bx-week-card-title > div { min-width:0; }
.bx-week-card-title h2 { margin:0 0 5px; font-size:22px; font-weight:700; letter-spacing:-.025em; line-height:1.25; }
.bx-week-card-title p { margin:0; font-size:12px; color:var(--bx-muted); line-height:1.5; }
.bx-week-copy { display:flex; flex-wrap:wrap; gap:10px 14px; align-items:end; padding:12px 0 18px; }
.bx-week-copy label { display:grid; gap:5px; font-size:11px; }
.bx-private .bx-week-copy [data-bx-part='button'] { min-height:40px; padding:8px 12px !important; }
.bx-week-copy p { margin:0; padding:8px 12px; font-size:11px; line-height:1.6; color:var(--bx-muted); background:#f8f0e3; border-radius:8px; flex:1 1 230px; }
.bx-week-day { display:grid; grid-template-columns:150px minmax(0,1fr); gap:20px; padding:20px 0; border-top:1px solid #eee4d6; }
.bx-week-day-heading { display:flex; align-items:flex-start; gap:9px; padding-top:5px; }
.bx-week-day-heading > svg { width:19px; height:19px; color:var(--bx-action); flex:none; }
.bx-week-day-heading h3 { font-size:14px; margin:0 0 7px; font-weight:650; }
.bx-week-day-state { display:inline-flex; font-size:10px; padding:4px 8px; border-radius:15px; background:#eeebe5; color:#6c655c; }
.bx-week-day-state.is-open { color:#386334; background:#e4efdb; }
.bx-week-switch { margin-left:auto; position:relative; min-width:34px; width:34px; height:44px; padding:0; border:0; background:transparent; cursor:pointer; flex:none; }
.bx-week-switch::before { content:''; position:absolute; inset:13px 0; border-radius:20px; background:#b2b0ab; }
.bx-week-switch[aria-checked='true']::before { background:#8b5c20; }
.bx-week-switch i { position:absolute; left:3px; top:15px; width:14px; height:14px; border-radius:50%; background:white; box-shadow:0 1px 3px #0002; }
.bx-week-switch[aria-checked='true'] i { left:17px; }
.bx-week-switch:disabled { opacity:.5; cursor:not-allowed; }
.bx-week-day-content { min-width:0; border-left:1px solid #eadbc7; padding-left:20px; }
.bx-week-interval { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.bx-week-interval > svg { color:var(--bx-action); width:18px; height:18px; flex:none; }
.bx-week-time { display:grid; gap:5px; min-width:0; flex:1; font-size:10px; color:var(--bx-muted); }
.bx-week-time select { width:100%; font-weight:550; }
.bx-week-remove { display:grid; place-items:center; flex:none; align-self:end; width:36px; min-height:40px; border:1px solid #e3d2b9; border-radius:9px; color:var(--bx-action); background:#fffdfa; cursor:pointer; }
.bx-week-remove svg { width:18px; height:18px; }
.bx-week-day-actions { display:flex; flex-wrap:wrap; gap:8px; }
.bx-week-day-actions button { flex:1; min-height:36px; border:1px solid #d7c19e; border-radius:9px; background:transparent; color:var(--bx-action); font:inherit; font-size:11px; font-weight:550; padding:8px; cursor:pointer; }
.bx-week-day-actions button:disabled, .bx-week-remove:disabled { opacity:.5; cursor:not-allowed; }
.bx-week-closed { margin:10px 0; padding:12px; border-radius:9px; background:#f6f0e6; color:var(--bx-muted); font-size:12px; text-align:center; }
.bx-week-break { display:flex; flex-wrap:wrap; gap:8px; align-items:center; padding:8px 10px; margin:8px 0 12px; background:#f8edda; border-radius:9px; color:#775120; font-size:11px; }
.bx-week-break > svg { width:16px; height:16px; }
.bx-week-break span { flex:1; }
.bx-week-break button { min-height:30px; border:0; border-bottom:1px solid #c4a16b; background:transparent; color:var(--bx-action); font:inherit; cursor:pointer; }
.bx-week-break-editor { display:flex; flex-wrap:wrap; gap:10px; padding:12px; margin-bottom:12px; border:1px solid #dec39a; border-radius:10px; background:#fff8ec; }
.bx-week-break-editor .bx-week-time { flex:1 1 110px; }
.bx-week-break-editor > button { min-height:36px; padding:8px 12px; border:1px solid #ccb083; background:#fffdfa; border-radius:8px; color:var(--bx-action); cursor:pointer; font:inherit; font-size:11px; }
.bx-week-error { color:var(--bx-error); font-size:13px; line-height:1.6; padding:12px; background:#fff1ed; border-radius:9px; }
.bx-week-unknown { font-size:14px; color:var(--bx-muted); padding:20px; line-height:1.6; }
.bx-week-summary-column { display:grid; gap:22px; min-width:0; }
.bx-week-summary-column .bx-week-card-title h2 { font-size:20px; }
.bx-week-summary-status { display:inline-flex; border-radius:20px; padding:5px 10px; font-size:11px; color:#3f6437; background:#e8efdf; margin-bottom:14px; }
.bx-week-summary-status.is-draft { color:#82581d; background:#f7e8c6; }
.bx-week-stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
.bx-week-stats > div { display:flex; flex-direction:column; align-items:center; gap:8px; padding:12px 6px; border:1px solid #eee1ce; border-radius:12px; background:#fbf5eb; text-align:center; }
.bx-week-stats svg { width:22px; height:22px; color:var(--bx-action); }
.bx-week-stats strong { font-size:12px; overflow-wrap:anywhere; }
.bx-week-stats span { font-size:10px; color:var(--bx-muted); }
.bx-week-view-title { margin:20px 0 14px; font-size:17px; }
.bx-week-overview { display:grid; gap:14px; }
.bx-week-overview > div { display:flex; align-items:center; gap:12px; }
.bx-week-overview strong { width:28px; flex:none; font-size:12px; }
.bx-week-overview > div > span { display:flex; flex-wrap:wrap; gap:8px; flex:1; min-width:0; }
.bx-week-overview i { flex:1 1 100px; padding:5px 8px; border-radius:18px; background:#fbebc8; color:#78531c; font-style:normal; font-size:11px; font-weight:600; text-align:center; }
.bx-week-overview i.is-closed { background:#eae7e1; color:#70685e; font-weight:400; }
.bx-week-advice h2 { margin:0 0 14px; font-size:18px; }
.bx-week-advice ul { display:grid; gap:12px; margin:0; padding:0; list-style:none; }
.bx-week-advice li { display:flex; gap:10px; font-size:12px; color:var(--bx-muted); line-height:1.6; }
.bx-week-advice li::before { content:'✓'; color:var(--bx-action); }
.bx-week-bottom { display:flex; gap:16px; padding:14px; margin-top:22px; border:1px solid #e6dacb; border-radius:16px; background:#fffdfa; box-shadow:0 3px 12px #52351207; }
.bx-week-bottom > * { flex:1; }
.bx-private .bx-week-bottom [data-bx-part='button'] { min-height:46px; border-radius:12px !important; }
.bx-week-extras { margin-top:22px; }
.bx-week-extras > summary { cursor:pointer; color:var(--bx-action); font-size:14px; font-weight:600; padding-block:6px; }
.bx-week-extras > div { display:grid; gap:20px; padding-top:18px; }
.bx-week-extras > summary { min-height:44px; line-height:1.5; }
.bx-week-extras > summary:focus-visible { outline:2px solid var(--bx-action); outline-offset:4px; border-radius:5px; }
.bx-availability-summary-hint { display:block; font-size:12px; font-weight:400; color:var(--bx-muted); padding-top:5px; }
.bx-week-extras > .bx-availability-guide { grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; padding:20px 0; margin-bottom:8px; border-bottom:1px solid var(--bx-line); }
.bx-availability-guide article { padding:18px; border:1px solid #e7d9c4; border-radius:14px; background:#fcf8ef; }
.bx-availability-guide strong { display:block; font-size:15px; line-height:1.4; }
.bx-availability-guide span { display:block; margin-top:8px; color:var(--bx-action); font-size:12px; font-weight:600; }
.bx-availability-guide p,.bx-availability-help { font-size:13px; line-height:1.65; color:var(--bx-muted); margin:8px 0 0; }
.bx-availability-scope { display:grid; gap:16px; width:100%; }
.bx-availability-scope label,.bx-availability-date { display:grid; gap:8px; font-size:14px; font-weight:600; }
.bx-availability-scope select,.bx-availability-date input { width:100%; min-height:46px; padding:12px; border:1px solid #d9c8ae; border-radius:12px; background:#fffdf9; color:var(--bx-ink); font:inherit; }
.bx-availability-scope select:focus-visible,.bx-availability-date input:focus-visible { outline:2px solid var(--bx-action); outline-offset:2px; }
.bx-availability-impact { display:flex; align-items:flex-start; gap:14px; padding:18px; border-radius:14px; background:#f7ecd6; border:1px solid #e5cfaa; }
.bx-availability-impact > svg { width:26px; height:26px; flex:none; color:var(--bx-action); }
.bx-availability-impact strong { font-size:16px; }
.bx-availability-impact p { margin:6px 0 0; font-size:13px; line-height:1.6; }
.bx-availability-personal { padding:22px; display:grid; gap:16px; }
.bx-availability-personal header { display:flex; gap:14px; align-items:center; }
.bx-availability-personal [data-bx-part='button'] { align-self:start; }
.bx-availability-exception { padding:4px; border-radius:20px; background:#fffdf9; border:1px solid #e5d7c3; }
@media(max-width:850px) { .bx-week-extras > .bx-availability-guide { grid-template-columns:1fr; } }
@media (hover:hover) { .bx-week-day-actions button:hover:not(:disabled), .bx-week-remove:hover:not(:disabled) { background:#f6ead4; } }
@media (max-width:1250px) { .bx-week-layout { grid-template-columns:minmax(0,1.5fr) minmax(270px,1fr); gap:16px; } .bx-week-day { grid-template-columns:minmax(0,1fr); gap:12px; } .bx-week-day-content { border-left:0; padding-left:0; } .bx-week-day-heading { align-items:center; } .bx-week-day-heading > div { display:flex; align-items:center; gap:10px; } .bx-week-day-heading h3 { margin:0; } .bx-week-card { padding:18px; } }
@media (max-width:950px) { .bx-week-layout { grid-template-columns:minmax(0,1fr); } .bx-week-summary-column { grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; } }
@media (max-width:650px) { .bx-week-page { padding:22px 16px 28px; } .bx-week-summary-column { grid-template-columns:minmax(0,1fr); } .bx-week-card-title h2 { font-size:21px; } .bx-week-tabs > div { flex:1 1 44%; } .bx-private .bx-week-tab [data-bx-part='button'] { padding-right:8px !important; } .bx-week-bottom { flex-direction:column-reverse; } .bx-week-interval { gap:8px; } .bx-week-interval > svg { display:none; } .bx-week-time { font-size:9px; } }
`;
