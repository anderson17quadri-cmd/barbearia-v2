import React from 'react'
import {
  View,
  TextInput as RNTextInput,
  StyleSheet,
} from 'react-native'
import { colors, spacing, fontSize, radius } from '../config/theme'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Pesquisar...',
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <RNTextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text3}
        selectionColor={colors.accent}
        autoCorrect={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
  },
})
