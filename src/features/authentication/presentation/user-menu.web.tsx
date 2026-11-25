import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'expo-router';
import { WorkspaceIcon } from '../../../shared/ui/workspace-icon.web';
import type { workspaceAccess } from './workspace-access';

export function UserMenu({
  name,
  contextKey = '',
  onSignOut,
  access,
}: {
  name: string;
  contextKey?: string;
  onSignOut?: () => Promise<void>;
  access?: ReturnType<typeof workspaceAccess>;
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const previousContext = useRef(contextKey);
  useEffect(() => {
    if (previousContext.current !== contextKey) {
      setOpen(false);
      previousContext.current = contextKey;
    }
  }, [contextKey]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  const initial = Array.from(name.trim())[0]?.toLocaleUpperCase('es') ?? 'B';
  return (
    <div
      className="bx-user-menu"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        className="bx-user-trigger"
        ref={trigger}
        aria-label={`Abrir menú de ${name}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <span className="bx-avatar" aria-hidden="true">
          {initial}
        </span>
        <span className="bx-user-chevron">
          <WorkspaceIcon name="chevron" />
        </span>
      </button>
      {open && (
        <nav
          id={id}
          className="bx-user-popover"
          aria-label="Menú personal"
          onClick={() => setOpen(false)}
        >
          <p className="bx-user-name">{name}</p>
          <Link href="/account?view=profile">
            <WorkspaceIcon name="user" />
            Mi perfil
          </Link>
          <Link href="/my-reservations">
            <WorkspaceIcon name="calendar" />
            Mis reservas
          </Link>
          <Link href="/staff">
            <WorkspaceIcon name="mail" />
            Mis invitaciones recibidas
          </Link>
          <Link href="/barbershop-admin?view=create">
            <WorkspaceIcon name="shop" />
            Crear mi barbería
          </Link>
          {(access?.professional || access?.administrator) && (
            <Link href="/staff?view=professional">
              <WorkspaceIcon name="user" />
              Mi espacio profesional
            </Link>
          )}
          {access?.administrator && (
            <Link href="/barbershop-admin">
              <WorkspaceIcon name="shop" />
              Administrar barbería
            </Link>
          )}
          {access?.hasWorkspaces && (
            <Link href="/context">
              <WorkspaceIcon name="shop" />
              Mis espacios de trabajo
            </Link>
          )}
          <button
            type="button"
            className="bx-sign-out"
            disabled={busy || !onSignOut}
            onClick={() => {
              if (!onSignOut || busy) return;
              setBusy(true);
              // The supplied coordinator owns invalidation, cleanup and remote status.
              void onSignOut()
                .catch(() => {})
                .finally(() => setBusy(false));
            }}
          >
            <WorkspaceIcon name="logout" />
            {busy ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </nav>
      )}
    </div>
  );
}
