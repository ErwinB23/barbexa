import { StyleSheet, View } from 'react-native';

import { AppButton } from './app-button';
import { AppText } from './app-text';
import { tokens } from './tokens';

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
    <View style={styles.container}>
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
          label={props.retryLabel ?? 'Reintentar'}
          onPress={props.onRetry}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.space.md },
});
