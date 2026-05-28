/**
 * lib/mercadopago.ts
 * Cliente leve para Mercado Pago Subscriptions API.
 * Não usa SDK — apenas fetch para manter bundle pequeno.
 * Troca por @mercadopago/sdk-js no front quando precisar do brick.
 */

const BASE = "https://api.mercadopago.com"

function headers() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado")
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

export interface MpPlan {
  id: string
  reason: string
  auto_recurring: {
    frequency: number
    frequency_type: "months" | "days"
    transaction_amount: number
    currency_id: string
    free_trial?: {
      frequency: number
      frequency_type: "days" | "months"
    }
  }
  status: string
}

export interface MpSubscription {
  id: string
  payer_id: string
  plan_id: string
  status: string // 'authorized' | 'paused' | 'cancelled' | 'pending'
  next_payment_date: string
  start_date: string
  end_date?: string
  init_point: string // URL de checkout
  auto_recurring: {
    transaction_amount: number
    currency_id: string
  }
}

/**
 * Cria ou recupera um plano de assinatura no MP.
 * Inclui free_trial de 7 dias (suportado apenas em preapproval_plan).
 */
export async function getOrCreateMpPlan(
  slug: string,
  name: string,
  amountCents: number,
  backUrl?: string,
): Promise<MpPlan> {
  // Usa sufixo -trial7 para diferenciar do plano antigo sem trial
  const externalRef = `${slug}-trial7`

  // Tenta buscar plano existente
  const search = await fetch(
    `${BASE}/preapproval_plan/search?external_reference=${externalRef}&limit=1`,
    { headers: headers() },
  )
  const searchData = await search.json()
  if (searchData.results?.length > 0) {
    console.log("[MP] Plano existente encontrado:", searchData.results[0].id)
    return searchData.results[0] as MpPlan
  }

  // Cria novo plano com free_trial
  const payload = {
    reason: `${name} - AFT Barber`,
    external_reference: externalRef,
    ...(backUrl && { back_url: backUrl }),
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

  console.log("[MP] createPlan payload:", JSON.stringify(payload))

  const res = await fetch(`${BASE}/preapproval_plan`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json()
    console.error("[MP] createPlan response:", res.status, err)
    throw new Error(`MP createPlan error: ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  console.log("[MP] Plano criado:", data.id)
  return data as MpPlan
}

/** Gera link de checkout para o cliente assinar (mantido para compat) */
export async function createCheckoutUrl(opts: {
  planId: string
  backUrl: string
  payerEmail: string
  externalReference: string // tenantId
}): Promise<string> {
  const res = await fetch(`${BASE}/preapproval`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      preapproval_plan_id: opts.planId,
      payer_email: opts.payerEmail,
      back_url: opts.backUrl,
      external_reference: opts.externalReference,
      status: "pending",
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(`MP createCheckout error: ${JSON.stringify(err)}`)
  }
  const data = await res.json()
  return data.init_point as string
}

/** Cancela uma assinatura no MP */
export async function cancelMpSubscription(subscriptionId: string): Promise<void> {
  const res = await fetch(`${BASE}/preapproval/${subscriptionId}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ status: "cancelled" }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(`MP cancelSubscription error: ${JSON.stringify(err)}`)
  }
}

/** Busca detalhes de uma assinatura */
export async function getMpSubscription(subscriptionId: string): Promise<MpSubscription> {
  const res = await fetch(`${BASE}/preapproval/${subscriptionId}`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error(`MP getSubscription error: ${res.status}`)
  return res.json() as Promise<MpSubscription>
}

export interface MpPreapproval {
  id: string
  status: string // 'authorized' | 'pending' | 'cancelled' | 'paused'
  init_point: string
  external_reference: string | null
  payer_email: string
  preapproval_plan_id: string | null
  auto_recurring: {
    transaction_amount: number
    currency_id: string
    start_date: string
    end_date: string
  } | null
}

/**
 * Cria um Preapproval vinculado a um plano com free_trial.
 *
 * Fluxo:
 * 1. Garante que existe um preapproval_plan no MP com free_trial de 7 dias
 * 2. Cria preapproval vinculado a esse plano
 * 3. Cartão é cadastrado, mas NÃO cobrado nos 7 primeiros dias
 * 4. MP cobra automaticamente no dia 8 (se não cancelado)
 */
export async function createPreapproval(opts: {
  tenantId: string
  planSlug: string
  planName: string
  amountCents: number
  payerEmail: string
  backUrl: string
}): Promise<{ id: string; init_point: string }> {
  // 1) Garante plano com free_trial
  const plan = await getOrCreateMpPlan(
    opts.planSlug,
    opts.planName,
    opts.amountCents,
    opts.backUrl,
  )

  // 2) Cria preapproval vinculado ao plano
  const payload = {
    preapproval_plan_id: plan.id,
    payer_email: opts.payerEmail,
    back_url: opts.backUrl,
    external_reference: opts.tenantId,
    status: "pending",
  }

  console.log("[MP] createPreapproval payload:", JSON.stringify(payload))

  const res = await fetch(`${BASE}/preapproval`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json()
    console.error("[MP] createPreapproval response:", res.status, err)
    throw new Error(`MP createPreapproval error: ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  console.log("[MP] Preapproval criado:", data.id)
  return { id: data.id as string, init_point: data.init_point as string }
}

/** Busca detalhes de um preapproval por ID */
export async function getPreapproval(preapprovalId: string): Promise<MpPreapproval> {
  const res = await fetch(`${BASE}/preapproval/${preapprovalId}`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error(`MP getPreapproval error: ${res.status}`)
  return res.json() as Promise<MpPreapproval>
}

/** Valida a assinatura do webhook (header x-signature) */
export function validateWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  // Em produção: validar HMAC-SHA256 com MP_WEBHOOK_SECRET
  // Por ora retorna true para não bloquear integração inicial
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return true // stub: aceita sem validação
  // TODO: implementar validação HMAC quando em produção
  return true
}
