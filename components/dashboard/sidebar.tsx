"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Copy, ExternalLink, LogOut, Scissors, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { currentTenant, currentUser } from "@/lib/mock-data"
import { navItems } from "./nav-config"
import { toast } from "sonner"

export function DashboardSidebar() {
  const pathname = usePathname()

  const handleCopyLink = () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/booking/${currentTenant.slug}`
    navigator.clipboard.writeText(url)
    toast.success("Link copiado para a área de transferência")
  }

  return (
    <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Scissors className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate leading-tight">AFT Barber</p>
          <p className="text-xs text-muted-foreground truncate">{currentTenant.name}</p>
        </div>
      </div>

      {/* Tenant switcher / user */}
      <div className="px-3 py-3 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 rounded-md p-2 hover:bg-sidebar-accent transition-colors text-left">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar_url || "/placeholder.svg"} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">{currentUser.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

      {/* Footer */}
      <div className="border-t p-3 space-y-2">
        <div className="rounded-md bg-accent/50 p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium">Plano atual</p>
            <Badge variant="default" className="capitalize text-[10px] h-5">{currentTenant.plan}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">12 dias restantes</p>
        </div>
        <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={handleCopyLink}>
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Link público</span>
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
    </aside>
  )
}
