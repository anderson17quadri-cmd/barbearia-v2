import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { colors, spacing, fontSize, radius } from '../config/theme'

interface FilterOption {
  key: string
  label: string
}

interface FilterChipsProps {
  options: FilterOption[]
  selected: string
  onSelect: (key: string) => void
}

export default function FilterChips({
  options,
  selected,
  onSelect,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isSelected = selected === option.key
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onSelect(option.key)}
            activeOpacity={0.7}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? colors.accent : colors.surface2,
                borderColor: isSelected ? colors.accent : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? colors.black : colors.text2,
                  fontWeight: isSelected ? ('600' as const) : ('400' as const),
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  label: {
    fontSize: fontSize.sm,
  },
})
