export const agendaWebStyles = `
.bx-agenda-list:has(> .bx-agenda-professional) {display:flex;flex-direction:column;gap:18px;}
.bx-agenda-professional {min-width:0;border:1px solid var(--bx-line);border-radius:18px;background:var(--bx-panel);overflow:hidden;}
.bx-agenda-professional > summary {display:flex;align-items:center;gap:12px;padding:18px 20px;cursor:pointer;list-style:none;background:linear-gradient(110deg,#f9eedc,#fffdfa);}
.bx-agenda-professional > summary::-webkit-details-marker {display:none;}
.bx-agenda-professional > summary:focus-visible {outline:3px solid var(--bx-action);outline-offset:-4px;}
.bx-agenda-professional > summary strong {flex:1;overflow-wrap:anywhere;font-size:18px;}
.bx-agenda-professional-avatar {display:grid;place-items:center;width:38px;height:38px;flex:none;border-radius:50%;background:#efddb8;color:#79501d;font-weight:700;}
.bx-agenda-count {padding:5px 10px;border-radius:20px;background:#f1dfbc;color:#674316;font-size:13px;white-space:nowrap;}
.bx-agenda-chevron {font-size:22px;}
.bx-agenda-professional[open] > summary .bx-agenda-chevron {transform:rotate(180deg);}
.bx-agenda-professional-list {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;padding:16px;align-items:start;}
@media(max-width:1000px){.bx-agenda-professional-list{grid-template-columns:minmax(0,1fr);}}
@media(max-width:520px){.bx-agenda-professional > summary{padding:14px;gap:8px;}.bx-agenda-professional-list{padding:10px;}}

.bx-agenda-page { width:100%; max-width:1420px; margin:0 auto; padding:28px clamp(18px,3vw,40px) 40px; background:var(--bx-canvas); color:var(--bx-ink); font-family:var(--bx-font); }
.bx-agenda-page * { box-sizing:border-box; }
.bx-agenda-page h1,.bx-agenda-page h2,.bx-agenda-page h3,.bx-agenda-page p { margin:0; }
.bx-agenda-heading { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:18px; padding:16px 0 24px; position:relative; }
.bx-agenda-heading:before { content:''; width:58px; height:5px; position:absolute; top:0; border-radius:5px; background:var(--bx-action); }
.bx-agenda-heading h1 { font-size:clamp(27px,3vw,36px); letter-spacing:-.035em; margin-bottom:8px; }
.bx-agenda-heading p,.bx-agenda-help { font-size:13px; line-height:1.6; color:var(--bx-muted); }
.bx-agenda-card { background:linear-gradient(120deg,#fffdfa,#fcf8f0); padding:22px; border:1px solid var(--bx-line); border-radius:18px; box-shadow:0 4px 18px #52351208; margin-bottom:24px; }
.bx-agenda-page h2 { font-size:20px; letter-spacing:-.02em; }
.bx-agenda-query { display:flex; align-items:end; flex-wrap:wrap; gap:14px; margin:18px 0; }
.bx-agenda-query label { flex:1 1 230px; max-width:400px; }
.bx-agenda-page label { display:grid; gap:8px; font-size:13px; font-weight:600; min-width:0; }
.bx-agenda-page input[type=date],.bx-agenda-page select { width:100%; min-height:44px; min-width:0; max-width:100%; padding:10px 12px; border:1px solid var(--bx-line); border-radius:11px; background:#fffdfa; color:var(--bx-ink); font:inherit; font-size:14px; }
.bx-agenda-page select:disabled,.bx-agenda-page input:disabled { opacity:.6; }
.bx-agenda-filters { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; max-width:850px; }
.bx-agenda-details { margin-top:18px; border-top:1px solid var(--bx-line); padding-top:14px; }
.bx-agenda-page summary { cursor:pointer; color:var(--bx-action); font-size:14px; font-weight:600; padding:8px 0; }
.bx-agenda-page summary:focus-visible { outline:2px solid var(--bx-action); outline-offset:4px; border-radius:5px; }
.bx-agenda-details-body { padding-top:14px; }
.bx-agenda-care-filters > div { margin-bottom:14px; }
.bx-agenda-care-filters .bx-agenda-help { margin-top:12px; }
.bx-agenda-results-heading { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px; }
.bx-agenda-results-heading > span { color:var(--bx-action); background:#f6e8cf; border-radius:20px; padding:6px 12px; font-size:12px; }
.bx-agenda-help { margin-bottom:16px !important; }
.bx-agenda-empty,.bx-agenda-message { padding:24px; border:1px solid var(--bx-line); background:#fffdfa; border-radius:16px; margin:16px 0; }
.bx-agenda-empty h3 { font-size:17px; margin-bottom:8px; }
.bx-agenda-empty p { font-size:14px; color:var(--bx-muted); line-height:1.6; }
.bx-agenda-error { background:#fff3ef; color:#9e2626; }
.bx-agenda-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; margin:18px 0 24px; }
.bx-private .bx-agenda-list [data-bx-part=panel] { min-width:0; margin:0; border-radius:16px; padding:20px; background:#fffdfa; box-shadow:0 4px 16px #52351207; }
.bx-agenda-list [data-bx-part=text] { overflow-wrap:anywhere; }
.bx-private .bx-agenda-page [data-bx-part=button] { min-height:42px; padding:10px 16px; border-radius:11px; }
.bx-agenda-settings summary strong { font-size:17px; color:var(--bx-ink); }
.bx-agenda-settings summary span { display:block; margin:6px 0 0 18px; font-size:12px; color:var(--bx-muted); font-weight:400; }
.bx-agenda-settings-body { display:grid; gap:24px; border-top:1px solid var(--bx-line); margin-top:14px; padding-top:20px; }
.bx-agenda-settings-body > div { gap:10px; min-width:0; }
@media(max-width:1000px) { .bx-agenda-list { grid-template-columns:1fr; } }
@media(max-width:600px) { .bx-agenda-page { padding:20px 16px; } .bx-agenda-card { padding:16px; } .bx-agenda-filters { grid-template-columns:1fr; } .bx-agenda-query > label { max-width:none; } .bx-agenda-query > div { width:100%; } }
`;
