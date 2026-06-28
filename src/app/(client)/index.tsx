import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing, fontSize, radius } from '../../config/theme'
import useBarbershops from '../../hooks/useBarbershops'
import { Barbershop } from '../../config/types'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import Card from '../../components/Card'

export default function ClientDiscoverScreen() {
  const router = useRouter()
  const { barbershops, loading, refresh } = useBarbershops()
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const filtered = barbershops.filter(
    (b) =>
      b.nome.toLowerCase().includes(search.toLowerCase()) ||
      b.cidade.toLowerCase().includes(search.toLowerCase())
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }, [refresh])

  const renderItem = ({ item }: { item: Barbershop }) => (
    <Card onPress={() => router.push(`/barbershop/${item.id}`)}>
      <Text style={styles.cardName}>{item.nome}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardCity}>📍 {item.cidade}</Text>
        <Text style={styles.cardPhone}>📞 {item.telefone}</Text>
      </View>
      {item.descricao ? <Text style={styles.cardDesc} numberOfLines={2}>{item.descricao}</Text> : null}
    </Card>
  )

  if (loading && barbershops.length === 0) return <Loading message="A procurar barbearias..." />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Barbearias</Text>
        <Text style={styles.subtitle}>Encontre a sua barbearia e marque já</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} placeholder="Procurar barbearia..." placeholderTextColor={colors.text3} value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity style={styles.qrBtn} onPress={() => router.push('/poster')}>
          <Text style={styles.qrText}>QR</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={<EmptyState icon="🔍" title="Nenhuma barbearia" subtitle="Não foram encontradas barbearias disponíveis." />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800' },
  subtitle: { color: colors.text2, fontSize: fontSize.md, marginTop: spacing.xs },
  searchRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.md },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.md },
  searchIcon: { fontSize: fontSize.lg, marginRight: spacing.sm },
  searchInput: { flex: 1, color: colors.text, fontSize: fontSize.md, paddingVertical: spacing.md },
  qrBtn: { width: 48, height: 48, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  qrText: { color: colors.accent, fontSize: fontSize.lg, fontWeight: '800' },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  cardName: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.xs },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  cardCity: { color: colors.text2, fontSize: fontSize.sm },
  cardPhone: { color: colors.text2, fontSize: fontSize.sm },
  cardDesc: { color: colors.text2, fontSize: fontSize.sm, lineHeight: 18 },
})
