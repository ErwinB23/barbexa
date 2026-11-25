import {
  Redirect,
  Stack,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from 'expo-router';
import {
  AccountShell,
  accountStackOptions,
} from '@/features/authentication/presentation/account-shell.web';
import { useRegistration } from '@/features/authentication/presentation/use-registration';
import { retainAccountRoute } from '@/features/authentication/presentation/navigation-policy';
import { useTeamAuthority } from '@/composition/use-team-authority';
import {
  InboxRefresh,
  useInbox,
} from '@/features/notifications/presentation/inbox-context';

export default function AccountWebLayout() {
  const inbox = useInbox();
  const { state, callbackError, application } = useRegistration();
  const { authority } = useTeamAuthority();
  const router = useRouter(),
    path = usePathname(),
    { view } = useLocalSearchParams();
  if (callbackError || !retainAccountRoute(state))
    return <Redirect href="/sign-in" />;
  const leave = async () => {
    try {
      await application.signOutCurrent();
    } finally {
      router.replace('/sign-in');
    }
  };
  return (
    <AccountShell
      state={state}
      authority={authority}
      unreadNotifications={inbox.state.unseen}
      path={path}
      view={typeof view === 'string' ? view : undefined}
      onNavigate={(destination) => router.push(destination)}
      onSignOut={leave}
    >
      {state.kind === 'ready' && (
        <InboxRefresh
          identity={`${state.identity.userId}:${state.generation}:${state.context.kind === 'selected' ? state.context.context.membershipId : state.context.kind}`}
        />
      )}
      <Stack screenOptions={accountStackOptions}>
        <Stack.Screen name="account" options={{ title: 'Inicio · Barbexa' }} />
        <Stack.Screen name="context" options={{ title: 'Tus barberías' }} />
        <Stack.Screen name="agenda" options={{ title: 'Agenda' }} />
        <Stack.Screen name="booking" options={{ title: 'Reservar una cita' }} />
        <Stack.Screen
          name="my-reservations"
          options={{
            title: 'Mis reservas',
            contentStyle: { backgroundColor: '#fcfaf7' },
          }}
        />
        <Stack.Screen name="barbershop-admin" options={{ title: 'Barbería' }} />
        <Stack.Screen
          name="staff"
          options={{ title: 'Personal e invitaciones' }}
        />
        <Stack.Screen name="services" options={{ title: 'Servicios' }} />
        <Stack.Screen name="schedules" options={{ title: 'Horarios' }} />
      </Stack>
    </AccountShell>
  );
}
