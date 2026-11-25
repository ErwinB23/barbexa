import type { ReactNode } from 'react';
import { Platform, View } from 'react-native';
// Preserve navigation state while preventing rendering/interaction before verification.
export function NavigationFrame({
  blocked,
  children,
}: {
  blocked: boolean;
  children: ReactNode;
}) {
  return (
    <View
      // A native Stack must keep its viewport during cold mounting and resume.
      // display:none removes its layout even though the navigator remains mounted.
      style={{
        flex: 1,
        ...(Platform.OS === 'android'
          ? { opacity: blocked ? 0 : 1 }
          : { display: blocked ? 'none' : 'flex' }),
      }}
      pointerEvents={blocked ? 'none' : 'auto'}
      accessibilityElementsHidden={blocked}
      importantForAccessibility={blocked ? 'no-hide-descendants' : 'auto'}
    >
      {children}
    </View>
  );
}
