import { StyleSheet, View } from 'react-native';

import { AppButton } from './app-button';
import { AppText } from './app-text';
import { tokens } from './tokens';
import { webPart } from './web-part';

type StatusMessageProps = {
  message: string;
  announce?: boolean;
} & (
  | { state: 'loading' | 'empty' | 'success' }
  | { state: 'error'; onRetry: () => void; retryLabel?: string }
);

export function StatusMessage(props: StatusMessageProps) {
  const { state, message, announce = true } = props;
  return (
    <View
      {...webPart('status', state)}
      style={[
        styles.container,
        state === 'error' && styles.error,
        state === 'success' && styles.success,
      ]}
    >
      <AppText
        tone={
          state === 'error'
            ? 'error'
            : state === 'success'
              ? 'success'
              : 'textSecondary'
        }
        accessibilityLiveRegion={announce ? 'polite' : 'none'}
        accessibilityState={{ busy: state === 'loading' }}
      >
        {message}
      </AppText>
      {props.state === 'error' && (
        <AppButton
          variant="secondary"
          label={props.retryLabel ?? 'Reintentar'}
          onPress={props.onRetry}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: tokens.space.md,
    padding: tokens.space.lg,
    borderRadius: tokens.radius.control,
    backgroundColor: tokens.color.tint,
    borderLeftWidth: 3,
    borderLeftColor: tokens.color.action,
  },
  error: {
    backgroundColor: tokens.color.errorSurface,
    borderLeftColor: tokens.color.error,
  },
  success: {
    backgroundColor: tokens.color.successSurface,
    borderLeftColor: tokens.color.success,
  },
});
