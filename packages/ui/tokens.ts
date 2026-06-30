// Shared design tokens — used by apps/web and apps/admin
// Mobile app imports these values into its own StyleSheet constants

export const colors = {
  // Brand
  primary:        '#7C3AED',  // violet-600
  primaryLight:   '#A78BFA',  // violet-400
  primaryDark:    '#5B21B6',  // violet-800

  // Semantic
  success:        '#10B981',
  warning:        '#F59E0B',
  error:          '#EF4444',
  info:           '#3B82F6',

  // Neutrals
  gray50:         '#F9FAFB',
  gray100:        '#F3F4F6',
  gray200:        '#E5E7EB',
  gray300:        '#D1D5DB',
  gray400:        '#9CA3AF',
  gray500:        '#6B7280',
  gray600:        '#4B5563',
  gray700:        '#374151',
  gray800:        '#1F2937',
  gray900:        '#111827',

  // Status
  upcoming:       '#3B82F6',
  ongoing:        '#10B981',
  completed:      '#6B7280',
  cancelled:      '#EF4444',

  white:          '#FFFFFF',
  black:          '#000000',
} as const

export const spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  '2xl': 48,
  '3xl': 64,
} as const

export const typography = {
  fontSizeXs:   12,
  fontSizeSm:   14,
  fontSizeMd:   16,
  fontSizeLg:   18,
  fontSizeXl:   20,
  fontSize2Xl:  24,
  fontSize3Xl:  30,
  fontSize4Xl:  36,

  fontWeightNormal:   '400',
  fontWeightMedium:   '500',
  fontWeightSemibold: '600',
  fontWeightBold:     '700',

  lineHeightTight:  1.25,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,
} as const

export const borderRadius = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  full: 9999,
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
} as const

// Category color map (matches seed.sql categories)
export const categoryColors: Record<string, string> = {
  'cat-sports':   '#3B82F6',
  'cat-outdoors': '#10B981',
  'cat-food':     '#F59E0B',
  'cat-music':    '#8B5CF6',
  'cat-art':      '#EC4899',
  'cat-wellness': '#14B8A6',
  'cat-games':    '#F97316',
  'cat-learning': '#6366F1',
  'cat-social':   '#7C3AED',
  'cat-travel':   '#0EA5E9',
}

