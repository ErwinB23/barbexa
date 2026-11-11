import { useRouter } from 'expo-router';

import { TechnicalScreen } from '@/features/foundation/presentation/technical-screen';

export default function TechnicalRoute() {
  const router = useRouter();
  return (
    <TechnicalScreen
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/');
      }}
    />
  );
}
