import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Stack, useRouter, usePathname } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fontSize, bottomBarHeight } from '../../config/theme'
import { useAuth } from '../../hooks/useAuth'

const TABS = [
  { label: 'Início', icon: '🏠', path: '/(client)' },
  { label: 'Marcações', icon: '📋', path: '/(client)/bookings' },
  { label: 'Perfil', icon: '👤', path: '/(client)/profile' },
]

export default function ClientLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, clientId } = useAuth()
  const isLoggedIn = !!clientId || !!user

  const isActive = (path: string) => {
    if (path === '/(client)' && (pathname === '/(client)' || pathname === '/(client)/')) return true
    return pathname === path
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>Agend<Text style={styles.logoGold}>amento.pt</Text></Text>
        {isLoggedIn && user && <Text style={styles.userName}>{user.email}</Text>}
      </View>

      <Stack screenOptions={{ headerShown: false }} />

      <View style={styles.bottomBar}>
        {TABS.map((tab) => {
          const active = isActive(tab.path)
          return (
            <TouchableOpacity key={tab.path} style={styles.tab} onPress={() => router.push(tab.path as any)} activeOpacity={0.7}>
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              {active && <View style={styles.activeDot} />}
            </TouchableOpacity>
          )
        })}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg },
  logo: { color: colors.text, fontSize: fontSize.lg, fontWeight: '800' },
  logoGold: { color: colors.accent },
  userName: { color: colors.text2, fontSize: fontSize.sm },
  bottomBar: { flexDirection: 'row', height: bottomBarHeight, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { fontSize: 20, marginBottom: 2 },
  tabLabel: { color: colors.text2, fontSize: fontSize.xs, fontWeight: '500' },
  tabLabelActive: { color: colors.accent, fontWeight: '700' },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent, marginTop: 2 },
})
