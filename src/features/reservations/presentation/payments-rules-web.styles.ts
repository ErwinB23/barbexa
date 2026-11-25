export const paymentsRulesStyles = `
.bx-pr {width:100%;font-family:var(--bx-font);color:var(--bx-ink);padding-bottom:12px;}
.bx-pr *, .bx-pr *::before, .bx-pr *::after {box-sizing:border-box;}
.bx-pr h2,.bx-pr h3,.bx-pr h4,.bx-pr p {margin:0;}
.bx-pr svg {width:24px;height:24px;flex:none;}
.bx-pr-title {border-left:4px solid #b7812d;padding-left:12px;margin:8px 0 18px;}
.bx-pr-title h2 {font-size:26px;line-height:1.3;}
.bx-pr-title p {font-size:14px;line-height:1.6;color:var(--bx-muted);margin-top:3px;}
.bx-pr-banner {isolation:isolate;position:relative;overflow:hidden;display:flex;gap:16px;align-items:center;padding:22px 24px;margin-bottom:18px;border-radius:15px;color:#fff7e8;background:linear-gradient(115deg,#6b431b,#3f2914 60%,#946025);box-shadow:0 4px 12px #61401912;}
.bx-pr-banner::after {content:'';position:absolute;z-index:-1;width:460px;height:180px;right:-65px;bottom:-120px;border:1px solid #e8bc70;background:linear-gradient(150deg,#c38d37,#86531f);border-radius:50%;transform:rotate(-18deg);}
.bx-pr-banner > svg {width:36px;height:36px;color:#e5bd72;}
.bx-pr-banner h3 {font-size:20px;line-height:1.4;}
.bx-pr-banner p {font-size:14px;line-height:1.6;color:#f0dfc6;}
.bx-pr-banner > div {position:relative;z-index:1;padding-right:90px;}
.bx-pr-terminal {position:absolute;right:35px;transform:rotate(-15deg);color:#edcc8d;opacity:.65;}.bx-pr-terminal svg{width:76px;height:76px;}
.bx-pr-grid {display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:18px;align-items:stretch;}
.bx-pr-card {min-width:0;padding:20px;border:1px solid var(--bx-line);border-radius:17px;background:linear-gradient(120deg,#fffdfa,#fcf8f2);box-shadow:0 4px 14px #61401908;}
.bx-pr-heading {display:flex;align-items:center;gap:12px;margin-bottom:16px;}.bx-pr-heading > div{min-width:0;}.bx-pr-heading h3{font-size:20px;line-height:1.3;}.bx-pr-heading p{font-size:13px;line-height:1.5;color:var(--bx-muted);margin-top:3px;}
.bx-pr-icon {display:grid;place-items:center;width:42px;height:42px;flex:none;border-radius:12px;background:#faeacb;color:#936122;}
.bx-pr-method {display:flex;align-items:center;gap:12px;padding:14px 12px;border:1px solid var(--bx-line);border-radius:12px;margin-bottom:10px;}.bx-pr-method > div{flex:1;min-width:0;}.bx-pr h4{font-size:15px;line-height:1.4;}.bx-pr-method p{font-size:12px;color:var(--bx-muted);line-height:1.4;}
.bx-pr-yape {display:grid;place-items:center;background:#77248b;color:white;width:36px;height:36px;font-size:18px;font-weight:700;border-radius:9px;flex:none;}
.bx-pr-badge {padding:4px 9px;border-radius:20px;background:#e5f0d8;color:#316227;font-size:12px;font-weight:650;white-space:nowrap;}.bx-pr-badge.is-neutral{background:#f2e7d5;color:#765625;}
.bx-pr button {font:600 13px var(--bx-font);border:1px solid #d6bea0;border-radius:10px;color:#704719;background:#fffaf3;min-height:38px;padding:9px 12px;cursor:pointer;line-height:1.4;}
.bx-pr button:disabled,.bx-pr input:disabled,.bx-pr textarea:disabled{opacity:.55;cursor:default;}.bx-pr button:focus-visible,.bx-pr input:focus-visible,.bx-pr textarea:focus-visible {outline:3px solid #ac7b38;outline-offset:3px;}.bx-pr button:not(:disabled):hover{border-color:#926021;background:#fbefd9;}
.bx-pr .bx-pr-read [data-bx-part='button'] {min-height:38px!important;background:transparent!important;border-color:#d6bea0!important;box-shadow:none!important;}.bx-pr .bx-pr-read [data-bx-part='text']{font-size:13px!important;color:#704719!important;}
.bx-pr-read {margin:12px 0;}
.bx-pr-info {display:flex;gap:12px;border-top:1px solid var(--bx-line);padding:14px 0;}.bx-pr-info:last-child{padding-bottom:0;}.bx-pr-info > svg{color:#9b6728;margin-top:2px;}.bx-pr-info p{font-size:13px;color:var(--bx-muted);line-height:1.5;margin-top:3px;}
.bx-pr-field {display:grid;gap:9px;font-size:14px;font-weight:650;}.bx-pr-number {display:flex;border:1px solid #c8b79f;border-radius:10px;background:#fffdfa;overflow:hidden;}.bx-pr-number input {width:100%;min-width:0;border:0;background:transparent;padding:11px 12px;font:500 16px var(--bx-font);color:var(--bx-ink);}.bx-pr-number > span {align-self:center;font-size:12px;font-weight:400;color:var(--bx-muted);padding:0 12px;}
.bx-pr .bx-pr-hint {font-size:12px;color:var(--bx-muted);line-height:1.6;margin-top:9px;}.bx-pr .bx-pr-example {padding:10px 12px;background:#f6ecdb;border-radius:9px;font-size:12px;line-height:1.6;margin-top:12px;color:#735024;}.bx-pr-rule-body{display:grid;gap:4px;}.bx-pr-rule-body .bx-pr-read {margin-top:0;}.bx-pr-secondary{margin-top:10px;justify-self:start;}
.bx-pr-footer {margin-top:20px;}.bx-pr-footer > p{font-size:12px;color:var(--bx-muted);line-height:1.6;margin-bottom:10px;}.bx-pr button.bx-pr-save {width:100%;min-height:48px;display:flex;justify-content:center;align-items:center;gap:12px;background:linear-gradient(110deg,#9a651f,#694015);color:#fffaf1;border-color:#a17435;box-shadow:0 3px 10px #61401918;font-size:15px;}.bx-pr-footer [role='status']{font-size:13px;margin-top:10px;}

.bx-pr-grid {grid-template-columns:repeat(12,minmax(0,1fr));gap:18px;align-items:start;}
.bx-pr-payments {grid-column:span 7;}.bx-pr-payment-rules{grid-column:span 5;}.bx-pr-attendance,.bx-pr-reservations{grid-column:span 6;align-self:stretch;}
.bx-pr-card{padding:18px;}.bx-pr-heading{margin-bottom:14px;}.bx-pr-heading h3{font-size:20px;}.bx-pr-method{padding:12px;gap:12px;min-height:66px;}.bx-pr-method > div{min-width:90px;}.bx-pr-method p{max-width:220px;}
.bx-pr .bx-pr-switch {position:relative;display:inline-flex;align-items:center;width:42px;min-width:42px;height:24px;min-height:24px;padding:3px;border:1px solid #bca580;border-radius:20px;background:#d9d0c2;flex:none;}
.bx-pr .bx-pr-switch i{width:17px;height:17px;border-radius:50%;background:#fffcf3;box-shadow:0 1px 3px #43280044;display:block;}
.bx-pr .bx-pr-switch.is-on{background:linear-gradient(110deg,#af741d,#87500d);border-color:#ad7b2f;justify-content:flex-end;}
.bx-pr .bx-pr-switch.is-fixed{cursor:default;}
.bx-pr-payment-strip {display:grid;grid-template-columns:1fr 1fr 1.25fr;gap:10px;align-items:center;padding:12px;margin-top:14px;border:1px solid #efdfc7;border-radius:12px;background:linear-gradient(105deg,#fff4dd,#f6ecdc);}
.bx-pr-payment-strip > div{display:flex;align-items:center;gap:8px;min-width:0;}.bx-pr-payment-strip > div + div{border-left:1px solid #d6bc94;padding-left:12px;}.bx-pr-payment-strip strong{font-size:12px;line-height:1.4;display:block;}.bx-pr-payment-strip small{font-size:11px;line-height:1.4;color:var(--bx-muted);display:block;margin-top:3px;}.bx-pr-payment-strip svg{width:22px;height:22px;color:#8e5e23;}.bx-pr-payment-strip .bx-pr-read{margin:0;}
.bx-pr .bx-pr-payment-strip [data-bx-part='button']{padding:7px!important;}.bx-pr .bx-pr-payment-strip [data-bx-part='text']{font-size:11px!important;}
.bx-pr-info{border:1px solid #ecdfcf;border-radius:12px;background:#fcf8f1;margin-top:8px;padding:12px;gap:12px;}.bx-pr-info:last-child{padding-bottom:12px;}.bx-pr-info > svg{padding:6px;box-sizing:content-box;width:25px;height:25px;border-radius:10px;background:#fbebce;}.bx-pr-info p{font-size:12px;}.bx-pr-info h4{font-size:14px;}
.bx-pr-confirm{padding:14px;border:1px solid #d4af78;background:#fff5e6;border-radius:12px;margin:10px 0;}.bx-pr-confirm p{font-size:13px;line-height:1.5;margin:5px 0 10px;}.bx-pr-confirm button{margin-right:8px;}
.bx-pr-example-details{margin-top:10px;}.bx-pr-example-details summary{font-size:12px;color:#80551e;cursor:pointer;}.bx-pr-rule-body .bx-pr-example{font-size:12px;padding:7px 10px;}
.bx-pr-rule-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;}.bx-pr-rule-actions button{font-size:12px;padding:7px 10px;}.bx-pr-rule-body .bx-pr-example{background:transparent;padding:0;margin-top:3px;}
@media(max-width:1150px){.bx-pr-payment-strip{grid-template-columns:1fr 1fr;}.bx-pr-payment-strip > .bx-pr-read{grid-column:1/-1;border-left:0;padding:0;}.bx-pr-method{flex-wrap:wrap;}.bx-pr-method > div{flex-basis:35%;}}
@media(max-width:950px){.bx-pr-grid{grid-template-columns:minmax(0,1fr);}.bx-pr-card{grid-column:auto;}}
@media(max-width:950px){.bx-pr-grid{grid-template-columns:minmax(0,1fr);}.bx-pr-method{flex-wrap:wrap;}.bx-pr-method > div{flex-basis:40%;}}
@media(max-width:520px){.bx-pr-card{padding:16px;}.bx-pr-banner{padding:18px 16px;}.bx-pr-banner > div{padding-right:0;}.bx-pr-terminal{display:none;}.bx-pr-banner h3{font-size:18px;}.bx-pr-heading h3{font-size:19px;}.bx-pr-method .bx-pr-badge{margin-left:auto;}.bx-pr-method button{margin-left:48px;}}

.bx-yape-region { grid-column:1/-1; container-type:inline-size; }
.bx-pr .bx-yape-editor { display:grid; width:100%; max-width:800px; grid-template-columns:minmax(0,1.05fr) minmax(0,1fr); gap:12px; align-items:start; padding:18px; }
.bx-yape-fields,.bx-yape-preview { min-width:0; }
.bx-yape-preview { padding-left:12px; border-left:1px solid var(--bx-line); }
.bx-yape-editor .bx-pr-heading h3 { font-size:18px; }
.bx-yape-editor .bx-pr-heading p { font-size:12px; }
.bx-yape-editor .bx-pr-icon { width:38px; height:38px; }
.bx-yape-editor svg { width:20px; height:20px; }
.bx-yape-field { display:grid; max-width:360px; gap:6px; margin-top:12px; font-size:14px; font-weight:600; }
.bx-yape-field > span { display:flex; align-items:center; gap:8px; padding-inline:10px; border:1px solid #dccab4; border-radius:10px; background:#fffdfa; color:#89571d; }
.bx-yape-field input,.bx-yape-field textarea { min-width:0; width:100%; padding:10px 3px; border:0; background:transparent; color:var(--bx-ink); font:500 16px var(--bx-font); }
.bx-yape-field textarea { padding:10px; border:1px solid #dccab4; border-radius:10px; resize:vertical; }
.bx-yape-fields > h4 { margin-top:16px; }
.bx-yape-upload-row { display:flex; max-width:360px; flex-wrap:wrap; gap:10px; margin-top:8px; }
.bx-yape-upload { position:relative; display:grid; place-items:center; align-content:center; gap:6px; text-align:center; flex:1 1 160px; min-height:112px; padding:10px; border:1px dashed #c5a474; border-radius:12px; background:#faf3e8; color:#81501c; cursor:pointer; }
.bx-yape-upload:hover { background:#f6ebd8; }
.bx-yape-upload:focus-within { outline:3px solid #ac7b38; outline-offset:2px; }
.bx-yape-upload > span { padding:6px 12px; border:1px solid #d6bea0; border-radius:8px; font-size:13px; background:#fffdfa; }
.bx-yape-upload input { position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer; }
.bx-yape-uploaded { position:relative; flex:0 1 148px; max-width:100%; align-self:center; }
.bx-yape-uploaded img,.bx-yape-qr { display:block; width:100%; max-height:208px; object-fit:contain; padding:8px; border:1px solid #ebdac4; border-radius:12px; background:white; }
.bx-yape-uploaded button { position:absolute; right:4px; top:4px; display:grid; place-items:center; width:44px; height:44px; padding:0; }
.bx-yape-fields .bx-yape-error { margin-top:6px; font-size:13px; color:#9d3026; }
.bx-yape-actions { display:flex; flex-wrap:wrap; gap:10px; margin-top:16px; }
.bx-yape-actions button.bx-pr-save { width:auto; min-height:44px; font-size:14px; padding-inline:20px; }
.bx-yape-actions button { display:flex; align-items:center; justify-content:center; gap:8px; min-height:44px; }
.bx-yape-actions button.bx-pr-save:hover:not(:disabled) { background:linear-gradient(110deg,#875818,#58330e); }
.bx-yape-fields [role=status]:not(:empty) { margin-top:10px; font-size:13px; }
.bx-yape-payment { border:1px solid #efdfc8; border-radius:16px; background:#f9f0e3; overflow:hidden; box-shadow:0 5px 15px #61401912; }
.bx-yape-brand { position:relative; isolation:isolate; overflow:hidden; display:flex; align-items:center; justify-content:center; gap:8px; min-height:58px; padding-bottom:12px; background:linear-gradient(120deg,#8f3789,#4f115f); color:white; font-size:28px; font-weight:700; font-style:italic; }
.bx-yape-brand span { border-radius:50%; background:#39d6c0; color:#4f115f; padding:5px; font-size:14px; font-style:normal; }
.bx-yape-brand::after { content:''; position:absolute; z-index:-1; width:120%; height:36px; bottom:-24px; left:-10%; border-top:5px solid #edc581; border-radius:50% 62% 0 0; transform:rotate(-2deg); background:#f9f0e3; }
.bx-yape-payment-body { padding:10px 12px 12px; text-align:center; }
.bx-yape-payment-body h4 { font-size:20px; }
.bx-yape-payment-body p { color:#594a3c; font-size:13px; }
.bx-yape-payment-body dl { display:grid; gap:6px; margin:10px 0; text-align:left; }
.bx-yape-payment-body dl > div { display:grid; grid-template-columns:auto minmax(0,1fr) minmax(0,1fr); align-items:center; gap:7px; padding:8px; background:#fffdfa; border:1px solid #ebdac4; border-radius:9px; font-size:13px; }
.bx-yape-payment-body svg { color:#89571d; }
.bx-yape-payment-body dd { margin:0; font-weight:650; overflow-wrap:anywhere; }
.bx-yape-qr { width:min(100%,180px); margin:0 auto; }
.bx-yape-qr-empty { display:grid; justify-items:center; gap:6px; padding:14px; color:#6d5b46; font-size:13px; }
.bx-yape-payment-body .bx-yape-reminder { margin-top:12px; padding:9px 10px; border-radius:9px; background:#f4e4c9; }
@container (max-width:620px) { .bx-pr .bx-yape-editor { max-width:420px; grid-template-columns:minmax(0,1fr); gap:20px; padding:18px; } .bx-yape-preview { padding:20px 0 0; border-left:0; border-top:1px solid var(--bx-line); } }
@container (max-width:380px) { .bx-yape-actions { flex-direction:column; } }
`;
