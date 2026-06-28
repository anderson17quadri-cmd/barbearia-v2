import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native'
import { colors, spacing, fontSize, radius } from '../../config/theme'
import { useAgenda } from '../../hooks/useAgenda'
import { useAuth } from '../../hooks/useAuth'
import { Appointment } from '../../config/types'
import Loading from '../../components/Loading'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function AdminAgendaScreen() {
  const { barbershopId } = useAuth()
  const { date, appointments, loading, changeDay, refresh, updateStatus } = useAgenda(barbershopId || '')
  const [refreshing, setRefreshing] = useState(false)

  const selectedDate = date.toISOString().split('T')[0]
  const today = new Date()
  const dates: Date[] = []
  for (let i = -3; i <= 10; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    dates.push(d)
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }, [refresh])

  const handleConfirm = (id: string) => updateStatus(id, 'confirmado')
  const handleComplete = (id: string) => updateStatus(id, 'concluido')
  const handleCancel = (id: string) => {
    Alert.alert('Cancelar', 'Cancelar esta marcação?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', style: 'destructive', onPress: () => updateStatus(id, 'cancelado') },
    ])
  }

  const renderDateItem = (d: Date, index: number) => {
    const dateStr = d.toISOString().split('T')[0]
    const isSelected = dateStr === selectedDate
    const isToday = dateStr === today.toISOString().split('T')[0]
    return (
      <TouchableOpacity
        key={index}
        style={[styles.dayChip, isSelected && styles.dayChipActive, isToday && styles.dayChipToday]}
        onPress={() => changeDay(index - 3)}
      >
        <Text style={[styles.dayName, isSelected && styles.dayTextActive]}>{WEEKDAYS[d.getDay()]}</Text>
        <Text style={[styles.dayNum, isSelected && styles.dayTextActive]}>{d.getDate()}</Text>
      </TouchableOpacity>
    )
  }

  const formattedDate = date.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })

  const renderItem = ({ item }: { item: Appointment }) => (
    <Card>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTime}>{item.hora_inicio?.slice(0, 5)}</Text>
          <Text style={styles.cardClient}>{item.clientes?.nome || 'Cliente'}</Text>
        </View>
        <Badge status={item.status} />
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.cardLabel}>💈 {item.servicos?.nome || 'Serviço'}</Text>
        {item.profissionais?.nome && <Text style={styles.cardLabel}>👤 {item.profissionais.nome}</Text>}
      </View>
      <View style={styles.cardActions}>
        {item.status === 'pendente' && (
          <>
            <Button title="Confirmar" onPress={() => handleConfirm(item.id)} variant="success" size="sm" />
            <View style={{ width: spacing.sm }} />
            <Button title="Cancelar" onPress={() => handleCancel(item.id)} variant="danger" size="sm" />
          </>
        )}
        {item.status === 'confirmado' && (
          <Button title="Concluir" onPress={() => handleComplete(item.id)} variant="success" size="sm" />
        )}
      </View>
    </Card>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      <FlatList
        horizontal
        data={dates}
        renderItem={({ item, index }) => renderDateItem(item, index)}
        keyExtractor={(_, i) => i.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayPickerContent}
        style={{ flexGrow: 0, marginBottom: spacing.lg }}
      />

      {loading ? (
        <Loading message="A carregar..." />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          ListEmptyComponent={<EmptyState icon="📅" title="Sem agendamentos" subtitle={`Nenhum agendamento para ${formattedDate}.`} />}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800' },
  date: { color: colors.text2, fontSize: fontSize.sm, marginTop: spacing.xs, textTransform: 'capitalize' },
  dayPickerContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  dayChip: { width: 56, paddingVertical: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginRight: spacing.sm },
  dayChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  dayChipToday: { borderColor: colors.accent },
  dayName: { color: colors.text2, fontSize: fontSize.xs, fontWeight: '600' },
  dayNum: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  dayTextActive: { color: colors.black },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardTime: { color: colors.accent, fontSize: fontSize.lg, fontWeight: '800' },
  cardClient: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', marginTop: spacing.xs },
  cardDetails: { marginBottom: spacing.sm },
  cardLabel: { color: colors.text2, fontSize: fontSize.sm, marginBottom: spacing.xs },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.sm },
})
