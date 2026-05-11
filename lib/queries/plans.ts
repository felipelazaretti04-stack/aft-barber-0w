import { createClient } from "@/lib/supabase/server"

export type Plan = {
  id: string
  name: string
  slug: string
  price_cents: number
  max_barbers: number | null
  max_appointments_month: number | null
  features: string[]
  sort_order: number
  active: boolean
}

export async function getActivePlans(): Promise<Plan[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.log("[v0] getActivePlans error:", error.message)
    return []
  }
  return (data ?? []) as Plan[]
}
