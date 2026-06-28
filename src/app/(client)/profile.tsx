import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { colors, spacing, fontSize, radius } from '../../config/theme'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/Button'
import Input from '../../components/Input'

export default function ClientProfileScreen() {
  const { user, clientId, loginWithOtp, logout } = useAuth()
  const [step, setStep] = useState<'form' | 'sent'>('form')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const isLoggedIn = !!clientId || !!user

  const handleSendLink = async () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Preencha todos os campos')
      return
    }
    setLoading(true)
    const { error } = await loginWithOtp(email)
    setLoading(false)
    if (error) {
      Alert.alert('Erro', error)
    } else {
      setStep('sent')
    }
  }

  if (isLoggedIn && user) {
    const displayName = user.user_metadata?.nome || user.email || 'Utilizador'
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Perfil</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>📧 {user.email}</Text>
        </View>
        <Button title="Terminar sessão" onPress={logout} variant="danger" size="md" fullWidth />
      </ScrollView>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 'sent' ? (
          <View style={styles.sentCard}>
            <Text style={styles.sentIcon}>✉️</Text>
            <Text style={styles.sentTitle}>Verifica o teu email</Text>
            <Text style={styles.sentSub}>
              Enviámos um link de acesso para {email}. Clica no link para entrares automaticamente.
            </Text>
            <Button title="Voltar" onPress={() => { setStep('form'); setName(''); setPhone(''); setEmail('') }} variant="outline" size="md" />
          </View>
        ) : (
          <>
            <Text style={styles.title}>Entrar</Text>
            <Text style={styles.subtitle}>Aceda à sua conta para ver as suas marcações</Text>
            <View style={styles.formCard}>
              <Input label="Nome" value={name} onChangeText={setName} placeholder="O seu nome" />
              <Input label="Telefone" value={phone} onChangeText={setPhone} placeholder="+351 900 000 000" keyboardType="phone-pad" />
              <Input label="Email" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" />
              <Button title="Enviar link de acesso" onPress={handleSendLink} variant="gold" size="md" fullWidth loading={loading} />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xxxl },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800', marginBottom: spacing.xs },
  subtitle: { color: colors.text2, fontSize: fontSize.md, marginBottom: spacing.xxl },
  profileCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xxl, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xxl },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  avatarText: { color: colors.black, fontSize: fontSize.xxl, fontWeight: '800' },
  profileName: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.sm },
  profileEmail: { color: colors.text2, fontSize: fontSize.md },
  formCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  sentCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xxl, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginTop: spacing.xxxl },
  sentIcon: { fontSize: 48, marginBottom: spacing.lg },
  sentTitle: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800', marginBottom: spacing.md },
  sentSub: { color: colors.text2, fontSize: fontSize.md, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xxl },
})
