"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import type { FeatureKey, FeaturesMap, PlanSlug } from "./index"

interface FeaturesContextValue {
  plan: PlanSlug
  features: FeaturesMap
  usage: Partial<Record<FeatureKey, number>>
  tenantId: string
}

const FeaturesContext = createContext<FeaturesContextValue | null>(null)

export function FeaturesProvider({
  plan,
  features,
  usage,
  tenantId,
  children,
}: FeaturesContextValue & { children: ReactNode }) {
  const value = useMemo(() => ({ plan, features, usage, tenantId }), [plan, features, usage, tenantId])
  return <FeaturesContext.Provider value={value}>{children}</FeaturesContext.Provider>
}

export interface UseFeatureResult {
  enabled: boolean
  limit: number | null
  currentUsage: number
  isAtLimit: boolean
  plan: PlanSlug
}

export function useFeature(key: FeatureKey): UseFeatureResult {
  const ctx = useContext(FeaturesContext)
  if (!ctx) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[v0] useFeature usado fora do FeaturesProvider")
    }
    return {
      enabled: false,
      limit: 0,
      currentUsage: 0,
      isAtLimit: true,
      plan: "free",
    }
  }
  const f = ctx.features[key]
  const currentUsage = ctx.usage[key] ?? 0
  const isAtLimit =
    !f.enabled || (f.limit != null && currentUsage >= f.limit)
  return {
    enabled: f.enabled,
    limit: f.limit,
    currentUsage,
    isAtLimit,
    plan: ctx.plan,
  }
}

export function usePlan(): PlanSlug {
  const ctx = useContext(FeaturesContext)
  return ctx?.plan ?? "starter"
}

export function useTenantId(): string {
  const ctx = useContext(FeaturesContext)
  return ctx?.tenantId ?? ""
}
