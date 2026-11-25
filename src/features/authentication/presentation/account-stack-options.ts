import { tokens } from '../../../shared/ui/tokens';

export const authenticationStackOptions = {
  headerTintColor: tokens.color.action,
  headerStyle: { backgroundColor: tokens.color.panel },
  headerTitleStyle: { fontFamily: 'sans-serif', fontWeight: '600' as const },
  contentStyle: { backgroundColor: tokens.color.background },
};
