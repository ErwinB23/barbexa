export const welcomeWebStyles = `
.bx-landing { height:100%; min-height:0; overflow-y:auto; scroll-behavior:smooth; background:#14110e; color:#f8f5ef; --landing-gold:#eebc7d; }
.bx-landing * { box-sizing:border-box; }
.bx-landing a { color:inherit; text-decoration:none; }
.bx-landing a:focus-visible { outline-color:var(--landing-gold) !important; }
.bx-landing section { scroll-margin-top:var(--landing-header-height, 94px); }
.bx-landing-header { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:.65rem clamp(1.1rem,5.5vw,6rem); min-height:80px; position:sticky; top:0; z-index:3; background:#14110f; border-bottom:1px solid #d4a86e26; }
.bx-landing-brand { flex-shrink:0; }
.bx-landing-brand .bx-brand { font-size:clamp(1.4rem,2vw,1.95rem); }
.bx-landing-header nav { font-size: 22px; display:flex; gap:clamp(.75rem,3.2vw,3.5rem);}
.bx-landing-header nav a { display:flex; align-items:center; min-height:48px; position:relative; white-space:nowrap; }
.bx-landing-header nav a:hover { color:var(--landing-gold); }
.bx-landing-header nav a[aria-current='location']::after { content:''; height:2px; background:var(--landing-gold); position:absolute; bottom:0; left:0; right:0; }
.bx-landing-access { display:flex; gap:1.4rem; }
.bx-landing-access a {font-size: 18px; display:inline-flex; align-items:center; justify-content:center; min-height:48px; padding:.65rem 1.75rem; border-radius:16px; border:1px solid #d8d0c5; font-weight:600; white-space:nowrap; }
.bx-landing-access .bx-landing-register { color:#21170d; background:linear-gradient(#f1c795,#ce8c47); border-color:#eac28c; box-shadow:inset 0 0 0 2px #fff1c620; }
.bx-landing-access a:hover { box-shadow:0 0 0 2px #eac28c70; }
.bx-landing-hero { overflow:hidden; position:relative; isolation:isolate; min-height:max(690px,calc(100svh - 80px)); padding:clamp(3rem,6vw,6rem) clamp(1.25rem,10.3vw,11rem) 7.8rem; display:flex; flex-direction:column; }
.bx-landing-photo { position:absolute; inset:0; left:25%; z-index:0; width:100%; height:100%; object-fit:cover; object-position:65% center; }
.bx-landing-hero::before { content:''; position:absolute; inset:0; z-index:1; background:linear-gradient(90deg,#100e0cf5 0%,#100e0cde 28%,#100e0c6e 50%,#100e0c00 73%),linear-gradient(0deg,#100e0c45,transparent 35%); }
.bx-landing-hero::after { content:''; position:absolute; top:0; left:0; width:min(17vw,280px); height:32%; z-index:1; border-top:1px solid #c48c4566; background:linear-gradient(145deg,#96603288,transparent 67%); clip-path:polygon(0 0,100% 0,0 100%); }
.bx-landing-copy { position:relative; z-index:2; width:min(49vw,760px); }
.bx-landing-flourish { display:flex; align-items:center; justify-content:center; gap:1.3rem; width:min(100%,570px); }
.bx-landing-flourish svg { width:56px; height:56px; color:#f4d5a6; }
.bx-landing-flourish span { width:90px; height:1px; background:linear-gradient(90deg,transparent,#c69b62); }
.bx-landing-flourish span:last-child { transform:rotate(180deg); }
.bx-landing-eyebrow { font-size:.78rem; letter-spacing:.29em; text-align:center; width:min(100%,570px); color:#f4d1a1; margin:1.15rem 0 2.4rem; }
.bx-landing h1 { font-size:clamp(3.2rem,5.05vw,5.75rem); line-height:1.05; letter-spacing:-.042em; font-weight:750; margin:0; }
.bx-landing h1 em { display:block; width:fit-content; color:var(--landing-gold); font-weight:750; position:relative; padding-bottom:.24em; }
.bx-landing h1 em::after { content:''; width:40%; position:absolute; bottom:0; left:30%; height:12px; border-top:3px solid #eebc7d; border-radius:50%; transform:rotate(-3deg); }
.bx-landing-description { font-size:clamp(1.1rem,1.5vw,1.55rem); line-height:1.4; max-width:580px; margin:1.8rem 0 2rem; }
.bx-landing-highlights { position:relative; z-index:2; list-style:none; display:flex; flex-wrap:wrap; gap:1.5rem 2rem; padding:0; margin:auto 0 0; padding-top:6rem; }
.bx-landing-highlights li { display:flex; gap:1.1rem; align-items:center; padding-right:2rem; border-right:1px solid #e3ba7e66; font-size:1.1rem; line-height:1.2; }
.bx-landing-highlights li:last-child { border:0; padding:0; }
.bx-landing-highlights svg { width:44px; height:44px; color:var(--landing-gold); flex:none; }
.bx-landing-info { background:var(--bx-canvas); color:var(--bx-ink); padding:clamp(3rem,6vw,6rem) clamp(1.25rem,7vw,8rem); }
.bx-landing-info h2 { margin:0 0 2rem; font-size:clamp(1.9rem,3vw,3rem); line-height:1.1; letter-spacing:-.03em; }
.bx-landing-steps,.bx-landing-benefits { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1.25rem; }
.bx-landing-info article { padding:1.8rem; border:1px solid var(--bx-line); border-radius:16px; background:var(--bx-panel); }
.bx-landing-info article>svg { width:32px; height:32px; color:var(--bx-action); }
.bx-landing-info h3 { font-size:1.25rem; line-height:1.3; margin:.65rem 0; }
.bx-landing-info p { color:var(--bx-muted); line-height:1.6; margin:.75rem 0 0; }
.bx-landing-info .bx-landing-step { font-size:.85rem; font-weight:600; color:var(--bx-action); }
.bx-landing-info .bx-flip {
  position:relative; perspective:1200px; padding:0; border:0;
  background:transparent; min-width:0; border-radius:16px;
}
.bx-flip-inner { display:grid; grid-template-columns:minmax(0,1fr); height:100%; transform-style:preserve-3d; transition:transform 600ms cubic-bezier(.22,.61,.36,1); }
.bx-flip[data-flipped='true'] .bx-flip-inner { transform:rotateY(180deg); }
.bx-flip-face {
  grid-area:1 / 1; min-width:0; min-height:28rem; padding:clamp(1.3rem,2.4vw,2rem); padding-bottom:5rem;
  border:1px solid var(--bx-line); border-radius:16px; backface-visibility:hidden; -webkit-backface-visibility:hidden;
  overflow-wrap:anywhere; box-shadow:0 8px 24px #42230e0b;
}
.bx-flip-front { background:var(--bx-panel); display:flex; flex-direction:column; justify-content:center; transform:rotateY(0deg); }
.bx-flip-top { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:2rem; }
.bx-flip-top svg { width:42px; height:42px; color:var(--bx-action); }
.bx-flip-number { font-size:3.6rem; font-weight:600; line-height:1; letter-spacing:-.06em; color:var(--bx-action); }
.bx-landing-info .bx-flip h3 { font-size:1.45rem; letter-spacing:-.02em; margin:0 0 .8rem; }
.bx-flip-back { transform:rotateY(180deg); background:var(--bx-rail); color:var(--bx-rail-text); border-color:#8c6a42; }
.bx-landing-info .bx-flip-back p { color:var(--bx-rail-text); }
.bx-landing-info .bx-flip-back .bx-flip-back-step { color:var(--bx-gold); font-size:.875rem; font-weight:600; margin:0 0 1rem; }
.bx-flip-back ul { padding-left:1.2rem; margin:1.25rem 0 0; display:grid; gap:.65rem; line-height:1.5; }
.bx-flip-back li::marker { color:var(--bx-gold); }
.bx-flip-control {
  position:absolute; inset:0; width:100%; height:100%; padding:0; border:0; border-radius:16px;
  background:transparent; cursor:pointer; color:var(--bx-action); font:600 1rem var(--bx-font); text-align:left;
  -webkit-tap-highlight-color:transparent;
}
.bx-flip-control > span { position:absolute; bottom:1.6rem; left:clamp(1.3rem,2.4vw,2rem); right:clamp(1.3rem,2.4vw,2rem); display:flex; justify-content:space-between; gap:1rem; }
.bx-flip[data-flipped='true'] .bx-flip-control { color:var(--bx-gold); }
.bx-web .bx-flip-control:focus-visible { outline:3px solid var(--bx-action) !important; outline-offset:5px; }
.bx-flip:hover .bx-flip-face { box-shadow:0 12px 28px #42230e18; }
@media(prefers-reduced-motion:reduce) {
  .bx-flip-inner, .bx-flip[data-flipped='true'] .bx-flip-inner { transition:none; transform:none; }
  .bx-flip-face { transform:none; }
  .bx-flip-face[aria-hidden='true'] { visibility:hidden; }
}
.bx-landing-info--benefits { background:#eee7dd; }
.bx-landing-benefits { grid-template-columns:repeat(2,minmax(0,1fr)); }
.bx-landing-benefits .bx-flip-face { min-height:24rem; }
.bx-landing-benefits .bx-flip-top { margin-bottom:1.5rem; }
.bx-landing-footer { display:flex; flex-wrap:wrap; justify-content:space-between; gap:1rem; align-items:center; padding:1.25rem clamp(1.25rem,7vw,8rem); }
.bx-landing-footer a { min-height:44px; display:inline-flex; align-items:center; text-decoration:underline; }
@media(max-width:70rem) {
 .bx-landing-header { flex-wrap:wrap; padding-inline:1.25rem; }
 .bx-landing-header nav { order:3; width:100%; justify-content:center; gap:2rem; }
 .bx-landing-hero { padding-inline:6vw; min-height:740px; }
 .bx-landing-copy { width:58vw; }
 .bx-landing-benefits { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media(max-width:45rem) {
 .bx-landing-header { gap:.5rem; }
 .bx-landing-brand .bx-brand { font-size:1.4rem; }
 .bx-brand--official img { width:46px; height:46px; }
 .bx-landing-access { gap:.5rem; }
 .bx-landing-access a { padding:.5rem .7rem; border-radius:10px; font-size:.9rem; }
 .bx-landing-header nav { gap:.5rem; justify-content:space-between; font-size:.9rem; }
 .bx-landing-hero { min-height:780px; padding:2.75rem 1.4rem 2rem; }
 .bx-landing-copy { width:100%; }
 .bx-landing-flourish svg { width:42px; height:42px; }
 .bx-landing-eyebrow { font-size:.64rem; letter-spacing:.18em; margin-bottom:1.8rem; }
 .bx-landing h1 { font-size:clamp(2.65rem,9.4vw,4rem); }
 .bx-landing-description { font-size:1.12rem; max-width:32rem; }
 .bx-landing-photo { left:0; object-position:45% center; }
 .bx-landing-hero::before { background:linear-gradient(180deg,#100e0cf5,#100e0cde 46%,#100e0c30 77%,#100e0ce8); }
 .bx-landing-highlights { gap:1.25rem; padding-top:12rem; }
 .bx-landing-highlights li { border:0; padding:0; flex:1 1 40%; gap:.65rem; font-size:.94rem; }
 .bx-landing-highlights svg { width:32px; height:32px; }
 .bx-landing-steps,.bx-landing-benefits { grid-template-columns:minmax(0,1fr); }
}
@media(prefers-reduced-motion:reduce) { .bx-landing { scroll-behavior:auto; } }

/* Match the approved Auth proportions in the public header and presentation only. */
@media (min-width: 1021px) {
.bx-landing section { scroll-margin-top:var(--landing-header-height, 75.2px)
}
.bx-landing-header { gap:0.8rem; padding:0.52rem clamp(0.88rem,5.5vw,4.8rem); min-height:64px; border-bottom:0.8px solid #d4a86e26
}
.bx-landing-brand .bx-brand { font-size:clamp(1.12rem,2vw,1.56rem)
}
.bx-landing-header nav { font-size: 17.6px; gap:clamp(0.6rem,3.2vw,2.8rem)
}
.bx-landing-header nav a { min-height:38.4px
}
.bx-landing-header nav a[aria-current='location']::after { height:1.6px
}
.bx-landing-access { gap:1.12rem
}
.bx-landing-access a {font-size: 14.4px; min-height:38.4px; padding:0.52rem 1.4rem; border-radius:12.8px; border:0.8px solid #d8d0c5
}
.bx-landing-access .bx-landing-register { box-shadow:inset 0 0 0 1.6px #fff1c620
}
.bx-landing-access a:hover { box-shadow:0 0 0 1.6px #eac28c70
}
.bx-landing-hero { min-height:max(552px,calc(100svh - 64px)); padding:clamp(2.4rem,6vw,4.8rem) clamp(1rem,10.3vw,8.8rem) 6.24rem
}
.bx-landing-hero::after { width:min(17vw,224px); border-top:0.8px solid #c48c4566
}
.bx-landing-copy { width:min(49vw,608px)
}
.bx-landing-flourish { gap:1.04rem; width:min(100%,456px)
}
.bx-landing-flourish svg { width:44.8px; height:44.8px
}
.bx-landing-flourish span { width:72px; height:0.8px
}
.bx-landing-eyebrow { font-size:0.624rem; width:min(100%,456px); margin:0.92rem 0 1.92rem
}
.bx-landing h1 { font-size:clamp(2.56rem,5.05vw,4.6rem)
}
.bx-landing h1 em::after { height:9.6px; border-top:2.4px solid #eebc7d
}
.bx-landing-description { font-size:clamp(0.88rem,1.5vw,1.24rem); max-width:464px; margin:1.44rem 0 1.6rem
}
.bx-landing-highlights { gap:1.2rem 1.6rem; padding-top:4.8rem
}
.bx-landing-highlights li { gap:0.88rem; padding-right:1.6rem; border-right:0.8px solid #e3ba7e66; font-size:0.88rem
}
.bx-landing-highlights svg { width:35.2px; height:35.2px
}
.bx-landing-header .bx-brand--official img { width: 44.8px; height: 44.8px; }
}
`;
