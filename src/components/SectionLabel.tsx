import React from 'react'
import { Text, StyleSheet } from 'react-native'
import { colors, spacing, fontSize } from '../config/theme'

interface SectionLabelProps {
  children: React.ReactNode
}

export default function SectionLabel({ children }: SectionLabelProps) {
  return <Text style={styles.label}>{children}</Text>
}

const styles = StyleSheet.create({
  label: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
})
