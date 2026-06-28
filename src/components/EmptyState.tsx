import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, fontSize } from '../config/theme'
import Button from './Button'

interface EmptyStateAction {
  label: string
  onPress: () => void
}

interface EmptyStateProps {
  icon: string
  title: string
  subtitle: string
  action?: EmptyStateAction
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {action && (
        <View style={styles.actionWrapper}>
          <Button
            title={action.label}
            onPress={action.onPress}
            variant="gold"
            size="md"
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.text2,
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionWrapper: {
    marginTop: spacing.xxl,
  },
})
