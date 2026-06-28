import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabase'
import { Barbershop } from '../config/types'

export default function useBarbershops() {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBarbershops = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('barbearias')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    setBarbershops((data as Barbershop[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchBarbershops()
  }, [fetchBarbershops])

  return { barbershops, loading, refresh: fetchBarbershops }
}
