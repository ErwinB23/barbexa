import { useRouter } from 'expo-router';
import { ContextScreen } from '@/features/authentication/presentation/context-screen';
export default function ContextRoute() {
  const router = useRouter();
  return (
    <ContextScreen
      onAccount={() => router.replace('/account')}
      onAgenda={() => router.push('/agenda')}
    />
  );
}
