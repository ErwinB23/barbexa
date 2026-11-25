import { useState, type Ref, type ComponentRef } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { AppText } from './app-text';
import { tokens } from './tokens';
import { webPart } from './web-part';

type InputOptions = Pick<
  TextInputProps,
  | 'keyboardType'
  | 'inputMode'
  | 'autoComplete'
  | 'textContentType'
  | 'secureTextEntry'
  | 'autoCapitalize'
  | 'autoCorrect'
  | 'returnKeyType'
  | 'onSubmitEditing'
  | 'onFocus'
  | 'onBlur'
  | 'testID'
>;
export interface AppTextFieldProps extends InputOptions {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (value: string) => void;
  readonly hint?: string;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly ref?: Ref<ComponentRef<typeof TextInput>>;
}

export function AppTextField({
  id,
  label,
  value,
  onChangeText,
  hint,
  error,
  disabled = false,
  onFocus,
  onBlur,
  ref,
  ...inputProps
}: AppTextFieldProps) {
  const [focused, setFocused] = useState(false);
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') ||
    undefined;
  const web =
    Platform.OS === 'web'
      ? {
          'aria-describedby': describedBy,
          'aria-invalid': !!error,
          'aria-disabled': disabled,
        }
      : {};
  return (
    <View style={styles.container}>
      <AppText nativeID={`${id}-label`} variant="action">
        {label}
      </AppText>
      <TextInput
        {...inputProps}
        {...web}
        {...webPart('field')}
        ref={ref}
        nativeID={id}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        accessibilityLabel={label}
        accessibilityLabelledBy={
          Platform.OS === 'android' ? `${id}-label` : undefined
        }
        accessibilityHint={
          [hint, error].filter(Boolean).join('. ') || undefined
        }
        accessibilityState={{ disabled }}
        allowFontScaling
        maxFontSizeMultiplier={0}
        placeholderTextColor={tokens.color.textSecondary}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          error && styles.error,
          focused && styles.focused,
          disabled && styles.disabled,
        ]}
      />
      {hint ? (
        <AppText nativeID={`${id}-hint`} variant="caption" tone="textSecondary">
          {hint}
        </AppText>
      ) : null}
      {error ? (
        <AppText
          nativeID={`${id}-error`}
          tone="error"
          accessibilityLiveRegion="polite"
        >
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: tokens.space.sm },
  input: {
    minWidth: tokens.size.minimumTouch,
    minHeight: tokens.size.minimumTouch,
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.md,
    borderWidth: 2,
    borderColor: tokens.color.controlBorder,
    borderRadius: tokens.radius.control,
    backgroundColor: tokens.color.panel,
    color: tokens.color.text,
    ...tokens.typography.body,
  },
  focused: { borderColor: tokens.color.action },
  error: { borderColor: tokens.color.error },
  disabled: { backgroundColor: tokens.color.surface },
});
