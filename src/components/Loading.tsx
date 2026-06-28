import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { colors, spacing, fontSize } from '../config/theme'

interface LoadingProps {
  message?: string
}

export default function Loading({ message = 'A carregar...' }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  message: {
    marginTop: spacing.lg,
    color: colors.text2,
    fontSize: fontSize.md,
  },
})
