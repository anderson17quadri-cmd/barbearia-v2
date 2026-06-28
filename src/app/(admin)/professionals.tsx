import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing, fontSize, radius } from '../../config/theme'
import { useAdminData } from '../../hooks/useAdminData'
import { useAuth } from '../../hooks/useAuth'
import { Professional } from '../../config/types'
import Loading from '../../components/Loading'
import Card from '../../components/Card'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'

export default function AdminProfessionalsScreen() {
  const router = useRouter()
  const { barbershopId } = useAuth()
  const { professionals, loadingProfessionals, saveProfessional, deleteProfessional, refreshProfessionals } = useAdminData(barbershopId || '')
  const [modalVisible, setModalVisible] = useState(false)
  const [editing, setEditing] = useState<Professional | null>(null)
  const [nome, setNome] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [telefone, setTelefone] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const openAdd = () => {
    setEditing(null)
    setNome('')
    setEspecialidade('')
    setTelefone('')
    setModalVisible(true)
  }

  const openEdit = (p: Professional) => {
    setEditing(p)
    setNome(p.nome)
    setEspecialidade(p.especialidade || '')
    setTelefone(p.telefone || '')
    setModalVisible(true)
  }

  const handleSave = async () => {
    if (!nome.trim()) { Alert.alert('O nome é obrigatório'); return }
    const data: Partial<Professional> = { nome, especialidade, telefone, ativo: true }
    if (editing) data.id = editing.id
    await saveProfessional(data)
    setModalVisible(false)
  }

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Eliminar', `Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteProfessional(id) },
    ])
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshProfessionals()
    setRefreshing(false)
  }

  if (loadingProfessionals && professionals.length === 0) return <Loading message="A carregar..." />

  const renderItem = ({ item }: { item: Professional }) => (
    <Card>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardName}>{item.nome}</Text>
          {item.especialidade ? <Text style={styles.cardSpec}>{item.especialidade}</Text> : null}
          {item.telefone ? <Text style={styles.cardPhone}>📞 {item.telefone}</Text> : null}
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profissionais</Text>
      </View>

      <FlatList
        data={professionals}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={<EmptyState icon="👥" title="Sem profissionais" subtitle="Adicione o primeiro profissional." />}
      />

      <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title={editing ? 'Editar profissional' : 'Novo profissional'}>
        <ScrollView>
          <View style={styles.formField}>
            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome do profissional" placeholderTextColor={colors.text3} />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Especialidade</Text>
            <TextInput style={styles.input} value={especialidade} onChangeText={setEspecialidade} placeholder="Ex: Barba, Corte" placeholderTextColor={colors.text3} />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} placeholder="+351 900 000 000" placeholderTextColor={colors.text3} keyboardType="phone-pad" />
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
  backBtn: { marginBottom: spacing.sm },
  backText: { color: colors.text2, fontSize: fontSize.md },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800' },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl + 60 },
  cardHeader: { marginBottom: spacing.sm },
  cardName: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.xs },
  cardSpec: { color: colors.accent, fontSize: fontSize.sm, marginBottom: spacing.xs },
  cardPhone: { color: colors.text2, fontSize: fontSize.sm },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.md },
  fab: { position: 'absolute', bottom: spacing.xxl, right: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  fabText: { color: colors.black, fontSize: fontSize.xxl, fontWeight: '700', marginTop: -2 },
  formField: { marginBottom: spacing.lg },
  label: { color: colors.text2, fontSize: fontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, color: colors.text, fontSize: fontSize.md },
})
