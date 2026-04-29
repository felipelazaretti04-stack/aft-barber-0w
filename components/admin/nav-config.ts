import type { LucideIcon } from "lucide-react"
import { Building2, FileText, LayoutDashboard, Package } from "lucide-react"

export interface AdminNavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Visão geral", href: "/admin", icon: LayoutDashboard },
  { label: "Barbearias", href: "/admin/tenants", icon: Building2 },
  { label: "Planos", href: "/admin/plans", icon: Package },
  { label: "Logs de auditoria", href: "/admin/logs", icon: FileText },
]
