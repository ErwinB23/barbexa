import { useRouter } from 'expo-router';
import { ForgotPasswordScreen } from '@/features/authentication/presentation/forgot-password-screen';
export default function ForgotPasswordRoute() {
  const router = useRouter();
  return <ForgotPasswordScreen onLogin={() => router.replace('/sign-in')} />;
}
