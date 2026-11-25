import { useCallback, useEffect, useRef, useState } from 'react';
import type { OperationApplication } from '../features/barbershop-operation/application/operation-application';
import {
  InvitationsInboxWeb,
  type InboxInvitation,
  type InboxState,
} from '../features/barbershop-operation/presentation/invitations-inbox.web';

export function ReceivedInvitationsPage({
  application: app,
}: {
  application: OperationApplication;
}) {
  const [state, setState] = useState<InboxState>({
    administrator: null,
    barber: null,
    busy: true,
    errors: [],
    message: '',
  });
  const responseBlocked = useRef(false);
  const live = useRef(false),
    flight = useRef(false);
  const scope = app.scopeKey();
  const valid = useCallback(
    () => live.current && app.scopeKey() === scope,
    [app, scope],
  );
  const read = useCallback(async () => {
    const [admins, barbers] = await Promise.allSettled([
      app.adminInvitations
        ? app.adminInvitations.loadOwn()
        : Promise.reject(Error('unavailable')),
      app.listOwnInvitations(),
    ]);
    if (!valid()) return;
    const errors: string[] = [];
    const administrator: InboxInvitation[] | null =
      admins.status === 'fulfilled'
        ? admins.value.map((i) => ({ ...i, kind: 'administrator' }))
        : null;
    const barber: InboxInvitation[] | null =
      barbers.status === 'fulfilled'
        ? barbers.value
            .filter((i) => i.role === 'barber')
            .map((i) => ({ ...i, kind: 'barber' }))
        : null;
    if (!administrator)
      errors.push(
        'No se pudieron consultar las invitaciones de administración.',
      );
    if (!barber)
      errors.push('No se pudieron consultar las invitaciones de barbero.');
    if (administrator !== null && barber !== null)
      responseBlocked.current = false;
    setState((s) => ({
      ...s,
      administrator,
      barber,
      errors,
      responseUnverified: responseBlocked.current,
    }));
  }, [app, valid]);
  const run = useCallback(
    async (invitation?: InboxInvitation, decision?: 'accept' | 'reject') => {
      if (flight.current || !valid() || (invitation && responseBlocked.current))
        return;
      flight.current = true;
      setState((s) => ({ ...s, busy: true, message: '', errors: [] }));
      try {
        if (invitation && decision) {
          if (invitation.kind === 'administrator') {
            if (!app.adminInvitations) throw Error('unavailable');
            await app.adminInvitations.respond(invitation.id, decision);
          } else await app.respondInvitation(invitation.id, decision);
          if (!valid()) return;
          setState((s) => ({
            ...s,
            message:
              decision === 'accept'
                ? 'Invitación aceptada. Puedes revisar tus espacios de trabajo para acceder.'
                : 'Invitación rechazada.',
          }));
        }
        await read();
      } catch {
        if (invitation) responseBlocked.current = true;
        if (valid())
          setState((s) => ({
            ...s,
            responseUnverified: responseBlocked.current,
            errors: [
              'No se pudo confirmar la respuesta. Actualiza las invitaciones para verificar su estado antes de intentarlo nuevamente.',
            ],
          }));
      } finally {
        flight.current = false;
        if (valid()) setState((s) => ({ ...s, busy: false }));
      }
    },
    [app, valid, read],
  );
  useEffect(() => {
    live.current = true;
    let current = true;
    void Promise.resolve().then(() => {
      if (current) return run();
    });
    return () => {
      current = false;
      live.current = false;
    };
  }, [run]);
  return (
    <InvitationsInboxWeb
      state={state}
      onRefresh={() => void run()}
      onRespond={(i, d) => void run(i, d)}
    />
  );
}
