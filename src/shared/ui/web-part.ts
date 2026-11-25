import { Platform } from 'react-native';

// React Native Web maps dataSet to data attributes. Native keeps its existing styles.
export function webPart(part: string, variant?: string, tone?: string) {
  return Platform?.OS === 'web'
    ? { dataSet: { 'bx-part': part, 'bx-variant': variant, 'bx-tone': tone } }
    : {};
}
