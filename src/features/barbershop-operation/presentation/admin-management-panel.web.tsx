import type { ManagementData } from '../application/operation-application';
import type { TeamAuthorityApplication } from '../application/team-authority';
import type { AdminInvitationsApplication } from '../application/admin-invitations';
import type { TeamAuthority } from '../domain/team-authority';
import { TeamAuthorityPanel } from './team-authority-panel';
import { AdminInvitationsPanel } from './admin-invitations';
import { AdminManagementWeb } from './admin-management.web';

export function AdminManagementPanel(p: {
  application: TeamAuthorityApplication;
  invitations?: AdminInvitationsApplication;
  authority: TeamAuthority;
  data: ManagementData | null;
  loading: boolean;
  viewerName: string;
  newRequestId: () => string;
  onReload: () => Promise<unknown>;
}) {
  const scopeKey = p.application.scopeKey();
  return (
    <TeamAuthorityPanel
      {...p}
      render={(authority) =>
        p.invitations ? (
          <AdminInvitationsPanel
            key={`admin-invitations:${scopeKey}`}
            application={p.invitations}
            audience="outgoing"
            canManage={
              p.authority.capacity === 'owner' &&
              p.authority.permissions.manageAdministrators
            }
            render={(invitations) => (
              <AdminManagementWeb
                key={scopeKey}
                scopeKey={scopeKey}
                authority={authority}
                invitations={invitations}
                viewerName={p.viewerName}
              />
            )}
          />
        ) : (
          <AdminManagementWeb
            key={scopeKey}
            scopeKey={scopeKey}
            authority={authority}
            viewerName={p.viewerName}
          />
        )
      }
    />
  );
}
