export const availabilityToolsStyles = `
.bx-date-tools { --date-line:#e6d7c1; --date-gold:#a7772d; width:100%; margin-top:32px; padding:clamp(18px,2vw,30px); border-radius:24px; color:var(--bx-ink,#29231c); background:radial-gradient(ellipse at 100% 0,#eddfc740,transparent 43%),#faf7f1; font-family:var(--bx-font,Outfit,sans-serif); }
.bx-date-tools * { box-sizing:border-box; min-width:0; }
.bx-date-tools svg { width:21px; height:21px; flex:none; }
.bx-date-heading { position:relative; isolation:isolate; overflow:hidden; display:flex; align-items:center; gap:14px; padding:8px 0 24px; }
.bx-date-heading:after { content:''; position:absolute; z-index:-1; right:-40px; top:-140px; width:330px; height:230px; border:1px solid #bc944044; border-radius:50%; transform:rotate(-22deg); box-shadow:0 20px 0 #cda8660a,0 40px 0 #cda86608; }
.bx-date-heading > div { border-left:1px solid #c8a365; padding-left:14px; }
.bx-date-tools h2,.bx-date-tools h3,.bx-date-tools p { margin:0; }
.bx-date-heading h2 { font-size:22px; font-weight:700; letter-spacing:-.025em; line-height:1.25; }
.bx-date-heading p { margin-top:5px; font-size:12px; color:var(--bx-muted,#746754); line-height:1.5; }
.bx-date-icon { display:grid; place-items:center; width:48px; height:48px; flex:none; border:1px solid #e7d3ae; border-radius:13px; background:linear-gradient(135deg,#fff1cf,#f5e6c7); color:#90631e; box-shadow:0 3px 7px #67461d08; }
.bx-date-icon--gold { background:linear-gradient(135deg,#c99d56,#704514 85%); color:#fff0c7; border-color:#bd995c; box-shadow:inset 0 1px 0 #fff5cc99,0 4px 10px #68401412; }
.bx-date-icon--gold svg { width:24px; height:24px; }
.bx-date-guide { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; margin:10px 0 26px; }
.bx-date-guide article { display:flex; gap:18px; align-items:flex-start; padding:22px; border:1px solid var(--date-line); border-radius:18px; background:linear-gradient(120deg,#fffdf9,#fbf7f0); box-shadow:0 4px 12px #60401d08; }
.bx-date-guide h3 { font-size:14px; font-weight:650; line-height:1.3; }
.bx-date-guide p { font-size:13px; line-height:1.65; margin-top:8px; color:#5e5549; }
.bx-date-guidance { display:flex; align-items:center; gap:16px; padding:17px 22px; margin-bottom:24px; border:1px solid #e7cb99; border-radius:14px; background:#f8ecd6; color:#6e4a1f; }
.bx-date-guidance p { font-size:12px; font-weight:500; line-height:1.6; }
.bx-date-layout { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(0,1fr); align-items:start; gap:22px; }
.bx-date-sidebar { display:grid; gap:20px; }
.bx-date-form,.bx-date-closures { padding:22px; background:linear-gradient(130deg,#fffdf9,#faf5ec); border:1px solid var(--date-line); border-radius:20px; box-shadow:0 5px 15px #63401c0b; }
.bx-date-form { display:grid; gap:21px; }
.bx-date-panel-heading { position:relative; isolation:isolate; overflow:hidden; display:flex; align-items:center; gap:18px; padding:5px 0 22px; border-bottom:1px solid #e9dfd0; }
.bx-date-panel-heading:after { content:''; position:absolute; z-index:-1; right:-70px; top:-120px; width:250px; height:190px; border:1px solid #cfa45a3b; border-radius:50%; transform:rotate(-20deg); box-shadow:0 12px 0 #e5ca9a16,0 24px 0 #e5ca9a12; }
.bx-date-panel-heading h2 { font-size:22px; font-weight:700; letter-spacing:-.025em; line-height:1.25; }
.bx-date-panel-heading p { margin-top:5px; font-size:12px; line-height:1.5; color:#71634e; }
.bx-date-tools .bx-availability-help { display:none; }
.bx-date-tools .bx-availability-scope { gap:16px; }
.bx-date-tools .bx-availability-impact { padding:16px; gap:14px; background:#f9ecd5; border-color:#e9ce9f; }
.bx-date-tools .bx-availability-impact > svg { width:24px; height:24px; padding:4px; box-sizing:content-box; background:#f7e4bc; border-radius:10px; }
.bx-date-times { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
.bx-date-tools .bx-date-times label,.bx-date-tools .bx-date-form label { width:100%; margin:0; font-size:13px; line-height:1.45; }
.bx-date-tools .bx-date-form select,.bx-date-tools .bx-date-form input { min-height:46px; border-color:#d8c4a7; border-radius:11px; background:#fffdf9; font-size:13px; font-weight:500; }
.bx-date-note { display:flex; align-items:flex-start; gap:12px; padding:15px; border:1px solid #ecdfca; background:#fbf3e6; border-radius:12px; }
.bx-date-note > svg { color:#a67428; }
.bx-date-note p { font-size:12px; line-height:1.65; color:#675a45; }
.bx-date-tools .bx-date-submit { position:relative; width:100%; }
.bx-date-submit-icon { position:absolute; z-index:1; left:18px; top:50%; transform:translateY(-50%); display:flex; color:#fff0cb; pointer-events:none; }
.bx-date-tools .bx-date-submit [data-bx-part=button] { width:100%; min-height:50px; padding-inline:50px !important; background:linear-gradient(115deg,#a9752e,#674015) !important; }
.bx-date-tools .bx-date-submit [data-bx-part=text] { font-size:13px !important; }
.bx-date-tools .bx-self-schedule { gap:16px; }
.bx-date-tools .bx-availability-personal { padding:22px; background:linear-gradient(125deg,#fffdf9,#faf4e9); border-color:var(--date-line); box-shadow:0 5px 15px #63401c0b; }
.bx-date-tools .bx-availability-personal header { align-items:center; gap:18px; }
.bx-date-tools .bx-availability-personal header .bx-self-schedule-icon { width:48px; height:48px; border-radius:13px; color:#ffefbd; background:linear-gradient(135deg,#c99d56,#704514); }
.bx-date-tools .bx-availability-personal h2 { font-size:22px; font-weight:700; letter-spacing:-.025em; line-height:1.25; }
.bx-date-tools .bx-availability-personal header p { font-size:12px; line-height:1.5; }
.bx-date-personal-facts { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:15px; margin:0; padding:16px; border-radius:13px; background:#f5ecdd; }
.bx-date-personal-facts > div + div { padding-left:16px; border-left:1px solid #dcc7a4; }
.bx-date-personal-facts dt { font-size:12px; color:#786951; }
.bx-date-personal-facts dd { margin:6px 0 0; font-size:14px; font-weight:600; }
.bx-date-tools .bx-availability-personal [data-bx-part=button] { min-height:44px; width:100%; }
.bx-date-closures { position:relative; }
.bx-date-closures-icon { position:absolute; top:22px; left:22px; }
.bx-date-tools .bx-date-closures > [data-bx-part=section] { padding:0 !important; border:0 !important; background:transparent !important; box-shadow:none !important; gap:17px !important; }
.bx-date-tools .bx-date-closures > [data-bx-part=section] > [role=heading] { padding-left:62px; min-height:48px; display:flex; align-items:center; font-size:22px !important; line-height:1.25 !important; }
.bx-date-closures [data-bx-part=button] { min-height:46px; }
.bx-date-empty { display:flex; flex-direction:column; align-items:center; gap:16px; padding:30px 18px; text-align:center; border:1px solid #e6d2b1; background:#faf1e3; border-radius:15px; }
.bx-date-empty > svg { width:32px; height:32px; color:#c3a168; }
.bx-date-empty p { font-size:13px; color:#796951; line-height:1.6; }
.bx-date-tools .bx-availability-personal [data-bx-part=button],.bx-date-closures > [data-bx-part=section] > [data-bx-part=button] { position:relative; padding-right:42px !important; }
.bx-date-tools .bx-availability-personal [data-bx-part=button]:after,.bx-date-closures > [data-bx-part=section] > [data-bx-part=button]:after { content:'→'; position:absolute; right:16px; top:50%; transform:translateY(-50%); font-size:18px; color:inherit; }
.bx-date-tools [data-bx-part=button]:not([aria-disabled=true]):not(:disabled):hover { filter:brightness(.97); }
.bx-date-tools .bx-date-submit [data-bx-part=button][aria-disabled=true],.bx-date-tools .bx-date-submit [data-bx-part=button]:disabled { background:#e6dfd3 !important; }
.bx-date-tools button:focus-visible,.bx-date-tools input:focus-visible,.bx-date-tools select:focus-visible { outline:2px solid #96641e; outline-offset:3px; }
@media(max-width:1250px) { .bx-date-guide article { padding:18px; gap:12px; } .bx-date-guide .bx-date-icon { width:40px; height:40px; border-radius:12px; } .bx-date-guide h3 { font-size:14px; } .bx-date-layout { gap:18px; } .bx-date-panel-heading h2,.bx-date-tools .bx-availability-personal h2,.bx-date-tools .bx-date-closures > [data-bx-part=section] > [role=heading] { font-size:22px !important; } }
@media(max-width:1000px) { .bx-date-guide { grid-template-columns:1fr; gap:12px; } .bx-date-layout { grid-template-columns:1fr; } .bx-date-sidebar { grid-template-columns:1fr; } }
.bx-date-tools .bx-date-form > [data-bx-part=text],.bx-date-tools .bx-date-closures > [data-bx-part=section] > [data-bx-part=text]:not([role=heading]) { font-size:13px !important; line-height:1.6 !important; }
@media(max-width:650px) { .bx-date-heading h2,.bx-date-panel-heading h2,.bx-date-tools .bx-availability-personal h2,.bx-date-tools .bx-date-closures > [data-bx-part=section] > [role=heading] { font-size:21px !important; } }
@media(max-width:600px) { .bx-date-tools { padding:16px; } .bx-date-heading { gap:14px; } .bx-date-heading > div { padding-left:14px; } .bx-date-heading h2 { font-size:21px; } .bx-date-heading p { font-size:12px; } .bx-date-heading > .bx-date-icon { width:40px; height:40px; } .bx-date-form,.bx-date-closures,.bx-date-tools .bx-availability-personal { padding:18px; } .bx-date-times { grid-template-columns:1fr; } .bx-date-panel-heading { align-items:flex-start; gap:12px; } .bx-date-panel-heading .bx-date-icon { width:40px; height:40px; } .bx-date-closures-icon { left:18px;top:18px;width:46px;height:46px; } .bx-date-tools .bx-date-closures > [data-bx-part=section] > [role=heading] { padding-left:54px;min-height:40px; } }
`;
