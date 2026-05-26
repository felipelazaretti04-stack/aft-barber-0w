import type { ReactNode } from "react"
import Link from "next/link"
import { Sparkles, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getTenantFeatures,
  minPlanFor,
  type FeatureKey,
} from "@/lib/features"
import { UpgradeCard } from "./upgrade-card"
import { createClient } from "@/lib/supabase/server"

interface PlanGateProps {
  tenantId: string
  feature: FeatureKey
  /**
   * - "hard" (padrão): se feature desabilitada → renderiza UpgradeCard.
   * - "soft": sempre renderiza children + badge "Pro/Premium".
   * - "hide": se desabilitada não renderiza nada.
   */
  mode?: "hard" | "soft" | "hide"
  featureName?: string
  description?: string
  fallback?: ReactNode
  children: ReactNode
}

async function getTenantStatus(tenantId: string): Promise<string> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("tenants")
      .select("status")
      .eq("id", tenantId)
      .single()
    return data?.status ?? "active"
  } catch {
    return "active"
  }
}

export async function PlanGate({
  tenantId,
  feature,
  mode = "hard",
  featureName,
  description,
  fallback,
  children,
}: PlanGateProps) {
  const [{ features }, tenantStatus] = await Promise.all([
    getTenantFeatures(tenantId),
    getTenantStatus(tenantId),
  ])

  // Conta bloqueada: overlay de bloqueio em vez de UpgradeCard
  if (tenantStatus === "blocked") {
    if (mode === "hide") return null
    if (fallback) return <>{fallback}</>
    return (
      <div className="relative overflow-hidden rounded-lg border border-destructive/30">
        <div className="pointer-events-none select-none opacity-30">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 p-4 text-center backdrop-blur-sm">
          <Lock className="h-8 w-8 text-destructive" />
          <p className="font-semibold">Conta bloqueada</p>
          <p className="text-sm text-muted-foreground">
            Atualize seu plano para continuar usando esta funcionalidade.
          </p>
          <Button size="sm" variant="destructive" asChild>
            <Link href="/dashboard/plan?reason=blocked">Reativar conta</Link>
          </Button>
        </div>
      </div>
    )
  }

  const enabled = features[feature]?.enabled ?? false
  const required = minPlanFor(feature)

  if (enabled) {
    if (mode === "soft") {
      return (
        <div className="relative">
          <Badge
            variant="secondary"
            className="absolute right-3 top-3 z-10 gap-1"
          >
            <Sparkles className="h-3 w-3" />
            {required === "premium" ? "Premium" : "Pro"}
          </Badge>
          {children}
        </div>
      )
    }
    return <>{children}</>
  }

  if (mode === "hide") return null

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[v0] PlanGate: feature "${feature}" bloqueada (tenant ${tenantId}, requer ${required})`,
    )
  }

  if (fallback) return <>{fallback}</>

  return (
    <UpgradeCard
      featureName={featureName ?? feature}
      description={description}
      requiredPlan={required}
    />
  )
}
