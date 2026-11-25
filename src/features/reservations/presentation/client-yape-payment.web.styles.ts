export const clientYapePaymentStyles = `
.bx-client-yape { overflow:hidden; border:1px solid #ebdac3; border-radius:18px; background:linear-gradient(130deg,#fffaf3,#f8eddd); box-shadow:0 5px 16px #57300f0d; width:100%; max-width:420px; margin:4px auto; color:#39281c; }
.bx-client-yape .bx-client-yape-brand { position:relative; isolation:isolate; overflow:hidden; display:flex; align-items:center; justify-content:center; gap:8px; min-height:88px; padding:12px 16px 24px; background:linear-gradient(120deg,#91388d,#4e105d); color:white; }
.bx-client-yape-brand strong { font-size:32px; font-weight:700; font-style:italic; }
.bx-client-yape-brand span { border-radius:50%; padding:5px; background:#2ed1bc; color:#571068; font-size:14px; font-weight:700; }
.bx-client-yape-brand::after { content:''; position:absolute; z-index:-1; height:32px; width:120%; bottom:-20px; left:-10%; border-top:6px solid #eac47f; background:#fff7ed; border-radius:60% 70% 0 0; transform:rotate(-3deg); }
.bx-client-yape-body { padding:12px 14px 16px; }
.bx-own .bx-client-yape-body h3 { font-size:20px; text-align:center; margin-bottom:5px; }
.bx-client-yape-body>p { text-align:center; color:#75634e; font-size:13px; line-height:1.6; }
.bx-client-yape-total { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:10px 12px; background:#f4e5cc; border-radius:10px; margin:14px 0 10px; font-size:13px; }
.bx-client-yape-total strong { font-size:18px; color:#79501d; }
.bx-client-yape dl { display:grid; gap:8px; margin:0; }
.bx-client-yape dl>div { display:flex; align-items:center; flex-wrap:wrap; gap:6px 10px; padding:10px; border:1px solid #e7d7c1; border-radius:10px; background:#fffdfa; }
.bx-client-yape dt { font-size:12px; color:#7c6852; flex:1; }
.bx-client-yape dd { margin:0; font-weight:600; font-size:14px; overflow-wrap:anywhere; }
.bx-client-yape button { min-height:44px; padding:6px 9px; border:1px solid #dcc8a8; background:#fff7e9; color:#7b501d; border-radius:8px; font:500 12px Outfit,sans-serif; cursor:pointer; }
.bx-client-yape-copy { min-height:8px; font-size:12px; color:#627044; padding-top:4px; }
.bx-client-yape-qr { display:grid; justify-items:center; gap:6px; text-align:center; border:1px dashed #ddc9aa; border-radius:12px; padding:18px 12px; margin:6px auto 12px; max-width:230px; font-size:12px; color:#80674c; }
.bx-own .bx-client-yape-qr svg { width:32px; height:32px; }
.bx-client-yape-instructions { font-size:13px; line-height:1.6; margin-bottom:12px; }
.bx-client-yape-instructions h4 { margin:0 0 6px; font-size:13px; }
.bx-client-yape-instructions p { white-space:pre-wrap; overflow-wrap:anywhere; }
.bx-client-yape-body .bx-client-yape-notice { background:#f4e5cc; padding:10px 12px; border-radius:10px; font-size:12px; line-height:1.6; }
.bx-client-yape-report { display:grid; gap:10px; margin:14px 0; padding-top:14px; border-top:1px solid #e2cfb3; font-size:13px; }
.bx-client-yape-report label { display:grid; gap:7px; font-weight:600; }
.bx-client-yape-report input { width:120px; min-height:44px; border:1px solid #ccb28e; border-radius:9px; padding:9px 12px; background:#fffdfa; color:#38271b; font:600 18px Outfit,sans-serif; }
.bx-client-yape-report small { line-height:1.6; }
.bx-client-yape-report button { font-size:14px; color:#fffaf1; background:linear-gradient(110deg,#966222,#674019); }
.bx-client-yape-report button:disabled { opacity:.5; cursor:default; }
.bx-client-yape-report input:focus-visible,.bx-client-yape button:focus-visible { outline:3px solid #a87b36; outline-offset:3px; }
.bx-client-yape-report p { font-size:12px; line-height:1.5; }
`;
