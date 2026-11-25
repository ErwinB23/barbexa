// Expo defines this flag in the app; Node tests compile without React Native globals.
// Runtime adapters guard it with typeof before reading it. No Node polyfill is installed.
declare const __DEV__: boolean;
