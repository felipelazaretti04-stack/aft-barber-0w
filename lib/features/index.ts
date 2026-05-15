import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export type FeatureKey =
  | "max_barbers"
  | "max_services"
  | "whatsapp_notifications"
  | "analytics_advanced"
  | "custom_branding"

export type PlanSlug = "free" | "pro" | "premium"

export interface FeatureValue {
  enabled: boolean
  limit: number | null // null = ilimitado
}

export type FeaturesMap = Record<FeatureKey, FeatureValue>

const DEFAULT_FEATURES: FeaturesMap = {
  max_barbers: { enabled: true, limit: 1 },
  max_services: { enabled: true, limit: 5 },
  whatsapp_notifications: { enabled: false, limit: null },
  analytics_advanced: { enabled: false, limit: null },
  custom_branding: { enabled: false, limit: null },
}

/**
 * Busca o plano + features do tenant.
 * Cacheado por request via React `cache()`.
 */
export const getTenantFeatures = cache(
  async (
    tenantId: string,
  ): Promise<{ plan: PlanSlug; features: FeaturesMap }> => {
    const supabase = await createClient()

    // 1) Plano atual do tenant
    const { data: planData } = await supabase.rpc("get_tenant_plan", {
      p_tenant_id: tenantId,
    })
    const plan = (planData ?? "free") as PlanSlug

    // 2) Features do plano
    const { data: rows } = await supabase
      .from("plan_features")
      .select("feature_key, limit_value, enabled")
      .eq("plan", plan)

    const features: FeaturesMap = { ...DEFAULT_FEATURES }
    for (const row of rows ?? []) {
      const key = row.feature_key as FeatureKey
      if (key in features) {
        features[key] = {
          enabled: row.enabled,
          limit: row.limit_value,
        }
      }
    }

    return { plan, features }
  },
)

/**
 * Conta uso atual de um recurso para checar contra o limite.
 */
export const getCurrentUsage = cache(
  async (tenantId: string, key: FeatureKey): Promise<number> => {
    const supabase = await createClient()

    switch (key) {
      case "max_barbers": {
        const { count } = await supabase
          .from("barbers")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
          .eq("active", true)
        return count ?? 0
      }
      case "max_services": {
        const { count } = await supabase
          .from("services")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
          .eq("active", true)
        return count ?? 0
      }
      default:
        return 0
    }
  },
)

/**
 * Helper para checar se atingiu o limite de uma feature.
 */
export async function isAtLimit(
  tenantId: string,
  key: FeatureKey,
): Promise<boolean> {
  const { features } = await getTenantFeatures(tenantId)
  const f = features[key]
  if (!f.enabled) return true
  if (f.limit == null) return false // ilimitado
  const usage = await getCurrentUsage(tenantId, key)
  return usage >= f.limit
}

/**
 * Metadados de UI por plano.
 */
export const PLAN_META: Record<
  PlanSlug,
  { name: string; tagline: string; order: number }
> = {
  free: { name: "Free", tagline: "Para começar", order: 0 },
  pro: { name: "Pro", tagline: "Para crescer", order: 1 },
  premium: { name: "Premium", tagline: "Para escalar", order: 2 },
}

export function isPlanAtLeast(current: PlanSlug, required: PlanSlug): boolean {
  return PLAN_META[current].order >= PLAN_META[required].order
}

/**
 * Plano mínimo onde a feature está habilitada.
 */
export function minPlanFor(key: FeatureKey): PlanSlug {
  if (key === "custom_branding") return "premium"
  if (key === "analytics_advanced" || key === "whatsapp_notifications") return "pro"
  return "free"
}
