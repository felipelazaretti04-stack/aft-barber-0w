import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentTenant } from "@/lib/queries/dashboard"
import { getNotificationSettings } from "@/app/actions/notification-settings"
import { NotificationsSettingsForm } from "@/components/dashboard/notifications-settings-form"
import { PageHeader } from "@/components/dashboard/page-header"

export const dynamic = "force-dynamic"

export default async function NotificacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const tenant = await getCurrentTenant()
  if (!tenant) redirect("/onboarding")

  const settings = await getNotificationSettings(tenant.id)

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-2xl">
      <PageHeader
        title="Notificações"
        description="Configure quais mensagens seus clientes recebem e por qual canal."
      />
      <NotificationsSettingsForm tenantId={tenant.id} initialSettings={settings} />
    </div>
  )
}
