import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <DashboardSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardTopbar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
