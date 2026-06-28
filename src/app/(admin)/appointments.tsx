import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { colors, spacing, fontSize, radius } from '../../config/theme'
import { useAdminAppointments } from '../../hooks/useAppointments'
import { useAuth } from '../../hooks/useAuth'
import { Appointment } from '../../config/types'
import Loading from '../../components/Loading'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'

const FILTERS = [
  { key: '', label: 'Todos' },
  { key: 'pendente', label: 'Pendente' },
  { key: 'confirmado', label: 'Confirmado' },
  { key: 'concluido', label: 'Concluído' },
  { key: 'cancelado', label: 'Cancelado' },
]

export default function AdminAppointmentsScreen() {
  const { barbershopId } = useAuth()
  const { appointments, loading, filterStatus, setFilterStatus, updateStatus } = useAdminAppointments(barbershopId || '')
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 500))
    setRefreshing(false)
  }, [])

  const renderItem = ({ item }: { item: Appointment }) => {
    const dateStr = item.data ? new Date(item.data + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' }) : ''
    return (
      <Card>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardClient}>{item.clientes?.nome || 'Cliente'}</Text>
            <Text style={styles.cardDate}>📅 {dateStr} às {item.hora_inicio?.slice(0, 5)}</Text>
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
              <Button title="Confirmar" onPress={() => updateStatus(item.id, 'confirmado')} variant="success" size="sm" />
              <View style={{ width: spacing.sm }} />
              <Button title="Cancelar" onPress={() => {
                Alert.alert('Cancelar', 'Cancelar esta marcação?', [
                  { text: 'Não', style: 'cancel' },
                  { text: 'Sim', style: 'destructive', onPress: () => updateStatus(item.id, 'cancelado') },
                ])
              }} variant="danger" size="sm" />
            </>
          )}
          {item.status === 'confirmado' && (
            <Button title="Concluir" onPress={() => updateStatus(item.id, 'concluido')} variant="success" size="sm" />
          )}
        </View>
      </Card>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agendamentos</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filterStatus === f.key && styles.filterChipActive]}
            onPress={() => setFilterStatus(f.key)}
          >
            <Text style={[styles.filterText, filterStatus === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
          ListEmptyComponent={<EmptyState icon="📋" title="Sem agendamentos" subtitle={`Nenhum agendamento com estado "${FILTERS.find(f => f.key === filterStatus)?.label}".`} />}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800' },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: spacing.sm },
  filterChip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { color: colors.text2, fontSize: fontSize.sm, fontWeight: '600' },
  filterTextActive: { color: colors.black },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardClient: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  cardDate: { color: colors.text2, fontSize: fontSize.sm, marginTop: spacing.xs },
  cardDetails: { marginBottom: spacing.sm },
  cardLabel: { color: colors.text2, fontSize: fontSize.sm, marginBottom: spacing.xs },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.sm },
})
