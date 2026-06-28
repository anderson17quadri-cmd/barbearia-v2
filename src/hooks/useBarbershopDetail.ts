import { useState, useEffect, useCallback } from 'react'
import type { Barbershop, Service, Professional, BusinessHours } from '../config/types'
import {
  fetchBarbershopById,
  fetchServicesByBarbershop,
  fetchProfessionalsByBarbershop,
  fetchBusinessHours,
  fetchAppointmentsByBarbershop,
  createAppointment,
} from '../services/api'

const ANY_PROFESSIONAL = { id: 'qualquer', nome: 'Qualquer profissional' } as const

export function useBarbershopDetail(barbershopId: string) {
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<
    Professional | typeof ANY_PROFESSIONAL | null
  >(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(1)

  const reset = useCallback(() => {
    setSelectedService(null)
    setSelectedProfessional(null)
    setSelectedDate('')
    setSelectedTime('')
    setAvailableSlots([])
    setCurrentStep(1)
  }, [])

  useEffect(() => {
    if (!barbershopId) return

    const load = async () => {
      try {
        setLoading(true)
        const [shop, svcs, profs, hours] = await Promise.all([
          fetchBarbershopById(barbershopId),
          fetchServicesByBarbershop(barbershopId),
          fetchProfessionalsByBarbershop(barbershopId),
          fetchBusinessHours(barbershopId),
        ])
        setBarbershop(shop)
        setServices(svcs)
        setProfessionals(profs)
        setBusinessHours(hours)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [barbershopId])

  const loadAvailableSlots = useCallback(async () => {
    if (!selectedDate || !selectedService) {
      setAvailableSlots([])
      return
    }

    try {
      const date = new Date(selectedDate + 'T00:00:00')
      const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1

      const dayHours = businessHours.find((h) => h.dia_semana === dayOfWeek)
      if (!dayHours || !dayHours.ativo) {
        setAvailableSlots([])
        return
      }

      const existingAppointments = await fetchAppointmentsByBarbershop(barbershopId, {
        date: selectedDate,
      })

      if (selectedProfessional && selectedProfessional.id !== 'qualquer') {
        const filtered = existingAppointments.filter(
          (a) =>
            a.profissional_id === selectedProfessional.id && a.status !== 'cancelado',
        )
        generateSlots(dayHours, selectedService.duracao, filtered)
      } else {
        const filtered = existingAppointments.filter(
          (a) => a.status !== 'cancelado',
        )
        generateSlots(dayHours, selectedService.duracao, filtered)
      }
    } catch {
      setAvailableSlots([])
    }
  }, [selectedDate, selectedService, selectedProfessional, businessHours, barbershopId])

  const generateSlots = (
    dayHours: BusinessHours,
    duration: number,
    existing: any[],
  ) => {
    const slots: string[] = []
    const [startH, startM] = dayHours.hora_inicio.split(':').map(Number)
    const [endH, endM] = dayHours.hora_fim.split(':').map(Number)

    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    const now = new Date()
    const isToday =
      selectedDate === now.toISOString().split('T')[0]
    const nowMinutes = now.getHours() * 60 + now.getMinutes() + 30

    for (let m = startMinutes; m + duration <= endMinutes; m += 30) {
      if (isToday && m < nowMinutes) continue

      const slotH = Math.floor(m / 60)
      const slotM = m % 60
      const slotEnd = m + duration

      const conflicts = existing.some((appt: any) => {
        const [aStartH, aStartM] = (appt.hora_inicio || '00:00').split(':').map(Number)
        const [aEndH, aEndM] = (appt.hora_fim || '00:00').split(':').map(Number)
        const aStart = aStartH * 60 + aStartM
        const aEnd = aEndH * 60 + aEndM

        return m < aEnd && slotEnd > aStart
      })

      if (!conflicts) {
        const timeStr = `${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`
        slots.push(timeStr)
      }
    }

    setAvailableSlots(slots)
  }

  const confirmBooking = useCallback(
    async (
      clientId: string,
      clientName?: string,
      clientPhone?: string,
    ): Promise<{ error?: string }> => {
      if (!selectedService || !selectedDate || !selectedTime) {
        return { error: 'Preencha todos os campos' }
      }

      try {
        const [h, m] = selectedTime.split(':').map(Number)
        const startMinutes = h * 60 + m
        const endMinutes = startMinutes + selectedService.duracao
        const endH = Math.floor(endMinutes / 60)
        const endM = endMinutes % 60

        const hora_fim = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

        const profissionalId =
          selectedProfessional && selectedProfessional.id !== 'qualquer'
            ? selectedProfessional.id
            : null

        await createAppointment({
          barbearia_id: barbershopId,
          cliente_id: clientId,
          servico_id: selectedService.id,
          profissional_id: profissionalId,
          data: selectedDate,
          hora_inicio: selectedTime,
          hora_fim,
          status: 'pendente',
        })

        reset()
        return {}
      } catch (err: any) {
        return { error: err.message || 'Erro ao agendar' }
      }
    },
    [selectedService, selectedProfessional, selectedDate, selectedTime, barbershopId, reset],
  )

  return {
    barbershop,
    services,
    professionals,
    businessHours,
    loading,
    selectedService,
    selectedProfessional,
    selectedDate,
    selectedTime,
    availableSlots,
    currentStep,
    setSelectedService,
    setSelectedProfessional,
    setSelectedDate,
    setSelectedTime,
    setCurrentStep,
    loadAvailableSlots,
    confirmBooking,
    reset,
  }
}
