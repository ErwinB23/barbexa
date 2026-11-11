import { useRouter } from 'expo-router';

import { NotFoundScreen } from '@/features/foundation/presentation/not-found-screen';

export default function NotFoundRoute() {
  const router = useRouter();
  return <NotFoundScreen onGoHome={() => router.replace('/')} />;
}
