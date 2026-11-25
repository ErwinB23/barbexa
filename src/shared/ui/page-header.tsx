import { View, StyleSheet } from 'react-native';
import { Children, type ReactNode } from 'react';
import { AppText } from './app-text';
import { tokens } from './tokens';
import { webPart } from './web-part';

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View {...webPart('header')} style={styles.header}>
      <AppText variant="title" aria-level={1}>
        {title}
      </AppText>
      {subtitle && <AppText tone="textSecondary">{subtitle}</AppText>}
    </View>
  );
}
export function Section({
  title,
  description,
  children,
  webLayout,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  webLayout?: 'account-shortcut';
}) {
  return (
    <View {...webPart('section', webLayout)} style={styles.section}>
      <AppText variant="heading" aria-level={2}>
        {title}
      </AppText>
      {description && <AppText tone="textSecondary">{description}</AppText>}
      {children}
    </View>
  );
}
export function ActionRow({ children }: { children: ReactNode }) {
  return (
    <View {...webPart('actions')} style={styles.actions}>
      {children}
    </View>
  );
}
export function ChoiceGrid({ children }: { children: ReactNode }) {
  return (
    <View {...webPart('choices')} style={pageStyles.optionGrid}>
      {Children.toArray(children).map((child) => (
        <View key={(child as { key?: string }).key} style={styles.choice}>
          {child}
        </View>
      ))}
    </View>
  );
}
export const pageStyles = StyleSheet.create({
  panel: {
    padding: tokens.space.xl,
    borderRadius: tokens.radius.panel,
    borderWidth: 1,
    borderColor: tokens.color.border,
    backgroundColor: tokens.color.panel,
    gap: tokens.space.md,
  },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.sm },
});
const styles = StyleSheet.create({
  header: {
    gap: tokens.space.sm,
    paddingTop: tokens.space.md,
    paddingBottom: tokens.space.md,
  },
  section: {
    gap: tokens.space.lg,
    paddingVertical: tokens.space.lg,
    borderTopWidth: 1,
    borderTopColor: tokens.color.border,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space.sm,
    alignItems: 'center',
  },
  choice: { flexBasis: 240, flexGrow: 1, flexShrink: 1, minWidth: 0 },
});
