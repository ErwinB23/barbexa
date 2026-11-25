import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  type PressableProps,
} from 'react-native';

import { AppText } from './app-text';
import { tokens } from './tokens';
import { webPart } from './web-part';

type AppButtonProps = Pick<
  PressableProps,
  'onPress' | 'disabled' | 'accessibilityHint' | 'testID'
> & {
  label: string;
  accessibilityLabel?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  selected?: boolean;
  compact?: boolean;
};

export function AppButton({
  label,
  disabled = false,
  variant = 'primary',
  selected,
  compact = false,
  ...props
}: AppButtonProps) {
  const [focused, setFocused] = useState(false);
  const web = Platform?.OS === 'web';
  return (
    <Pressable
      {...props}
      {...webPart('button', variant)}
      {...(web && selected !== undefined ? { 'aria-pressed': selected } : {})}
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{
        disabled,
        ...(web || selected === undefined ? {} : { selected }),
      }}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        variant !== 'primary' && styles[variant],
        compact && styles.compact,
        selected && variant !== 'primary' && styles.selected,
        disabled && styles.disabled,
        !disabled &&
          (pressed || focused) &&
          (variant === 'primary' ? styles.focused : styles.focusedSecondary),
      ]}
    >
      <AppText
        variant={compact ? 'caption' : 'action'}
        tone={
          disabled
            ? 'textSecondary'
            : variant === 'primary'
              ? 'onAction'
              : variant === 'danger'
                ? 'error'
                : 'text'
        }
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: tokens.size.minimumTouch,
    minHeight: tokens.size.minimumTouch,
    paddingHorizontal: tokens.space.xl,
    paddingVertical: tokens.space.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.control,
    borderWidth: 2,
    borderColor: tokens.color.action,
    backgroundColor: tokens.color.action,
  },
  disabled: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.textSecondary,
  },
  focused: { borderColor: tokens.color.onAction },
  focusedSecondary: {
    borderColor: tokens.color.action,
    backgroundColor: tokens.color.tint,
  },
  secondary: {
    backgroundColor: tokens.color.panel,
    borderColor: tokens.color.border,
  },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  danger: {
    backgroundColor: tokens.color.errorSurface,
    borderColor: tokens.color.error,
  },
  selected: {
    backgroundColor: tokens.color.tint,
    borderColor: tokens.color.action,
  },
  compact: {
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
  },
});
