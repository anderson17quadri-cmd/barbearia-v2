import { supabase, EDGE_FUNCTION_URL } from '../config/supabase'
import type {
  Barbershop,
  Client,
  Service,
  Professional,
  Appointment,
  BusinessHours,
  PlanId,
  PlanPeriod,
} from '../config/types'

// ─── AUTH ──────────────────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signInWithOtp(email: string, redirectTo?: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// ─── BARBERSHOPS ───────────────────────────────────────────────────────────────

export async function fetchBarbershops(search?: string): Promise<Barbershop[]> {
  let query = supabase
    .from('barbearias')
    .select('*')
    .eq('ativo', true)
    .order('nome', { ascending: true })

  if (search) {
    query = query.or(`nome.ilike.%${search}%,cidade.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function fetchBarbershopById(id: string): Promise<Barbershop | null> {
  const { data, error } = await supabase
    .from('barbearias')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function createBarbershop(data: Partial<Barbershop>) {
  const { data: result, error } = await supabase
    .from('barbearias')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function updateBarbershop(id: string, data: Partial<Barbershop>) {
  const { data: result, error } = await supabase
    .from('barbearias')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return result
}

// ─── CLIENTS ───────────────────────────────────────────────────────────────────

export async function fetchClientByEmail(email: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('email', email)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createClient(data: Partial<Client>) {
  const { data: result, error } = await supabase
    .from('clientes')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function updateClient(id: string, data: Partial<Client>) {
  const { data: result, error } = await supabase
    .from('clientes')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function fetchClientsByBarbershop(barbershopId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('barbearia_id', barbershopId)
    .order('nome', { ascending: true })
  if (error) throw error
  return data || []
}

// ─── SERVICES ──────────────────────────────────────────────────────────────────

export async function fetchServicesByBarbershop(barbershopId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from('servicos')
    .select('*')
    .eq('barbearia_id', barbershopId)
    .order('nome', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createService(data: Partial<Service>) {
  const { data: result, error } = await supabase
    .from('servicos')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function updateService(id: string, data: Partial<Service>) {
  const { data: result, error } = await supabase
    .from('servicos')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function deleteService(id: string) {
  const { error } = await supabase.from('servicos').delete().eq('id', id)
  if (error) throw error
}

// ─── PROFESSIONALS ─────────────────────────────────────────────────────────────

export async function fetchProfessionalsByBarbershop(barbershopId: string): Promise<Professional[]> {
  const { data, error } = await supabase
    .from('profissionais')
    .select('*')
    .eq('barbearia_id', barbershopId)
    .order('nome', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createProfessional(data: Partial<Professional>) {
  const { data: result, error } = await supabase
    .from('profissionais')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function updateProfessional(id: string, data: Partial<Professional>) {
  const { data: result, error } = await supabase
    .from('profissionais')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function deleteProfessional(id: string) {
  const { error } = await supabase.from('profissionais').delete().eq('id', id)
  if (error) throw error
}

// ─── APPOINTMENTS ──────────────────────────────────────────────────────────────

export async function fetchAppointmentsByClient(
  clientId: string,
  limit?: number,
): Promise<Appointment[]> {
  let query = supabase
    .from('agendamentos')
    .select('*, barbearias:nome, servicos:nome, servicos:duracao, profissionais:nome')
    .eq('cliente_id', clientId)
    .order('data', { ascending: false })
    .order('hora_inicio', { ascending: true })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function fetchAppointmentsByBarbershop(
  barbershopId: string,
  filters?: { status?: string; date?: string; fromDate?: string; toDate?: string },
  limit?: number,
): Promise<Appointment[]> {
  let query = supabase
    .from('agendamentos')
    .select(
      '*, barbearias:nome, servicos:nome, servicos:duracao, profissionais:nome, clientes:nome, clientes:telefone',
    )
    .eq('barbearia_id', barbershopId)
    .order('data', { ascending: true })
    .order('hora_inicio', { ascending: true })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.date) {
    query = query.eq('data', filters.date)
  }
  if (filters?.fromDate) {
    query = query.gte('data', filters.fromDate)
  }
  if (filters?.toDate) {
    query = query.lte('data', filters.toDate)
  }
  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createAppointment(data: Partial<Appointment>) {
  const { data: result, error } = await supabase
    .from('agendamentos')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function updateAppointmentStatus(id: string, status: string) {
  const { data: result, error } = await supabase
    .from('agendamentos')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function cancelAppointment(id: string) {
  const { data: result, error } = await supabase
    .from('agendamentos')
    .update({ status: 'cancelado' })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return result
}

// ─── BUSINESS HOURS ────────────────────────────────────────────────────────────

export async function fetchBusinessHours(barbershopId: string): Promise<BusinessHours[]> {
  const { data, error } = await supabase
    .from('horarios')
    .select('*')
    .eq('barbearia_id', barbershopId)
    .order('dia_semana', { ascending: true })
  if (error) throw error
  return data || []
}

export async function saveBusinessHours(barbershopId: string, hours: BusinessHours[]) {
  const records = hours.map((h) => ({ ...h, barbearia_id: barbershopId }))
  const { error } = await supabase.from('horarios_funcionamento').upsert(records)
  if (error) throw error
}

// ─── STORAGE ───────────────────────────────────────────────────────────────────

export async function uploadLogo(barbershopId: string, uri: string): Promise<string | null> {
  const response = await fetch(uri)
  const blob = await response.blob()

  const ext = uri.split('.').pop()?.split('?')[0] || 'png'
  const path = `logos/${barbershopId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('barbearias')
    .upload(path, blob, { upsert: true })

  if (uploadError) throw uploadError

  const {
    data: { publicUrl },
  } = supabase.storage.from('barbearias').getPublicUrl(path)

  await supabase.from('barbearias').update({ logo_url: publicUrl }).eq('id', barbershopId)

  return publicUrl
}

export async function removeLogo(barbershopId: string) {
  const extList = ['jpg', 'jpeg', 'png', 'webp']
  for (const ext of extList) {
    await supabase.storage.from('barbearias').remove([`logos/${barbershopId}.${ext}`])
  }

  await supabase.from('barbearias').update({ logo_url: null }).eq('id', barbershopId)
}

// ─── DASHBOARD STATS ───────────────────────────────────────────────────────────

export async function fetchDashboardStats(barbershopId: string) {
  const hoje = new Date().toISOString().split('T')[0]

  const startOfWeek = new Date()
  const dayOfWeek = startOfWeek.getDay()
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  startOfWeek.setDate(startOfWeek.getDate() - diff)
  const semanaInicio = startOfWeek.toISOString().split('T')[0]

  const [{ count: hojeCount }, { count: semanaCount }, { count: pendentesCount }, { data: clientesData }] =
    await Promise.all([
      supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .eq('barbearia_id', barbershopId)
        .eq('data', hoje)
        .neq('status', 'cancelado'),
      supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .eq('barbearia_id', barbershopId)
        .gte('data', semanaInicio)
        .lte('data', hoje)
        .neq('status', 'cancelado'),
      supabase
        .from('agendamentos')
        .select('*', { count: 'exact', head: true })
        .eq('barbearia_id', barbershopId)
        .eq('status', 'pendente'),
      supabase
        .from('agendamentos')
        .select('cliente_id')
        .eq('barbearia_id', barbershopId),
    ])

  const uniqueClients = new Set((clientesData || []).map((c) => c.cliente_id)).size

  const { data: mesData } = await supabase
    .from('agendamentos')
    .select('servicos:preco')
    .eq('barbearia_id', barbershopId)
    .neq('status', 'cancelado')
    .gte(
      'data',
      new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    )

  const faturamento_mes =
    (mesData || []).reduce((sum: number, row: any) => {
      const preco = row.servicos?.preco || row.preco || 0
      return sum + (typeof preco === 'number' ? preco : 0)
    }, 0) || 0

  return {
    hoje: hojeCount || 0,
    semana: semanaCount || 0,
    clientes: uniqueClients,
    pendentes: pendentesCount || 0,
    faturamento_mes,
  }
}

// ─── STRIPE CHECKOUT ───────────────────────────────────────────────────────────

export async function createCheckoutSession(
  plano: PlanId,
  periodo: PlanPeriod,
  email: string,
  nome: string,
) {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(`${EDGE_FUNCTION_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token || ''}`,
    },
    body: JSON.stringify({ plano, periodo, email, nome }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Erro ao criar sessão de checkout' }))
    throw new Error(err.error || 'Erro ao criar sessão de checkout')
  }

  return response.json()
}
