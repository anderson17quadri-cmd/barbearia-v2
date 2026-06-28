import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors, spacing, radius } from '../config/theme'

interface StepIndicatorProps {
  current: number
  total: number
}

export default function StepIndicator({
  current,
  total = 4,
}: StepIndicatorProps) {
  const steps = Array.from({ length: total }, (_, i) => i + 1)

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View
          key={step}
          style={[
            styles.bar,
            index < steps.length - 1 && styles.barMargin,
            {
              backgroundColor:
                step <= current ? colors.accent : colors.surface2,
            },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
  },
  barMargin: {
    marginRight: spacing.xs,
  },
})
