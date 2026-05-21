import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export type FeatureKey =
  | "max_barbers"
  | "max_services"
  | "max_appointments_month"
  | "has_whatsapp"
  | "has_marketing"
  | "has_loyalty"
  | "has_advanced_reports"
  | "has_pos"
  | "has_branding"
  | "has_waitlist"
  // aliases para compatibilidade com código existente
  | "whatsapp_notifications"
  | "analytics_advanced"
  | "custom_branding"

export type PlanSlug = "starter" | "pro" | "premium" | "free"

export interface FeatureValue {
  enabled: boolean
  limit: number | null
}

export type FeaturesMap = Record<FeatureKey, FeatureValue>

const DEFAULT_FEATURES: FeaturesMap = {
  max_barbers:            { enabled: true,  limit: 1 },
  max_services:           { enabled: true,  limit: 10 },
  max_appointments_month: { enabled: true,  limit: 200 },
  has_whatsapp:           { enabled: false, limit: null },
  has_marketing:          { enabled: false, limit: null },
  has_loyalty:            { enabled: false, limit: null },
  has_advanced_reports:   { enabled: false, limit: null },
  has_pos:                { enabled: false, limit: null },
  has_branding:           { enabled: false, limit: null },
  has_waitlist:           { enabled: false, limit: null },
  // aliases
  whatsapp_notifications: { enabled: false, limit: null },
  analytics_advanced:     { enabled: false, limit: null },
  custom_branding:        { enabled: false, limit: null },
}

/** Normaliza 'free' → 'starter' para retrocompatibilidade */
function normalizePlan(slug: string): PlanSlug {
  if (slug === "free") return "starter"
  return slug as PlanSlug
}

export const getTenantFeatures = cache(
  async (tenantId: string): Promise<{ plan: PlanSlug; features: FeaturesMap }> => {
    const supabase = await createClient()

    const { data: planData } = await supabase.rpc("get_tenant_plan", {
      p_tenant_id: tenantId,
    })
    const plan = normalizePlan(planData ?? "starter")

    const { data: rows } = await supabase
      .from("plan_features")
      .select("feature_key, limit_value, enabled")
      .eq("plan", plan)

    const features: FeaturesMap = { ...DEFAULT_FEATURES }
    for (const row of rows ?? []) {
      const key = row.feature_key as FeatureKey
      if (key in features) {
        features[key] = { enabled: row.enabled, limit: row.limit_value }
      }
      // sincroniza aliases
      if (key === "has_whatsapp")         features.whatsapp_notifications = features[key]
      if (key === "has_advanced_reports") features.analytics_advanced = features[key]
      if (key === "has_branding")         features.custom_branding = features[key]
    }

    return { plan, features }
  },
)

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

export async function isAtLimit(tenantId: string, key: FeatureKey): Promise<boolean> {
  const { features } = await getTenantFeatures(tenantId)
  const f = features[key]
  if (!f.enabled) return true
  if (f.limit == null) return false
  const usage = await getCurrentUsage(tenantId, key)
  return usage >= f.limit
}

export const PLAN_META: Record<PlanSlug, { name: string; tagline: string; order: number; price_cents: number }> = {
  starter: { name: "Starter", tagline: "Para começar",  order: 0, price_cents: 7990 },
  free:    { name: "Starter", tagline: "Para começar",  order: 0, price_cents: 7990 },
  pro:     { name: "Pro",     tagline: "Para crescer",  order: 1, price_cents: 12990 },
  premium: { name: "Premium", tagline: "Para escalar",  order: 2, price_cents: 29990 },
}

export function isPlanAtLeast(current: PlanSlug, required: PlanSlug): boolean {
  return PLAN_META[current].order >= PLAN_META[required].order
}

export function minPlanFor(key: FeatureKey): PlanSlug {
  if (key === "has_branding" || key === "custom_branding" || key === "has_marketing" || key === "has_loyalty") return "premium"
  if (
    key === "has_advanced_reports" || key === "analytics_advanced" ||
    key === "has_whatsapp" || key === "whatsapp_notifications" ||
    key === "has_pos" || key === "has_waitlist"
  ) return "pro"
  return "starter"
}
