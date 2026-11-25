import { useRouter } from 'expo-router';
import { ConfirmEmailScreen } from '@/features/authentication/presentation/confirm-email-screen';
import { useCleanAuthReturn } from '@/features/authentication/presentation/use-clean-auth-return';
export default function ConfirmationCallbackRoute() {
  const router = useRouter();
  useCleanAuthReturn('/auth/callback');
  return (
    <ConfirmEmailScreen
      onRegister={() => router.replace('/sign-up')}
      onHome={() => router.replace('/')}
    />
  );
}
