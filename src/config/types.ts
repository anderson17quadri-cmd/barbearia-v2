export type Barbershop = {
  id: string
  user_id: string
  nome: string
  email: string
  telefone: string
  ativo: boolean
  cidade: string
  descricao: string
  morada: string
  logo_url: string | null
}

export type Client = {
  id: string
  nome: string
  telefone: string
  email: string
  barbearia_id: string | null
}

export type Service = {
  id: string
  barbearia_id: string
  nome: string
  descricao: string
  preco: number
  duracao: number
  ativo: boolean
}

export type Professional = {
  id: string
  barbearia_id: string
  nome: string
  especialidade: string
  telefone: string
  ativo: boolean
}

export type Appointment = {
  id: string
  barbearia_id: string
  cliente_id: string
  servico_id: string
  profissional_id: string | null
  data: string
  hora_inicio: string
  hora_fim: string
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido'
  barbearias?: { nome: string }
  servicos?: { nome: string; duracao?: number }
  profissionais?: { nome: string }
  clientes?: { nome: string; telefone: string }
}

export type BusinessHours = {
  id?: string
  barbearia_id: string
  dia_semana: number
  ativo: boolean
  hora_inicio: string
  hora_fim: string
}

export type PlanId = 'solo' | 'pro' | 'business'
export type PlanPeriod = 'mensal' | 'anual'

export type Plan = {
  id: PlanId
  nome: string
  mensal: number
  anual: number
}

export type UserRole = 'client' | 'admin' | null
