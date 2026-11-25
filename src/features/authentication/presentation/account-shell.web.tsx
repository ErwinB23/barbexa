import type { ComponentProps } from 'react';
import { Link } from 'expo-router';
import { WebSurface } from '../../../shared/ui/web-surface';
import type { AccountShell as SharedAccountShell } from './account-shell';
import { BarbexaBrand } from '../../../shared/ui/barbexa-brand.web';
import { privateWorkspaceStyles } from '../../../shared/ui/private-workspace.styles';
import {
  WorkspaceIcon,
  type WorkspaceIconName,
} from '../../../shared/ui/workspace-icon.web';
import { UserMenu } from './user-menu.web';
import { workspaceAccess, type WorkspaceAuthority } from './workspace-access';
import { UnreadBadge } from '../../../shared/ui/unread-badge.web';

export { authenticationStackOptions } from './account-stack-options';
export const accountStackOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: 'transparent' },
};

const links = [
  { href: '/account', label: 'Inicio', icon: 'home' },
  {
    href: '/account?view=explore',
    label: 'Explorar barberías',
    icon: 'search',
  },
  { href: '/booking', label: 'Reservar', icon: 'calendar' },
  { href: '/my-reservations', label: 'Mis reservas', icon: 'reservations' },
  { href: '/account?view=notices', label: 'Notificaciones', icon: 'bell' },
] as const;

export function AccountShell({
  state,
  path,
  children,
  view = 'home',
  onSignOut,
  authority,
  unreadNotifications = 0,
}: ComponentProps<typeof SharedAccountShell> & {
  view?: string;
  onSignOut?: () => Promise<void>;
  authority?: WorkspaceAuthority;
  unreadNotifications?: number;
}) {
  const selected =
    state.kind === 'ready' && state.context.kind === 'selected'
      ? state.context
      : null;
  const access = workspaceAccess(state, authority);
  const administrator = access.administrator;
  const active = (href: string) =>
    (path === '/account'
      ? href ===
        (view === 'explore' || view === 'shop'
          ? '/account?view=explore'
          : view === 'notices'
            ? '/account?view=notices'
            : view === 'profile'
              ? ''
              : '/account')
      : path === href) ||
    (href === '/barbershop-admin' &&
      ['/services', '/schedules'].includes(path)) ||
    (href === '/staff' && !administrator && path === '/schedules')
      ? ('page' as const)
      : undefined;
  return (
    <WebSurface kind="workspace">
      <style>{privateWorkspaceStyles}</style>
      <div
        className={`bx-workspace bx-private${path !== '/account' ? ' bx-private--inner' : ''}`}
      >
        {state.kind === 'ready' && (
          <aside className="bx-rail">
            <Link
              href="/account"
              className="bx-brand"
              aria-label="Barbexa, Inicio privado"
            >
              <BarbexaBrand />
            </Link>
            <nav aria-label="Mi cuenta y reservas">
              {links.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={active(href)}
                  onPress={
                    active(href) === 'page'
                      ? (event) => event.preventDefault()
                      : undefined
                  }
                >
                  <WorkspaceIcon name={icon as WorkspaceIconName} />
                  <span>{label}</span>
                  {icon === 'bell' && (
                    <UnreadBadge count={unreadNotifications} />
                  )}
                </Link>
              ))}
            </nav>
            {selected && (
              <div className="bx-rail-context">
                <span>Barbería actual</span>
                <strong>
                  {selected?.barbershop?.name ??
                    (selected
                      ? 'Barbería seleccionada'
                      : 'Sin barbería seleccionada')}
                </strong>
                {selected && (
                  <span>
                    {authority
                      ? {
                          owner: 'Administrador principal',
                          secondary: 'Administrador secundario',
                          barber: 'Barbero',
                          unregularized:
                            'Propiedad pendiente de regularización',
                          unavailable: 'Verificando facultades',
                        }[access.capacity ?? 'unavailable']
                      : administrator
                        ? 'Administrador'
                        : 'Barbero'}
                  </span>
                )}
                <Link href="/context">Cambiar barbería</Link>
              </div>
            )}
          </aside>
        )}
        {state.kind === 'ready' && (
          <div className="bx-private-profile">
            <UserMenu
              name={state.profile?.displayName ?? 'Usuario'}
              access={access}
              contextKey={`${state.identity?.userId ?? ''}:${selected?.context.membershipId ?? ''}:${path}:${view}`}
              onSignOut={onSignOut}
            />
          </div>
        )}
        <main className="bx-main">{children}</main>
      </div>
    </WebSurface>
  );
}
