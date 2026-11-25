export const contextContentStyles = `
.bx-context-agenda {display:flex;align-items:center;gap:20px;margin-top:22px;padding:24px;border:1px solid #d7be98;border-radius:18px;background:linear-gradient(115deg,#fffdfa,#f6eddf);}
.bx-context-agenda > div {flex:1;min-width:0;}
.bx-context-agenda h2 {font-size:21px;margin:5px 0 8px;line-height:1.3;}
.bx-context-agenda p {max-width:65ch;margin:0;color:var(--bx-muted);font-size:14px;line-height:1.6;}
.bx-context-eyebrow {color:var(--bx-action);font-size:11px;font-weight:700;letter-spacing:.08em;}
.bx-context-agenda [data-bx-part='button'] {flex-shrink:0;max-width:340px;}
@media(max-width:800px){.bx-context-agenda {flex-wrap:wrap;}.bx-context-agenda > div {flex-basis:calc(100% - 70px);}.bx-context-agenda [data-bx-part='button'] {width:100%;max-width:none;}}

.bx-context-page { overflow-x:clip; box-sizing:border-box; position:relative; isolation:isolate; width:100%; max-width:1240px; margin:0 auto; padding:clamp(22px,3.5vw,48px); font-family:var(--bx-font); color:var(--bx-ink); }
.bx-context-page *, .bx-context-page *::before, .bx-context-page *::after { box-sizing:border-box; }
.bx-context-page::before { content:''; position:absolute; z-index:-1; pointer-events:none; top:-165px; right:0; width:440px; height:260px; border-radius:50%; border:1px solid #d8b06d26; box-shadow:0 8px 0 -1px #f8f5ef,0 9px 0 #d8b06d26,0 17px 0 -1px #f8f5ef,0 18px 0 #d8b06d26; transform:rotate(20deg); }
.bx-context-heading { padding-top:18px; position:relative; margin-bottom:32px; }
.bx-context-heading::before { content:''; position:absolute; top:0; left:0; width:58px; height:6px; border-radius:5px; background:linear-gradient(90deg,#a66c28,#c1944b); box-shadow:inset 0 1px 1px #fff7; }
.bx-context-heading h1 { margin:0 0 8px; font-size:clamp(30px,3vw,42px); line-height:1.15; letter-spacing:-.035em; font-weight:750; }
.bx-context-heading p { margin:0; color:var(--bx-muted); font-size:15px; line-height:1.6; max-width:86ch; }
.bx-context-shop { position:relative; isolation:isolate; overflow:hidden; display:flex; align-items:center; gap:30px; padding:30px 36px; min-height:180px; border:1px solid #c8a169; border-radius:19px; background:linear-gradient(120deg,#fffdfa,#f1e7d8); box-shadow:0 7px 24px #6140180b; }
.bx-context-shop::after { content:''; position:absolute; z-index:-1; right:-60px; bottom:-90px; width:370px; height:200px; background:#dfc69c1c; border-radius:50%; transform:rotate(-28deg); }
.bx-context-shop-icon { display:grid; place-items:center; flex:none; width:96px; height:96px; border-radius:22px; color:#eac480; border:1px solid #7a572a; background:linear-gradient(140deg,#573818,#2b1d0c); box-shadow:inset 0 1px 0 #daba7740; }
.bx-context-shop-icon svg { width:55px; height:55px; stroke-width:1.4; }
.bx-context-shop-details { position:relative; min-width:0; padding-left:30px; border-left:1px solid #c7a46c; padding-right:90px; }
.bx-context-shop-details h2 { margin:0 0 12px; font-size:clamp(23px,2.1vw,30px); line-height:1.2; font-weight:700; letter-spacing:-.025em; overflow-wrap:anywhere; }
.bx-context-role { display:inline-flex; align-items:center; gap:9px; padding:6px 12px; color:#654316; font-size:14px; font-weight:650; border-radius:30px; background:#f1dfba; }
.bx-context-role svg { width:18px; height:18px; }
.bx-context-shop-details p { margin:10px 0 0; color:var(--bx-muted); font-size:14px; line-height:1.5; }
.bx-context-pole { position:absolute; right:40px; bottom:18px; width:56px; height:130px; opacity:.22; color:#c5984f; pointer-events:none; }
.bx-context-pole::before { content:''; position:absolute; top:5px; left:6px; width:44px; height:32px; border:4px solid; border-radius:30px 30px 0 0; }
.bx-context-pole i { position:absolute; top:33px; width:56px; height:15px; border:4px solid; border-radius:8px; }
.bx-context-pole span { position:absolute; top:46px; left:8px; width:40px; height:80px; border-inline:4px solid; background:repeating-linear-gradient(-38deg,transparent 0 14px,#c5984f 15px 24px,transparent 25px 29px); }
.bx-context-info-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; margin-top:26px; }
.bx-context-info { display:flex; align-items:flex-start; gap:18px; min-width:0; padding:24px; border:1px solid var(--bx-line); border-radius:18px; background:linear-gradient(120deg,#fffdfa,#f8f4ed); box-shadow:0 4px 16px #51351206; }
.bx-context-info > div { min-width:0; }
.bx-context-info-icon { display:grid; place-items:center; flex:none; width:48px; height:48px; color:var(--bx-action); border:1px solid #e8c991; border-radius:12px; background:linear-gradient(140deg,#fff8e9,#f8e9ca); }
.bx-context-info-icon svg { width:28px; height:28px; }
.bx-context-info h2 { margin:5px 0 12px; font-size:20px; line-height:1.3; letter-spacing:-.02em; font-weight:650; }
.bx-context-info p, .bx-context-info li { margin:0; font-size:14px; line-height:1.65; color:var(--bx-muted); overflow-wrap:anywhere; }
.bx-context-info ul { display:grid; gap:6px; padding:0; margin:0; list-style:none; }
.bx-context-info li { display:flex; gap:10px; align-items:flex-start; }
.bx-context-info li::before { content:'✓'; flex:none; display:grid; place-items:center; width:18px; height:18px; margin-top:2px; border:1px solid #bd9656; border-radius:50%; color:#805421; background:#f5e5c3; font-size:12px; font-weight:700; }
.bx-context-divider { display:flex; align-items:center; gap:22px; margin:28px 18px 24px; color:#bc934e; }
.bx-context-divider::before, .bx-context-divider::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,#d0ac6c88,#e6d4b3); }
.bx-context-divider svg { width:28px; height:28px; }
.bx-context-actions { display:flex; justify-content:center; gap:22px; max-width:920px; margin-inline:auto; }
.bx-context-action { position:relative; flex:1; min-width:0; color:white; }
.bx-context-action > svg { position:absolute; left:24px; top:calc(50% - 12px); width:24px; height:24px; z-index:1; pointer-events:none; }
.bx-private .bx-context-action > [data-bx-part='button'] { width:100%; min-height:56px; padding:14px 26px 14px 60px !important; border-radius:14px !important; }
.bx-private .bx-context-action [data-bx-part='text'] { font-size:16px !important; line-height:1.4 !important; }
.bx-private .bx-context-action--secondary > [data-bx-part='button'] { background:transparent !important; border-color:#bd904b !important; }
.bx-context-action--secondary { color:var(--bx-action); }
.bx-context-action:has([aria-disabled='true']) > svg { opacity:.4; }
.bx-context-return { display:flex; align-items:center; justify-content:center; gap:8px; margin-top:24px; }
.bx-context-return > svg { width:22px; height:22px; color:var(--bx-action); }
.bx-private .bx-context-return > [data-bx-part='button'] { min-height:44px; padding-inline:0 !important; border:0 !important; background:transparent !important; border-radius:0 !important; box-shadow:none; }
.bx-context-return [data-bx-part='text'] { text-decoration:underline; text-underline-offset:7px; text-decoration-color:#b68a47; }
.bx-context-choice > p { font-size:15px; color:var(--bx-muted); }
.bx-context-choice-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr)); gap:20px; }
.bx-context-option { min-width:0; padding:24px; border:1px solid var(--bx-line); border-radius:18px; background:var(--bx-panel); }
.bx-context-option > svg { width:32px; height:32px; color:var(--bx-action); }
.bx-context-option h2 { font-size:21px; overflow-wrap:anywhere; }
.bx-context-option p { font-size:14px; color:var(--bx-muted); }
.bx-context-message { display:flex; align-items:center; gap:18px; padding:28px; border:1px solid var(--bx-line); border-radius:18px; background:var(--bx-panel); }
.bx-context-message p { margin:0; font-size:15px; line-height:1.6; }
.bx-context-message > svg { color:var(--bx-action); width:32px; height:32px; }
.bx-context-message--error { color:var(--bx-error); }
@media (hover:hover) { .bx-context-page [data-bx-part='button']:hover:not([aria-disabled='true']) { filter:brightness(.97); } }
@media (max-width:1000px) { .bx-context-info { padding:20px; gap:12px; } .bx-context-info h2 { font-size:18px; } .bx-context-actions { gap:16px; } .bx-context-action > svg { left:16px; } .bx-private .bx-context-action > [data-bx-part='button'] { padding-left:48px !important; padding-right:16px !important; } }
@media (max-width:700px) { .bx-context-page { padding:24px 18px; } .bx-context-heading { margin-bottom:24px; } .bx-context-shop { padding:24px; gap:20px; } .bx-context-shop-icon { width:72px; height:72px; border-radius:17px; } .bx-context-shop-icon svg { width:42px; height:42px; } .bx-context-shop-details { padding-left:20px; padding-right:0; } .bx-context-pole { right:16px; opacity:.1; } .bx-context-info-grid { grid-template-columns:minmax(0,1fr); gap:16px; margin-top:20px; } .bx-context-actions { flex-direction:column; gap:12px; } .bx-context-divider { margin:24px 0; } .bx-context-return { margin-top:18px; } }
@media (max-width:420px) { .bx-context-shop { align-items:flex-start; flex-direction:column; } .bx-context-shop-details { border:0; padding:0; } .bx-context-info-icon { width:40px; height:40px; } .bx-context-info { padding:18px; } }
`;
