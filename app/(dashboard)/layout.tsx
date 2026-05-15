import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { FeaturesProvider } from "@/lib/features/context"
import { loadTenantFeatures } from "@/lib/features"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const features = await loadTenantFeatures()

  return (
    <FeaturesProvider value={features}>
      <div className="flex min-h-screen bg-muted/30">
        <DashboardSidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <DashboardTopbar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </FeaturesProvider>
  )
}
