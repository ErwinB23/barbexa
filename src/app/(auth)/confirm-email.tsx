import { useRouter } from 'expo-router';
import { ConfirmEmailScreen } from '@/features/authentication/presentation/confirm-email-screen';
export default function ConfirmEmailRoute() {
  const router = useRouter();
  return (
    <ConfirmEmailScreen
      onRegister={() => router.replace('/sign-up')}
      onHome={() => router.replace('/')}
    />
  );
}
