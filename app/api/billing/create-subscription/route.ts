import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const BASE = "https://api.mercadopago.com"

function headers() {
  const token = process.env.MP_ACCESS_TOKEN ?? process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) throw new Error("MP_ACCESS_TOKEN não configurado")
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

/**
 * Cria ou recupera um plano de assinatura no MP com free_trial de 7 dias.
 */
async function getOrCreatePlan(slug: string, name: string, amountCents: number) {
  const externalRef = `${slug}-trial7`

  // Tenta buscar plano existente
  const search = await fetch(
    `${BASE}/preapproval_plan/search?external_reference=${externalRef}&limit=1`,
    { headers: headers() },
  )
  const searchData = await search.json()
  if (searchData.results?.length > 0) {
    return searchData.results[0]
  }

  // Cria novo plano com free_trial
  const payload = {
    reason: `${name} - AFT Barber`,
    external_reference: externalRef,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: amountCents / 100,
      currency_id: "BRL",
      free_trial: {
        frequency: 7,
        frequency_type: "days",
      },
    },
  }

  const res = await fetch(`${BASE}/preapproval_plan`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`MP createPlan error: ${JSON.stringify(err)}`)
  }

  return res.json()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, cardToken, planSlug, planName, priceCents, payerEmail } = body

    if (!tenantId || !cardToken || !planSlug || !planName || !priceCents || !payerEmail) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 },
      )
    }

    // Verifica se o usuario esta autenticado
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // 1. Garante plano com free_trial no MP
    const plan = await getOrCreatePlan(planSlug, planName, priceCents)

    // 2. Cria preapproval com card_token (assinatura ja autorizada)
    const preapprovalPayload = {
      preapproval_plan_id: plan.id,
      payer_email: payerEmail,
      card_token_id: cardToken,
      external_reference: tenantId,
      status: "authorized", // Como temos o card_token, ja fica authorized
    }

    const preapprovalRes = await fetch(`${BASE}/preapproval`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(preapprovalPayload),
    })

    if (!preapprovalRes.ok) {
      const err = await preapprovalRes.json()
      console.error("[MP] createPreapproval error:", err)
      return NextResponse.json(
        { error: err.message || "Erro ao criar assinatura" },
        { status: 400 },
      )
    }

    const preapproval = await preapprovalRes.json()

    // 3. Atualiza tenant no banco
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 7)

    const { error: updateError } = await supabase
      .from("tenants")
      .update({
        status: "trialing",
        mp_subscription_id: preapproval.id,
        mp_preapproval_id: preapproval.id,
        trial_ends_at: trialEndsAt.toISOString(),
      })
      .eq("id", tenantId)

    if (updateError) {
      console.error("[Supabase] tenant update error:", updateError)
    }

    return NextResponse.json({
      success: true,
      subscriptionId: preapproval.id,
      status: preapproval.status,
    })
  } catch (err) {
    console.error("[create-subscription] error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 },
    )
  }
}
