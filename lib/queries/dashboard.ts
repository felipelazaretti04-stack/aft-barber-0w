import { createClient } from "@/lib/supabase/server"

// ============ TYPES ============
export interface DashboardTenant {
  id: string
  name: string
  slug: string
  plan_slug: string
  plan_name: string
  trial_ends_at: string | null
  status: string
}

export interface DashboardUser {
  id: string
  full_name: string
  avatar_url: string | null
  role: string
}

export interface DashboardBarber {
  id: string
  name: string
  avatar_url: string | null
  color: string
}

export interface DashboardService {
  id: string
  name: string
  price_cents: number
  duration_min: number
}

export interface DashboardAppointment {
  id: string
  starts_at: string
  ends_at: string
  status: string
  total_cents: number
  client_name: string
  client_phone: string | null
  client_avatar_url: string | null
  barber_id: string
  barber_name: string
  service_id: string | null
  service_name: string | null
}

export interface DashboardKPIs {
  todayRevenue: number
  todayAppointments: number
  confirmedCount: number
  pendingCount: number
  occupancyRate: number
  newClientsThisMonth: number
}

// ============ QUERIES ============

/** Busca o tenant ativo do usuário logado */
export async function getCurrentTenant(): Promise<DashboardTenant | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('get_my_tenant')
    .single()
  
  if (error || !data) return null
  
  // Buscar nome do plano
  const { data: planData } = await supabase
    .from('plans')
    .select('name')
    .eq('slug', data.plan_slug)
    .single()
  
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    plan_slug: data.plan_slug || 'free',
    plan_name: planData?.name || 'Free',
    trial_ends_at: null, // TODO: buscar do tenants
    status: 'trial'
  }
}

/** Busca o usuário logado */
export async function getCurrentUser(): Promise<DashboardUser | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()
  
  // Buscar role do tenant_users
  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()
  
  return {
    id: user.id,
    full_name: profile?.full_name || user.email?.split('@')[0] || 'Usuário',
    avatar_url: profile?.avatar_url,
    role: tenantUser?.role || 'barber'
  }
}

/** Busca barbeiros do tenant */
export async function getTenantBarbers(tenantId: string): Promise<DashboardBarber[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('barbers')
    .select('id, name, avatar_url, color')
    .eq('tenant_id', tenantId)
    .eq('active', true)
    .order('name')
  
  if (error || !data) return []
  
  return data.map(b => ({
    id: b.id,
    name: b.name,
    avatar_url: b.avatar_url,
    color: b.color || '#6366f1'
  }))
}

/** Busca serviços do tenant */
export async function getTenantServices(tenantId: string): Promise<DashboardService[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('services')
    .select('id, name, price_cents, duration_min')
    .eq('tenant_id', tenantId)
    .eq('active', true)
    .order('name')
  
  if (error || !data) return []
  
  return data
}

/** Busca agendamentos de hoje */
export async function getTodayAppointments(tenantId: string): Promise<DashboardAppointment[]> {
  const supabase = await createClient()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id, starts_at, ends_at, status, total_cents,
      client_name, client_phone,
      barber_id,
      barbers!inner(name),
      service_id,
      services(name)
    `)
    .eq('tenant_id', tenantId)
    .gte('starts_at', today.toISOString())
    .lt('starts_at', tomorrow.toISOString())
    .order('starts_at')
  
  if (error || !data) return []
  
  return data.map((a: any) => ({
    id: a.id,
    starts_at: a.starts_at,
    ends_at: a.ends_at,
    status: a.status,
    total_cents: a.total_cents || 0,
    client_name: a.client_name || 'Cliente',
    client_phone: a.client_phone,
    client_avatar_url: null,
    barber_id: a.barber_id,
    barber_name: a.barbers?.name || 'Profissional',
    service_id: a.service_id,
    service_name: a.services?.name || null
  }))
}

/** Calcula KPIs do dashboard */
export async function getDashboardKPIs(tenantId: string): Promise<DashboardKPIs> {
  const supabase = await createClient()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  
  // Agendamentos de hoje
  const { data: todayAppts } = await supabase
    .from('appointments')
    .select('id, status, total_cents')
    .eq('tenant_id', tenantId)
    .gte('starts_at', today.toISOString())
    .lt('starts_at', tomorrow.toISOString())
  
  const appointments = todayAppts || []
  const todayRevenue = appointments
    .filter(a => ['confirmed', 'in_progress', 'completed'].includes(a.status))
    .reduce((sum, a) => sum + (a.total_cents || 0), 0)
  
  const confirmedCount = appointments.filter(a => 
    ['confirmed', 'in_progress', 'completed'].includes(a.status)
  ).length
  const pendingCount = appointments.filter(a => a.status === 'pending').length
  
  // Novos clientes do mês
  const { count: newClientsThisMonth } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('created_at', monthStart.toISOString())
  
  // Taxa de ocupação (simplificada: assumindo 8h de trabalho * barbers)
  const { count: barbersCount } = await supabase
    .from('barbers')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('active', true)
  
  const totalSlots = (barbersCount || 1) * 16 // 8h / 30min slots
  const occupancyRate = Math.min(100, Math.round((appointments.length / totalSlots) * 100))
  
  return {
    todayRevenue: todayRevenue / 100, // converter de centavos para reais
    todayAppointments: appointments.length,
    confirmedCount,
    pendingCount,
    occupancyRate,
    newClientsThisMonth: newClientsThisMonth || 0
  }
}

/** Ranking de barbeiros do mês */
export async function getBarberRanking(tenantId: string): Promise<{
  barber: DashboardBarber
  count: number
  revenue: number
}[]> {
  const supabase = await createClient()
  
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  
  const { data: barbers } = await supabase
    .from('barbers')
    .select('id, name, avatar_url, color')
    .eq('tenant_id', tenantId)
    .eq('active', true)
  
  if (!barbers) return []
  
  const results = await Promise.all(barbers.map(async (b) => {
    const { data: appts } = await supabase
      .from('appointments')
      .select('id, total_cents, status')
      .eq('tenant_id', tenantId)
      .eq('barber_id', b.id)
      .gte('starts_at', monthStart.toISOString())
    
    const completed = (appts || []).filter(a => a.status === 'completed')
    const revenue = completed.reduce((sum, a) => sum + (a.total_cents || 0), 0)
    
    return {
      barber: {
        id: b.id,
        name: b.name,
        avatar_url: b.avatar_url,
        color: b.color || '#6366f1'
      },
      count: (appts || []).length,
      revenue: revenue / 100
    }
  }))
  
  return results.sort((a, b) => b.revenue - a.revenue)
}

/** Top serviços do mês */
export async function getServiceStats(tenantId: string): Promise<{
  service: DashboardService
  count: number
}[]> {
  const supabase = await createClient()
  
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  
  const { data: services } = await supabase
    .from('services')
    .select('id, name, price_cents, duration_min')
    .eq('tenant_id', tenantId)
    .eq('active', true)
  
  if (!services) return []
  
  const results = await Promise.all(services.map(async (s) => {
    const { count } = await supabase
      .from('appointment_services')
      .select('id', { count: 'exact', head: true })
      .eq('service_id', s.id)
    
    return {
      service: s,
      count: count || 0
    }
  }))
  
  return results.sort((a, b) => b.count - a.count).slice(0, 5)
}

/** Receita dos últimos 7 dias */
export async function getWeeklyRevenue(tenantId: string): Promise<{
  date: string
  revenue: number
}[]> {
  const supabase = await createClient()
  
  const results: { date: string; revenue: number }[] = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const { data } = await supabase
      .from('appointments')
      .select('total_cents')
      .eq('tenant_id', tenantId)
      .in('status', ['confirmed', 'in_progress', 'completed'])
      .gte('starts_at', date.toISOString())
      .lt('starts_at', nextDate.toISOString())
    
    const dayRevenue = (data || []).reduce((sum, a) => sum + (a.total_cents || 0), 0)
    
    results.push({
      date: date.toISOString().split('T')[0],
      revenue: dayRevenue / 100
    })
  }
  
  return results
}
