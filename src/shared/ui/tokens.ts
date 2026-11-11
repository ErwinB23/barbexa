export const tokens = {
  color: {
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#111827',
    textSecondary: '#374151',
    action: '#1D4ED8',
    onAction: '#FFFFFF',
    error: '#B91C1C',
    success: '#166534',
  },
  typography: {
    title: { fontSize: 24, fontWeight: '700' },
    body: { fontSize: 16, fontWeight: '400' },
    caption: { fontSize: 14, fontWeight: '400' },
    action: { fontSize: 16, fontWeight: '600' },
  },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { control: 8, panel: 12 },
  size: { minimumTouch: 48, contentMaxWidth: 720 },
} as const;
