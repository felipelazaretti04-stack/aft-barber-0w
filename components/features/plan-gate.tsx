import type { ReactNode } from "react"
import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  getTenantFeatures,
  minPlanFor,
  type FeatureKey,
} from "@/lib/features"
import { UpgradeCard } from "./upgrade-card"

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

export async function PlanGate({
  tenantId,
  feature,
  mode = "hard",
  featureName,
  description,
  fallback,
  children,
}: PlanGateProps) {
  const { features } = await getTenantFeatures(tenantId)
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
