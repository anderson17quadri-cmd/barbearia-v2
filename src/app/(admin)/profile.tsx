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
import * as Clipboard from 'expo-clipboard'
import { colors, spacing, fontSize, radius } from '../../config/theme'
import { CLIENT_URL } from '../../config/env'
import { useAdminData } from '../../hooks/useAdminData'
import { useAuth } from '../../hooks/useAuth'
import Loading from '../../components/Loading'
import Button from '../../components/Button'

export default function AdminProfileScreen() {
  const router = useRouter()
  const { barbershopId } = useAuth()
  const { barbershop, loadingProfile, updateProfile } = useAdminData(barbershopId || '')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [telefone, setTelefone] = useState('')
  const [morada, setMorada] = useState('')
  const [cidade, setCidade] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (barbershop) {
      setNome(barbershop.nome || '')
      setDescricao(barbershop.descricao || '')
      setTelefone(barbershop.telefone || '')
      setMorada(barbershop.morada || '')
      setCidade(barbershop.cidade || '')
    }
  }, [barbershop])

  const handleSave = async () => {
    if (!nome.trim()) { Alert.alert('O nome é obrigatório'); return }
    setSaving(true)
    await updateProfile({ nome, descricao, telefone, morada, cidade })
    setSaving(false)
    Alert.alert('Guardado', 'Perfil atualizado com sucesso.')
  }

  const handleCopyLink = async () => {
    const link = `${CLIENT_URL}#bb=${barbershopId || ''}`
    await Clipboard.setStringAsync(link)
    Alert.alert('Copiado', 'Link de marcações copiado.')
  }

  const handleQRCode = () => {
    if (barbershopId) {
      router.push(`/poster?b=${barbershopId}&n=${encodeURIComponent(nome)}`)
    }
  }

  if (loadingProfile) return <Loading message="A carregar perfil..." />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Dados da sua barbearia</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Partilhar</Text>
          <Text style={styles.shareDesc}>Os seus clientes podem fazer marcações através deste link:</Text>
          <View style={styles.shareActions}>
            <Button title="Copiar link" onPress={handleCopyLink} variant="secondary" size="sm" />
            <View style={{ width: spacing.sm }} />
            <Button title="QR Code" onPress={handleQRCode} variant="secondary" size="sm" />
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.formField}>
            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome da barbearia" placeholderTextColor={colors.text3} />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput style={[styles.input, styles.multiline]} value={descricao} onChangeText={setDescricao} placeholder="Descreva a sua barbearia" placeholderTextColor={colors.text3} multiline numberOfLines={4} />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} placeholder="Contacto" placeholderTextColor={colors.text3} keyboardType="phone-pad" />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Morada</Text>
            <TextInput style={styles.input} value={morada} onChangeText={setMorada} placeholder="Rua, nº" placeholderTextColor={colors.text3} />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Cidade</Text>
            <TextInput style={styles.input} value={cidade} onChangeText={setCidade} placeholder="Cidade" placeholderTextColor={colors.text3} />
          </View>
        </View>

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
  shareSection: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.sm },
  shareDesc: { color: colors.text2, fontSize: fontSize.sm, lineHeight: 20, marginBottom: spacing.md },
  shareActions: { flexDirection: 'row' },
  formSection: { marginBottom: spacing.xl },
  formField: { marginBottom: spacing.lg },
  label: { color: colors.text2, fontSize: fontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, color: colors.text, fontSize: fontSize.md },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
})
