import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { colors, spacing, fontSize, radius } from '../../config/theme'

const MENU_ITEMS = [
  { icon: '👥', label: 'Profissionais', desc: 'Gerir a sua equipa', path: '/(admin)/professionals' },
  { icon: '👤', label: 'Clientes', desc: 'Lista de clientes', path: '/(admin)/clients' },
  { icon: '🕐', label: 'Horários', desc: 'Horário de funcionamento', path: '/(admin)/hours' },
  { icon: '🏪', label: 'Perfil da barbearia', desc: 'Dados e partilha', path: '/(admin)/profile' },
]

export default function AdminMoreScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mais</Text>
        <Text style={styles.subtitle}>Configurações e gestão</Text>
      </View>
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.path as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800' },
  subtitle: { color: colors.text2, fontSize: fontSize.md, marginTop: spacing.xs },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  menuIcon: { fontSize: fontSize.xxl, marginRight: spacing.lg },
  menuContent: { flex: 1 },
  menuLabel: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.xs },
  menuDesc: { color: colors.text2, fontSize: fontSize.sm },
  menuArrow: { color: colors.text3, fontSize: fontSize.xxl, fontWeight: '300', marginLeft: spacing.md },
})
