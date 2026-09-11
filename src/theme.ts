export const colors = {
  // Mutfak/duvar zemini — buzdolabının önünde durduğu alan
  backdrop: '#dfe6ea',

  // Paslanmaz çelik gövde
  bodyTop: '#eef2f4',
  bodyBottom: '#c8d2d8',
  bodyEdge: '#a9b6bf',
  doorTop: '#f7fafb',
  doorBottom: '#dce4e8',
  handle: '#8d9aa3',

  // İç aydınlatma
  interior: '#22303a',
  interiorLight: '#2e3f4b',
  shelf: '#4a6272',

  text: '#1d2b33',
  textMuted: '#6b7c86',
  textOnDark: '#f2f7f9',
  textOnDarkMuted: '#9db0bd',

  accent: '#2f8fd6',
  accentDark: '#1e6fab',

  fresh: '#37b26c',
  warning: '#e8a33d',
  expired: '#e2564b',

  white: '#ffffff',
  border: '#d7e0e5',
  danger: '#e2564b',
} as const;

export const statusColor = {
  fresh: colors.fresh,
  warning: colors.warning,
  expired: colors.expired,
} as const;

export const statusLabel = {
  fresh: 'Taze',
  warning: 'Dikkat',
  expired: 'Süresi geçti',
} as const;

export const radius = { sm: 8, md: 14, lg: 22, xl: 30 } as const;
export const spacing = { xs: 4, sm: 8, md: 14, lg: 20, xl: 28 } as const;
