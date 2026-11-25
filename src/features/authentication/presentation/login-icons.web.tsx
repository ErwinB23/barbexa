import { useId } from 'react';

export function LoginIcon({
  name,
  className,
}: {
  name:
    | 'mail'
    | 'phone'
    | 'lock'
    | 'eye'
    | 'eye-off'
    | 'arrow'
    | 'scissors'
    | 'calendar'
    | 'user';
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {name === 'mail' && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 6 9 7 9-7" />
        </>
      )}
      {name === 'lock' && (
        <>
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" />
        </>
      )}
      {name === 'phone' && (
        <path d="M7 3 4 4c-2 2 0 7 4 11s9 6 11 4l1-3-4-3-2 2a13 13 0 0 1-5-5l2-2-3-4Z" />
      )}
      {(name === 'eye' || name === 'eye-off') && (
        <>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
          <circle cx="12" cy="12" r="2.7" />
          {name === 'eye-off' && <path d="m3 3 18 18" />}
        </>
      )}
      {name === 'arrow' && <path d="M3 12h18m-7-7 7 7-7 7" />}
      {name === 'scissors' && (
        <>
          <circle cx="5.5" cy="5.5" r="3" />
          <circle cx="18.5" cy="5.5" r="3" />
          <path d="m7.5 8 13 13M16.5 8 3.5 21M10 15l2-2" />
        </>
      )}
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
    </svg>
  );
}
export function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.25c1.9-1.75 2.97-4.33 2.97-7.36Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.25-2.51c-.9.6-2.06.96-3.37.96-2.6 0-4.81-1.76-5.6-4.13H3.04v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.91a6 6 0 0 1 0-3.82V7.5H3.04a10 10 0 0 0 0 9l3.36-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.96c1.47 0 2.79.51 3.83 1.51L18.7 4.6A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.96 5.5l3.36 2.59C7.19 7.72 9.4 5.96 12 5.96Z"
      />
    </svg>
  );
}
export function BarberEmblem() {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      className="ab-login__emblem"
      viewBox="-10 0 196 104"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={id}>
          <rect x="76" y="24" width="24" height="60" rx="2" />
        </clipPath>
      </defs>
      <g fill="none" stroke="#a67b36" strokeWidth="2">
        <path d="M65 17C17 29 0 59 21 94M111 17c48 12 65 42 44 77" />
      </g>
      <g fill="#a67b36">
        {[false, true].map((mirror) => (
          <path
            key={String(mirror)}
            transform={mirror ? 'translate(176 0) scale(-1 1)' : undefined}
            d="M10 68C-4 62-6 51-3 48c11 3 16 10 13 20M10 71c8-14 17-17 21-16-2 9-8 15-21 16M14 82C1 81-5 73-4 67c12 0 18 5 18 15M19 92C7 94-1 88-2 82c11-2 18 2 21 10M20 91c-1-13 5-20 11-21 3 10-2 19-11 21"
          />
        ))}
      </g>
      <path
        d="M78 21v-6a10 10 0 0 1 20 0v6"
        fill="#fcfaf6"
        stroke="#181715"
        strokeWidth="3"
      />
      <rect x="76" y="24" width="24" height="60" fill="#fffdf8" />
      <g clipPath={`url(#${id})`}>
        <path d="m70 46 40-36v13L70 59Zm0 41 40-36v13l-40 36Z" fill="#9c4229" />
        <path d="m70 66 40-36v12L70 79Z" fill="#333b42" />
      </g>
      <rect
        x="76"
        y="24"
        width="24"
        height="60"
        rx="2"
        fill="none"
        stroke="#181715"
        strokeWidth="3"
      />
      <rect
        x="71"
        y="20"
        width="34"
        height="7"
        rx="2"
        fill="#c49a51"
        stroke="#181715"
        strokeWidth="3"
      />
      <rect
        x="71"
        y="82"
        width="34"
        height="7"
        rx="2"
        fill="#c49a51"
        stroke="#181715"
        strokeWidth="3"
      />
      <path
        d="M82 90v4h12v-4"
        fill="#a67b36"
        stroke="#181715"
        strokeWidth="3"
      />
    </svg>
  );
}
