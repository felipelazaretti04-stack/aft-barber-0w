"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Scissors } from "lucide-react"
import { cn } from "@/lib/utils"
import { navItems } from "./nav-config"

interface MobileSidebarProps {
  tenantName?: string
}

export function MobileSidebar({ tenantName }: MobileSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex w-full h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Scissors className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate leading-tight">AFT Barber</p>
          <p className="text-xs text-muted-foreground truncate">{tenantName || 'Menu'}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {Array.from(new Set(navItems.map((i) => i.group ?? ""))).map((group) => {
          const items = navItems.filter((i) => (i.group ?? "") === group)
          return (
            <div key={group} className="mb-3">
              {group && (
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </p>
              )}
              <ul className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href.split("/").slice(0, 3).join("/"))
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
