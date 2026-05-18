"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  getOrCreateMpPlan,
  createCheckoutUrl,
  cancelMpSubscription,
} from "@/lib/mercadopago"

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
async function requireTenant() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const { data } = await supabase.rpc("get_my_tenant").single()
  if (!data) throw new Error("Tenant não encontrado")

  return { supabase, user, tenant: data }
}

// ----------------------------------------------------------------
// Action: criar link de checkout para upgrade de plano
// ----------------------------------------------------------------
export async function createCheckoutAction(planSlug: string) {
  const { supabase, user, tenant } = await requireTenant()

  // Busca o plano no banco
  const { data: plan, error } = await supabase
    .from("plans")
    .select("id, name, price_cents, mp_plan_id, slug")
    .eq("slug", planSlug)
    .eq("active", true)
    .single()

  if (error || !plan) throw new Error("Plano inválido")
  if (plan.price_cents === 0) throw new Error("Plano gratuito não requer checkout")

  // Garante que o plano existe no MP
  const mpPlan = await getOrCreateMpPlan(plan.slug, plan.name, plan.price_cents)

  // Salva o mp_plan_id no banco se ainda não estava
  if (!plan.mp_plan_id) {
    await supabase.from("plans").update({ mp_plan_id: mpPlan.id }).eq("id", plan.id)
  }

  // Pega e-mail do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const checkoutUrl = await createCheckoutUrl({
    planId: mpPlan.id,
    backUrl: `${appUrl}/dashboard/plan?success=1`,
    payerEmail: user.email ?? "",
    externalReference: tenant.out_tenant_id,
  })

  redirect(checkoutUrl)
}

// ----------------------------------------------------------------
// Action: cancelar assinatura (agenda para o fim do período)
// ----------------------------------------------------------------
export async function cancelSubscriptionAction() {
  const { supabase, tenant } = await requireTenant()

  // Busca subscription_id do tenant
  const { data: tenantRow } = await supabase
    .from("tenants")
    .select("mp_subscription_id")
    .eq("id", tenant.out_tenant_id)
    .single()

  if (tenantRow?.mp_subscription_id) {
    await cancelMpSubscription(tenantRow.mp_subscription_id)
  }

  // Marca cancel_at_period_end no banco independente
  await supabase
    .from("tenants")
    .update({ cancel_at_period_end: true })
    .eq("id", tenant.out_tenant_id)
}

// ----------------------------------------------------------------
// Action: buscar billing info para a página
// ----------------------------------------------------------------
export async function getBillingInfoAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: tenantRow } = await supabase.rpc("get_my_tenant").single()
  if (!tenantRow) return null

  const { data: billing } = await supabase
    .rpc("get_billing_info", { p_tenant_id: tenantRow.out_tenant_id })
    .single()

  const { data: plans } = await supabase
    .from("plans")
    .select("id, name, slug, price_cents, description, active")
    .eq("active", true)
    .order("price_cents")

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, amount_cents, status, paid_at, period_start, period_end, pdf_url, mp_payment_id")
    .eq("tenant_id", tenantRow.out_tenant_id)
    .order("created_at", { ascending: false })
    .limit(12)

  return {
    tenantId: tenantRow.out_tenant_id,
    billing,
    plans: plans ?? [],
    invoices: invoices ?? [],
  }
}
