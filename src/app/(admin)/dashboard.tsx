import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
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

export default function AdminDashboardScreen() {
  const { barbershopId } = useAuth()
  const { appointments, loading, stats, updateStatus } = useAdminAppointments(barbershopId || '')
  const [refreshing, setRefreshing] = useState(false)

  const today = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 500))
    setRefreshing(false)
  }, [])

  const handleConfirm = (id: string) => {
    Alert.alert('Confirmar', 'Confirmar esta marcação?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => updateStatus(id, 'confirmado') },
    ])
  }

  const handleCancel = (id: string) => {
    Alert.alert('Cancelar', 'Cancelar esta marcação?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim, cancelar', style: 'destructive', onPress: () => updateStatus(id, 'cancelado') },
    ])
  }

  if (loading) return <Loading message="A carregar dashboard..." />

  const nextAppointments = appointments.filter(a => a.status !== 'cancelado' && a.status !== 'concluido').slice(0, 10)

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
        {item.status === 'pendente' && (
          <View style={styles.cardActions}>
            <Button title="Confirmar" onPress={() => handleConfirm(item.id)} variant="success" size="sm" />
            <View style={{ width: spacing.sm }} />
            <Button title="Cancelar" onPress={() => handleCancel(item.id)} variant="danger" size="sm" />
          </View>
        )}
      </Card>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.date}>{today}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}><Text style={styles.statValue}>{stats.hoje}</Text><Text style={styles.statLabel}>Hoje</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{stats.semana}</Text><Text style={styles.statLabel}>Semana</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{stats.clientes}</Text><Text style={styles.statLabel}>Clientes</Text></View>
        <View style={styles.statCard}><Text style={[styles.statValue, { color: colors.accent }]}>{stats.pendentes}</Text><Text style={styles.statLabel}>Pendentes</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Próximos agendamentos</Text>

      <FlatList
        data={nextAppointments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={<EmptyState icon="📅" title="Sem agendamentos" subtitle="Nenhum agendamento próximo." />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800' },
  date: { color: colors.text2, fontSize: fontSize.sm, marginTop: spacing.xs, textTransform: 'capitalize' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.xl },
  statCard: { width: '47%' as any, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.sm },
  statValue: { color: colors.text, fontSize: fontSize.xxxl, fontWeight: '900' },
  statLabel: { color: colors.text2, fontSize: fontSize.xs, marginTop: spacing.xs, textTransform: 'uppercase', letterSpacing: 1 },
  sectionTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardClient: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  cardDate: { color: colors.text2, fontSize: fontSize.sm, marginTop: spacing.xs },
  cardDetails: { marginBottom: spacing.sm },
  cardLabel: { color: colors.text2, fontSize: fontSize.sm, marginBottom: spacing.xs },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.sm },
})
