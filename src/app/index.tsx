import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fontSize, radius, plans } from '../config/theme'
import Button from '../components/Button'

const FEATURES = [
  { icon: '📅', title: 'Agenda online 24h', desc: 'Os seus clientes marcam a qualquer hora do dia, sem precisar de ligar.' },
  { icon: '📱', title: 'App para clientes', desc: 'Cada barbearia recebe o seu próprio link e QR code para partilhar com os clientes.' },
  { icon: '🔔', title: 'Lembretes automáticos', desc: 'Reduza faltas com notificações automáticas enviadas antes de cada agendamento.' },
  { icon: '📊', title: 'Dashboard', desc: 'Acompanhe o movimento da barbearia com estatísticas em tempo real.' },
]

const TESTIMONIALS = [
  { name: 'Carlos Silva', shop: 'Barbearia Lisboa', text: 'Desde que comecei a usar o Agendamento.pt, as faltas reduziram 70%. Os meus clientes adoram a facilidade de marcar online.' },
  { name: 'Miguel Santos', shop: 'Porto Barber Club', text: 'O melhor investimento que fiz para o meu negócio. A app para clientes é fantástica e o suporte é impecável.' },
  { name: 'Rui Costa', shop: 'Coimbra Cuts', text: 'Simples, intuitivo e eficaz. Em poucos minutos tinha tudo a funcionar. Recomendo a todos os barbeiros!' },
]

const FAQS = [
  { q: 'Como funciona o período grátis?', a: 'Todos os planos começam com 30 dias gratuitos. Sem compromisso, sem cartão de crédito. Cancele a qualquer momento.' },
  { q: 'Preciso de instalar alguma coisa?', a: 'Nada! O Agendamento.pt funciona 100% online. Você acede pelo navegador e os seus clientes usam a app ou link.' },
  { q: 'Os meus clientes precisam de criar conta?', a: 'Não. Os clientes fazem a marcação de forma rápida, apenas com nome e telefone. Simples e sem atritos.' },
  { q: 'Posso mudar de plano depois?', a: 'Sim! Pode fazer upgrade ou downgrade do seu plano a qualquer momento, diretamente no painel de administração.' },
]

const BADGE_TEXT = '🌟 30 dias grátis em qualquer plano'

export default function IndexScreen() {
  const router = useRouter()
  const [pricingPeriod, setPricingPeriod] = useState<'mensal' | 'anual'>('mensal')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const getPrice = (plan: { mensal: number; anual: number }) => pricingPeriod === 'mensal' ? `${plan.mensal.toFixed(2).replace('.', ',')}€/mês` : `${plan.anual}€/ano`

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Nav */}
        <View style={styles.nav}>
          <Text style={styles.logo}>
            Agend<Text style={styles.logoGold}>amento.pt</Text>
          </Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Marcações simples{'\n'}para a sua barbearia
          </Text>
          <Text style={styles.heroSub}>
            A plataforma de agendamentos nº1 para barbearias em Portugal.
            Organize a sua agenda, reduza faltas e fidelize clientes.
          </Text>
          <Button title="Começar grátis" onPress={() => router.push('/pricing')} variant="gold" size="lg" fullWidth />
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{BADGE_TEXT}</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tudo o que precisa</Text>
          <Text style={styles.sectionSub}>Ferramentas pensadas para o dia a dia da sua barbearia</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Before vs After */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Antes vs Depois</Text>
          <View style={styles.comparisonRow}>
            <View style={styles.compCard}>
              <Text style={styles.compEmoji}>😰</Text>
              <Text style={styles.compLabel}>Antes</Text>
              <Text style={styles.compText}>Telefonemas constantes{'\n'}Agenda em papel{'\n'}Faltas frequentes{'\n'}Clientes esquecidos</Text>
            </View>
            <View style={styles.compVs}>VS</View>
            <View style={styles.compCard}>
              <Text style={styles.compEmoji}>😎</Text>
              <Text style={styles.compLabel}>Depois</Text>
              <Text style={styles.compText}>Tudo online 24h{'\n'}Agenda digital{'\n'}Lembretes automáticos{'\n'}Clientes fidelizados</Text>
            </View>
          </View>
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que dizem os barbeiros</Text>
          {TESTIMONIALS.map((t, i) => (
            <View key={i} style={styles.testimonialCard}>
              <Text style={styles.testText}>"{t.text}"</Text>
              <Text style={styles.testName}>{t.name}</Text>
              <Text style={styles.testShop}>{t.shop}</Text>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planos simples e transparentes</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity onPress={() => setPricingPeriod('mensal')} style={[styles.toggleBtn, pricingPeriod === 'mensal' && styles.toggleActive]}>
              <Text style={[styles.toggleText, pricingPeriod === 'mensal' && styles.toggleTextActive]}>Mensal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPricingPeriod('anual')} style={[styles.toggleBtn, pricingPeriod === 'anual' && styles.toggleActive]}>
              <Text style={[styles.toggleText, pricingPeriod === 'anual' && styles.toggleTextActive]}>Anual</Text>
            </TouchableOpacity>
          </View>
          {Object.values(plans).map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <Text style={styles.planName}>{plan.nome}</Text>
              <Text style={styles.planPrice}>{getPrice(plan)}</Text>
              <Text style={styles.planPeriod}>{pricingPeriod === 'anual' ? `Poupe ${((plan.mensal * 12) - plan.anual).toFixed(0)}€ por ano` : ' '}</Text>
              <Button title="Começar grátis" onPress={() => router.push('/pricing')} variant="primary" size="md" fullWidth />
            </View>
          ))}
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perguntas frequentes</Text>
          {FAQS.map((faq, i) => (
            <TouchableOpacity key={i} style={styles.faqCard} onPress={() => setOpenFaq(openFaq === i ? null : i)}>
              <View style={styles.faqHeader}>
                <Text style={styles.faqQ}>{faq.q}</Text>
                <Text style={styles.faqArrow}>{openFaq === i ? '▴' : '▾'}</Text>
              </View>
              {openFaq === i && <Text style={styles.faqA}>{faq.a}</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>
            Agend<Text style={styles.logoGold}>amento.pt</Text>
          </Text>
          <Text style={styles.footerText}>© 2026 Agendamento.pt — Todos os direitos reservados.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: spacing.xl },
  nav: { flexDirection: 'row', justifyContent: 'center', paddingVertical: spacing.lg },
  logo: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800', letterSpacing: -0.5 },
  logoGold: { color: colors.accent },
  hero: { paddingTop: spacing.xxl, paddingBottom: spacing.xxxl, alignItems: 'center' },
  heroTitle: { color: colors.text, fontSize: fontSize.hero, fontWeight: '900', textAlign: 'center', lineHeight: 42, marginBottom: spacing.lg },
  heroSub: { color: colors.text2, fontSize: fontSize.lg, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xxl, paddingHorizontal: spacing.sm },
  heroBadge: { marginTop: spacing.lg, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, backgroundColor: 'rgba(201,168,76,0.1)', borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)' },
  heroBadgeText: { color: colors.accent, fontSize: fontSize.sm },
  section: { paddingTop: spacing.xxxl },
  sectionTitle: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800', textAlign: 'center', marginBottom: spacing.sm },
  sectionSub: { color: colors.text2, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.xxl },
  featureCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  featureIcon: { fontSize: 32, marginRight: spacing.lg },
  featureContent: { flex: 1 },
  featureTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.xs },
  featureDesc: { color: colors.text2, fontSize: fontSize.sm, lineHeight: 18 },
  comparisonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  compCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  compEmoji: { fontSize: 36, marginBottom: spacing.sm },
  compLabel: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  compText: { color: colors.text2, fontSize: fontSize.sm, textAlign: 'center', lineHeight: 22 },
  compVs: { color: colors.accent, fontSize: fontSize.lg, fontWeight: '900', paddingHorizontal: spacing.md },
  testimonialCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  testText: { color: colors.text, fontSize: fontSize.md, fontStyle: 'italic', lineHeight: 22, marginBottom: spacing.sm },
  testName: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  testShop: { color: colors.text2, fontSize: fontSize.xs },
  toggleRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.full, padding: spacing.xs, marginBottom: spacing.xxl, borderWidth: 1, borderColor: colors.border },
  toggleBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.full, alignItems: 'center' },
  toggleActive: { backgroundColor: colors.accent },
  toggleText: { color: colors.text2, fontSize: fontSize.md, fontWeight: '600' },
  toggleTextActive: { color: colors.black },
  planCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  planName: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', marginBottom: spacing.sm },
  planPrice: { color: colors.accent, fontSize: fontSize.xxxl, fontWeight: '900', marginBottom: spacing.xs },
  planPeriod: { color: colors.success, fontSize: fontSize.xs, marginBottom: spacing.lg },
  faqCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', flex: 1 },
  faqArrow: { color: colors.accent, fontSize: fontSize.lg, marginLeft: spacing.md },
  faqA: { color: colors.text2, fontSize: fontSize.sm, lineHeight: 20, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  footer: { alignItems: 'center', paddingVertical: spacing.xxxl, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xxxl },
  footerLogo: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', marginBottom: spacing.sm },
  footerText: { color: colors.text2, fontSize: fontSize.xs },
})
