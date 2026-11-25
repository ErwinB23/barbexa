// Scoped to the private Web shell; approved public/authentication surfaces opt out.
export const privateWorkspaceStyles = `
.bx-web--workspace { height:100dvh; overflow:hidden; }
.bx-private {
  --bx-private-rail:#15120f;
  --bx-private-cream:#f8f5ef;
  --bx-private-border:#decfbd;
  --bx-private-subtle:#e2d7c9;
  --bx-private-float:0 16px 32px #1d120e35;
  position:relative; height:100dvh; flex:none; overflow:hidden;
}
.bx-private *, .bx-private *::before, .bx-private *::after { box-sizing:border-box; }
.bx-private button, .bx-private input { font:inherit; }
.bx-private button, .bx-private a { -webkit-tap-highlight-color:transparent; }
.bx-private button { cursor:pointer; }
.bx-private button:disabled { cursor:default; opacity:.6; }
.bx-private svg { width:22px; height:22px; flex:none; vertical-align:middle; }
.bx-private .bx-rail {
  position:relative; flex:0 0 clamp(14rem,16.75vw,19rem); padding:24px 15px; gap:32px;
  background:var(--bx-private-rail); isolation:isolate; overflow:auto;
}
.bx-private .bx-rail::before {
  content:''; position:absolute; inset:35% 0 0; z-index:-1; pointer-events:none;
  background:linear-gradient(var(--bx-private-rail),transparent 24%),url('/images/private-sidebar-tools.png') bottom center / 100% auto no-repeat;
}
.bx-private .bx-rail .bx-brand { padding:0 18px; min-height:56px; border:0; font-size:26px; gap:16px; }
.bx-private .bx-rail .bx-brand:hover { background:transparent; color:var(--bx-rail-text); }
.bx-private .bx-brand--official img { width:52px; height:52px; }
.bx-private .bx-rail nav { gap:6px; }
.bx-private .bx-rail nav a { padding:10px 15px; gap:15px; min-height:46px; border-radius:11px; font-size:16px; }
.bx-private .bx-rail nav a svg { width:23px; height:23px; color:var(--bx-gold); }
.bx-private .bx-rail nav a[aria-current='page'] { box-shadow:inset 0 1px 0 #e7ba7833; background:linear-gradient(110deg,#503923,#362b22); color:#ffe0b1; border-color:#967248; font-weight:600; }
.bx-private .bx-rail-context { margin-top:0; padding:14px 14px; border:1px solid #7b655344; border-radius:10px; background:#15120fe8; font-size:13px; }
.bx-private .bx-main { overflow:auto; background:var(--bx-private-cream); }
.bx-private--inner .bx-main { padding-top:76px; }
.bx-private .bx-private-profile { position:absolute; top:18px; right:25px; z-index:20; }
.bx-user-trigger { display:flex; align-items:center; gap:10px; min-height:48px; background:transparent; border:0; color:var(--bx-gold); padding:0 4px; }
.bx-avatar { display:grid; place-items:center; width:46px; height:46px; border:1px solid #b69b79; border-radius:50%; background:linear-gradient(130deg,#62513c,#35291f); color:#fff5e8; font-size:21px; font-weight:600; box-shadow:0 2px 8px #0003; }
.bx-user-chevron { display:flex; transform:rotate(90deg); }
.bx-user-chevron svg { width:15px; height:15px; }
.bx-user-popover { position:absolute; right:0; top:calc(100% + 8px); width:244px; max-width:calc(100vw - 32px); border:1px solid #93816d; background:linear-gradient(135deg,#2a241e,#1c1814); border-radius:14px; padding:10px 13px; box-shadow:var(--bx-private-float); color:#fff6ec; }
.bx-user-name { margin:4px 10px 6px; padding-bottom:8px; border-bottom:1px solid #74634e; font-size:13px; color:#e4c8a5; overflow-wrap:anywhere; }
.bx-user-popover a, .bx-user-popover button { display:flex; align-items:center; gap:16px; min-height:44px; width:100%; padding:9px 10px; border:0; border-radius:7px; background:transparent; color:inherit; text-decoration:none; font-size:14px; text-align:left; }
.bx-user-popover svg { color:#e8cda9; width:21px; height:21px; }
.bx-user-popover a:hover, .bx-user-popover button:hover { background:#ffffff12; }
.bx-user-popover .bx-sign-out { border-top:1px solid #74634e; border-radius:0; margin-top:7px; padding-top:14px; color:#ffb19c; font-weight:600; }
.bx-private .bx-private-profile :focus-visible, .bx-private .bx-rail :focus-visible { outline-color:var(--bx-gold) !important; }
.bx-private-home { display:flex; flex-direction:column; flex:1 0 auto; min-width:0; height:100%; min-height:100%; overflow:auto; background:var(--bx-private-cream); }
.bx-private-hero { position:relative; flex-shrink:0; min-height:360px; padding:43px clamp(25px,4vw,66px) 30px; color:#f9f5ee; background:#211911 url('/images/private-home-banner.png') center right / cover no-repeat; }
.bx-private-hero::before { content:''; position:absolute; inset:0; background:linear-gradient(90deg,#15100bc7 0%,#15100b75 45%,#15100b00 80%); pointer-events:none; }
.bx-hero-copy { position:relative; max-width:690px; }
.bx-private-eyebrow { display:flex; gap:18px; align-items:center; margin:0 0 12px; color:#edc080; letter-spacing:.5em; font-size:13px; font-weight:500; }
.bx-private-eyebrow span { width:42px; height:1px; background:#a87b44; }
.bx-private-hero h1 { margin:0 0 4px; font-size:clamp(30px,3vw,44px); font-weight:800; letter-spacing:-.025em; line-height:1.12; overflow-wrap:anywhere; padding-right:15px; }
.bx-private-intro { max-width:465px; font-size:17px; line-height:1.35; margin:4px 0 19px; color:#e4dbd0; }
.bx-private-search { display:flex; align-items:center; gap:16px; width:100%; min-height:51px; padding:0 17px; border:1px solid #96816c; border-radius:12px; background:#302821db; box-shadow:inset 0 1px 0 #ffffff0d; color:#edd8bd; }
.bx-private-search:focus-within { border-color:var(--bx-gold); }
.bx-private-search input { flex:1; width:0; min-width:0; background:transparent; border:0; outline:none; color:#fff8ee; padding:13px 0; font-size:15px; }
.bx-private-search input::placeholder { color:#e6dacc; opacity:1; }
.bx-private-search input:focus-visible { outline-offset:0; }
.bx-private-search button { display:grid; place-items:center; width:44px; min-height:44px; border:0; background:transparent; color:var(--bx-gold); border-radius:5px; }
.bx-home-feed { position:relative; flex:1; min-width:0; border-radius:24px 24px 0 0; margin-top:-24px; padding:22px clamp(22px,2.75vw,46px) 22px; background:var(--bx-private-cream); }
.bx-home-feed--home { display:flex; flex-direction:column; gap:clamp(24px,2.5vh,32px); }
.bx-home-feed--home>section:first-child { display:flex; flex-direction:column; }
.bx-home-feed--home .bx-movements { margin-top:0; }
.bx-section-heading { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:16px; }
.bx-home-feed h2 { margin:0 0 3px; font-size:28px; line-height:1.15; font-weight:750; letter-spacing:-.025em; }
.bx-section-heading p { font-size:15px; margin:0; color:var(--bx-muted); }
.bx-private .bx-text-link { display:inline-flex; flex:none; align-items:center; gap:7px; min-height:44px; font-size:14px; color:var(--bx-action); font-weight:600; text-decoration:none; }
.bx-private .bx-text-link:hover { text-decoration:underline; }
.bx-text-link svg { width:16px; height:16px; }
.bx-shop-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:21px; }
.bx-shop-card { min-width:0; overflow:hidden; border-radius:14px; color:#f8f1e7; background:#211b15; box-shadow:0 8px 16px #37200e1a; }
.bx-shop-picture { position:relative; height:auto; aspect-ratio:2.75; min-height:155px; max-height:245px; background:#292015; }
.bx-shop-picture img { position:absolute; inset:0; }
.bx-shop-picture img { width:100%; height:100%; object-fit:cover; object-position:60% 45%; display:block; }
.bx-shop-card:nth-child(2) img { object-position:75% 50%; }
.bx-shop-card:nth-child(3) img { object-position:50% 30%; }
.bx-shop-picture span { position:absolute; bottom:8px; left:10px; background:#18120de8; border-radius:4px; padding:3px 7px; font-size:11px; color:#f0e1ce; }
.bx-shop-info { display:flex; align-items:center; gap:12px; padding:13px 17px 15px; background:linear-gradient(130deg,#30281e,#1b1712); min-height:95px; }
.bx-shop-info>div { flex:1; min-width:0; }
.bx-shop-info h3 { margin:0 0 5px; font-size:18px; line-height:1.2; font-weight:700; overflow-wrap:anywhere; }
.bx-shop-info p { display:flex; align-items:flex-start; gap:6px; margin:0 0 5px; font-size:12px; color:#e4d9cb; overflow-wrap:anywhere; }
.bx-shop-info p svg { width:14px; height:16px; }
.bx-shop-status { display:block; font-size:11px; color:#eac894; }
.bx-private .bx-card-button, .bx-private .bx-gold-button { display:inline-flex; justify-content:center; align-items:center; gap:5px; border:1px solid #b58a51; border-radius:10px; background:linear-gradient(120deg,#805a2b,#54391c); color:#fff7ed; min-height:44px; padding:9px 13px; font-weight:600; font-size:12px; }
.bx-card-button { flex:none; }
.bx-card-button svg { width:14px; height:14px; }
.bx-private .bx-gold-button { font-size:15px; margin-top:20px; }
.bx-movements { margin-top:38px; }
.bx-movements .bx-section-heading { margin-bottom:16px; }
.bx-movement-grid { display:grid; grid-template-columns:1.24fr 1fr 1.3fr; gap:22px; }
.bx-movement { display:flex; flex-direction:column; min-width:0; border:1px solid var(--bx-private-border); padding:14px 18px; border-radius:15px; background:linear-gradient(135deg,var(--bx-private-cream),var(--bx-panel)); box-shadow:0 4px 12px #42230e08; }
.bx-movement h3 { display:flex; align-items:center; gap:12px; margin:0 0 10px; font-size:18px; font-weight:650; line-height:1.2; flex-wrap:wrap; }
.bx-movement h3>svg { color:var(--bx-action); }
.bx-confirmed { margin-left:auto; background:#dcebdc; color:#245833; border-radius:6px; font-size:11px; padding:5px 7px; }
.bx-movement p { font-size:14px; color:var(--bx-muted); line-height:1.45; margin:10px 0; }
.bx-movement a, .bx-home-empty a { color:var(--bx-action); }
.bx-movement-empty { display:flex; flex-direction:column; justify-content:center; flex:1; gap:9px; padding:12px 14px; border:1px solid var(--bx-line); border-radius:12px; background:var(--bx-panel); }
.bx-movement-empty p { margin:0; }
.bx-movement-empty a { display:inline-flex; align-items:center; align-self:flex-start; min-height:44px; font-size:14px; }
.bx-quick-links { display:grid; flex:1; gap:6px; }
.bx-quick-links a { display:flex; align-items:center; gap:14px; min-height:44px; border:1px solid #e0d3c2; border-radius:9px; padding:5px 12px; font-size:13px; color:var(--bx-ink); font-weight:500; text-decoration:none; }
.bx-quick-links a svg { color:var(--bx-action); width:19px; height:19px; }
.bx-quick-links a svg:last-child { margin-left:auto; width:13px; }
.bx-next-link { display:flex; flex:1; gap:14px; align-items:center; min-height:100px; padding:12px 14px; border:1px solid var(--bx-line); border-radius:12px; background:var(--bx-panel); text-decoration:none; }
.bx-next-link>span:nth-child(2) { flex:1; min-width:0; }
.bx-next-link strong, .bx-next-link span span { display:block; color:var(--bx-ink); font-size:14px; overflow-wrap:anywhere; }
.bx-next-link span span { font-size:12px; margin-top:8px; color:var(--bx-muted); }
.bx-next-link span span svg { width:15px; height:15px; margin-right:5px; }
.bx-appointment-mark { display:grid; place-items:center; width:68px; height:75px; background:var(--bx-panel); border:1px solid #e4d8ca; border-radius:11px; }
.bx-appointment-mark svg { width:30px; height:30px; }
.bx-home-empty { padding:28px 20px; border:1px solid var(--bx-private-border); border-radius:14px; background:var(--bx-panel); text-align:center; }
.bx-home-empty>svg { width:30px; height:30px; color:var(--bx-action); }
.bx-home-empty h3 { margin:12px 0 4px; font-size:20px; }
.bx-home-empty p { color:var(--bx-muted); line-height:1.5; }
.bx-home-empty a { display:inline-flex; align-items:center; min-height:44px; }
.bx-catalog-empty { display:grid; grid-template-columns:32px minmax(0,1fr); column-gap:16px; padding:20px 24px; text-align:left; }
.bx-catalog-empty>svg { grid-row:1 / 3; align-self:center; }
.bx-catalog-empty h3 { grid-column:2; margin:0; font-size:19px; line-height:1.3; }
.bx-catalog-empty p { grid-column:2; margin:5px 0 0; font-size:14px; line-height:1.5; }
.bx-inline-note { border:1px solid var(--bx-private-border); background:var(--bx-tint); padding:12px 16px; border-radius:10px; margin-bottom:16px; }
.bx-inline-note button, .bx-movement button { min-height:44px; padding:8px 12px; border:1px solid var(--bx-control); border-radius:7px; background:var(--bx-panel); color:var(--bx-action); }
.bx-shop-detail>p { color:var(--bx-muted); line-height:1.5; }
.bx-shop-detail>p>svg { margin-right:8px; }
.bx-shop-detail h3 { margin:26px 0 14px; }
.bx-service-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; }
.bx-service-grid h4 { margin:0; font-size:18px; }
@media (max-width:1250px) {
  .bx-shop-info { flex-direction:column; align-items:stretch; gap:10px; }
  .bx-movement-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .bx-movement-grid>article:last-child { grid-column:1 / -1; }
  .bx-private-hero { padding-left:32px; padding-right:32px; }
  .bx-hero-copy { max-width:calc(100% - 70px); }
}
@media (max-width:960px) {
  .bx-private .bx-rail { flex-basis:210px; padding-inline:10px; }
  .bx-private .bx-rail .bx-brand { padding:0 8px; gap:10px; font-size:23px; }
  .bx-private .bx-rail nav a { font-size:14px; gap:10px; }
  .bx-shop-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .bx-movement-grid { grid-template-columns:minmax(0,1fr); }
  .bx-service-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media (max-width:52rem) {
  .bx-private { height:100dvh; flex-direction:column; }
  .bx-private .bx-rail { flex:none; flex-basis:auto; padding:12px 16px; gap:12px; overflow:visible; }
  .bx-private .bx-rail::before { display:none; }
  .bx-private .bx-rail .bx-brand { min-height:46px; padding:0; padding-right:80px; }
  .bx-private .bx-brand--official img { width:42px; height:42px; }
  .bx-private .bx-rail nav { flex-wrap:nowrap; overflow-x:auto; padding:3px 1px; gap:5px; }
  .bx-private .bx-rail nav a { flex:none; white-space:nowrap; min-height:44px; padding:8px 12px; font-size:13px; }
  .bx-private .bx-rail nav a svg { width:18px; height:18px; }
  .bx-private .bx-rail-context { display:none; }
  .bx-private .bx-private-profile { top:12px; right:16px; }
  .bx-private--inner .bx-main { padding-top:0; }
  .bx-private-hero { min-height:258px; padding:30px 23px; background-position:100% center; }
  .bx-hero-copy { max-width:100%; }
  .bx-private-hero::before { background:linear-gradient(90deg,#15100bdb,#15100b65); }
  .bx-private-intro { font-size:15px; max-width:360px; }
  .bx-private-hero h1 { font-size:32px; }
  .bx-home-feed { padding:24px 20px 30px; border-radius:20px 20px 0 0; margin-top:-20px; }
  .bx-home-feed h2 { font-size:25px; }
  .bx-section-heading { align-items:flex-start; gap:12px; }
}
@media (max-width:480px) {
  .bx-shop-grid, .bx-service-grid { grid-template-columns:minmax(0,1fr); }
  .bx-shop-info { flex-direction:row; align-items:center; }
  .bx-shop-picture { height:170px; }
  .bx-section-heading { flex-wrap:wrap; margin-bottom:16px; }
  .bx-section-heading .bx-text-link { min-height:44px; }
  .bx-home-feed { padding-inline:16px; }
  .bx-movements { margin-top:28px; }
  .bx-movement { padding:15px 16px; }
  .bx-private-search { gap:10px; padding-inline:12px; }
}
/* Compact desktop proportions shared by every private Web view. */
@media (min-width:1021px) {
  .bx-private--inner .bx-main { padding-top:60.8px; }
  .bx-private [data-bx-part='scroll'] > div { padding:clamp(1rem,2.64vw,2.8rem) !important; gap:clamp(.8rem,1.6vw,1.4rem) !important; }
  .bx-private [data-bx-part='text'][data-bx-variant='title'] { font-size:clamp(1.48rem,2.88vw,2.32rem) !important; }
  .bx-private [data-bx-part='text'][data-bx-variant='display'] { font-size:35.2px !important; line-height:41.6px !important; }
  .bx-private [data-bx-part='text'][data-bx-variant='heading'] { font-size:17px !important; }
  .bx-private [data-bx-part='text'][data-bx-variant='body'],
  .bx-private [data-bx-part='text'][data-bx-variant='action'] { font-size:14px !important; line-height:20px !important; }
  .bx-private [data-bx-part='text'][data-bx-variant='caption'] { font-size:12px !important; line-height:18px !important; }
  .bx-private [data-bx-part='header'] { padding-bottom:clamp(.8rem,2vw,1.32rem) !important; gap:.44rem !important; }
  .bx-private [data-bx-part='section'], .bx-private [data-bx-part='panel'] { padding:clamp(.8rem,1.92vw,1.28rem) !important; border-radius:12.8px !important; }
  .bx-private [data-bx-part='button'] { min-height:44px; padding:9.6px 19.2px !important; }
  .bx-private [data-bx-part='field'] { font-size:14px !important; line-height:20px !important; padding:9.6px !important; min-height:44px; }
  .bx-private .bx-rail { flex-basis:clamp(11.2rem,13.4vw,15.2rem); padding:19.2px 12px; gap:25.6px; }
  .bx-private .bx-rail .bx-brand { padding-inline:14.4px; min-height:44.8px; font-size:20.8px; gap:12.8px; }
  .bx-private .bx-brand--official img { width:41.6px; height:41.6px; }
  .bx-private .bx-rail nav a { padding:8px 12px; gap:12px; font-size:14px; min-height:44px; }
  .bx-private .bx-rail nav a svg { width:18.4px; height:18.4px; }
  .bx-private .bx-private-profile { top:14.4px; right:20px; }
  .bx-private .bx-avatar { width:40px; height:40px; font-size:17px; }
  .bx-private .bx-private-hero { min-height:288px; padding:34.4px clamp(20px,3.2vw,52.8px) 24px; }
  .bx-private .bx-hero-copy { max-width:552px; }
  .bx-private .bx-private-eyebrow { font-size:11px; gap:14.4px; margin-bottom:9.6px; }
  .bx-private .bx-private-hero h1 { font-size:clamp(24px,2.4vw,35.2px); }
  .bx-private .bx-private-intro { max-width:372px; font-size:14px; margin:3.2px 0 15.2px; }
  .bx-private .bx-private-search { min-height:44px; gap:12.8px; padding-inline:13.6px; }
  .bx-private .bx-private-search input { font-size:14px; padding-block:10.4px; }
  .bx-private .bx-home-feed { border-radius:19.2px 19.2px 0 0; margin-top:-19.2px; padding:17.6px clamp(17.6px,2.2vw,36.8px); gap:clamp(19.2px,2vh,25.6px); }
  .bx-private .bx-section-heading { gap:12.8px; margin-bottom:12.8px; }
  .bx-private .bx-home-feed h2 { font-size:22.4px; }
  .bx-private .bx-section-heading p { font-size:13px; }
  .bx-private .bx-shop-grid { gap:16.8px; }
  .bx-private .bx-shop-picture { min-height:124px; max-height:196px; }
  .bx-private .bx-shop-info { padding:10.4px 13.6px 12px; min-height:76px; gap:9.6px; }
  .bx-private .bx-shop-info h3 { font-size:15px; }
  .bx-private .bx-movement-grid { gap:17.6px; }
  .bx-private .bx-movement { padding:11.2px 14.4px; border-radius:12px; }
  .bx-private .bx-movement h3 { font-size:15px; gap:9.6px; margin-bottom:8px; }
  .bx-private .bx-movement p { font-size:13px; margin-block:8px; }
  .bx-private .bx-movement-empty { padding:9.6px 11.2px; gap:7.2px; }
  .bx-private .bx-catalog-empty { padding:16px 19.2px; column-gap:12.8px; }
  .bx-private .bx-catalog-empty h3 { font-size:16px; }
  .bx-private .bx-catalog-empty p { font-size:13px; }
}
`;
