import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native'
import { colors, spacing, fontSize, radius } from '../config/theme'

type ToastType = 'ok' | 'erro'

interface ToastContextValue {
  toast: (msg: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
})

interface ToastState {
  visible: boolean
  message: string
  type: ToastType
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'ok',
  })
  const opacity = useRef(new Animated.Value(0)).current
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toast = useCallback(
    (msg: string, type: ToastType = 'ok') => {
      if (timerRef.current) clearTimeout(timerRef.current)

      setState({ visible: true, message: msg, type })
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()

      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setState((prev) => ({ ...prev, visible: false }))
        })
      }, 2500)
    },
    [opacity],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {state.visible && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity,
              borderLeftColor:
                state.type === 'ok' ? colors.success : colors.danger,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.message}>{state.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const { toast } = useContext(ToastContext)

  const ToastComponent: React.FC = () => {
    return null
  }

  return { toast, ToastComponent }
}

const { height } = Dimensions.get('window')

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: height * 0.12,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderLeftWidth: 4,
    zIndex: 999,
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  message: {
    color: colors.text,
    fontSize: fontSize.md,
  },
})
