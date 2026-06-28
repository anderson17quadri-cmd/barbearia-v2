import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, spacing, fontSize, radius } from '../config/theme'

interface DayPickerProps {
  date: Date
  onChange: (date: Date) => void
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatDateStr(d: Date): string {
  const dayName = DAY_NAMES[d.getDay()]
  const day = d.getDate()
  const month = MONTH_NAMES[d.getMonth()]
  const year = d.getFullYear()
  return `${dayName}, ${day} de ${month} de ${year}`
}

function addDays(d: Date, n: number): Date {
  const nd = new Date(d)
  nd.setDate(nd.getDate() + n)
  return nd
}

export default function DayPicker({ date, onChange }: DayPickerProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onChange(addDays(date, -1))}
        style={styles.arrow}
        activeOpacity={0.6}
      >
        <Text style={styles.arrowText}>{'‹'}</Text>
      </TouchableOpacity>
      <Text style={styles.dateText}>{formatDateStr(date)}</Text>
      <TouchableOpacity
        onPress={() => onChange(addDays(date, 1))}
        style={styles.arrow}
        activeOpacity={0.6}
      >
        <Text style={styles.arrowText}>{'›'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  arrow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  arrowText: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: '300',
  },
  dateText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
})
