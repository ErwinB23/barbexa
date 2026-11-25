import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../../shared/ui/app-button';
import { AppText } from '../../../shared/ui/app-text';
import { tokens } from '../../../shared/ui/tokens';
import type { SessionView } from '../domain/session-state';

export type AccountDestination =
  | '/account'
  | '/booking'
  | '/my-reservations'
  | '/agenda'
  | '/barbershop-admin'
  | '/staff'
  | '/context';
export function AccountNavigation({
  state,
  path,
  wide,
  onNavigate,
}: {
  state: SessionView;
  path: string;
  wide: boolean;
  onNavigate: (path: AccountDestination) => void;
}) {
  if (state.kind !== 'ready') return null;
  const context = state.context.kind === 'selected' ? state.context : null;
  const administrator = context?.context.role === 'administrator';
  const items: { path: AccountDestination; label: string }[] = [
    { path: '/account', label: 'Mi cuenta' },
    { path: '/booking', label: 'Reservar' },
    { path: '/my-reservations', label: 'Mis reservas' },
    ...(context ? [{ path: '/agenda' as const, label: 'Agenda' }] : []),
    ...(wide
      ? [
          { path: '/staff' as const, label: 'Invitaciones' },
          ...(administrator
            ? [
                {
                  path: '/barbershop-admin' as const,
                  label: 'Administrar barbería',
                },
              ]
            : []),
        ]
      : []),
  ];
  const links = items.map((item) => (
    <AppButton
      key={item.path}
      label={item.label}
      variant="ghost"
      compact
      selected={
        path === item.path ||
        (item.path === '/barbershop-admin' &&
          ['/services', '/schedules'].includes(path))
      }
      onPress={() => {
        if (path !== item.path) onNavigate(item.path);
      }}
    />
  ));
  if (!wide)
    return (
      <SafeAreaView edges={['bottom']} style={styles.mobile}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mobileLinks}
        >
          {links}
        </ScrollView>
      </SafeAreaView>
    );
  return (
    <View style={styles.sidebar}>
      <View style={styles.identity}>
        <View style={styles.mark}>
          <AppText
            variant="action"
            tone="onAction"
            style={tokens.typography.heading}
          >
            B
          </AppText>
        </View>
        <AppText variant="heading">App Barbería</AppText>
      </View>
      <View style={styles.links}>{links}</View>
      <View style={styles.context}>
        <AppText variant="caption" tone="textSecondary">
          Barbería actual
        </AppText>
        <AppText variant="action">
          {context?.barbershop?.name ?? 'Sin barbería seleccionada'}
        </AppText>
        <AppText variant="caption" tone="textSecondary">
          {context
            ? administrator
              ? 'Administrador'
              : 'Barbero'
            : 'Puedes reservar sin una membresía'}
        </AppText>
        <AppButton
          label="Cambiar barbería"
          variant="ghost"
          compact
          onPress={() => onNavigate('/context')}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  sidebar: {
    width: tokens.size.sidebarWidth,
    padding: tokens.space.lg,
    borderRightWidth: 1,
    borderRightColor: tokens.color.border,
    backgroundColor: tokens.color.panel,
    gap: tokens.space.xxl,
  },
  identity: {
    gap: tokens.space.md,
    paddingHorizontal: tokens.space.sm,
    paddingTop: tokens.space.md,
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.control,
    backgroundColor: tokens.color.action,
    alignItems: 'center',
    justifyContent: 'center',
  },
  links: { gap: tokens.space.sm },
  context: {
    gap: tokens.space.xs,
    marginTop: 'auto',
    padding: tokens.space.md,
    borderTopWidth: 1,
    borderTopColor: tokens.color.border,
  },
  mobile: {
    backgroundColor: tokens.color.panel,
    borderTopWidth: 1,
    borderTopColor: tokens.color.border,
  },
  mobileLinks: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: tokens.space.xs,
    paddingVertical: tokens.space.xs,
    gap: tokens.space.xs,
  },
});
