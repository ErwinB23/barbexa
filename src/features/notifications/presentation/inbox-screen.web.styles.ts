export const inboxStyles = `
.bx-inbox-delete{display:inline-grid;place-items:center;flex:none;min-width:40px;min-height:40px;border:1px solid #e4c7ba;border-radius:11px;background:#fff6ef;color:#a04a30;cursor:pointer;}
.bx-inbox-delete svg{width:19px;height:19px;}.bx-inbox-delete:hover:not(:disabled){background:#fbe6da;border-color:#bd7256;}.bx-inbox-delete:disabled{opacity:.45;cursor:default;}.bx-inbox-delete:focus-visible,.bx-notice-decision button:focus-visible{outline:3px solid #ab7833;outline-offset:3px;}


.bx-inbox { width:100%; max-width:1500px; margin:0 auto; padding:26px clamp(20px,3vw,44px) 40px; color:var(--bx-ink); background:var(--bx-canvas); font-family:var(--bx-font); }
.bx-inbox *,.bx-inbox *::before { box-sizing:border-box; }
.bx-inbox h1,.bx-inbox h2,.bx-inbox h3,.bx-inbox p { margin:0; }
.bx-inbox svg { width:20px; height:20px; flex:none; }
.bx-inbox-ornament { display:flex; align-items:center; justify-content:center; gap:18px; width:min(460px,65%); margin:0 auto 24px; color:#bd8b36; }
.bx-inbox-ornament > span { height:1px; flex:1; background:linear-gradient(90deg,transparent,#bb872c); }
.bx-inbox-ornament > span:last-child { transform:rotate(180deg); }
.bx-inbox-ornament svg { width:30px; height:30px; }
.bx-inbox-heading h1 { font-size:clamp(28px,2.7vw,38px); font-weight:750; line-height:1.15; letter-spacing:-.035em; margin-bottom:10px; }
.bx-inbox-heading p { color:var(--bx-muted); font-size:15px; line-height:1.6; }
.bx-inbox-toolbar { display:flex; align-items:center; flex-wrap:wrap; gap:16px; padding:26px 0; margin-bottom:26px; border-bottom:1px solid var(--bx-line); }
.bx-inbox-count { display:inline-flex; align-items:center; gap:9px; padding:10px 15px; border-radius:30px; border:1px solid #edd09c; background:#ffedc9; font-size:14px; font-weight:650; white-space:nowrap; }
.bx-inbox-count svg { color:var(--bx-action); }
.bx-inbox-filters { display:flex; flex-wrap:wrap; gap:10px; padding-left:20px; border-left:1px solid var(--bx-line); }
.bx-inbox-filters button { display:flex; align-items:center; justify-content:center; gap:8px; min-height:42px; padding:9px 17px; border:1px solid var(--bx-line); border-radius:24px; background:transparent; color:var(--bx-ink); font:inherit; font-size:13px; font-weight:600; cursor:pointer; }
.bx-inbox-filters button[aria-pressed=true] { background:linear-gradient(125deg,#956324,#6a4317); color:#fff9ed; border-color:#ad803e; box-shadow:0 3px 8px #54320e15; }
.bx-inbox-filters button:hover:not([aria-pressed=true]) { background:#f8ecd9; }
.bx-inbox button:focus-visible,.bx-inbox a:focus-visible { outline:2px solid var(--bx-action); outline-offset:3px; }
.bx-inbox-refresh { margin-left:auto; }
.bx-inbox-layout { display:grid; grid-template-columns:minmax(0,2.2fr) minmax(270px,1fr); gap:28px; align-items:start; }
.bx-inbox-main { min-width:0; }
.bx-inbox-main > h2 { font-size:22px; letter-spacing:-.02em; margin-bottom:20px; }
.bx-inbox-list { display:grid; gap:14px; list-style:none; padding:0; margin:0; }
.bx-inbox-card { display:flex; gap:18px; min-width:0; padding:22px; border:1px solid #ebddca; border-radius:17px; background:linear-gradient(120deg,#fffdfa,#fcf8f2); box-shadow:0 4px 15px #57361907; }
.bx-inbox-card--unread { background:linear-gradient(110deg,#fff5e1,#fff8ed); border-color:#e8c68b; border-left:4px solid #bf8a32; padding-left:19px; }
.bx-inbox-card--read { background:linear-gradient(120deg,#f4f1eb,#eeebe5); border-color:#ddd6ca; }
.bx-inbox-card--read .bx-inbox-icon { background:#e8e2d8; color:#7b6b53; }
.bx-inbox-icon { display:grid; place-items:center; flex:none; width:50px; height:50px; border-radius:13px; background:#fceccc; color:var(--bx-action); }
.bx-inbox-icon svg { width:27px; height:27px; }
.bx-inbox-card-body { flex:1; min-width:0; }
.bx-inbox-card-heading { display:flex; align-items:center; flex-wrap:wrap; gap:9px 12px; margin-bottom:11px; }
.bx-inbox-card-heading h3 { font-size:19px; line-height:1.3; font-weight:700; letter-spacing:-.025em; overflow-wrap:anywhere; }
.bx-inbox-unread { padding:4px 10px; border-radius:20px; background:#ffe5af; font-size:11px; font-weight:650; white-space:nowrap; color:#573a17; }
.bx-inbox-card time { margin-left:auto; font-size:11px; color:var(--bx-muted); line-height:1.6; }
.bx-inbox-description { font-size:14px; line-height:1.6; overflow-wrap:anywhere; }
.bx-inbox-actions { display:flex; flex-wrap:wrap; align-items:center; gap:12px; margin-top:16px; }
.bx-inbox-detail { display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:42px; padding:10px 18px; border:1px solid #a5793c; border-radius:11px; color:#fff7e8; background:linear-gradient(125deg,#956324,#6a4317); font-size:13px; font-weight:650; text-decoration:none; box-shadow:0 3px 8px #54320e12; }
.bx-inbox-detail:hover { background:#694215; }
.bx-inbox-detail svg { width:15px; height:15px; }
.bx-private .bx-inbox [data-bx-part=button] { min-height:42px; padding:10px 17px; border-radius:11px; }
.bx-inbox-about { border:1px solid #e5cdab; border-radius:17px; padding:26px 22px 20px; background:linear-gradient(130deg,#fffaf2,#fbf5ec); box-shadow:0 4px 15px #57361906; min-width:0; }
.bx-inbox-about .bx-inbox-pole { display:block; width:105px; height:105px; margin:0 auto 18px; color:#ae7d2b; }
.bx-inbox-about > h2 { font-size:23px; line-height:1.25; letter-spacing:-.02em; margin-bottom:12px; }
.bx-inbox-about p { font-size:14px; line-height:1.6; color:var(--bx-muted); }
.bx-inbox-about-items { display:grid; gap:22px; border-top:1px solid #e6c99e; margin-top:22px; padding-top:22px; }
.bx-inbox-about-items > div { display:flex; gap:14px; align-items:flex-start; }
.bx-inbox-about-items h3 { font-size:15px; margin-bottom:4px; }
.bx-inbox-about-items p { font-size:13px; }
.bx-inbox-about-items .bx-inbox-icon { width:42px; height:42px; border-radius:11px; }
.bx-inbox-about-items svg { width:23px; height:23px; }
.bx-inbox-ornament--small { width:90%; gap:10px; margin:42px auto 0; }
.bx-inbox-ornament--small svg { width:16px; height:16px; }
.bx-inbox-status,.bx-inbox-empty { margin:0 0 18px; padding:22px; border:1px solid var(--bx-line); border-radius:15px; background:#fffdfa; font-size:14px; line-height:1.6; }
.bx-inbox-status p { margin-bottom:12px; }
.bx-inbox-error { color:#a22b27; border-color:#e5b9af; background:#fff4ef; }
.bx-inbox-empty > svg { color:var(--bx-action); margin-bottom:10px; }
.bx-inbox-empty h3 { font-size:17px; margin-bottom:8px; }
.bx-inbox-empty p,.bx-inbox-limit { color:var(--bx-muted); font-size:13px; line-height:1.6; }
.bx-inbox-limit { margin-top:18px !important; }
@media(max-width:1100px) { .bx-inbox-layout { grid-template-columns:minmax(0,1.8fr) minmax(250px,1fr); gap:20px; } .bx-inbox-refresh { margin-left:0; } .bx-inbox-card { padding:18px; gap:12px; } .bx-inbox-card-heading time { width:100%; margin-left:0; } }
@media(max-width:850px) { .bx-inbox-layout { grid-template-columns:1fr; } .bx-inbox-about { margin-top:8px; } .bx-inbox-about-items { grid-template-columns:repeat(3,minmax(0,1fr)); } .bx-inbox-about-items > div { flex-direction:column; } }
@media(max-width:600px) { .bx-inbox { padding:18px 16px 28px; } .bx-inbox-ornament { margin-bottom:20px; } .bx-inbox-toolbar { gap:14px; padding:20px 0; } .bx-inbox-filters { border:0; padding:0; width:100%; gap:8px; } .bx-inbox-filters button { flex:1 1 calc(50% - 8px); } .bx-inbox-refresh { width:100%; } .bx-inbox-card { gap:12px; padding:16px 12px; } .bx-inbox-card--unread { padding-left:9px; } .bx-inbox-card > .bx-inbox-icon { width:36px; height:36px; border-radius:10px; } .bx-inbox-card > .bx-inbox-icon svg { width:22px; height:22px; } .bx-inbox-card-heading h3 { font-size:17px; } .bx-inbox-actions { align-items:stretch; } .bx-inbox-actions > * { max-width:100%; } .bx-inbox-about-items { grid-template-columns:1fr; } .bx-inbox-about-items > div { flex-direction:row; } }
.bx-inbox-disclosure { width:100%; min-width:0; }
.bx-inbox-summary { display:flex; align-items:flex-start; gap:18px; list-style:none; cursor:pointer; border-radius:10px; }
.bx-inbox-summary::-webkit-details-marker { display:none; }
.bx-inbox-summary:focus-visible { outline:2px solid var(--bx-action); outline-offset:6px; }
.bx-inbox-expand { color:var(--bx-action); flex:none; padding-top:4px; }
.bx-inbox-expand svg { width:19px; height:19px; transform:rotate(90deg); }
.bx-inbox-disclosure[open] .bx-inbox-expand svg { transform:rotate(-90deg); }
.bx-inbox-preview { font-size:13px; color:var(--bx-muted); line-height:1.6; overflow-wrap:anywhere; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.bx-inbox-expanded { position:relative; isolation:isolate; padding:18px 0 0 68px; min-width:0; }
.bx-inbox-expanded > .bx-inbox-pole { position:absolute; right:0; bottom:10px; width:130px; height:160px; color:var(--bx-action); opacity:.08; z-index:-1; pointer-events:none; }
.bx-inbox-meta dl { display:flex; flex-wrap:wrap; gap:12px 20px; margin:0 0 18px; padding:12px 15px; width:fit-content; max-width:100%; border:1px solid #ebddca; border-radius:12px; background:#fffaf1; }
.bx-inbox-meta dl > div { min-width:0; padding-right:18px; border-right:1px solid #ebddca; }
.bx-inbox-meta dl > div:last-child { border-right:0; padding-right:0; }
.bx-inbox-meta dt { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--bx-muted); margin-bottom:5px; }
.bx-inbox-meta dt svg { width:16px; height:16px; color:var(--bx-action); }
.bx-inbox-meta dd { margin:0; font-size:13px; font-weight:600; overflow-wrap:anywhere; }
.bx-inbox-event-detail { border-left:3px solid #e2ba73; padding:0 0 0 16px; }
.bx-inbox-event-detail h4 { margin:0 0 8px; color:var(--bx-action); font-size:14px; }
.bx-inbox-disclosure[open] .bx-inbox-actions { margin-top:20px; }
@media(max-width:600px) { .bx-inbox-summary { gap:10px; } .bx-inbox-summary > .bx-inbox-icon { width:36px; height:36px; border-radius:10px; } .bx-inbox-summary > .bx-inbox-icon svg { width:22px; height:22px; } .bx-inbox-expanded { padding-left:0; } .bx-inbox-meta dl { gap:12px; width:100%; } .bx-inbox-meta dl > div { border:0; padding:0; flex:1 1 100px; } .bx-inbox-meta dl > div:first-child { flex-basis:100%; } }
@media(prefers-reduced-motion:no-preference) { .bx-inbox a,.bx-inbox button { transition:background-color .15s ease,box-shadow .15s ease; } }
.bx-inbox-list{padding-bottom:20px}
.bx-inbox-card{position:relative;isolation:isolate}
.bx-inbox-card:has(>.bx-notice-decision-layer){min-height:320px}
.bx-notice-decision-layer{position:absolute;inset:0;z-index:4;display:flex;align-items:center;justify-content:center;padding:24px 18px;scroll-margin-block:24px;border-radius:inherit;background:#30271f59;backdrop-filter:blur(3px);animation:bx-notice-shade .16s ease-out}
.bx-notice-decision{position:relative;width:min(100%,390px);padding:22px 22px 28px;background:#fffdf8;border:1px solid #e4d3b9;border-radius:16px;box-shadow:0 16px 42px #30271f30;animation:bx-notice-enter .18s ease-out}
.bx-notice-decision button{font:600 12px var(--bx-font);min-height:44px;padding:10px 12px;border:1px solid #dec9af;border-radius:10px;background:#fffdf8;color:#795321;cursor:pointer}
.bx-notice-decision button:disabled{opacity:.55;cursor:wait}
.bx-notice-decision .bx-notice-decision-close{position:absolute;top:8px;right:8px;display:grid;place-items:center;width:36px;min-height:36px;padding:8px;border:0;border-radius:50%;background:transparent}
.bx-notice-decision-close:hover{background:#f5ebd9}
.bx-notice-decision-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:#fbe9e2;color:#a44730;margin-bottom:12px}
.bx-inbox .bx-notice-decision h4{font-size:17px;line-height:1.4;margin:0 22px 8px 0}
.bx-inbox .bx-notice-decision p{font-size:13px;line-height:1.6;margin:0 0 18px;color:#756752}
.bx-notice-decision-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.bx-notice-decision .bx-notice-delete-action{background:#a44730;border-color:#a44730;color:#fff}
@keyframes bx-notice-shade{from{opacity:0}to{opacity:1}}
@keyframes bx-notice-enter{from{opacity:0;transform:translateY(6px) scale(.98)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.bx-notice-decision-layer,.bx-notice-decision{animation:none}}
`;
