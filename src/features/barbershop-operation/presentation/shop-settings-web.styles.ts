export const shopSettingsStyles = `
.bx-shop-settings-page { width:100%; min-height:100%; max-width:1600px; margin:0 auto; padding:24px clamp(20px,2.8vw,40px) 32px; color:var(--bx-ink); font-family:var(--bx-font); background:var(--bx-canvas); }
.bx-shop-settings-page *, .bx-shop-settings-page *::before, .bx-shop-settings-page *::after { box-sizing:border-box; }
.bx-shop-settings-header { position:relative; isolation:isolate; padding:18px 0 18px; border-bottom:1px solid var(--bx-line); }
.bx-shop-settings-header::before { content:''; position:absolute; top:0; left:0; height:6px; width:68px; border-radius:8px; background:linear-gradient(90deg,#bd8639,#d8af6f); }
.bx-shop-settings-header::after { content:''; z-index:-1; position:absolute; pointer-events:none; right:0; top:-110px; width:330px; height:190px; border-bottom:1px solid #d6b77f33; border-radius:50%; transform:rotate(20deg); box-shadow:0 10px 0 -1px #f8f5ef,0 11px 0 #d6b77f33,0 20px 0 -1px #f8f5ef,0 21px 0 #d6b77f33; }
.bx-shop-settings-header h1 { margin:0 0 4px; font-size:clamp(28px,2.6vw,38px); font-weight:750; line-height:1.15; letter-spacing:-.035em; overflow-wrap:anywhere; }
.bx-shop-settings-header p { margin:0; font-size:14px; line-height:1.5; color:var(--bx-muted); }
.bx-shop-settings-context { margin-top:8px; padding:0; border:0; background:transparent; color:var(--bx-action); font:inherit; font-size:12px; text-decoration:underline; text-underline-offset:3px; cursor:pointer; min-height:28px; }
.bx-shop-settings-tabs { display:flex; gap:10px; flex-wrap:wrap; padding:14px 0; }
.bx-shop-settings-tab { position:relative; min-width:0; }
.bx-shop-settings-tab > svg { position:absolute; top:calc(50% - 9px); left:14px; z-index:1; width:18px; height:18px; pointer-events:none; color:var(--bx-action); }
.bx-private .bx-shop-settings-tab [data-bx-part='button'] { padding:10px 16px 10px 42px !important; min-height:42px; border-radius:12px !important; }
.bx-private .bx-shop-settings-tab [data-bx-part='button'][aria-pressed='true'] { background:linear-gradient(130deg,#986323,#734816) !important; border-color:#a97735 !important; opacity:1; }
.bx-private .bx-shop-settings-tab [aria-pressed='true'] [data-bx-part='text'] { color:#fff9ef !important; }
.bx-shop-settings-tab:has([aria-pressed='true']) > svg { color:#fff1d8; }
.bx-shop-settings-feedback:empty { display:none; }
.bx-shop-settings-feedback { margin-bottom:12px; }
.bx-shop-settings-grid { display:grid; grid-template-columns:minmax(0,2.05fr) minmax(280px,1fr); gap:20px; align-items:stretch; }
.bx-shop-settings-left, .bx-shop-settings-right { display:flex; flex-direction:column; gap:18px; min-width:0; }
.bx-shop-settings-card { min-width:0; padding:20px; border:1px solid #e4d8c9; border-radius:17px; background:linear-gradient(120deg,#fffdfa,#fcf9f4); box-shadow:0 4px 14px #56381307; }
.bx-shop-settings-card-heading { display:flex; align-items:center; gap:18px; margin-bottom:18px; position:relative; isolation:isolate; }
.bx-shop-settings-left .bx-shop-settings-card-heading::after { content:''; position:absolute; z-index:-1; right:-14px; top:-10px; width:140px; height:70px; border-top-right-radius:12px; border-bottom-left-radius:100%; background:linear-gradient(125deg,#b2884520,#a16e2e66); pointer-events:none; }
.bx-shop-settings-card-heading > span { display:grid; place-items:center; flex:none; width:58px; height:58px; border-radius:14px; background:linear-gradient(130deg,#f7ead2,#f2e2c7); color:var(--bx-action); }
.bx-shop-settings-card-heading > span svg { width:32px; height:32px; }
.bx-shop-settings-card-heading > div { min-width:0; }
.bx-shop-settings-left .bx-shop-settings-card-heading > div { border-left:1px solid #deceb7; padding-left:18px; }
.bx-shop-settings-card-heading h2 { margin:0 0 5px; font-size:20px; font-weight:700; letter-spacing:-.025em; line-height:1.25; }
.bx-shop-settings-card-heading p { margin:0; font-size:12px; color:var(--bx-muted); line-height:1.5; }
.bx-shop-settings-field { display:flex; flex-direction:column; gap:7px; min-width:0; font-size:12px; line-height:1.4; font-weight:600; }
.bx-shop-settings-field > input, .bx-shop-settings-input { width:100%; min-width:0; min-height:44px; border:1px solid #cdbfae; border-radius:10px; background:#fffdfa; }
.bx-shop-settings-page input { color:var(--bx-ink); font:inherit; font-size:14px; font-weight:400; padding:10px 12px; }
.bx-shop-settings-page input:disabled { color:var(--bx-muted); background:#f3eee5; cursor:not-allowed; }
.bx-shop-settings-page input:focus { border-color:#9a6b2d; outline:2px solid #b38b4c; outline-offset:2px; }
.bx-shop-settings-input { display:flex; align-items:center; padding-left:12px; }
.bx-shop-settings-input svg { color:var(--bx-action); width:18px; height:18px; flex:none; }
.bx-shop-settings-input input { border:0; min-width:0; width:100%; border-radius:10px; min-height:42px; background:transparent; }
.bx-shop-settings-contact-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
.bx-shop-settings-name { margin-bottom:16px; }
.bx-shop-settings-name > p { font-size:12px; line-height:1.5; }
.bx-shop-settings-rename { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:8px; flex-wrap:wrap; }
.bx-shop-settings-rename p { margin:0; font-size:11px; line-height:1.5; color:var(--bx-muted); }
.bx-private .bx-shop-settings-rename [data-bx-part='button'] { min-height:36px; padding:6px 10px !important; }
.bx-shop-settings-rules-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px 20px; }
.bx-shop-settings-rule { min-width:0; }
.bx-shop-settings-rule label { display:flex; align-items:flex-start; gap:8px; min-height:32px; font-size:12px; line-height:1.35; font-weight:600; margin-bottom:6px; }
.bx-shop-settings-rule label svg { flex:none; width:17px; height:17px; color:var(--bx-action); }
.bx-shop-settings-number { display:flex; min-height:40px; border-radius:10px; border:1px solid #ded2c3; background:#f3ece1; }
.bx-shop-settings-number input { width:100%; min-width:0; border:0; border-radius:9px; background:#fffdfa; padding:8px 10px; }
.bx-shop-settings-number > span { display:grid; place-items:center; flex:none; padding:0 10px; font-size:11px; color:var(--bx-muted); font-weight:600; }
.bx-shop-settings-rule p { margin:7px 0 0; font-size:11px; line-height:1.5; color:var(--bx-muted); }
.bx-shop-settings-readiness { position:relative; overflow:hidden; }
.bx-shop-settings-right .bx-shop-settings-card-heading { align-items:flex-start; gap:12px; margin-bottom:12px; }
.bx-shop-settings-right .bx-shop-settings-card-heading > span { width:42px; height:42px; border-radius:11px; }
.bx-shop-settings-right .bx-shop-settings-card-heading svg { width:25px; height:25px; }
.bx-shop-settings-right .bx-shop-settings-card-heading h2 { font-size:18px; }
.bx-shop-settings-badge { display:inline-flex; margin-left:54px; padding:4px 10px; border-radius:16px; font-size:11px; font-weight:600; background:#f2e4cc; color:#725122; }
.bx-shop-settings-badge--published { color:#285638; background:#e5efe0; }
.bx-shop-settings-readiness ul { position:relative; z-index:1; display:grid; gap:13px; list-style:none; padding:16px 0 0; margin:16px 0 0; border-top:1px solid #e5d9c9; }
.bx-shop-settings-readiness li { display:flex; align-items:center; gap:12px; font-size:13px; font-weight:550; }
.bx-shop-settings-check { display:grid; place-items:center; width:17px; height:17px; flex:none; border:1.5px solid #b29b79; border-radius:50%; color:#8e672b; font-size:12px; }
.bx-shop-settings-check.is-complete { background:#e7efdf; border-color:#5b7d43; color:#3e6430; }
.bx-shop-settings-readiness small { display:block; font-size:10px; font-weight:400; color:var(--bx-muted); margin-top:2px; }
.bx-shop-settings-readiness::after { content:''; position:absolute; right:12px; bottom:42px; width:44px; height:100px; opacity:.08; border:5px solid #a77a34; border-radius:25px 25px 8px 8px; background:repeating-linear-gradient(-35deg,transparent 0 12px,#a77a34 13px 24px,transparent 25px 30px); pointer-events:none; }
.bx-shop-settings-server-note { position:relative; margin:15px 0 0; font-size:10px; color:var(--bx-muted); line-height:1.5; }
.bx-shop-settings-publication { flex:1; }
.bx-shop-settings-publication-actions { display:grid; gap:12px; margin-top:20px; }
.bx-shop-settings-icon-action { position:relative; min-width:0; color:white; }
.bx-shop-settings-icon-action > svg { position:absolute; z-index:1; pointer-events:none; left:15px; top:calc(50% - 10px); width:20px; height:20px; }
.bx-private .bx-shop-settings-icon-action > [data-bx-part='button'] { width:100%; min-height:46px; padding:11px 12px 11px 40px !important; border-radius:11px !important; }
.bx-shop-settings-icon-action:has([data-bx-variant='secondary']), .bx-shop-settings-icon-action.is-secondary { color:var(--bx-action); }
.bx-shop-settings-icon-action.is-danger { color:var(--bx-error); }
.bx-shop-settings-icon-action:has([aria-disabled='true']) > svg { opacity:.4; }
.bx-shop-settings-warning { font-size:12px; color:var(--bx-muted); line-height:1.6; margin:15px 0 0; }
.bx-shop-settings-error { color:var(--bx-error); }
.bx-shop-settings-bottom { display:flex; justify-content:center; gap:14px; margin-top:20px; padding:12px clamp(14px,10vw,140px); border:1px solid #e8dfd4; border-radius:16px; background:#fffdfa; box-shadow:0 3px 14px #56381307; }
.bx-shop-settings-bottom > div { flex:1; min-width:0; }
.bx-shop-settings-extras { display:grid; gap:20px; margin-top:24px; }
@media (hover:hover) { .bx-shop-settings-page [data-bx-part='button']:hover:not([aria-disabled='true']) { filter:brightness(.97); } }
@media (max-width:1250px) { .bx-shop-settings-grid { grid-template-columns:minmax(0,1.5fr) minmax(265px,1fr); gap:16px; } .bx-shop-settings-rules-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px 16px; } .bx-shop-settings-card { padding:18px; } .bx-shop-settings-card-heading h2 { font-size:18px; } .bx-shop-settings-card-heading > span { width:48px; height:48px; } .bx-shop-settings-bottom { padding-inline:20px; } }
@media (max-width:1000px) { .bx-shop-settings-grid { grid-template-columns:minmax(0,1fr); } .bx-shop-settings-right { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); align-items:stretch; } .bx-shop-settings-rules-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media (max-width:650px) { .bx-shop-settings-page { padding:22px 16px 28px; } .bx-shop-settings-tabs { gap:8px; } .bx-shop-settings-tabs > div { flex:1 1 45%; } .bx-private .bx-shop-settings-tabs [data-bx-part='button'] { padding-right:8px !important; } .bx-shop-settings-contact-grid, .bx-shop-settings-right { grid-template-columns:minmax(0,1fr); } .bx-shop-settings-rules-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .bx-shop-settings-bottom { flex-direction:column; padding:12px; } .bx-shop-settings-card-heading { gap:12px; } .bx-shop-settings-left .bx-shop-settings-card-heading > div { padding-left:12px; } }
@media (max-width:400px) { .bx-shop-settings-rules-grid { grid-template-columns:minmax(0,1fr); } .bx-shop-settings-rule label { min-height:0; } .bx-shop-settings-card-heading > span { width:40px; height:40px; } .bx-shop-settings-card-heading > span svg { width:25px; height:25px; } }
`;
