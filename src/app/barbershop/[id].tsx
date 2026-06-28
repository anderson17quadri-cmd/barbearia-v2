import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fontSize, radius } from '../../config/theme'
import { useBarbershopDetail } from '../../hooks/useBarbershopDetail'
import { useAuth } from '../../hooks/useAuth'
import { Service, Professional } from '../../config/types'
import Loading from '../../components/Loading'
import Button from '../../components/Button'
import StepIndicator from '../../components/StepIndicator'
import Card from '../../components/Card'

const ANY_PRO: any = { id: 'qualquer', nome: 'Qualquer' }

export default function BarbershopDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { clientId } = useAuth()
  const data = useBarbershopDetail(id || '')

  const {
    barbershop, services, professionals, loading,
    selectedService, setSelectedService,
    selectedProfessional, setSelectedProfessional,
    selectedDate, setSelectedDate,
    selectedTime, setSelectedTime,
    availableSlots, loadAvailableSlots,
    currentStep, setCurrentStep,
    confirmBooking, reset,
  } = data

  const [bookingSuccess, setBookingSuccess] = React.useState(false)
  const [guestName, setGuestName] = React.useState('')
  const [guestPhone, setGuestPhone] = React.useState('')

  if (loading) return <Loading message="A carregar barbearia..." />

  if (bookingSuccess) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Marcação enviada!</Text>
          <Text style={styles.successText}>
            A sua marcação em {barbershop?.nome} para {selectedService?.nome} no dia {selectedDate} às {selectedTime} foi enviada com sucesso.
          </Text>
          <Button title="Voltar ao início" onPress={() => router.push('/(client)')} variant="gold" size="md" fullWidth />
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>

          <View style={styles.hero}>
            <Text style={styles.shopName}>{barbershop?.nome}</Text>
            <Text style={styles.shopInfo}>📍 {barbershop?.cidade}</Text>
            <Text style={styles.shopInfo}>📞 {barbershop?.telefone}</Text>
            {barbershop?.descricao ? <Text style={styles.shopDesc}>{barbershop.descricao}</Text> : null}
          </View>

          <StepIndicator current={currentStep} total={4} />

          {/* Step 1 */}
          {currentStep === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Escolha o serviço</Text>
              {services.map((s: Service) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.selectCard, selectedService?.id === s.id && styles.selectCardActive]}
                  onPress={() => setSelectedService(s)}
                >
                  <View style={styles.selectCardContent}>
                    <Text style={styles.selectCardName}>{s.nome}</Text>
                    {s.descricao ? <Text style={styles.selectCardDesc}>{s.descricao}</Text> : null}
                  </View>
                  <View style={styles.selectCardMeta}>
                    <Text style={styles.selectCardPrice}>{s.preco.toFixed(2).replace('.', ',')}€</Text>
                    <Text style={styles.selectCardDuration}>{s.duracao}min</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <Button title="Continuar" onPress={() => setCurrentStep(2)} variant="gold" size="md" fullWidth disabled={!selectedService} />
            </View>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Escolha o profissional</Text>
              <View style={styles.profGrid}>
                <TouchableOpacity
                  style={[styles.profCard, (!selectedProfessional || selectedProfessional.id === 'qualquer') && styles.profCardActive]}
                  onPress={() => setSelectedProfessional(ANY_PRO)}
                >
                  <Text style={styles.profName}>Qualquer</Text>
                  <Text style={styles.profSub}>Disponível</Text>
                </TouchableOpacity>
                {professionals.map((p: Professional) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.profCard, selectedProfessional?.id === p.id && styles.profCardActive]}
                    onPress={() => setSelectedProfessional(p)}
                  >
                    <Text style={styles.profName}>{p.nome}</Text>
                    <Text style={styles.profSub}>{p.especialidade}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.stepBtns}>
                <Button title="Voltar" onPress={() => setCurrentStep(1)} variant="outline" size="md" />
                <View style={{ width: spacing.md }} />
                <Button title="Continuar" onPress={() => setCurrentStep(3)} variant="gold" size="md" fullWidth />
              </View>
            </View>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Escolha a data e hora</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={colors.text3}
                value={selectedDate}
                onChangeText={setSelectedDate}
                onBlur={() => loadAvailableSlots()}
              />
              <Text style={styles.timeLabel}>Horários disponíveis</Text>
              <View style={styles.timeGrid}>
                {availableSlots.map((slot: string) => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.timeChip, selectedTime === slot && styles.timeChipActive]}
                    onPress={() => setSelectedTime(slot)}
                  >
                    <Text style={[styles.timeChipText, selectedTime === slot && styles.timeChipTextActive]}>{slot}</Text>
                  </TouchableOpacity>
                ))}
                {availableSlots.length === 0 && (
                  <Text style={styles.timeEmpty}>Selecione uma data para ver os horários</Text>
                )}
              </View>
              <View style={styles.stepBtns}>
                <Button title="Voltar" onPress={() => setCurrentStep(2)} variant="outline" size="md" />
                <View style={{ width: spacing.md }} />
                <Button title="Continuar" onPress={() => setCurrentStep(4)} variant="gold" size="md" fullWidth disabled={!selectedTime} />
              </View>
            </View>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Confirmar marcação</Text>
              <Card>
                <View style={styles.confirmRow}><Text style={styles.confirmLabel}>Serviço</Text><Text style={styles.confirmValue}>{selectedService?.nome}</Text></View>
                <View style={styles.confirmRow}><Text style={styles.confirmLabel}>Profissional</Text><Text style={styles.confirmValue}>{selectedProfessional?.nome || 'Qualquer'}</Text></View>
                <View style={styles.confirmRow}><Text style={styles.confirmLabel}>Data</Text><Text style={styles.confirmValue}>{selectedDate}</Text></View>
                <View style={styles.confirmRow}><Text style={styles.confirmLabel}>Hora</Text><Text style={styles.confirmValue}>{selectedTime}</Text></View>
                <View style={styles.confirmRow}><Text style={styles.confirmLabel}>Preço</Text><Text style={styles.confirmPrice}>{selectedService?.preco.toFixed(2).replace('.', ',')}€</Text></View>
              </Card>

              {!clientId && (
                <View style={styles.guestForm}>
                  <Text style={styles.guestTitle}>Os seus dados</Text>
                  <TextInput style={styles.input} placeholder="Nome" placeholderTextColor={colors.text3} value={guestName} onChangeText={setGuestName} />
                  <TextInput style={styles.input} placeholder="Telefone" placeholderTextColor={colors.text3} value={guestPhone} onChangeText={setGuestPhone} keyboardType="phone-pad" />
                </View>
              )}

              <View style={styles.stepBtns}>
                <Button title="Voltar" onPress={() => setCurrentStep(3)} variant="outline" size="md" />
                <View style={{ width: spacing.md }} />
                <Button
                  title="Confirmar"
                  onPress={async () => {
                    const { error } = await confirmBooking(clientId || guestName, guestName, guestPhone)
                    if (error) Alert.alert('Erro', error)
                    else setBookingSuccess(true)
                  }}
                  variant="gold"
                  size="md"
                  fullWidth
                />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: spacing.xl },
  backBtn: { paddingVertical: spacing.md },
  backText: { color: colors.text2, fontSize: fontSize.md },
  hero: { paddingVertical: spacing.lg, marginBottom: spacing.lg },
  shopName: { color: colors.text, fontSize: fontSize.xxxl, fontWeight: '900', marginBottom: spacing.sm },
  shopInfo: { color: colors.text2, fontSize: fontSize.sm, marginBottom: spacing.xs },
  shopDesc: { color: colors.text2, fontSize: fontSize.sm, lineHeight: 20, marginTop: spacing.md },
  stepContainer: { paddingVertical: spacing.xl },
  stepTitle: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.lg },
  selectCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm },
  selectCardActive: { borderColor: colors.accent, backgroundColor: 'rgba(201,168,76,0.05)' },
  selectCardContent: { flex: 1, marginRight: spacing.md },
  selectCardName: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.xs },
  selectCardDesc: { color: colors.text2, fontSize: fontSize.xs },
  selectCardMeta: { alignItems: 'flex-end' },
  selectCardPrice: { color: colors.accent, fontSize: fontSize.lg, fontWeight: '800' },
  selectCardDuration: { color: colors.text2, fontSize: fontSize.xs },
  profGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  profCard: { width: '47%' as any, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center' },
  profCardActive: { borderColor: colors.accent, backgroundColor: 'rgba(201,168,76,0.05)' },
  profName: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.xs },
  profSub: { color: colors.text2, fontSize: fontSize.xs },
  dateInput: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, color: colors.text, fontSize: fontSize.lg, marginBottom: spacing.lg },
  timeLabel: { color: colors.text2, fontSize: fontSize.sm, marginBottom: spacing.md },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  timeChip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  timeChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  timeChipText: { color: colors.text, fontSize: fontSize.sm },
  timeChipTextActive: { color: colors.black, fontWeight: '700' },
  timeEmpty: { color: colors.text2, fontSize: fontSize.sm, paddingVertical: spacing.lg },
  stepBtns: { flexDirection: 'row', marginTop: spacing.lg },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  confirmLabel: { color: colors.text2, fontSize: fontSize.md },
  confirmValue: { color: colors.text, fontSize: fontSize.md, fontWeight: '500' },
  confirmPrice: { color: colors.accent, fontSize: fontSize.lg, fontWeight: '800' },
  guestForm: { marginTop: spacing.xl },
  guestTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.md },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, color: colors.text, fontSize: fontSize.md, marginBottom: spacing.md },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xxl, paddingVertical: spacing.xxxl },
  successIcon: { fontSize: 64, marginBottom: spacing.lg },
  successTitle: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800', marginBottom: spacing.md, textAlign: 'center' },
  successText: { color: colors.text2, fontSize: fontSize.md, textAlign: 'center', lineHeight: 24, marginBottom: spacing.md },
})
