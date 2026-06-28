import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing, fontSize, radius } from '../../config/theme'
import { useAdminData } from '../../hooks/useAdminData'
import { useAuth } from '../../hooks/useAuth'
import { BusinessHours } from '../../config/types'
import Loading from '../../components/Loading'
import Button from '../../components/Button'

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const DEFAULT_HOURS: BusinessHours[] = Array.from({ length: 7 }, (_, i) => ({
  barbearia_id: '',
  dia_semana: i,
  ativo: i > 0,
  hora_inicio: '09:00',
  hora_fim: '18:00',
}))

export default function AdminHoursScreen() {
  const router = useRouter()
  const { barbershopId } = useAuth()
  const { businessHours: savedHours, loadingHours, saveHours } = useAdminData(barbershopId || '')
  const [hours, setHours] = useState<BusinessHours[]>(DEFAULT_HOURS)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (savedHours.length > 0) {
      const merged = DEFAULT_HOURS.map((dh) => {
        const found = savedHours.find((h) => h.dia_semana === dh.dia_semana)
        return found || dh
      })
      setHours(merged)
    }
  }, [savedHours])

  const toggleDay = (index: number) => {
    setHours((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ativo: !next[index].ativo }
      return next
    })
  }

  const updateTime = (index: number, field: 'hora_inicio' | 'hora_fim', value: string) => {
    setHours((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    await saveHours(hours)
    setSaving(false)
    Alert.alert('Guardado', 'Horários atualizados com sucesso.')
  }

  if (loadingHours) return <Loading message="A carregar horários..." />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Horários</Text>
        <Text style={styles.subtitle}>Defina o horário de funcionamento</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {hours.map((h, i) => (
          <View key={i} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <TouchableOpacity style={[styles.toggle, h.ativo && styles.toggleActive]} onPress={() => toggleDay(i)}>
                <View style={[styles.toggleKnob, h.ativo && styles.toggleKnobActive]} />
              </TouchableOpacity>
              <Text style={styles.dayName}>{DAY_NAMES[i]}</Text>
              <Text style={[styles.dayStatus, h.ativo ? styles.dayOpen : styles.dayClosed]}>
                {h.ativo ? 'Aberto' : 'Fechado'}
              </Text>
            </View>
            {h.ativo && (
              <View style={styles.timeRow}>
                <View style={styles.timeField}>
                  <Text style={styles.timeLabel}>Abertura</Text>
                  <TextInput style={styles.timeInput} value={h.hora_inicio} onChangeText={(v) => updateTime(i, 'hora_inicio', v)} placeholder="09:00" placeholderTextColor={colors.text3} />
                </View>
                <Text style={styles.timeSep}>—</Text>
                <View style={styles.timeField}>
                  <Text style={styles.timeLabel}>Fecho</Text>
                  <TextInput style={styles.timeInput} value={h.hora_fim} onChangeText={(v) => updateTime(i, 'hora_fim', v)} placeholder="18:00" placeholderTextColor={colors.text3} />
                </View>
              </View>
            )}
          </View>
        ))}
        <Button title="Guardar alterações" onPress={handleSave} variant="gold" size="md" fullWidth loading={saving} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  backBtn: { marginBottom: spacing.sm },
  backText: { color: colors.text2, fontSize: fontSize.md },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800' },
  subtitle: { color: colors.text2, fontSize: fontSize.md, marginTop: spacing.xs },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  dayCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  dayHeader: { flexDirection: 'row', alignItems: 'center' },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: colors.surface2, justifyContent: 'center', paddingHorizontal: 3, marginRight: spacing.md },
  toggleActive: { backgroundColor: colors.accent },
  toggleKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.text3, alignSelf: 'flex-start' as const },
  toggleKnobActive: { backgroundColor: colors.black, alignSelf: 'flex-end' as const },
  dayName: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600', flex: 1 },
  dayStatus: { fontSize: fontSize.sm, fontWeight: '600' },
  dayOpen: { color: colors.success },
  dayClosed: { color: colors.text3 },
  timeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md, marginTop: spacing.lg },
  timeField: { flex: 1 },
  timeLabel: { color: colors.text2, fontSize: fontSize.xs, marginBottom: spacing.sm },
  timeInput: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, color: colors.text, fontSize: fontSize.md, textAlign: 'center' },
  timeSep: { color: colors.text2, fontSize: fontSize.lg, paddingBottom: spacing.md },
})
