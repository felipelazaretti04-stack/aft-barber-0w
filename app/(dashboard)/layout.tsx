import type React from "react"
import { redirect } from "next/navigation"
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

  // 🔒 BLOQUEIO 1: sem tenant = sem acesso. Manda pro onboarding.
  if (!tenant?.id) {
    redirect("/onboarding")
  }

  const data = await getTenantFeatures(tenant.id)

  // 🔒 BLOQUEIO 2: assinatura precisa estar ativa ou em trial.
  // Ajuste o nome do campo conforme seu schema (status / subscription_status).
  const status = (tenant as any).status ?? (data as any).status
  if (!["trialing", "active"].includes(status)) {
    redirect("/onboarding/cartao")
  }

  // normaliza alias 'free' → 'starter'
  const plan = (data.plan === "free" ? "starter" : data.plan) as
    | "starter"
    | "pro"
    | "premium"

  const features = data.features

  const [barbers, services] = await Promise.all([
    getCurrentUsage(tenant.id, "max_barbers"),
    getCurrentUsage(tenant.id, "max_services"),
  ])
  const usage: Record<string, number> = {
    max_barbers: barbers,
    max_services: services,
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
