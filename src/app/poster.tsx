import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Share,
  Platform,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Clipboard from 'expo-clipboard'
import { colors, spacing, fontSize, radius } from '../config/theme'
import { CLIENT_URL } from '../config/env'
import Button from '../components/Button'
import Loading from '../components/Loading'

export default function PosterScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ b?: string; n?: string }>()
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const barbershopId = params.b || ''
  const barbershopName = params.n || 'Barbearia'

  useEffect(() => {
    if (!barbershopId) {
      setLoading(false)
      Alert.alert('Erro', 'Parâmetro de barbearia em falta.')
      return
    }
    const link = `${CLIENT_URL}#bb=${barbershopId}`
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(link)}&bgcolor=080808&color=C9A84C`)
    setLoading(false)
  }, [barbershopId])

  const handleShare = async () => {
    const link = `${CLIENT_URL}#bb=${barbershopId}`
    try {
      await Share.share({ message: `Marque na ${barbershopName}: ${link}`, url: Platform.OS === 'ios' ? link : undefined } as any)
    } catch {
      // ignore
    }
  }

  const handleCopy = async () => {
    const link = `${CLIENT_URL}#bb=${barbershopId}`
    await Clipboard.setStringAsync(link)
    Alert.alert('Copiado', 'Link copiado para a área de transferência.')
  }

  if (loading) return <Loading message="A gerar cartaz..." />

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Cartaz para {barbershopName}</Text>
        <Text style={styles.subtitle}>Imprima este cartaz e afixe na sua montra para os clientes fazerem scan do QR code e marcarem diretamente.</Text>

        <View style={styles.poster}>
          <View style={styles.posterInner}>
            <Text style={styles.posterTitle}>Marque já a sua vez!</Text>
            <Text style={styles.posterShop}>{barbershopName}</Text>
            {qrUrl && <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />}
            <Text style={styles.posterCta}>Aponte a câmara para o QR code</Text>
            <Text style={styles.posterFooter}>Agendamento.pt</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button title="Partilhar" onPress={handleShare} variant="primary" size="md" fullWidth />
          <View style={{ height: spacing.md }} />
          <Button title="Copiar link" onPress={handleCopy} variant="secondary" size="md" fullWidth />
          <View style={{ height: spacing.md }} />
          <Button title="Voltar" onPress={() => router.back()} variant="outline" size="md" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: spacing.xl },
  content: { paddingVertical: spacing.xxl },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800', textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { color: colors.text2, fontSize: fontSize.sm, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xxl },
  poster: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xxl },
  posterInner: { borderWidth: 2, borderColor: colors.accent, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center' },
  posterTitle: { color: colors.accent, fontSize: fontSize.xl, fontWeight: '800', marginBottom: spacing.xs },
  posterShop: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.xl },
  qrImage: { width: 250, height: 250, marginBottom: spacing.lg },
  posterCta: { color: colors.text2, fontSize: fontSize.sm, marginBottom: spacing.md },
  posterFooter: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  actions: { paddingBottom: spacing.xxxl },
})
