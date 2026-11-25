// Narrow declaration for the already-installed runtime; no new dependency.
declare module 'react-dom' {
  export function createPortal(
    children: import('react').ReactNode,
    container: Element | DocumentFragment,
    key?: string | null,
  ): import('react').ReactPortal;
}
