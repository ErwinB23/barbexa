export function SiteIcon({
  name,
}: {
  name: 'calendar' | 'user' | 'scissors' | 'phone';
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {name === 'calendar' && (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M7 2v6m10-6v6M3 11h18M8 15h.01M16 15h.01M8 18h.01M16 18h.01" />
        </>
      )}
      {name === 'user' && (
        <>
          <circle cx="12" cy="7" r="4" />
          <path d="M4 22v-3a8 8 0 0 1 16 0v3Z" />
        </>
      )}
      {name === 'scissors' && (
        <>
          <circle cx="5.5" cy="5.5" r="3" />
          <circle cx="18.5" cy="5.5" r="3" />
          <path d="m7.5 8 13 13M16.5 8 3.5 21M10 15l2-2" />
        </>
      )}
      {name === 'phone' && (
        <path d="M7 3 4 4c-2 2 0 7 4 11s9 6 11 4l1-3-4-3-2 2a13 13 0 0 1-5-5l2-2-3-4Z" />
      )}
    </svg>
  );
}
