import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, fontSize, radius } from '../config/theme'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
}

export default function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topLine} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {sub && <Text style={styles.sub}>{sub}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    paddingTop: spacing.sm + 3,
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.accent,
  },
  label: {
    color: colors.text2,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.accent,
    fontSize: fontSize.xxxl,
    fontWeight: '700',
  },
  sub: {
    color: colors.text2,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
})
