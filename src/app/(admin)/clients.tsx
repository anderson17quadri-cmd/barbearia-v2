import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing, fontSize } from '../../config/theme'
import { useAdminData } from '../../hooks/useAdminData'
import { useAuth } from '../../hooks/useAuth'
import { Client } from '../../config/types'
import Loading from '../../components/Loading'
import Card from '../../components/Card'
import EmptyState from '../../components/EmptyState'

export default function AdminClientsScreen() {
  const router = useRouter()
  const { barbershopId } = useAuth()
  const { clients, loadingClients, refreshClients } = useAdminData(barbershopId || '')
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshClients()
    setRefreshing(false)
  }

  if (loadingClients && clients.length === 0) return <Loading message="A carregar clientes..." />

  const renderItem = ({ item }: { item: Client }) => (
    <Card>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.nome}</Text>
          <Text style={styles.cardPhone}>📞 {item.telefone}</Text>
          {item.email ? <Text style={styles.cardEmail}>📧 {item.email}</Text> : null}
        </View>
      </View>
    </Card>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Clientes</Text>
        <Text style={styles.subtitle}>{clients.length} clientes registados</Text>
      </View>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={<EmptyState icon="👤" title="Sem clientes" subtitle="Ainda não há clientes registados." />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  backBtn: { marginBottom: spacing.sm },
  backText: { color: colors.text2, fontSize: fontSize.md },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800' },
  subtitle: { color: colors.text2, fontSize: fontSize.sm, marginTop: spacing.xs },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: spacing.lg },
  avatarText: { color: colors.black, fontSize: fontSize.xl, fontWeight: '800' },
  cardInfo: { flex: 1 },
  cardName: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.xs },
  cardPhone: { color: colors.text2, fontSize: fontSize.sm, marginBottom: spacing.xs },
  cardEmail: { color: colors.text2, fontSize: fontSize.sm },
})
