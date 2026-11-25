import { useEffect } from 'react';
import {
  useLocalSearchParams,
  useRootNavigationState,
  useRouter,
} from 'expo-router';
import { useRegistration } from './use-registration';

// history.replaceState alone emits no navigation event. Expo Router can replay its
// initial query afterwards. Synchronize its own state, only after the single PKCE
// consumer has captured the input and the navigator is mounted.
export function useCleanAuthReturn(
  destination: '/auth/callback' | '/auth/reset-password',
) {
  const { capturedReturn, configured } = useRegistration();
  const navigation = useRootNavigationState(),
    params = useLocalSearchParams(),
    router = useRouter();
  const hasParams = Object.keys(params).length > 0;
  useEffect(() => {
    if (
      configured &&
      navigation?.key &&
      capturedReturn === destination &&
      hasParams
    )
      router.replace(destination);
  }, [
    configured,
    navigation?.key,
    capturedReturn,
    destination,
    hasParams,
    router,
  ]);
}
