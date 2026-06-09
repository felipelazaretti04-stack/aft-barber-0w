"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { OnboardingPayload } from "@/lib/onboarding/schema"
import { createPreapproval } from "@/lib/mercadopago"
import { PLAN_META } from "@/lib/features"

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("is_slug_available", {
    p_slug: slug.toLowerCase(),
    p_tenant_id: null,
  })
  if (error) {
    console.error("[v0] checkSlugAvailability error:", error)
    return false
  }
  return data === true
}

export async function completeOnboarding(
  payload: OnboardingPayload,
): Promise<{
  success: boolean
  tenantId?: string
  slug?: string
  mpInitPoint?: string
  error?: string
}> {
  const supabase = await createClient()

  // planSlug obrigatório — sem fallback para 'free'
  const planSlug = payload.planSlug
  if (!planSlug || planSlug === "free") {
    return { success: false, error: "Selecione um plano para continuar" }
  }

  const activeSchedules = payload.schedules
    .filter((s) => s.starts_at && s.ends_at)
    .map((s) => ({
      weekday: s.weekday,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      break_starts_at: s.break_starts_at || null,
      break_ends_at: s.break_ends_at || null,
    }))

  const servicesJson = payload.services.map((s) => ({
    name: s.name,
    duration_min: s.duration_min,
    price_cents: s.price_cents,
    description: s.description || null,
  }))

  const { data, error } = await supabase.rpc("complete_onboarding", {
    p_name: payload.name,
    p_slug: payload.slug,
    p_timezone: payload.timezone || "America/Sao_Paulo",
    p_plan_slug: planSlug,
    p_phone: payload.phone || "",
    p_whatsapp: payload.whatsapp || "",
    p_address: payload.address || "",
    p_description: payload.description || "",
    p_primary_color: payload.primaryColor || "",
    p_services: servicesJson,
    p_schedules: activeSchedules,
    p_barber_name: payload.barberName,
  })

  if (error) {
    console.error("[v0] completeOnboarding error:", error)
    return { success: false, error: error.message }
  }

  const result = data?.[0]
  if (!result) {
    return { success: false, error: "Erro ao criar negócio" }
  }

  const tenantId: string = result.out_tenant_id
  const slug: string = result.out_tenant_slug

  // Busca e-mail do usuário autenticado para o preapproval
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let mpInitPoint: string | undefined

  try {
    const planMeta = PLAN_META[planSlug as keyof typeof PLAN_META]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    const preapproval = await createPreapproval({
      tenantId,
      planSlug,
      planName: planMeta?.name ?? planSlug,
      amountCents: planMeta?.price_cents ?? 7990,
      payerEmail: user?.email ?? "",
      backUrl: `${appUrl}/onboarding/sucesso`,
    })

    // Salva mp_preapproval_id no tenant
    await supabase
      .from("tenants")
      .update({ mp_preapproval_id: preapproval.id })
      .eq("id", tenantId)

    mpInitPoint = preapproval.init_point
  } catch (err) {
    // Falha no MP não deve impedir conclusão do onboarding
    console.error("[v0] createPreapproval error:", err)
  }

  revalidatePath("/dashboard")
  revalidatePath("/onboarding")

  return { success: true, tenantId, slug, mpInitPoint }
}

export async function getMyTenant() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_my_tenant")
  if (error) {
    console.error("[v0] getMyTenant error:", error)
    return null
  }
  return data?.[0] || null
}
