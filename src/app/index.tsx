import { useRouter } from 'expo-router';

import { WelcomeScreen } from '@/features/foundation/presentation/welcome-screen';

export default function IndexRoute() {
  const router = useRouter();
  return <WelcomeScreen onOpenTechnical={() => router.push('/technical')} />;
}
