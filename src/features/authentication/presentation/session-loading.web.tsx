const styles = `
.bx-session-loading{box-sizing:border-box;min-height:100dvh;width:100%;display:grid;place-items:center;padding:24px;background:#fcfaf7;font-family:Outfit,sans-serif;color:#29231c}
.bx-session-loading *{box-sizing:border-box}
.bx-session-loading-card{position:relative;overflow:hidden;width:100%;max-width:440px;padding:44px 28px;text-align:center;border:1px solid #e7dccc;border-radius:26px;background:#fffdf9;box-shadow:0 12px 40px #5b39140d}
.bx-session-loading-card:before{content:'';position:absolute;top:0;left:calc(50% - 24px);width:48px;height:3px;border-radius:0 0 4px 4px;background:#b58743}
.bx-session-loading-ring{display:block;width:46px;height:46px;margin:0 auto 26px;border:4px solid #eee5d8;border-top-color:#966324;border-right-color:#c69b5a;border-radius:50%;animation:bx-session-turn 1s linear infinite}
.bx-session-loading-card h1{font:700 clamp(23px,4vw,28px)/1.2 Outfit,sans-serif;margin:0 0 12px;letter-spacing:-.5px}
.bx-session-loading-card p{font-size:15px;line-height:1.6;color:#756a5b;margin:0;max-width:300px;margin-inline:auto}
@keyframes bx-session-turn{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.bx-session-loading-ring{animation:none}}
@media(max-width:480px){.bx-session-loading{padding:20px}.bx-session-loading-card{padding:36px 22px;border-radius:22px}}
`;

export function SessionLoadingWeb() {
  return (
    <div className="bx-session-loading">
      <style>{styles}</style>
      <section
        className="bx-session-loading-card"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="bx-session-loading-ring" aria-hidden="true" />
        <h1>Preparando tu espacio</h1>
        <p>Estamos verificando tu sesión. Enseguida podrás continuar.</p>
      </section>
    </div>
  );
}
