import React, { useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native'
import { colors, spacing, fontSize, radius } from '../config/theme'

interface ToggleProps {
  value: boolean
  onToggle: (val: boolean) => void
  label?: string
}

export default function Toggle({ value, onToggle, label }: ToggleProps) {
  const knobPosition = useRef(new Animated.Value(value ? 1 : 0)).current

  useEffect(() => {
    Animated.spring(knobPosition, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start()
  }, [value, knobPosition])

  const knobTranslateX = knobPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  })

  const toggle = () => onToggle(!value)

  return (
    <TouchableWithoutFeedback onPress={toggle}>
      <View style={styles.row}>
        <View
          style={[
            styles.track,
            { backgroundColor: value ? colors.accent : colors.surface2 },
          ]}
        >
          <Animated.View
            style={[
              styles.knob,
              { transform: [{ translateX: knobTranslateX }] },
            ]}
          />
        </View>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: radius.full,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
  },
})
