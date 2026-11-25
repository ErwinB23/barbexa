import { Linking, Platform } from 'react-native';

// The adapter validates the exact authorize URL before invoking this side effect.
// Native return is consumed only by the existing runtime Linking listener.
export async function openOAuthUrl(url: string): Promise<void> {
  if (Platform.OS === 'web') window.location.assign(url);
  else if (Platform.OS === 'android') await Linking.openURL(url);
  else throw Error('OAUTH_PLATFORM_UNAVAILABLE');
}
