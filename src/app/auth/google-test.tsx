import { Redirect } from 'expo-router';
export default function GoogleAuthTestRoute() {
  return __DEV__ ? null : <Redirect href="/" />;
}
