import { useRouter } from 'expo-router';
import { ResetPasswordScreen } from '@/features/authentication/presentation/reset-password-screen';
import { useCleanAuthReturn } from '@/features/authentication/presentation/use-clean-auth-return';
export default function ResetPasswordRoute() {
  const router = useRouter();
  useCleanAuthReturn('/auth/reset-password');
  return (
    <ResetPasswordScreen
      onLogin={() => router.replace('/sign-in')}
      onRequest={() => router.replace('/forgot-password')}
    />
  );
}
