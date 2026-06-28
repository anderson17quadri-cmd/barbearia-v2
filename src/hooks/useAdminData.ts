import { useState, useEffect, useCallback } from 'react'
import type { Barbershop, Service, Professional, Client, BusinessHours } from '../config/types'
import {
  fetchServicesByBarbershop,
  createService,
  updateService,
  deleteService,
  fetchProfessionalsByBarbershop,
  createProfessional,
  updateProfessional,
  deleteProfessional,
  fetchClientsByBarbershop,
  fetchBusinessHours,
  saveBusinessHours,
  fetchBarbershopById,
  updateBarbershop,
  uploadLogo,
  removeLogo,
} from '../services/api'

export function useAdminData(barbershopId: string) {
  const [services, setServices] = useState<Service[]>([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loadingProfessionals, setLoadingProfessionals] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([])
  const [loadingHours, setLoadingHours] = useState(true)
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const refreshServices = useCallback(async () => {
    if (!barbershopId) return
    try {
      setLoadingServices(true)
      const data = await fetchServicesByBarbershop(barbershopId)
      setServices(data)
    } catch {
      // silently fail
    } finally {
      setLoadingServices(false)
    }
  }, [barbershopId])

  const saveService = useCallback(
    async (data: Partial<Service>) => {
      if (data.id) {
        const updated = await updateService(data.id, data)
        setServices((prev) => prev.map((s) => (s.id === data.id ? updated : s)))
      } else {
        const created = await createService({ ...data, barbearia_id: barbershopId })
        setServices((prev) => [...prev, created])
      }
    },
    [barbershopId],
  )

  const removeService = useCallback(async (id: string) => {
    await deleteService(id)
    setServices((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const refreshProfessionals = useCallback(async () => {
    if (!barbershopId) return
    try {
      setLoadingProfessionals(true)
      const data = await fetchProfessionalsByBarbershop(barbershopId)
      setProfessionals(data)
    } catch {
      // silently fail
    } finally {
      setLoadingProfessionals(false)
    }
  }, [barbershopId])

  const saveProfessional = useCallback(
    async (data: Partial<Professional>) => {
      if (data.id) {
        const updated = await updateProfessional(data.id, data)
        setProfessionals((prev) =>
          prev.map((p) => (p.id === data.id ? updated : p)),
        )
      } else {
        const created = await createProfessional({
          ...data,
          barbearia_id: barbershopId,
        })
        setProfessionals((prev) => [...prev, created])
      }
    },
    [barbershopId],
  )

  const removeProfessional = useCallback(async (id: string) => {
    await deleteProfessional(id)
    setProfessionals((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const refreshClients = useCallback(async () => {
    if (!barbershopId) return
    try {
      setLoadingClients(true)
      const data = await fetchClientsByBarbershop(barbershopId)
      setClients(data)
    } catch {
      // silently fail
    } finally {
      setLoadingClients(false)
    }
  }, [barbershopId])

  const refreshHours = useCallback(async () => {
    if (!barbershopId) return
    try {
      setLoadingHours(true)
      const data = await fetchBusinessHours(barbershopId)
      setBusinessHours(data)
    } catch {
      // silently fail
    } finally {
      setLoadingHours(false)
    }
  }, [barbershopId])

  const saveHours = useCallback(
    async (hours: BusinessHours[]) => {
      await saveBusinessHours(barbershopId, hours)
      setBusinessHours(hours)
    },
    [barbershopId],
  )

  const refreshProfile = useCallback(async () => {
    if (!barbershopId) return
    try {
      setLoadingProfile(true)
      const data = await fetchBarbershopById(barbershopId)
      setBarbershop(data)
    } catch {
      // silently fail
    } finally {
      setLoadingProfile(false)
    }
  }, [barbershopId])

  const updateProfile = useCallback(
    async (data: Partial<Barbershop>) => {
      const updated = await updateBarbershop(barbershopId, data)
      setBarbershop(updated)
    },
    [barbershopId],
  )

  const uploadLogoAction = useCallback(
    async (uri: string) => {
      const url = await uploadLogo(barbershopId, uri)
      if (url) {
        setBarbershop((prev) => (prev ? { ...prev, logo_url: url } : prev))
      }
    },
    [barbershopId],
  )

  const removeLogoAction = useCallback(async () => {
    await removeLogo(barbershopId)
    setBarbershop((prev) => (prev ? { ...prev, logo_url: null } : prev))
  }, [barbershopId])

  useEffect(() => {
    refreshServices()
    refreshProfessionals()
    refreshClients()
    refreshHours()
    refreshProfile()
  }, [refreshServices, refreshProfessionals, refreshClients, refreshHours, refreshProfile])

  return {
    services,
    loadingServices,
    refreshServices,
    saveService,
    deleteService: removeService,
    professionals,
    loadingProfessionals,
    refreshProfessionals,
    saveProfessional,
    deleteProfessional: removeProfessional,
    clients,
    loadingClients,
    refreshClients,
    businessHours,
    loadingHours,
    refreshHours,
    saveHours,
    barbershop,
    loadingProfile,
    refreshProfile,
    updateProfile,
    uploadLogo: uploadLogoAction,
    removeLogo: removeLogoAction,
  }
}
