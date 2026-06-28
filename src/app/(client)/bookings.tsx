import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing, fontSize } from '../../config/theme'
import { useClientAppointments } from '../../hooks/useAppointments'
import { useAuth } from '../../hooks/useAuth'
import { Appointment } from '../../config/types'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import Card from '../../components/Card'
import Badge from '../../components/Badge'
import Button from '../../components/Button'

export default function ClientBookingsScreen() {
  const router = useRouter()
  const { clientId } = useAuth()
  const { appointments, loading, refresh, cancelAppointment } = useClientAppointments(clientId || '')
  const [refreshing, setRefreshing] = useState(false)

  const isLoggedIn = !!clientId

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }, [refresh])

  const handleCancel = (id: string) => {
    Alert.alert('Cancelar marcação', 'Tem a certeza que deseja cancelar esta marcação?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim, cancelar', style: 'destructive', onPress: async () => { await cancelAppointment(id) } },
    ])
  }

  if (!isLoggedIn) {
    return (
      <EmptyState
        icon="🔐"
        title="Inicie sessão"
        subtitle="Faça login para ver as suas marcações."
        action={{ label: 'Entrar', onPress: () => router.push('/(client)/profile') }}
      />
    )
  }

  if (loading) return <Loading message="A carregar marcações..." />

  const renderItem = ({ item }: { item: Appointment }) => {
    const dateStr = item.data ? new Date(item.data + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' }) : ''
    return (
      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardShop}>{item.barbearias?.nome || 'Barbearia'}</Text>
          <Badge status={item.status} />
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.cardLabel}>📅 {dateStr} às {item.hora_inicio?.slice(0, 5)}</Text>
          <Text style={styles.cardLabel}>💈 {item.servicos?.nome || 'Serviço'}</Text>
          {item.profissionais?.nome && <Text style={styles.cardLabel}>👤 {item.profissionais.nome}</Text>}
        </View>
        {item.status === 'pendente' && (
          <View style={styles.cardActions}>
            <Button title="Cancelar" onPress={() => handleCancel(item.id)} variant="danger" size="sm" />
          </View>
        )}
      </Card>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>As minhas marcações</Text>
        <Text style={styles.subtitle}>Consulte e faça a gestão das suas marcações</Text>
      </View>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={<EmptyState icon="📋" title="Sem marcações" subtitle="Ainda não tem nenhuma marcação." />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800' },
  subtitle: { color: colors.text2, fontSize: fontSize.md, marginTop: spacing.xs },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardShop: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  cardDetails: { marginBottom: spacing.sm },
  cardLabel: { color: colors.text2, fontSize: fontSize.sm, marginBottom: spacing.xs },
  cardActions: { alignItems: 'flex-end', marginTop: spacing.sm },
})
