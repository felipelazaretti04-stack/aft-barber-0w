import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { StatusBanner } from "@/components/dashboard/status-banner"
import { FeaturesProvider } from "@/lib/features/context"
import { getTenantFeatures, getCurrentUsage } from "@/lib/features"
import { getCurrentTenant } from "@/lib/queries/dashboard"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tenant = await getCurrentTenant()

  // Defaults caso ainda nao haja tenant (rota deveria ter sido protegida pelo proxy)
  let plan: "free" | "pro" | "premium" = "free"
  let features = {
    max_barbers: { enabled: true, limit: 1 },
    max_services: { enabled: true, limit: 5 },
    whatsapp_notifications: { enabled: false, limit: null },
    analytics_advanced: { enabled: false, limit: null },
    custom_branding: { enabled: false, limit: null },
  } as Awaited<ReturnType<typeof getTenantFeatures>>["features"]
  let usage: Record<string, number> = {}

  if (tenant?.id) {
    const data = await getTenantFeatures(tenant.id)
    plan = data.plan
    features = data.features
    const [barbers, services] = await Promise.all([
      getCurrentUsage(tenant.id, "max_barbers"),
      getCurrentUsage(tenant.id, "max_services"),
    ])
    usage = { max_barbers: barbers, max_services: services }
  }

  return (
    <FeaturesProvider plan={plan} features={features} usage={usage}>
      <div className="flex min-h-screen bg-muted/30">
        <DashboardSidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <StatusBanner />
          <DashboardTopbar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </FeaturesProvider>
  )
}
