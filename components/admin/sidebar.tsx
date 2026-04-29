"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeftRight, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { adminNavItems } from "./nav-config"
import { Badge } from "@/components/ui/badge"

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-zinc-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-500 text-zinc-950">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate leading-tight">AFT Barber Admin</p>
          <p className="text-xs text-amber-400/80 truncate">Super Admin</p>
        </div>
      </div>

      {/* Status */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-zinc-400">Sistema</p>
          <Badge className="bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/30 h-5 text-[10px] capitalize">
            Operacional
          </Badge>
        </div>
        <p className="text-xs text-zinc-500">v2.4.1 · 6 tenants ativos</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        <ul className="flex flex-col gap-0.5">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-amber-500 text-zinc-950"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800 p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Voltar para o painel
        </Link>
      </div>
    </aside>
  )
}
