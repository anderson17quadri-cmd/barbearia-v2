import { useState, useEffect, useCallback } from 'react'
import type { Appointment } from '../config/types'
import {
  fetchAppointmentsByClient,
  fetchAppointmentsByBarbershop,
  cancelAppointment as apiCancelAppointment,
  updateAppointmentStatus,
} from '../services/api'

export function useClientAppointments(clientId: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!clientId) return
    try {
      setLoading(true)
      const data = await fetchAppointmentsByClient(clientId)
      setAppointments(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const cancel = useCallback(
    async (id: string) => {
      try {
        await apiCancelAppointment(id)
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'cancelado' as const } : a)),
        )
      } catch {
        // silently fail
      }
    },
    [],
  )

  return { appointments, loading, refresh, cancelAppointment: cancel }
}

export function useAdminAppointments(barbershopId: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  const refresh = useCallback(async () => {
    if (!barbershopId) return
    try {
      setLoading(true)
      const filters: { status?: string } = {}
      if (filterStatus) filters.status = filterStatus
      const data = await fetchAppointmentsByBarbershop(barbershopId, filters)
      setAppointments(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [barbershopId, filterStatus])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateStatus = useCallback(async (id: string, status: string) => {
    try {
      await updateAppointmentStatus(id, status)
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: status as Appointment['status'] } : a)),
      )
    } catch {
      // silently fail
    }
  }, [])

  const hoje = new Date().toISOString().split('T')[0]

  const stats = {
    hoje: appointments.filter((a) => a.data === hoje && a.status !== 'cancelado').length,
    semana: appointments.filter((a) => {
      const apptDate = new Date(a.data)
      const now = new Date()
      const startOfWeek = new Date(now)
      const dayOfWeek = now.getDay()
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      startOfWeek.setDate(now.getDate() - diff)
      startOfWeek.setHours(0, 0, 0, 0)
      return apptDate >= startOfWeek && a.status !== 'cancelado'
    }).length,
    clientes: new Set(
      appointments
        .filter((a) => a.status !== 'cancelado')
        .map((a) => a.cliente_id),
    ).size,
    pendentes: appointments.filter((a) => a.status === 'pendente').length,
  }

  return { appointments, loading, stats, filterStatus, setFilterStatus, refresh, updateStatus }
}
