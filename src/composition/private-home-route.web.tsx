import { useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRegistration } from '../features/authentication/presentation/use-registration';
import { AccountScreen } from '../features/authentication/presentation/account-screen';
import { WebProfileAccess } from '../features/authentication/presentation/web-profile-access.web';
import { useTeamAuthority } from './use-team-authority';
import { BookingContext } from '../features/reservations/presentation/booking-context';
import { InboxScreen } from '../features/notifications/presentation/inbox-screen.web';
import { InboxPreview } from '../features/notifications/presentation/inbox-preview.web';
import type { PrivateHomeApplication } from '../features/reservations/application/private-home';
import {
  PrivateHomeContent,
  type PrivateHomeSection,
} from '../features/reservations/presentation/private-home-screen.web';

export function PrivateHomeRoute() {
  const { state, callbackError, configured } = useRegistration();
  const { authority } = useTeamAuthority();
  const app = useContext(BookingContext),
    params = useLocalSearchParams(),
    router = useRouter();
  if (!configured || callbackError || state.kind !== 'ready') return null;
  if (params.view === 'notices') return <InboxScreen />;
  if (params.view === 'profile')
    return (
      <AccountScreen
        workspaceContent={
          <WebProfileAccess state={state} authority={authority} />
        }
        onSignedOut={() => router.replace('/sign-in')}
        onHome={() => router.replace('/account')}
        onContext={() => router.push('/context')}
        onOperation={() => router.push('/barbershop-admin')}
        onBooking={() => router.push('/booking')}
        onAgenda={() => router.push('/agenda')}
        onOwn={() => router.push('/my-reservations')}
      />
    );
  if (!app?.discovery) return <p role="status">Preparando tu inicio…</p>;
  const contextKey =
    state.context.kind === 'selected'
      ? `${state.context.context.barbershopId}:${state.context.context.role}`
      : state.context.kind;
  return (
    <ConnectedHome
      key={`${state.identity.userId}:${state.generation}:${contextKey}`}
      application={app.discovery}
      name={state.profile.displayName}
      view={
        params.view === 'explore' ||
        params.view === 'shop' ||
        params.view === 'notices'
          ? params.view
          : 'home'
      }
      search={typeof params.q === 'string' ? params.q.slice(0, 200) : ''}
      shop={typeof params.shop === 'string' ? params.shop : ''}
      onReserve={(shop, professionalId) => {
        const draft = app.getSnapshot();
        if (draft.phase !== 'confirming' && !draft.uncertain && !draft.result)
          void app.chooseShop(shop, professionalId);
        router.push('/booking');
      }}
      reservationLocked={
        app.getSnapshot().phase === 'confirming' ||
        app.getSnapshot().uncertain ||
        !!app.getSnapshot().result
      }
    />
  );
}
function ConnectedHome({
  application: app,
  name,
  view,
  search,
  shop,
  onReserve,
  reservationLocked,
}: {
  application: PrivateHomeApplication;
  name: string;
  view: PrivateHomeSection;
  search: string;
  shop: string;
  onReserve: (id: string, professionalId?: string) => void;
  reservationLocked: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState({ source: search, value: search });
  const query = draft.source === search ? draft.value : search;
  const setQuery = (value: string) => setDraft({ source: search, value });
  const [now, setNow] = useState(() => Date.now());
  const state = useSyncExternalStore(
    app.subscribe,
    app.getSnapshot,
    app.getSnapshot,
  );
  useEffect(() => {
    if (view !== 'home' && view !== 'explore') return;
    void app.search(search);
  }, [app, view, search]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    const refresh = () => {
      if (document.visibilityState === 'visible') setNow(Date.now());
    };
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  useEffect(() => {
    if (view === 'home') void app.loadOwn();
  }, [app, view]);
  useEffect(() => {
    if (view === 'shop') void app.openShop(shop);
    return () => {
      app.closeShop();
    };
  }, [app, view, shop]);
  const submit = () => {
    if (view === 'explore' && search === query.trim())
      void app.search(query.trim());
    else
      router.push({
        pathname: '/account',
        params: { view: 'explore', q: query.trim() },
      });
  };
  return (
    <PrivateHomeContent
      systemNotices={<InboxPreview />}
      name={name}
      state={
        view === 'shop' && state.offer && state.offer.barbershopId !== shop
          ? { ...state, offer: null, offerPhase: 'loading' }
          : state
      }
      view={view}
      query={query}
      now={now}
      onQuery={setQuery}
      onSearch={submit}
      onMore={() => void app.more()}
      onRetryOwn={() => void app.loadOwn()}
      onRetryShop={() => void app.openShop(shop)}
      onOpenShop={(shop) =>
        router.push({
          pathname: '/account',
          params: { view: 'shop', shop, q: state.query },
        })
      }
      onReserve={onReserve}
      reservationLocked={reservationLocked}
    />
  );
}
