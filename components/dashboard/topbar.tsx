import { createClient } from "@/lib/supabase/server"
import { DashboardTopbarClient } from "./topbar-client"

export async function DashboardTopbar() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, is_super_admin')
    .eq('id', user?.id || '')
    .single()
  
  return (
    <DashboardTopbarClient
      user={user ? {
        id: user.id,
        name: profile?.full_name || user.email?.split('@')[0] || 'Usuário',
        email: user.email || '',
        avatar_url: profile?.avatar_url,
        is_super_admin: profile?.is_super_admin || false
      } : null}
    />
  )
}
