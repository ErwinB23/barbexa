import { useRouter } from 'expo-router';

import { TechnicalScreen } from '@/features/foundation/presentation/technical-screen';

export default function TechnicalRoute() {
  const router = useRouter();
  return (
    <TechnicalScreen
      onGoogleCheck={
        __DEV__ ? () => router.push('/auth/google-test') : undefined
      }
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/');
      }}
    />
  );
}
