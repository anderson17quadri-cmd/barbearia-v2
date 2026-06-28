import React, { useRef } from 'react'
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { colors, spacing, radius } from '../config/theme'

interface CardProps {
  children: React.ReactNode
  style?: object
  onPress?: () => void
}

export default function Card({ children, style, onPress }: CardProps) {
  const scale = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start()
    }
  }

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start()
    }
  }

  const content = <View style={[styles.card, style]}>{children}</View>

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          {content}
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
})
