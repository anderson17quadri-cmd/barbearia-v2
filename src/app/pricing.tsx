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
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Linking from 'expo-linking'
import { colors, spacing, fontSize, radius, plans } from '../config/theme'
import { EDGE_FUNCTION_URL } from '../config/supabase'
import Button from '../components/Button'
import Loading from '../components/Loading'

const PLAN_FEATURES: Record<string, string[]> = {
  solo: ['1 barbearia', 'Agenda online', 'Até 2 profissionais', 'App para clientes', 'Lembretes automáticos', 'Suporte por email'],
  pro: ['1 barbearia', 'Agenda online', 'Até 5 profissionais', 'App para clientes', 'Lembretes automáticos', 'Dashboard avançado', 'Suporte prioritário'],
  business: ['Até 3 barbearias', 'Agenda online', 'Profissionais ilimitados', 'App para clientes', 'Lembretes automáticos', 'Dashboard avançado', 'Suporte dedicado', 'API de integração'],
}

export default function PricingScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ sucesso?: string }>()
  const [period, setPeriod] = useState<'mensal' | 'anual'>('mensal')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<string>('solo')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (params.sucesso === '1') {
      Alert.alert('Pagamento confirmado', 'Obrigado! A sua conta foi ativada.', [{ text: 'OK', onPress: () => router.replace('/pricing') }])
    }
  }, [params.sucesso])

  const getPrice = (plan: { mensal: number; anual: number }) =>
    period === 'mensal' ? `${plan.mensal.toFixed(2).replace('.', ',')}€` : `${plan.anual}€`

  const handleCheckout = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Preencha todos os campos', 'Nome e email são obrigatórios.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${EDGE_FUNCTION_URL}/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: name, email, plano: selectedPlan, periodo: period }),
      })
      const data = await res.json()
      if (data.url) {
        Linking.openURL(data.url)
      } else {
        Alert.alert('Erro', data.error || 'Erro ao criar checkout.')
      }
    } catch {
      Alert.alert('Erro', 'Erro ao conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>Agend<Text style={styles.logoGold}>amento.pt</Text></Text>
          <Text style={styles.headerTitle}>Escolha o seu plano</Text>
          <Text style={styles.headerSub}>Comece grátis por 30 dias. Sem compromisso.</Text>
        </View>

        <View style={styles.toggleRow}>
          <TouchableOpacity onPress={() => setPeriod('mensal')} style={[styles.toggleBtn, period === 'mensal' && styles.toggleActive]}>
            <Text style={[styles.toggleText, period === 'mensal' && styles.toggleTextActive]}>Mensal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPeriod('anual')} style={[styles.toggleBtn, period === 'anual' && styles.toggleActive]}>
            <Text style={[styles.toggleText, period === 'anual' && styles.toggleTextActive]}>Anual</Text>
          </TouchableOpacity>
        </View>

        {Object.values(plans).map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[styles.planCard, selectedPlan === plan.id && styles.planCardSelected]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.nome}</Text>
              <View style={[styles.radio, selectedPlan === plan.id && styles.radioSelected]}>
                {selectedPlan === plan.id && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={styles.planPrice}>{getPrice(plan)}<Text style={styles.planPeriod}>/{period === 'mensal' ? 'mês' : 'ano'}</Text></Text>
            {(PLAN_FEATURES[plan.id] || []).map((f: string, i: number) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureCheck}>✓</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </TouchableOpacity>
        ))}

        <View style={styles.checkoutSection}>
          <Text style={styles.checkoutTitle}>Dados para faturação</Text>
          <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor={colors.text3} value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.text3} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Button title="Começar grátis" onPress={handleCheckout} variant="gold" size="lg" fullWidth loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: spacing.xl },
  backBtn: { paddingVertical: spacing.md },
  backText: { color: colors.text2, fontSize: fontSize.md },
  header: { alignItems: 'center', paddingVertical: spacing.xxl },
  logo: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800' },
  logoGold: { color: colors.accent },
  headerTitle: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800', marginTop: spacing.lg },
  headerSub: { color: colors.text2, fontSize: fontSize.md, marginTop: spacing.sm },
  toggleRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.full, padding: spacing.xs, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  toggleBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.full, alignItems: 'center' },
  toggleActive: { backgroundColor: colors.accent },
  toggleText: { color: colors.text2, fontSize: fontSize.md, fontWeight: '600' },
  toggleTextActive: { color: colors.black },
  planCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  planCardSelected: { borderColor: colors.accent, backgroundColor: 'rgba(201,168,76,0.05)' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  planName: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.text3, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.accent },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
  planPrice: { color: colors.accent, fontSize: fontSize.xxxl, fontWeight: '900', marginBottom: spacing.lg },
  planPeriod: { fontSize: fontSize.md, color: colors.text2, fontWeight: '400' },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  featureCheck: { color: colors.success, fontSize: fontSize.md, marginRight: spacing.sm, fontWeight: '700' },
  featureText: { color: colors.text, fontSize: fontSize.md },
  checkoutSection: { marginTop: spacing.xxl, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xxxl },
  checkoutTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.lg },
  input: { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, color: colors.text, fontSize: fontSize.md, marginBottom: spacing.md },
})
