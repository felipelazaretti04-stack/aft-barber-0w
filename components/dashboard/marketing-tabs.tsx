"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Megaphone, Sparkles, Tag, FileImage } from "lucide-react"

const tabs = [
  { href: "/dashboard/marketing/campaigns",   label: "Campanhas",  icon: Megaphone },
  { href: "/dashboard/marketing/automations", label: "Automações", icon: Sparkles  },
  { href: "/dashboard/marketing/promotions",  label: "Promoções",  icon: Tag       },
  { href: "/dashboard/marketing/flyers",      label: "Flyers",     icon: FileImage },
]

export function MarketingTabs({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b">
        <nav className="flex gap-1 overflow-x-auto scrollbar-thin -mb-px" aria-label="Seções de marketing">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
      {children}
    </div>
  )
}
