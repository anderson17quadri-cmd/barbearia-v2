import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fontSize, radius } from '../../config/theme'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/Button'
import Loading from '../../components/Loading'

export default function AdminAuthScreen() {
  const router = useRouter()
  const { login, register, loading } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleLogin = async () => {
    setError('')
    if (!email.trim() || !password.trim()) { setError('Preencha todos os campos.'); return }
    setSubmitting(true)
    const result = await login(email, password)
    setSubmitting(false)
    if (result.error) { setError(result.error) } else { router.replace('/(admin)/dashboard') }
  }

  const handleRegister = async () => {
    setError('')
    if (!nome.trim() || !email.trim() || !telefone.trim() || !password.trim()) { setError('Preencha todos os campos.'); return }
    setSubmitting(true)
    const result = await register(email, password, nome, telefone)
    setSubmitting(false)
    if (result.error) { setError(result.error) } else { router.replace('/(admin)/dashboard') }
  }

  if (loading) return <Loading message="A verificar sessão..." />

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.logoSection}>
            <LinearGradient colors={['rgba(201,168,76,0.08)', colors.bg]} style={styles.logoBg}>
              <Text style={styles.logo}>Agend<Text style={styles.logoGold}>amento.pt</Text></Text>
              <Text style={styles.logoSub}>Painel de administração</Text>
            </LinearGradient>
          </View>

          <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tab, tab === 'login' && styles.tabActive]} onPress={() => { setTab('login'); setError('') }}>
              <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, tab === 'register' && styles.tabActive]} onPress={() => { setTab('register'); setError('') }}>
              <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>Criar conta</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {tab === 'login' ? (
            <View style={styles.form}>
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.text3} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Palavra-passe" placeholderTextColor={colors.text3} value={password} onChangeText={setPassword} secureTextEntry />
              <Button title="Entrar" onPress={handleLogin} variant="gold" size="lg" fullWidth loading={submitting} />
            </View>
          ) : (
            <View style={styles.form}>
              <TextInput style={styles.input} placeholder="Nome da barbearia" placeholderTextColor={colors.text3} value={nome} onChangeText={setNome} />
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.text3} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Telefone" placeholderTextColor={colors.text3} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
              <TextInput style={styles.input} placeholder="Palavra-passe" placeholderTextColor={colors.text3} value={password} onChangeText={setPassword} secureTextEntry />
              <Button title="Criar conta" onPress={handleRegister} variant="gold" size="lg" fullWidth loading={submitting} />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: spacing.xxxl },
  logoBg: { width: '100%', alignItems: 'center', paddingVertical: spacing.xxxl, borderRadius: radius.xxl },
  logo: { color: colors.text, fontSize: fontSize.xxxl, fontWeight: '900', letterSpacing: -0.5 },
  logoGold: { color: colors.accent },
  logoSub: { color: colors.text2, fontSize: fontSize.md, marginTop: spacing.sm },
  tabRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.full, padding: spacing.xs, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.full, alignItems: 'center' },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.text2, fontSize: fontSize.md, fontWeight: '600' },
  tabTextActive: { color: colors.black },
  error: { color: colors.danger, fontSize: fontSize.sm, textAlign: 'center', marginBottom: spacing.md, backgroundColor: 'rgba(231,76,60,0.1)', padding: spacing.md, borderRadius: radius.md },
  form: { gap: spacing.md },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, color: colors.text, fontSize: fontSize.md },
})
