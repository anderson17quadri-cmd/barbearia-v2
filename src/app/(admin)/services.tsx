import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
  ScrollView,
} from 'react-native'
import { colors, spacing, fontSize, radius } from '../../config/theme'
import { useAdminData } from '../../hooks/useAdminData'
import { useAuth } from '../../hooks/useAuth'
import { Service } from '../../config/types'
import Loading from '../../components/Loading'
import Card from '../../components/Card'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'

export default function AdminServicesScreen() {
  const { barbershopId } = useAuth()
  const { services, loadingServices, saveService, deleteService, refreshServices } = useAdminData(barbershopId || '')
  const [modalVisible, setModalVisible] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')
  const [duracao, setDuracao] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const openAdd = () => {
    setEditing(null)
    setNome('')
    setDescricao('')
    setPreco('')
    setDuracao('')
    setModalVisible(true)
  }

  const openEdit = (s: Service) => {
    setEditing(s)
    setNome(s.nome)
    setDescricao(s.descricao || '')
    setPreco(s.preco.toString())
    setDuracao(s.duracao.toString())
    setModalVisible(true)
  }

  const handleSave = async () => {
    if (!nome.trim() || !preco.trim() || !duracao.trim()) {
      Alert.alert('Preencha todos os campos')
      return
    }
    const data: Partial<Service> = { nome, descricao, preco: parseFloat(preco), duracao: parseInt(duracao), ativo: true }
    if (editing) data.id = editing.id
    await saveService(data)
    setModalVisible(false)
  }

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Eliminar', `Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteService(id) },
    ])
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshServices()
    setRefreshing(false)
  }

  if (loadingServices && services.length === 0) return <Loading message="A carregar serviços..." />

  const renderItem = ({ item }: { item: Service }) => (
    <Card>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName}>{item.nome}</Text>
          {item.descricao ? <Text style={styles.cardDesc} numberOfLines={2}>{item.descricao}</Text> : null}
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardPrice}>{item.preco.toFixed(2).replace('.', ',')}€</Text>
          <Text style={styles.cardDuration}>{item.duracao}min</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <Button title="Editar" onPress={() => openEdit(item)} variant="outline" size="sm" />
        <View style={{ width: spacing.sm }} />
        <Button title="Eliminar" onPress={() => handleDelete(item.id, item.nome)} variant="danger" size="sm" />
      </View>
    </Card>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Serviços</Text>
        <Text style={styles.subtitle}>Preços e duração</Text>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={<EmptyState icon="✂️" title="Sem serviços" subtitle="Adicione o primeiro serviço." />}
      />

      <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title={editing ? 'Editar serviço' : 'Novo serviço'}>
        <ScrollView>
          <View style={styles.formField}>
            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome do serviço" placeholderTextColor={colors.text3} />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput style={[styles.input, styles.multiline]} value={descricao} onChangeText={setDescricao} placeholder="Descrição" placeholderTextColor={colors.text3} multiline numberOfLines={3} />
          </View>
          <View style={styles.formRow}>
            <View style={[styles.formField, { flex: 1 }]}>
              <Text style={styles.label}>Preço (€)</Text>
              <TextInput style={styles.input} value={preco} onChangeText={setPreco} placeholder="0.00" placeholderTextColor={colors.text3} keyboardType="decimal-pad" />
            </View>
            <View style={{ width: spacing.md }} />
            <View style={[styles.formField, { flex: 1 }]}>
              <Text style={styles.label}>Duração (min)</Text>
              <TextInput style={styles.input} value={duracao} onChangeText={setDuracao} placeholder="30" placeholderTextColor={colors.text3} keyboardType="numeric" />
            </View>
          </View>
          <Button title="Guardar" onPress={handleSave} variant="gold" size="md" fullWidth />
        </ScrollView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800' },
  subtitle: { color: colors.text2, fontSize: fontSize.md, marginTop: spacing.xs },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl + 60 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  cardName: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.xs },
  cardDesc: { color: colors.text2, fontSize: fontSize.xs, lineHeight: 16 },
  cardMeta: { alignItems: 'flex-end', marginLeft: spacing.md },
  cardPrice: { color: colors.accent, fontSize: fontSize.lg, fontWeight: '800' },
  cardDuration: { color: colors.text2, fontSize: fontSize.xs },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.md },
  fab: { position: 'absolute', bottom: spacing.xxl, right: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  fabText: { color: colors.black, fontSize: fontSize.xxl, fontWeight: '700', marginTop: -2 },
  formField: { marginBottom: spacing.lg },
  label: { color: colors.text2, fontSize: fontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, color: colors.text, fontSize: fontSize.md },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  formRow: { flexDirection: 'row' },
})
