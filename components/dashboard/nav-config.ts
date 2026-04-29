import {
  Armchair,
  BarChart3,
  Calendar,
  CalendarOff,
  CreditCard,
  Gift,
  Image as ImageIcon,
  LayoutDashboard,
  Megaphone,
  Scissors,
  Settings,
  ShoppingCart,
  Timer,
  UserCircle,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  group?: string
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Operação" },
  { label: "Agenda", href: "/dashboard/agenda", icon: Calendar, group: "Operação" },
  { label: "Venda Rápida", href: "/dashboard/pos", icon: ShoppingCart, group: "Operação" },
  { label: "Lista de Espera", href: "/dashboard/waitlist", icon: Timer, group: "Operação" },
  { label: "Bloqueios", href: "/dashboard/blocks", icon: CalendarOff, group: "Operação" },

  { label: "Serviços", href: "/dashboard/services", icon: Scissors, group: "Cadastros" },
  { label: "Barbeiros", href: "/dashboard/barbers", icon: Users, group: "Cadastros" },
  { label: "Clientes", href: "/dashboard/clients", icon: UserCircle, group: "Cadastros" },
  { label: "Recursos", href: "/dashboard/resources", icon: Armchair, group: "Cadastros" },

  { label: "Marketing", href: "/dashboard/marketing/campaigns", icon: Megaphone, group: "Crescimento" },
  { label: "Fidelização", href: "/dashboard/loyalty", icon: Gift, group: "Crescimento" },
  { label: "Galeria", href: "/dashboard/gallery", icon: ImageIcon, group: "Crescimento" },

  { label: "Relatórios", href: "/dashboard/reports", icon: BarChart3, group: "Gestão" },
  { label: "Plano", href: "/dashboard/plan", icon: CreditCard, group: "Gestão" },
  { label: "Configurações", href: "/dashboard/settings", icon: Settings, group: "Gestão" },
]

export const adminNavItems: NavItem[] = [
  { label: "Visão Geral", href: "/admin", icon: LayoutDashboard },
  { label: "Barbearias", href: "/admin/tenants", icon: Users },
  { label: "Planos", href: "/admin/plans", icon: CreditCard },
  { label: "Logs", href: "/admin/logs", icon: BarChart3 },
]
