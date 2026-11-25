import { useRouter } from 'expo-router';

import { WelcomeScreen } from '@/features/foundation/presentation/welcome-screen';
import { useRegistration } from '@/features/authentication/presentation/use-registration';

export default function IndexRoute() {
  const router = useRouter();
  const { state, callbackError } = useRegistration();
  const ready = state.kind === 'ready' && !callbackError;
  return (
    <WelcomeScreen
      onOpenTechnical={() => router.push('/technical')}
      onRegister={!ready ? () => router.push('/sign-up') : undefined}
      onBooking={ready ? () => router.push('/booking') : undefined}
      onOpenSession={() => router.push(ready ? '/account' : '/sign-in')}
      sessionLabel={ready ? 'Mi cuenta' : 'Iniciar sesión'}
    />
  );
}
