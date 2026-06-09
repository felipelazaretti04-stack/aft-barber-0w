import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type React from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopbar } from "@/components/admin/topbar"

async function isAdminUser(): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  // Verifica se o usuário pertence a um tenant com is_internal = true
  const { data } = await supabase
    .from("tenant_users")
    .select("tenants!inner(is_internal)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .eq("tenants.is_internal", true)
    .limit(1)
    .single()

  return !!data
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authorized = await isAdminUser()

  if (!authorized) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopbar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
