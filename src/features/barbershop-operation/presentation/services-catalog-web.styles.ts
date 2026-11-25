export const servicesCatalogStyles = `
.bx-services-page { width:100%; min-height:100%; max-width:1800px; margin:auto; padding:24px clamp(18px,2.4vw,36px) 36px; background:var(--bx-canvas); color:var(--bx-ink); font-family:var(--bx-font); }
.bx-services-page *, .bx-services-page *::before, .bx-services-page *::after { box-sizing:border-box; }
.bx-services-heading { position:relative; padding:18px 0 16px; border-bottom:1px solid var(--bx-line); }
.bx-services-heading::before { content:''; position:absolute; top:0; width:60px; height:6px; background:linear-gradient(90deg,#a06b26,#c89648); border-radius:6px; }
.bx-services-heading h1 { font-size:clamp(28px,2.6vw,38px); font-weight:750; letter-spacing:-.035em; line-height:1.15; margin:0 0 6px; overflow-wrap:anywhere; }
.bx-services-heading p { margin:0; color:var(--bx-muted); font-size:14px; line-height:1.5; }
.bx-services-heading > button { margin-top:8px; padding:0; min-height:28px; background:transparent; border:0; font:inherit; font-size:12px; color:var(--bx-action); text-decoration:underline; cursor:pointer; }
.bx-services-tabs { display:flex; flex-wrap:wrap; gap:10px; padding:14px 0 20px; }
.bx-services-tab { position:relative; min-width:0; }
.bx-services-tab > svg { position:absolute; left:14px; top:calc(50% - 9px); width:18px; height:18px; color:var(--bx-action); z-index:1; pointer-events:none; }
.bx-private .bx-services-tab [data-bx-part='button'] { padding:10px 16px 10px 42px !important; border-radius:12px !important; min-height:42px; }
.bx-private .bx-services-tab [data-bx-part='button'][aria-pressed='true'] { background:linear-gradient(130deg,#996724,#79501b) !important; border-color:#b1813e !important; opacity:1; }
.bx-private .bx-services-tab [aria-pressed='true'] [data-bx-part='text'] { color:#fff7e9 !important; }
.bx-services-tab:has([aria-pressed='true']) > svg { color:#fff1d6; }
.bx-services-feedback:empty { display:none; }
.bx-services-feedback { margin-bottom:14px; }
.bx-services-layout { display:grid; grid-template-columns:minmax(190px,.75fr) minmax(0,2fr) minmax(245px,.95fr); gap:16px; align-items:start; }
.bx-services-panel { min-width:0; border:1px solid #e4d9cb; border-radius:17px; padding:20px; background:linear-gradient(120deg,#fffdfa,#fcf9f4); box-shadow:0 4px 16px #52351207; }
.bx-services-title { display:flex; align-items:center; gap:12px; min-width:0; }
.bx-services-title > div { min-width:0; }
.bx-services-title > span:first-child { display:grid; place-items:center; flex:none; width:46px; height:46px; background:linear-gradient(130deg,#fae7c3,#fff1d5); border-radius:13px; color:var(--bx-action); }
.bx-services-title > span > svg { width:27px; height:27px; }
.bx-services-title h2 { font-size:19px; letter-spacing:-.025em; font-weight:700; line-height:1.25; margin:0 0 5px; }
.bx-services-title p { font-size:11px; line-height:1.5; color:var(--bx-muted); margin:0; }
.bx-services-categories { position:relative; isolation:isolate; overflow:hidden; min-height:590px; }
.bx-services-categories .bx-services-title { align-items:flex-start; gap:10px; }
.bx-services-categories .bx-services-title h2 { font-size:17px; }
.bx-services-categories .bx-services-title > span { width:36px; height:36px; }
.bx-services-category-list { display:grid; gap:6px; margin:24px -8px 18px; }
.bx-services-category-list button { display:flex; align-items:center; gap:10px; width:100%; text-align:left; min-height:48px; border:1px solid transparent; border-radius:12px; background:transparent; padding:10px; font:inherit; font-size:12px; color:var(--bx-ink); cursor:pointer; }
.bx-services-category-list button > svg { color:var(--bx-action); width:20px; height:20px; flex:none; }
.bx-services-category-list button > span { flex:1; }
.bx-services-category-list b { min-width:23px; padding:4px 6px; border-radius:50%; background:#f2e7d6; font-size:11px; font-weight:550; text-align:center; }
.bx-services-category-list button[aria-pressed='true'] { background:linear-gradient(100deg,#f6e6c9,#fcf2e2); border-color:#efdbb4; font-weight:650; box-shadow:inset 3px 0 #9c6d28; }
.bx-services-new-category { width:100%; min-height:44px; border:1px solid #dac6a5; border-radius:11px; background:#eee1ce; color:#74634a; font:inherit; font-size:13px; font-weight:600; cursor:not-allowed; }
.bx-services-category-note { font-size:10px; color:var(--bx-muted); line-height:1.6; }
.bx-services-watermark { position:absolute; z-index:-1; pointer-events:none; right:35px; bottom:20px; width:62px; height:140px; opacity:.07; border:7px solid #9f722e; border-radius:35px 35px 12px 12px; background:repeating-linear-gradient(-35deg,transparent 0 15px,#9f722e 16px 28px,transparent 29px 36px); }
.bx-services-catalog-heading { display:flex; align-items:center; justify-content:space-between; gap:14px; padding-bottom:18px; border-bottom:1px solid var(--bx-line); }
.bx-services-catalog-heading .bx-services-title h2 { font-size:23px; }
.bx-private .bx-services-catalog-heading [data-bx-part='button'] { padding:10px 13px !important; min-height:44px; flex:none; }
.bx-services-filters { display:grid; grid-template-columns:minmax(0,1.25fr) minmax(0,1fr) minmax(0,1fr); gap:8px; margin:16px 0 20px; }
.bx-services-filters label { min-width:0; }
.bx-services-filters input, .bx-services-filters select { width:100%; min-width:0; min-height:40px; padding:9px; border:1px solid #dfd1bd; border-radius:10px; background:#fffdfa; color:var(--bx-ink); font:inherit; font-size:11px; }
.bx-services-list { display:grid; gap:10px; }
.bx-services-row { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) auto auto; align-items:center; gap:10px; min-width:0; padding:14px; border:1px solid #e5d9cb; border-radius:13px; background:linear-gradient(110deg,#fffdfa,#fbf7f0); }
.bx-services-row.is-selected { border-color:#c6a36d; box-shadow:0 2px 8px #62411608; }
.bx-services-row-main { display:flex; align-items:center; gap:12px; min-width:0; padding:0; border:0; background:transparent; font:inherit; text-align:left; color:var(--bx-ink); cursor:pointer; }
.bx-services-row-main > span:last-child { min-width:0; }
.bx-services-row-main strong { display:block; font-size:14px; line-height:1.3; font-weight:650; overflow-wrap:anywhere; }
.bx-services-row-icon { display:grid; place-items:center; flex:none; width:42px; height:42px; border-radius:12px; background:#faebcf; color:var(--bx-action); }
.bx-services-row-icon svg { width:25px; height:25px; }
.bx-services-price-duration { display:flex; flex-wrap:wrap; gap:6px 12px; margin-top:7px; }
.bx-services-price-duration > span { display:inline-flex; align-items:center; gap:5px; font-size:11px; white-space:nowrap; }
.bx-services-price-duration svg { width:14px; height:14px; color:var(--bx-action); }
.bx-services-row-info { min-width:0; border-left:1px solid #e2d6c5; padding-left:12px; }
.bx-services-category-chip { display:inline-flex; align-items:center; gap:5px; border-radius:20px; padding:4px 7px; background:#f3ebdf; font-size:10px; line-height:1.3; max-width:100%; }
.bx-services-category-chip svg { width:14px; height:14px; color:var(--bx-action); flex:none; }
.bx-services-row-info small { display:flex; align-items:flex-start; gap:5px; font-size:10px; line-height:1.5; margin-top:5px; color:var(--bx-muted); }
.bx-services-row-info small svg { width:14px; height:14px; flex:none; }
.bx-services-state { display:inline-flex; align-items:center; gap:5px; padding:5px 8px; border-radius:20px; background:#eae8e3; color:#615b53; font-size:10px; font-weight:600; }
.bx-services-state::before { content:''; width:6px; height:6px; border-radius:50%; background:currentColor; }
.bx-services-state.is-visible { color:#3b652e; background:#e6efda; }
.bx-services-menu { position:relative; }
.bx-services-menu > summary { display:grid; place-items:center; min-width:34px; min-height:36px; border:1px solid #dfd0b9; border-radius:9px; background:var(--bx-panel); color:var(--bx-action); cursor:pointer; list-style:none; }
.bx-services-menu > summary::-webkit-details-marker { display:none; }
.bx-services-menu > div { position:absolute; z-index:5; right:0; top:calc(100% + 5px); padding:5px; border:1px solid #e1d3c0; border-radius:10px; background:var(--bx-panel); box-shadow:0 8px 20px #3b240d1a; width:150px; }
.bx-services-menu button { min-height:40px; width:100%; padding:8px; border:0; background:transparent; color:var(--bx-ink); font:inherit; font-size:13px; text-align:left; cursor:pointer; }
.bx-services-pagination { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:18px; padding-top:12px; border-top:1px solid var(--bx-line); }
.bx-services-pagination p { font-size:11px; color:var(--bx-muted); }
.bx-services-pagination > div { display:flex; align-items:center; gap:10px; font-size:12px; }
.bx-services-pagination button { min-width:34px; min-height:36px; border:1px solid #ddccb1; background:var(--bx-panel); border-radius:9px; font-size:20px; color:var(--bx-action); cursor:pointer; }
.bx-services-pagination button:disabled { opacity:.4; cursor:default; }
.bx-services-preview-column { display:grid; gap:18px; min-width:0; }
.bx-services-preview { position:relative; isolation:isolate; overflow:hidden; }
.bx-services-preview::before { content:''; position:absolute; z-index:-1; right:0; top:0; width:130px; height:80px; border-radius:0 16px 0 100%; background:linear-gradient(110deg,#f8e9ce22,#c5964d88); }
.bx-services-preview .bx-services-title { align-items:flex-start; }
.bx-services-preview .bx-services-title h2 { font-size:17px; }
.bx-services-preview-card { margin-top:24px; padding:18px; border:1px solid #e5d9c9; border-radius:15px; background:#fffdfa; box-shadow:0 4px 12px #53351308; }
.bx-services-preview-card h3 { margin:0 0 7px; font-size:21px; line-height:1.25; letter-spacing:-.025em; overflow-wrap:anywhere; }
.bx-services-preview-meta { display:flex; align-items:center; flex-wrap:wrap; gap:12px; justify-content:space-between; border-block:1px solid #ede4d6; padding:14px 0; margin-top:18px; }
.bx-services-preview-meta span { display:flex; align-items:center; gap:7px; font-size:12px; }
.bx-services-preview-meta svg { width:18px; height:18px; color:var(--bx-action); }
.bx-services-preview-meta strong { font-size:18px; }
.bx-services-preview-card > p { font-size:13px; line-height:1.65; overflow-wrap:anywhere; }
.bx-private .bx-services-preview-card [data-bx-part='button'] { margin-top:12px; padding:11px 12px !important; min-height:46px; }
.bx-services-preview-card > small { display:block; margin-top:8px; font-size:10px; line-height:1.5; color:var(--bx-muted); }
.bx-services-hidden-note { color:var(--bx-muted); font-weight:600; }
.bx-services-information h2 { font-size:17px; margin:0 0 14px; }
.bx-services-information ul { display:grid; gap:10px; padding:0; list-style:none; margin:0; }
.bx-services-information li { display:flex; gap:8px; color:var(--bx-muted); font-size:12px; line-height:1.6; }
.bx-services-information li::before { content:'✓'; color:var(--bx-action); }
.bx-services-empty { padding:26px 14px; margin:0; font-size:13px; line-height:1.6; color:var(--bx-muted); text-align:center; border:1px dashed #dfcfb7; border-radius:12px; }
.bx-services-empty svg { width:30px; height:30px; color:var(--bx-action); }
.bx-services-empty h3 { font-size:17px; color:var(--bx-ink); margin:8px 0; }
.bx-services-editor { display:grid; gap:14px; margin-top:20px; padding:18px; border:1px solid #d7bd93; border-radius:14px; background:#fcf6eb; }
.bx-services-editor-title { display:flex; justify-content:space-between; gap:10px; align-items:center; }
.bx-services-editor-title h3 { margin:0; font-size:20px; }
.bx-services-editor-title button { min-height:36px; background:transparent; border:0; color:var(--bx-action); font:inherit; font-size:12px; text-decoration:underline; cursor:pointer; }
.bx-services-editor-numbers { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.bx-services-editor > p { font-size:11px; color:var(--bx-muted); line-height:1.6; margin:0; }
.bx-services-sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
@media (hover:hover) { .bx-services-row:hover { border-color:#c9aa7a; } .bx-services-menu button:hover { background:#f8eddd; } }
@media (max-width:1450px) { .bx-services-layout { grid-template-columns:minmax(175px,.7fr) minmax(0,1.8fr); } .bx-services-preview-column { grid-column:2; grid-template-columns:repeat(2,minmax(0,1fr)); } .bx-services-categories { grid-row:1/3; } .bx-services-row { grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) auto auto; } }
@media (max-width:1000px) { .bx-services-layout { grid-template-columns:minmax(0,1fr); } .bx-services-categories { grid-row:auto; min-height:0; } .bx-services-category-list { display:flex; flex-wrap:wrap; margin:16px 0; } .bx-services-category-list button { width:auto; } .bx-services-preview-column { grid-column:auto; } .bx-services-watermark { display:none; } .bx-services-new-category { max-width:200px; } }
@media (max-width:650px) { .bx-services-page { padding:22px 16px 28px; } .bx-services-panel { padding:16px; } .bx-services-preview-column { grid-template-columns:minmax(0,1fr); } .bx-services-filters { grid-template-columns:repeat(2,minmax(0,1fr)); } .bx-services-filters > label:first-child { grid-column:1/-1; } .bx-services-catalog-heading { flex-wrap:wrap; } .bx-services-catalog-heading .bx-services-title h2 { font-size:21px; } .bx-services-row { grid-template-columns:minmax(0,1fr) auto; gap:12px; } .bx-services-row-main { grid-column:1/-1; } .bx-services-row-info { border:0; padding:0; grid-column:1; } .bx-services-state { grid-column:1; justify-self:start; } .bx-services-menu { grid-column:2; grid-row:2/4; } .bx-services-tabs > div { flex:1 1 44%; } .bx-private .bx-services-tab [data-bx-part='button'] { padding-right:8px !important; } }
@media (max-width:380px) { .bx-services-editor-numbers { grid-template-columns:minmax(0,1fr); } }
.bx-services-editor{padding:18px!important;display:grid;gap:14px;max-width:820px}
.bx-services-editor-title h3{font-size:18px}
.bx-services-editor-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 16px;max-width:720px}
.bx-services-editor-grid label{display:grid;gap:6px;font-size:13px;font-weight:600;color:#3c3023}
.bx-service-description{grid-column:1/-1}
.bx-services-editor-grid :is(input,textarea,select){box-sizing:border-box;width:100%;min-width:0;min-height:42px;border:1px solid #d9c6ac;border-radius:9px;padding:10px 12px;background:#fffdfa;color:#30271f;font:400 13px var(--bx-font)}
.bx-services-editor-grid textarea{resize:vertical;min-height:64px}
.bx-services-editor-footer{display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;border-top:1px solid #e8d9c3;padding-top:12px}
.bx-service-active{display:flex;align-items:center;gap:8px;font-size:13px}.bx-service-active input{width:17px;height:17px;accent-color:#80531f}
.bx-services-editor-footer [data-bx-part=button]{min-width:180px;width:auto!important;min-height:42px!important}
.bx-services-menu>div{display:flex!important;gap:6px;padding:7px!important;width:max-content!important;min-width:0!important}
.bx-services-menu>div button{display:grid;place-items:center;width:38px;min-height:38px;padding:8px!important;border-radius:8px}
.bx-services-menu>div button svg{width:20px;height:20px}.bx-services-menu>div button:last-child{color:#a44232}
.bx-services-delete-confirm{margin:14px 0;padding:16px;border:1px solid #e1b8ac;border-radius:12px;background:#fff6f0}.bx-services-delete-confirm h3{font-size:16px}.bx-services-delete-confirm p{font-size:13px;margin:8px 0 12px}.bx-services-delete-confirm button{min-height:40px;margin-right:8px;padding:8px 14px;border:1px solid #d8b7a8;border-radius:9px;background:#fffdfa;cursor:pointer}.bx-services-delete-confirm button:last-child{background:#a44730;color:#fff}
@media(max-width:550px){.bx-services-editor-grid{grid-template-columns:1fr}.bx-service-description{grid-column:auto}.bx-services-editor-footer [data-bx-part=button]{width:100%!important}}
`;
