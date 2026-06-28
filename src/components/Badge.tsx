import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, fontSize, radius } from '../config/theme'

type BadgeStatus = 'pendente' | 'confirmado' | 'cancelado' | 'concluido'

interface BadgeProps {
  status: BadgeStatus
}

const STATUS_CONFIG: Record<
  BadgeStatus,
  { label: string; bg: string; textColor: string }
> = {
  pendente: {
    label: 'Pendente',
    bg: 'rgba(243,156,18,0.15)',
    textColor: '#f39c12',
  },
  confirmado: {
    label: 'Confirmado',
    bg: 'rgba(46,204,113,0.15)',
    textColor: colors.success,
  },
  cancelado: {
    label: 'Cancelado',
    bg: 'rgba(231,76,60,0.15)',
    textColor: colors.danger,
  },
  concluido: {
    label: 'Concluído',
    bg: 'rgba(155,89,182,0.15)',
    textColor: '#9b59b6',
  },
}

export default function Badge({ status }: BadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <View style={[styles.pill, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.textColor }]}>
        {config.label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
})
