import { useState } from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { AppText } from './app-text';
import { tokens } from './tokens';

type AppButtonProps = Pick<
  PressableProps,
  'onPress' | 'disabled' | 'accessibilityHint' | 'testID'
> & {
  label: string;
  accessibilityLabel?: string;
};

export function AppButton({
  label,
  disabled = false,
  ...props
}: AppButtonProps) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        !disabled && (pressed || focused) && styles.focused,
      ]}
    >
      <AppText variant="action" tone={disabled ? 'textSecondary' : 'onAction'}>
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
});
