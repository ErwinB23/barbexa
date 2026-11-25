import { useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SignInScreen } from '@/features/authentication/presentation/sign-in-screen';
import { safeReturnIntent } from '@/features/authentication/presentation/navigation-policy';
export default function SignInRoute() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams();
  const destination = safeReturnIntent(returnTo);
  const ready = useCallback(
    () => router.replace(destination),
    [router, destination],
  );
  const profile = useCallback(() => router.replace('/confirm-email'), [router]);
  return (
    <SignInScreen
      onReady={ready}
      onProfile={profile}
      onRegister={() => router.push('/sign-up')}
      onHome={() => router.replace('/')}
      onForgotPassword={() => router.push('/forgot-password')}
    />
  );
}
