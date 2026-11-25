export type WorkspaceIconName =
  | 'home'
  | 'search'
  | 'calendar'
  | 'reservations'
  | 'bell'
  | 'user'
  | 'mail'
  | 'shop'
  | 'logout'
  | 'chevron'
  | 'pin'
  | 'bolt'
  | 'arrow'
  | 'menu';
const paths: Record<WorkspaceIconName, string> = {
  home: 'm3 10 9-7 9 7v11h-6v-7H9v7H3Z',
  search: 'M21 21l-5-5M19 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  calendar: 'M4 5h16v16H4ZM8 2v6m8-6v6M4 11h16M8 15h1m6 0h1m-8 3h1',
  reservations: 'M4 5h16v16H4ZM8 2v6m8-6v6M4 11h16m-9 5 2 2 5-5',
  bell: 'M18 8a6 6 0 0 0-12 0c0 8-3 8-3 10h18c0-2-3-2-3-10M10 22h4',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2Z',
  mail: 'M3 5h18v14H3Zm0 1 9 7 9-7',
  shop: 'M3 10h18l-2-7H5ZM5 10v11h14V10M9 21v-6h6v6M8 3l-1 7m9-7 1 7',
  logout: 'M10 3H4v18h6m4-14 5 5-5 5m-6-5h11',
  chevron: 'm8 4 8 8-8 8',
  pin: 'M19 9c0 6-7 12-7 12S5 15 5 9a7 7 0 1 1 14 0M14 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  bolt: 'm13 2-9 12h7l-1 8 10-13h-8Z',
  arrow: 'M3 12h18m-7-7 7 7-7 7',
  menu: 'M3 6h18M3 12h18M3 18h18',
};
export function WorkspaceIcon({ name }: { name: WorkspaceIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
