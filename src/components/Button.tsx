import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, spacing, fontSize, radius } from '../config/theme'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'gold' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  disabled?: boolean
  fullWidth?: boolean
  size?: ButtonSize
  loading?: boolean
  icon?: string
}

const SIZE_MAP: Record<ButtonSize, { paddingHorizontal: number; paddingVertical: number; fontSize: number }> = {
  sm: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, fontSize: fontSize.sm },
  md: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, fontSize: fontSize.md },
  lg: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.lg, fontSize: fontSize.lg },
}

function getButtonStyle(
  variant: ButtonVariant,
  disabled: boolean,
  size: ButtonSize,
  fullWidth: boolean,
): {
  wrapper: object
  content: object
  gradient?: boolean
} {
  const s = SIZE_MAP[size]

  const base: object = {
    opacity: disabled ? 0.5 : 1,
    alignSelf: fullWidth ? ('stretch' as const) : ('flex-start' as const),
  }

  switch (variant) {
    case 'primary':
      return {
        wrapper: { ...base },
        content: {
          paddingHorizontal: s.paddingHorizontal,
          paddingVertical: s.paddingVertical,
          borderRadius: radius.lg,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          flexDirection: 'row' as const,
        },
        gradient: true,
      }
    case 'secondary':
      return {
        wrapper: { ...base },
        content: {
          paddingHorizontal: s.paddingHorizontal,
          paddingVertical: s.paddingVertical,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.transparent,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          flexDirection: 'row' as const,
        },
      }
    case 'outline':
      return {
        wrapper: { ...base },
        content: {
          paddingHorizontal: s.paddingHorizontal,
          paddingVertical: s.paddingVertical,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.text3,
          backgroundColor: colors.transparent,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          flexDirection: 'row' as const,
        },
      }
    case 'gold':
      return {
        wrapper: { ...base },
        content: {
          paddingHorizontal: s.paddingHorizontal,
          paddingVertical: s.paddingVertical,
          borderRadius: radius.lg,
          backgroundColor: colors.accent,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          flexDirection: 'row' as const,
        },
      }
    case 'danger':
      return {
        wrapper: { ...base },
        content: {
          paddingHorizontal: s.paddingHorizontal,
          paddingVertical: s.paddingVertical,
          borderRadius: radius.lg,
          backgroundColor: 'rgba(231,76,60,0.15)',
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          flexDirection: 'row' as const,
        },
      }
    case 'success':
      return {
        wrapper: { ...base },
        content: {
          paddingHorizontal: s.paddingHorizontal,
          paddingVertical: s.paddingVertical,
          borderRadius: radius.lg,
          backgroundColor: 'rgba(46,204,113,0.15)',
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          flexDirection: 'row' as const,
        },
      }
  }
}

function getTextStyle(variant: ButtonVariant, size: ButtonSize): object {
  const s = SIZE_MAP[size]
  switch (variant) {
    case 'primary':
      return { color: colors.black, fontSize: s.fontSize, fontWeight: '600' as const }
    case 'secondary':
      return { color: colors.text, fontSize: s.fontSize, fontWeight: '600' as const }
    case 'outline':
      return { color: colors.text2, fontSize: s.fontSize, fontWeight: '600' as const }
    case 'gold':
      return { color: colors.black, fontSize: s.fontSize, fontWeight: '600' as const }
    case 'danger':
      return { color: colors.danger, fontSize: s.fontSize, fontWeight: '600' as const }
    case 'success':
      return { color: colors.success, fontSize: s.fontSize, fontWeight: '600' as const }
  }
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  size = 'md',
  loading = false,
  icon,
}: ButtonProps) {
  const { wrapper, content, gradient } = getButtonStyle(variant, disabled, size, fullWidth)
  const textStyle = getTextStyle(variant, size)

  const inner = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'gold' ? colors.black : colors.accent}
          style={{ marginRight: icon || loading ? spacing.sm : 0 }}
        />
      ) : icon ? (
        <Text style={{ marginRight: spacing.sm, fontSize: SIZE_MAP[size].fontSize }}>{icon}</Text>
      ) : null}
      <Text style={textStyle}>{title}</Text>
    </>
  )

  if (gradient && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={wrapper}
      >
        <LinearGradient
          colors={[colors.accent, colors.accent2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={content}
        >
          {inner}
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[wrapper, content]}
    >
      {inner}
    </TouchableOpacity>
  )
}
