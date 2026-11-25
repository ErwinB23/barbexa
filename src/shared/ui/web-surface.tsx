import type { ReactNode } from 'react';

export interface WebSurfaceProps {
  children: ReactNode;
  kind: 'workspace' | 'public' | 'home';
}

export function WebSurface({ children }: WebSurfaceProps) {
  return <>{children}</>;
}
