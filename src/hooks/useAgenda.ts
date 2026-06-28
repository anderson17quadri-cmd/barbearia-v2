import { useState, useEffect, useCallback } from 'react'
import type { Appointment } from '../config/types'
import {
  fetchAppointmentsByBarbershop,
  updateAppointmentStatus,
} from '../services/api'

export function useAgenda(barbershopId: string) {
  const [date, setDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!barbershopId) return
    try {
      setLoading(true)
      const dateStr = date.toISOString().split('T')[0]
      const data = await fetchAppointmentsByBarbershop(barbershopId, {
        date: dateStr,
      })
      setAppointments(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [barbershopId, date])

  useEffect(() => {
    refresh()
  }, [refresh])

  const changeDay = useCallback((delta: number) => {
    setDate((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() + delta)
      return next
    })
  }, [])

  const updateStatus = useCallback(async (id: string, status: string) => {
    try {
      await updateAppointmentStatus(id, status)
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: status as Appointment['status'] } : a,
        ),
      )
    } catch {
      // silently fail
    }
  }, [])

  return { date, appointments, loading, changeDay, refresh, updateStatus }
}
