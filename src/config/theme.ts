export const colors = {
  bg: '#080808',
  surface: '#101010',
  surface2: '#181818',
  border: '#222222',
  accent: '#C9A84C',
  accent2: '#E8C96A',
  text: '#f0f0f0',
  text2: '#777777',
  text3: '#444444',
  success: '#2ecc71',
  danger: '#e74c3c',
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  hero: 34,
} as const

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  full: 999,
} as const

export const bottomBarHeight = 68

export const plans = {
  solo: { id: 'solo' as const, nome: 'Solo', mensal: 9.90, anual: 79 },
  pro: { id: 'pro' as const, nome: 'Pro', mensal: 19.90, anual: 159 },
  business: { id: 'business' as const, nome: 'Business', mensal: 34.90, anual: 279 },
}
