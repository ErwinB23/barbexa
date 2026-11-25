export const teamManagementStyles = `
.bx-team-page { width:100%; min-height:100%; max-width:1500px; padding:24px clamp(18px,2.8vw,40px) 36px; margin:0 auto; background:var(--bx-canvas); color:var(--bx-ink); font-family:var(--bx-font); }
.bx-team-page *, .bx-team-page *::before, .bx-team-page *::after { box-sizing:border-box; }
.bx-team-page-heading { position:relative; padding:18px 0 16px; border-bottom:1px solid var(--bx-line); }
.bx-team-page-heading::before { content:''; position:absolute; top:0; left:0; width:60px; height:6px; border-radius:6px; background:linear-gradient(90deg,#a9752b,#c99b50); }
.bx-team-page-heading h1 { margin:0 0 6px; font-size:clamp(28px,2.6vw,38px); line-height:1.15; font-weight:750; letter-spacing:-.035em; overflow-wrap:anywhere; }
.bx-team-page-heading p { margin:0; font-size:14px; color:var(--bx-muted); line-height:1.5; }
.bx-team-page-heading > button { margin-top:8px; min-height:28px; padding:0; border:0; background:transparent; font:inherit; font-size:12px; color:var(--bx-action); text-decoration:underline; text-underline-offset:3px; cursor:pointer; }
.bx-team-tabs { display:flex; flex-wrap:wrap; gap:10px; padding:14px 0; }
.bx-team-tab { position:relative; min-width:0; }
.bx-team-tab > svg { position:absolute; left:14px; top:calc(50% - 9px); width:18px; height:18px; color:var(--bx-action); z-index:1; pointer-events:none; }
.bx-private .bx-team-tab [data-bx-part='button'] { padding:10px 16px 10px 42px !important; min-height:42px; border-radius:12px !important; }
.bx-private .bx-team-tab [data-bx-part='button'][aria-pressed='true'] { opacity:1; background:linear-gradient(130deg,#996724,#79501b) !important; border-color:#b1813e !important; }
.bx-private .bx-team-tab [aria-pressed='true'] [data-bx-part='text'] { color:#fff7e9 !important; }
.bx-team-tab:has([aria-pressed='true']) > svg { color:#fff1d6; }
.bx-team-feedback:empty { display:none; }
.bx-team-feedback { margin-bottom:14px; }
.bx-team-card, .bx-team-hero { position:relative; min-width:0; border:1px solid #e5d9c8; border-radius:18px; background:linear-gradient(115deg,#fffdfa,#fcf9f3); box-shadow:0 4px 16px #52351207; }
.bx-team-card { padding:22px; margin-top:20px; }
.bx-team-hero { isolation:isolate; overflow:hidden; padding:22px 24px; background:linear-gradient(115deg,#fffdfa,#fbf2e4); }
.bx-team-hero::after { content:''; z-index:-1; pointer-events:none; position:absolute; right:0; top:0; width:280px; height:80px; background:linear-gradient(130deg,#c1995110,#9a6a2d99); border-top-right-radius:17px; border-bottom-left-radius:100%; }
.bx-team-block-title { display:flex; align-items:center; gap:16px; margin-bottom:18px; }
.bx-team-block-title > div { min-width:0; }
.bx-team-block-title h2 { margin:0 0 5px; font-size:20px; font-weight:700; line-height:1.2; letter-spacing:-.025em; overflow-wrap:anywhere; }
.bx-team-hero .bx-team-block-title h2 { font-size:22px; }
.bx-team-block-title p { margin:0; font-size:13px; line-height:1.5; color:var(--bx-muted); }
.bx-team-icon { display:grid; place-items:center; flex:none; width:40px; height:40px; border-radius:11px; background:linear-gradient(130deg,#fff0cc,#f8e7bf); color:var(--bx-action); }
.bx-team-icon svg { width:22px; height:22px; }
.bx-team-metrics { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); border-top:1px solid #e9dcc8; padding-top:18px; gap:22px; }
.bx-team-metrics > div { display:flex; align-items:center; gap:16px; min-width:0; }
.bx-team-metrics > div + div { border-left:1px solid #e0cfb5; padding-left:22px; }
.bx-team-metrics strong { font-size:24px; line-height:1.1; font-weight:700; }
.bx-team-metrics p { font-size:13px; line-height:1.4; font-weight:550; margin:2px 0; }
.bx-team-metrics small { font-size:11px; color:var(--bx-muted); }
.bx-team-pole { position:absolute; pointer-events:none; z-index:-1; right:44px; top:34px; width:58px; height:140px; border:6px solid #c3985420; border-radius:35px 35px 12px 12px; background:repeating-linear-gradient(-35deg,transparent 0 15px,#c3985414 16px 28px,transparent 29px 36px); }
.bx-team-members > .bx-team-block-title { padding-right:180px; min-height:48px; }
.bx-team-invite > summary { position:absolute; right:22px; top:24px; display:flex; align-items:center; justify-content:center; min-height:44px; padding:10px 20px; border:1px solid #a77a38; border-radius:12px; color:#fff9ec; background:linear-gradient(130deg,#956223,#744913); font-size:14px; font-weight:600; cursor:pointer; list-style:none; }
.bx-team-page summary::-webkit-details-marker { display:none; }
.bx-team-invite-form { padding:18px; margin:14px 0 20px; border:1px solid #dfcba8; border-radius:14px; background:#fcf7ef; display:grid; gap:12px; }
.bx-team-invite-form h3 { margin:0; font-size:18px; }
.bx-team-invite-form p { margin:0; font-size:13px; line-height:1.6; color:var(--bx-muted); }
.bx-team-table { width:100%; border-collapse:separate; border-spacing:0; table-layout:fixed; }
.bx-team-table th { padding:13px 12px; background:#f4eee4; font-size:12px; font-weight:650; text-align:left; }
.bx-team-table th:first-child { border-top-left-radius:12px; width:24%; }
.bx-team-table th:nth-child(2) { width:16%; }
.bx-team-table th:nth-child(3) { width:13%; }
.bx-team-table th:nth-child(4) { width:23%; }
.bx-team-table th:last-child { border-top-right-radius:12px; width:24%; }
.bx-team-table td { padding:15px 12px; border-bottom:1px solid #ede4d7; font-size:13px; vertical-align:middle; overflow-wrap:anywhere; }
.bx-team-table tr:last-child td { border-bottom:0; }
.bx-team-person { display:flex; align-items:center; gap:12px; }
.bx-team-person > div { min-width:0; }
.bx-team-person strong { display:block; font-size:15px; font-weight:650; }
.bx-team-person small { display:block; margin-top:4px; font-size:11px; color:var(--bx-muted); line-height:1.45; }
.bx-team-avatar { display:grid; place-items:center; flex:none; width:40px; height:40px; border-radius:50%; color:var(--bx-action); background:#f6e8cd; }
.bx-team-avatar svg { width:23px; height:23px; }
.bx-team-badge { display:inline-flex; align-items:center; gap:6px; max-width:100%; padding:6px 9px; border:1px solid #e6d9c5; border-radius:12px; font-size:11px; font-weight:600; background:#fffdf8; }
.bx-team-badge svg { width:15px; height:15px; }
.bx-team-badge--admin { background:#fff0cb; border-color:#f6e4b4; color:#77501c; }
.bx-team-status { display:inline-flex; gap:5px; align-items:center; border-radius:20px; padding:6px 9px; background:#edeae5; color:#655e55; font-size:11px; font-weight:600; }
.bx-team-status::before { content:''; flex:none; width:6px; height:6px; border-radius:50%; background:currentColor; }
.bx-team-status.is-active { background:#e5efdf; color:#30623b; }
.bx-team-profile-note { display:block; margin-top:5px; font-size:10px; color:var(--bx-muted); }
.bx-team-chips { display:flex; flex-wrap:wrap; gap:6px; }
.bx-team-chips > span { display:inline-flex; align-items:center; gap:5px; border:1px solid #eee4d6; border-radius:20px; padding:5px 8px; background:#f7f1e8; font-size:11px; max-width:100%; }
.bx-team-chips svg { width:14px; height:14px; flex:none; }
.bx-team-chips small { font-size:11px; color:var(--bx-muted); }
.bx-team-row-actions { display:flex; flex-wrap:wrap; gap:6px; }
.bx-private .bx-team-row-actions [data-bx-part='button'] { min-height:36px; min-width:0; padding:7px 9px !important; border-radius:9px !important; }
.bx-private .bx-team-row-actions [data-bx-part='text'] { font-size:11px !important; line-height:1.3 !important; }
.bx-team-note { font-size:13px; line-height:1.6; color:var(--bx-muted); }
.bx-team-empty { margin:0; padding:24px 18px; text-align:center; border:1px dashed #deceb5; border-radius:13px; background:#fcf8f1; font-size:14px; line-height:1.6; color:var(--bx-muted); }
.bx-team-empty > svg { color:var(--bx-action); width:32px; height:32px; }
.bx-team-empty h3 { margin:10px 0 6px; font-size:17px; color:var(--bx-ink); }
.bx-team-empty p { margin:0; font-size:13px; }
.bx-team-invitation-list { display:grid; gap:12px; }
.bx-team-invitation { display:flex; flex-wrap:wrap; gap:16px; align-items:center; min-width:0; padding:14px; border:1px solid #e9dfd1; border-radius:14px; background:#fcf9f3; }
.bx-team-invitation > div { flex:1; min-width:150px; }
.bx-team-invitation strong { font-size:14px; }
.bx-team-invitation small { display:block; margin-top:4px; color:var(--bx-muted); font-size:11px; }
.bx-team-envelope { display:grid; place-items:center; flex:none; width:38px; height:38px; border:1px solid #e4d6c2; border-radius:10px; color:var(--bx-action); background:var(--bx-panel); }
.bx-team-envelope svg { width:22px; height:22px; }
.bx-team-pending { padding:6px 12px; border-radius:20px; background:#fff0c8; color:#80551f; font-size:12px; font-weight:600; }
.bx-private .bx-team-invitation [data-bx-part='button'] { min-height:40px; padding:8px 13px !important; }
.bx-team-profile-editor, .bx-team-history { margin-top:18px; border-top:1px solid var(--bx-line); padding-top:14px; }
.bx-team-profile-editor > summary, .bx-team-history > summary, .bx-team-administration > summary { cursor:pointer; color:var(--bx-action); font-size:14px; font-weight:600; line-height:1.5; padding-block:6px; }
.bx-team-profile-editor > div { display:grid; gap:14px; padding-top:14px; max-width:800px; }
.bx-team-profile-editor p, .bx-team-history p { margin:0; font-size:13px; color:var(--bx-muted); line-height:1.6; }
.bx-team-select-label { display:grid; gap:7px; font-size:14px; }
.bx-team-select-label select { min-width:0; width:100%; min-height:44px; padding:10px; border:1px solid var(--bx-control); border-radius:10px; color:var(--bx-ink); background:var(--bx-panel); font:inherit; }
.bx-team-capabilities { display:grid; gap:12px; padding:18px; border:1px solid #dfcfb5; border-radius:12px; background:#fcf6ec; }
.bx-team-capabilities h3 { margin:0; font-size:17px; overflow-wrap:anywhere; }
.bx-team-service-choices { display:flex; flex-wrap:wrap; gap:8px; }
.bx-team-administration > summary { display:flex; align-items:center; gap:12px; }
.bx-team-administration > summary svg { width:22px; height:22px; flex:none; }
.bx-team-administration > div { display:grid; gap:18px; padding-top:18px; }
.bx-team-professional-access { margin-top:18px; }
.bx-team-sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
.bx-team-history > summary { min-height:44px; display:list-item; }
.bx-team-history > summary:focus-visible { outline:2px solid var(--bx-action); outline-offset:4px; border-radius:4px; }
.bx-team-history .bx-team-history-caption { margin:10px 0 18px; }
.bx-team-history-list { display:grid; gap:14px; }
.bx-team-history-card { padding:20px; background:#fcf8f0; border:1px solid #e5d5bd; border-radius:16px; min-width:0; }
.bx-team-history-card header { display:flex; align-items:center; flex-wrap:wrap; gap:12px; }
.bx-team-history-card header > div { flex:1; min-width:130px; }
.bx-team-history-card small { color:var(--bx-muted); font-size:12px; }
.bx-team-history-card h3 { margin:3px 0 0; font-size:17px; font-weight:650; overflow-wrap:anywhere; }
.bx-team-history-state { padding:6px 12px; background:#eee8de; color:#685641; border-radius:20px; font-size:12px; font-weight:600; }
.bx-team-history-state.is-accepted { background:#e5efdf; color:#30623b; }
.bx-team-history-card dl { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr)); gap:18px 24px; margin:18px 0 0; padding-top:18px; border-top:1px solid #e5d5bd; }
.bx-team-history-card dt { color:var(--bx-muted); font-size:12px; margin-bottom:6px; }
.bx-team-history-card dd { margin:0; font-size:14px; line-height:1.55; overflow-wrap:anywhere; }
.bx-team-pending-disclosure.bx-team-history { margin-top:0; padding-top:0; border-top:0; }
.bx-team-pending-disclosure .bx-team-invitation-list { padding-bottom:4px; }
.bx-team-invitation .bx-team-pending-actions { display:flex; flex-wrap:wrap; flex:0 1 auto; gap:10px; min-width:0; }
.bx-team-invitation small { overflow-wrap:anywhere; line-height:1.55; }
@media (hover:hover) { .bx-team-invite > summary:hover { filter:brightness(1.06); } .bx-team-page [data-bx-part='button']:hover:not([aria-disabled='true']) { filter:brightness(.97); } }
@media (max-width:1200px) { .bx-team-metrics { gap:16px; } .bx-team-metrics > div { gap:10px; } .bx-team-metrics > div + div { padding-left:16px; } .bx-team-icon { width:38px; height:38px; } .bx-team-metrics strong { font-size:22px; } .bx-team-table th, .bx-team-table td { padding-inline:9px; } .bx-team-person { gap:8px; } .bx-team-person .bx-team-avatar { display:none; } }
@media (max-width:1050px) { .bx-team-metrics { grid-template-columns:minmax(0,1fr); gap:14px; } .bx-team-metrics > div + div { border-left:0; border-top:1px solid #e0cfb5; padding-left:0; padding-top:14px; } }
@media (max-width:950px) { .bx-team-table, .bx-team-table tbody, .bx-team-table tr { display:block; width:100%; } .bx-team-table thead { display:none; } .bx-team-table tr { padding:12px; border:1px solid #e9dfd0; border-radius:13px; margin-bottom:12px; background:#fffcf7; } .bx-team-table td { display:grid; grid-template-columns:130px minmax(0,1fr); gap:12px; padding:9px 0; border:0; align-items:center; } .bx-team-table td::before { content:attr(data-label); font-size:12px; color:var(--bx-muted); } .bx-team-person .bx-team-avatar { display:grid; } .bx-team-table td > * { justify-self:start; } }
@media (max-width:650px) { .bx-team-page { padding:22px 16px 28px; } .bx-team-card { padding:18px; } .bx-team-hero { padding:20px; } .bx-team-block-title { gap:12px; } .bx-team-block-title h2 { font-size:20px; } .bx-team-members > .bx-team-block-title { padding-right:0; } .bx-team-invite > summary { position:static; justify-content:center; margin:0 0 18px; } .bx-team-table td { grid-template-columns:100px minmax(0,1fr); gap:10px; } .bx-team-tabs > div { flex:1 1 44%; } .bx-private .bx-team-tab [data-bx-part='button'] { padding-right:8px !important; } .bx-team-invitation { gap:12px; } .bx-team-invitation > [data-bx-part='button'] { width:100%; } }
@media (max-width:380px) { .bx-team-table td { grid-template-columns:minmax(0,1fr); gap:5px; } .bx-team-person .bx-team-avatar { display:none; } .bx-team-block-title { align-items:flex-start; } }
`;
