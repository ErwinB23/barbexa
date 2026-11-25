import type { ReactNode } from 'react';
import { Platform, View, StyleSheet, useWindowDimensions } from 'react-native';
import type { SessionView } from '../domain/session-state';
import {
  AccountNavigation,
  type AccountDestination,
} from './account-navigation';

export { authenticationStackOptions } from './account-stack-options';
export { authenticationStackOptions as accountStackOptions } from './account-stack-options';
export function AccountShell({
  state,
  path,
  onNavigate,
  children,
}: {
  state: SessionView;
  path: string;
  onNavigate: (path: AccountDestination) => void;
  children: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const wide = Platform.OS === 'web' && width >= 1000;
  return (
    <View style={[styles.root, wide && styles.wide]}>
      {wide && (
        <AccountNavigation
          state={state}
          path={path}
          wide
          onNavigate={onNavigate}
        />
      )}
      <View style={styles.content}>{children}</View>
      {!wide && (
        <AccountNavigation
          state={state}
          path={path}
          wide={false}
          onNavigate={onNavigate}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  wide: { flexDirection: 'row' },
  content: { flex: 1, minWidth: 0 },
});
