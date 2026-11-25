import Constants from 'expo-constants';
import { Platform } from 'react-native';

// El origen es configuración pública local, no una URL de producción ni un secreto.
export function developmentTransportOrigin(
  origin?: string,
): string | undefined {
  return typeof __DEV__ !== 'undefined' &&
    __DEV__ &&
    Platform.OS === 'android' &&
    Constants.expoConfig?.extra?.localHttpDevelopment === true
    ? origin
    : undefined;
}
