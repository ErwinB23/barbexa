import { useRouter } from 'expo-router';
import { SignUpScreen } from '@/features/authentication/presentation/sign-up-screen';
export default function SignUpRoute() {
  const router = useRouter();
  return (
    <SignUpScreen
      onConfirm={() => router.replace('/confirm-email')}
      onHome={() => router.replace('/')}
      onLogin={() => router.replace('/sign-in')}
    />
  );
}
