import { createClient } from "@/lib/supabase/server"
import { DashboardSidebarClient } from "./sidebar-client"

export async function DashboardSidebar() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Buscar tenant e profile
  const { data: tenantData } = await supabase.rpc('get_my_tenant')
  const tenant = tenantData?.[0]
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user?.id || '')
    .single()
  
  // Buscar plano
  let planName = 'Free'
  let trialDaysLeft = 0
  
  if (tenant) {
    const { data: plan } = await supabase
      .from('plans')
      .select('name')
      .eq('slug', tenant.plan_slug)
      .single()
    
    planName = plan?.name || 'Free'
    
    // Calcular dias restantes do trial
    const { data: tenantRow } = await supabase
      .from('tenants')
      .select('trial_ends_at, status')
      .eq('id', tenant.id)
      .single()
    
    if (tenantRow?.trial_ends_at) {
      const trialEnd = new Date(tenantRow.trial_ends_at)
      const now = new Date()
      trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    }
  }
  
  return (
    <DashboardSidebarClient
      tenant={tenant ? {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: planName,
        trialDaysLeft
      } : null}
      user={user && profile ? {
        id: user.id,
        name: profile.full_name || user.email?.split('@')[0] || 'Usuário',
        email: user.email || '',
        avatar_url: profile.avatar_url,
        role: tenant?.role || 'owner'
      } : null}
    />
  )
}
