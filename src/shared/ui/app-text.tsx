import { StyleSheet, Text, type TextProps } from 'react-native';

import { tokens } from './tokens';
import { webPart } from './web-part';

type AppTextProps = Omit<
  TextProps,
  | 'allowFontScaling'
  | 'maxFontSizeMultiplier'
  | 'numberOfLines'
  | 'adjustsFontSizeToFit'
> & {
  variant?: keyof typeof tokens.typography;
  tone?: 'text' | 'textSecondary' | 'onAction' | 'error' | 'success';
};

export function AppText({
  variant = 'body',
  tone = 'text',
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...webPart('text', variant, tone)}
      accessibilityRole={
        ['title', 'heading', 'display'].includes(variant) ? 'header' : undefined
      }
      {...props}
      allowFontScaling
      maxFontSizeMultiplier={0}
      style={[
        styles.text,
        tokens.typography[variant],
        { color: tokens.color[tone] },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  text: { flexShrink: 1 },
});
