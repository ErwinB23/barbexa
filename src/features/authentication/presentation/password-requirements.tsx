import { View } from 'react-native';
import { AppText } from '../../../shared/ui/app-text';
import { passwordRequirementItems } from './password-requirement-items';

export function PasswordRequirements({ password }: { password: string }) {
  return (
    <View>
      {passwordRequirementItems(password).map(({ key, label, met }) => (
        <AppText
          key={key}
          tone={met ? 'success' : 'textSecondary'}
          accessibilityLabel={`${label}. ${met ? 'Cumplido' : 'Pendiente'}`}
        >
          {met ? '✓' : '○'} {label} · {met ? 'Cumplido' : 'Pendiente'}
        </AppText>
      ))}
      <AppText tone="textSecondary">Recomendamos 12 caracteres o más.</AppText>
    </View>
  );
}
