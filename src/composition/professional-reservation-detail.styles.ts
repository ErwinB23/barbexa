export const professionalDetailStyles = `
.bx-pro-dashboard.bx-pa-unified-card{display:block;width:100%;min-width:0}
.bx-pa-unified-card .bx-pro-appointment{margin-top:0}
.bx-pa-unified-card+.bx-pa-unified-card{margin-top:12px}
.bx-pro-dashboard .bx-pro-appointment+.bx-pro-appointment{margin-top:12px}
.bx-pro-dashboard .bx-pro-badge--neutral,.bx-pa-status--neutral,.bx-rd-state.is-neutral{background:#ece7df;color:#655c50}
.bx-pro-dashboard .bx-pro-badge--blue,.bx-pa-status--blue{background:#e4edf9;color:#2c5182}
.bx-pa-unified-card .bx-pro-badge{gap:6px}
.bx-pa-unified-card .bx-pro-badge svg{width:14px;height:14px;color:currentColor;flex:none}
.bx-pro-appointment:has(.bx-rd){container-type:inline-size}
.bx-pro-appointment .bx-pro-appointment-toggle{display:grid;place-items:center;width:36px;height:36px;flex:0 0 36px;border:1px solid #e3cfac;border-radius:50%;background:#fbf1df;color:#865b20}
.bx-pro-appointment .bx-pro-appointment-toggle svg{width:18px;height:18px;transform:rotate(90deg);color:currentColor}
.bx-pro-appointment>summary:hover .bx-pro-appointment-toggle{background:#f4e2bf;border-color:#b48640}
.bx-pro-appointment[open] .bx-pro-appointment-toggle{background:#ffffff16;border-color:#d8b77e80;color:#fff0cf}
.bx-pro-appointment[open] .bx-pro-appointment-toggle svg{transform:rotate(-90deg)}
.bx-pro-appointment[open]>summary:hover .bx-pro-appointment-toggle{background:#ffffff27;border-color:#e0bd7c}
.bx-pro-appointment>summary:focus-visible .bx-pro-appointment-toggle{outline:2px solid #b48640;outline-offset:3px}
.bx-pro-appointment[open]:has(.bx-rd)>summary{background:radial-gradient(ellipse at top right,#b68b3740,transparent 60%),linear-gradient(115deg,#795020,#352719);color:#fff7e9;border-radius:12px 12px 0 0;padding:16px 18px;gap:14px}
.bx-pro-appointment[open]:has(.bx-rd)>summary time{background:#fff0ce;color:#543919;padding:8px 6px;border-radius:10px;flex-basis:58px;text-align:center;font-size:18px;line-height:1.5;font-variant-numeric:tabular-nums}
.bx-pro-appointment[open]:has(.bx-rd) .bx-pro-appointment-name small{color:#e8d6ba}
.bx-pro-appointment-detail:has(.bx-rd){padding:0;border-top:0}
.bx-rd{--rd-line:#e7d8c3;--rd-gold:#956624;--rd-ink:#30271f;--rd-muted:#756752;background:#fdf9f2;border-radius:0 0 12px 12px;padding:0 14px 18px;color:var(--rd-ink);font-size:13px;line-height:1.5}
.bx-rd *{box-sizing:border-box;min-width:0}.bx-rd svg{width:20px;height:20px;flex:none;color:var(--rd-gold)}
.bx-rd .bx-rd-situation{margin:0 -14px!important;display:flex;align-items:center;min-height:44px;padding:8px 18px;background:#3e2c1c;color:#ecddc5;font-size:12px!important}
.bx-rd-pending{display:inline-flex;align-items:center;gap:7px;padding:4px 10px;border:1px solid #cda76755;border-radius:20px;background:#f5dea514;color:#f4ddb1;font-size:11px;font-weight:550;line-height:1.4}
.bx-rd-pending>span{width:6px;height:6px;flex:none;border-radius:50%;background:#e6bc68}
.bx-rd-strip{display:grid;grid-template-columns:1fr 1.4fr .8fr;gap:12px;margin:12px 0 14px;padding:12px;background:#f5ebd9;border-radius:10px}
.bx-rd-strip>span{display:flex;align-items:center;flex-wrap:wrap;gap:6px;font-size:11px}.bx-rd-strip>span+span{border-left:1px solid #ddc59e;padding-left:12px}.bx-rd-strip strong{font-weight:600}
.bx-rd-columns{display:grid;grid-template-columns:minmax(0,1fr);gap:14px;align-items:start;width:100%;max-width:1040px;margin-inline:auto}.bx-rd-main{display:grid;gap:14px;align-items:start}.bx-rd-data-pair{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:14px;align-items:start}
.bx-rd-panel{border:1px solid var(--rd-line);border-radius:13px;padding:16px;background:linear-gradient(135deg,#fffefa,#fcf7ef);box-shadow:0 3px 10px #60422206}
.bx-rd .bx-rd-panel h3{display:flex;align-items:center;gap:9px;font-size:15px;line-height:1.4;font-weight:650;margin:0 0 10px;padding-bottom:10px;border-bottom:1px solid #eee3d3}
.bx-rd dl{margin:0}.bx-rd-row{display:grid;grid-template-columns:18px 82px minmax(0,1fr);gap:10px;align-items:start;padding:8px 0;border-bottom:1px solid #eee4d6;font-size:12px;overflow-wrap:anywhere}.bx-rd-row:last-child{border:0;padding-bottom:0}.bx-rd-row svg{width:17px;height:17px}.bx-rd dt{color:var(--rd-muted)}.bx-rd dd{margin:0;font-weight:550}
.bx-rd-states{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.bx-rd-states>div{display:flex;align-items:center;flex-direction:column;text-align:center;gap:8px;padding:12px 8px;border:1px solid var(--rd-line);border-radius:12px;font-size:12px}.bx-rd-states small{color:var(--rd-muted);font-size:11px}
.bx-rd-state{display:inline-block;padding:4px 10px;background:#f9e9c3;color:#77521c;border-radius:20px;font-size:11px;line-height:1.5}.bx-rd-state.is-green{color:#355d2f;background:#e7f0df}.bx-rd-state.is-red{color:#9c3f35;background:#fbe7e0}
.bx-rd-operations{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.bx-pro-dashboard .bx-rd-operations button{flex-direction:column;min-height:64px;text-align:center;background:#fffcf7;padding:10px;font-size:12px;line-height:1.4}.bx-pro-dashboard .bx-rd button.bx-rd-primary{color:#fff9ed;background:linear-gradient(115deg,#936225,#583811);border-color:#986e37}.bx-rd button.bx-rd-primary svg{color:#f7e1ac}
.bx-rd [data-bx-part=button]{min-height:42px!important;border-radius:9px!important;padding:10px 12px!important;gap:7px!important;font-size:12px!important}
.bx-rd [data-bx-part=button] *{font-size:12px!important;line-height:1.5!important}.bx-rd [data-bx-part=button][aria-disabled=true]{opacity:.55}
.bx-rd-consult [data-bx-part=button]{width:100%}.bx-rd-feedback:empty{display:none}.bx-rd-feedback{display:grid;gap:10px;margin-top:14px}.bx-rd-feedback>div{gap:10px}.bx-rd-feedback *{font-size:12px;line-height:1.6}
.bx-rd-existing{display:grid;gap:16px;margin-top:16px}.bx-rd-existing>div:first-child{display:grid!important;grid-template-columns:1fr 1fr;gap:12px!important}.bx-rd-existing>div:first-child>div:not([data-bx-part=button]){grid-column:1/-1}.bx-rd-existing>div:last-child:not(:first-child){margin-top:0;padding-top:12px!important;border-color:var(--rd-line)!important}.bx-rd-existing [data-bx-part=button]{width:100%}
.bx-rd .bx-rd-note{font-size:12px!important;margin:12px 0 0!important;color:var(--rd-muted);line-height:1.6}.bx-rd-events{margin-top:18px;border-top:1px solid var(--rd-line);padding-top:12px}.bx-rd-events summary{font-size:12px;cursor:pointer;color:#795420}.bx-rd-events p{font-size:11px!important;line-height:1.7;margin-top:10px!important}

.bx-rd :is(button,summary):focus-visible{outline:2px solid #a47a35;outline-offset:3px}

.bx-rd-management{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.bx-rd-management>h3,.bx-rd-management>.bx-rd-feedback,.bx-rd-management>.bx-rd-events,.bx-rd-management>p{grid-column:1/-1;margin:0}
.bx-rd-management .bx-rd-operations,.bx-rd-management .bx-rd-existing,.bx-rd-management .bx-rd-existing>div:first-child{display:contents!important}
.bx-rd-management .bx-rd-existing>div:first-child>div:not([data-bx-part=button]),.bx-rd-management .bx-rd-existing>div:not(:first-child),.bx-rd-management [aria-label="Consultar historial de reprogramación"]{grid-column:1/-1}
.bx-rd-management .bx-rd-existing>div:first-child>[aria-label="Reprogramar cita"],.bx-rd-management .bx-rd-existing>div:first-child>[aria-label="Elegir otro horario"]{min-height:64px!important}
@container(max-width:700px){.bx-rd-management{grid-template-columns:1fr 1fr}}


.bx-rd-consult [data-bx-part=button]{background:linear-gradient(115deg,#936225,#583811)!important;border-color:#95672f!important;color:#fff9ed!important}
.bx-rd-consult [data-bx-part=button] *{color:#fff9ed!important}
.bx-rd-management [aria-label="Cancelar cita"]{background:#fff0ed!important;border:1px solid #d89485!important;color:#a33c2f!important}
.bx-rd-management [aria-label="Cancelar cita"] *{color:#a33c2f!important}
.bx-rd-management [aria-label="Reprogramar cita"]{flex-direction:column!important}
.bx-rd-management [aria-label="Reprogramar cita"]:before,.bx-rd-management [aria-label="Consultar historial de reprogramación"]:before{content:'';display:block;flex:none;width:20px;height:20px;background:currentColor;mask:center/contain no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.7' stroke-linecap='round'%3E%3Cpath d='M4 5h16v16H4ZM8 2v6m8-6v6M4 11h16m-9 5 2 2 5-5'/%3E%3C/svg%3E")}
.bx-rd-management [aria-label="Cancelar cita"]:before{content:'';display:block;flex:none;width:19px;height:19px;background:currentColor;mask:center/contain no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.7'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath d='m8 8 8 8m0-8-8 8'/%3E%3C/svg%3E")}



@container(max-width:640px){.bx-pro-appointment[open]:has(.bx-rd)>summary{display:grid;grid-template-columns:58px minmax(0,1fr) 36px;gap:8px 12px;padding:16px}.bx-pro-appointment[open]:has(.bx-rd)>summary time{grid-row:1/3;font-size:18px}.bx-pro-appointment[open]:has(.bx-rd)>summary .bx-pro-client-icon{display:none}.bx-pro-appointment[open]:has(.bx-rd)>summary .bx-pro-appointment-name{grid-column:2}.bx-pro-appointment[open]:has(.bx-rd)>summary .bx-pro-badge{grid-column:2;justify-self:start}.bx-pro-appointment[open]:has(.bx-rd)>summary>span:last-child{grid-column:3;grid-row:1/3}.bx-rd-data-pair{grid-template-columns:1fr}.bx-rd-strip{grid-template-columns:1fr;gap:9px}.bx-rd-strip>span+span{border-left:0;border-top:1px solid #e2d0b1;padding:9px 0 0}.bx-rd-strip>span{font-size:12px}.bx-rd-operations{grid-template-columns:1fr 1fr}.bx-rd-existing>div:first-child{grid-template-columns:1fr}}

@container(max-width:390px){.bx-rd{padding-inline:10px}.bx-rd .bx-rd-situation{margin-inline:-10px!important}.bx-rd-panel{padding:13px}.bx-rd-states{gap:7px}.bx-rd-row{grid-template-columns:17px 65px minmax(0,1fr)}}

.bx-rd-management .bx-rd-yape-review{grid-column:1/-1;display:flex;align-items:center;flex-wrap:wrap;gap:8px 16px;padding:10px 12px;border:1px solid #e5d4b9;border-radius:9px;background:#f7eddc;font-size:12px}
.bx-rd-yape-review>span{display:flex;align-items:center;gap:8px;flex-shrink:0;color:#77501e}
.bx-rd-yape-review strong{padding:3px 9px;border-radius:7px;background:#fffaf1;border:1px solid #dfc79f;font-variant-numeric:tabular-nums;letter-spacing:2px;font-size:15px}
.bx-rd .bx-rd-yape-review p{margin:0!important;font-size:12px!important;line-height:1.5;flex:1 1 260px;color:var(--rd-muted)}
.bx-pro-dashboard .bx-rd-management .bx-rd-operations button,.bx-rd-management .bx-rd-existing>div:first-child>[aria-label="Reprogramar cita"],.bx-rd-management .bx-rd-existing>div:first-child>[aria-label="Elegir otro horario"]{flex-direction:row!important;gap:8px;min-height:48px!important;padding:10px 12px!important}
.bx-rd-management [data-bx-part=button] [data-bx-part=text]{font-size:12px!important;line-height:1.4!important;text-align:center}
.bx-rd-management .bx-rd-feedback{margin:0}
.bx-rd-management .bx-rd-events{margin-top:2px;padding-top:10px}
.bx-rd-management .bx-rd-existing [aria-label="Consultar historial de reprogramación"],.bx-rd-management .bx-rd-existing [aria-label="Ocultar historial de reprogramación"]{grid-column:1 / span 3;display:flex;flex-direction:row!important;justify-content:flex-start;gap:8px;min-height:44px!important;padding:8px 0!important;font-size:12px}
.bx-rd-management .bx-rd-existing>div:not(:first-child){grid-column:4;padding:0!important;border:0!important;align-self:start}
.bx-rd-management .bx-rd-existing>div:not(:first-child):has(>:nth-child(2)){grid-column:1/-1;padding:12px!important;border:1px solid var(--rd-line)!important;border-radius:10px}
.bx-rd-management .bx-rd-existing [aria-label="Cancelar cita"]{flex-direction:row!important;gap:8px;min-height:44px!important;padding:9px 12px!important}
@container(max-width:700px){.bx-rd-management .bx-rd-existing [aria-label="Consultar historial de reprogramación"],.bx-rd-management .bx-rd-existing [aria-label="Ocultar historial de reprogramación"],.bx-rd-management .bx-rd-existing>div:not(:first-child){grid-column:1/-1}}
@container(max-width:390px){.bx-pro-dashboard .bx-rd-management .bx-rd-operations button,.bx-rd-management .bx-rd-existing>div:first-child>[aria-label="Reprogramar cita"]{flex-direction:column!important}}
.bx-rd-management{position:relative;isolation:isolate}
.bx-rd-management:has(>.bx-care-decision-layer){min-height:272px}
.bx-care-decision-layer{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:16px;border-radius:inherit;background:#30271f59;backdrop-filter:blur(3px);animation:bx-care-shade .16s ease-out}
.bx-care-decision{position:relative;width:min(100%,380px);padding:22px;background:#fffdf8;border:1px solid #e4d3b9;border-radius:16px;box-shadow:0 16px 42px #30271f30;text-align:left;animation:bx-care-enter .18s ease-out}
.bx-pro-dashboard .bx-care-decision .bx-care-decision-close{position:absolute;top:8px;right:8px;width:36px;min-height:36px;padding:8px;display:grid;place-items:center;border:0;border-radius:50%;background:transparent;color:#756752;box-shadow:none}
.bx-care-decision-close:hover{background:#f5ebd9!important}
.bx-care-decision-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:#f8ebce;margin-bottom:12px}
.bx-rd .bx-care-decision h4{font-size:18px;line-height:1.3;margin:0 24px 8px 0;font-weight:650}
.bx-rd .bx-care-decision p{font-size:13px!important;line-height:1.6;margin:0 0 18px!important;color:#756752}
.bx-care-decision-actions{display:grid;grid-template-columns:1fr 1.3fr;gap:10px}
.bx-pro-dashboard .bx-care-decision-actions button{min-height:44px;padding:10px 12px;font-size:12px;line-height:1.4;justify-content:center}
@keyframes bx-care-shade{from{opacity:0}to{opacity:1}}
@keyframes bx-care-enter{from{opacity:0;transform:translateY(6px) scale(.98)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.bx-care-decision-layer,.bx-care-decision{animation:none}}
`;
