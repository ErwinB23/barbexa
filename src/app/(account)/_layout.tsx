import { Redirect, Stack, usePathname, useRouter } from 'expo-router';
import {
  AccountShell,
  accountStackOptions,
} from '@/features/authentication/presentation/account-shell';
import { useRegistration } from '@/features/authentication/presentation/use-registration';
import { retainAccountRoute } from '@/features/authentication/presentation/navigation-policy';
export default function AccountLayout() {
  const { state, callbackError } = useRegistration();
  const router = useRouter(),
    path = usePathname();
  if (callbackError || !retainAccountRoute(state))
    return <Redirect href="/sign-in" />;
  return (
    <AccountShell
      state={state}
      path={path}
      onNavigate={(destination) => router.push(destination)}
    >
      <Stack screenOptions={accountStackOptions}>
        <Stack.Screen name="account" options={{ title: 'Mi cuenta' }} />
        <Stack.Screen name="context" options={{ title: 'Tus barberías' }} />
        <Stack.Screen name="agenda" options={{ title: 'Agenda' }} />
        <Stack.Screen name="booking" options={{ title: 'Reservar una cita' }} />
        <Stack.Screen
          name="my-reservations"
          options={{ title: 'Mis reservas' }}
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
