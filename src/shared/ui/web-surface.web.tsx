import type { WebSurfaceProps } from './web-surface';
import { webSurfaceStyles } from './web-surface.styles';

export function WebSurface({ children, kind }: WebSurfaceProps) {
  return (
    <div className={`bx-web bx-web--${kind}`}>
      <style>{webSurfaceStyles}</style>
      {children}
    </div>
  );
}
