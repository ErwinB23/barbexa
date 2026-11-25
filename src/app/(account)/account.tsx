import { useRouter } from 'expo-router';
import { AccountScreen } from '@/features/authentication/presentation/account-screen';
export default function AccountRoute() {
  const router = useRouter();
  return (
    <AccountScreen
      onSignedOut={() => router.replace('/sign-in')}
      onHome={() => router.replace('/')}
      onContext={() => router.push('/context')}
      onOperation={() => router.push('/barbershop-admin')}
      onBooking={() => router.push('/booking')}
      onAgenda={() => router.push('/agenda')}
      onOwn={() => router.push('/my-reservations')}
    />
  );
}
