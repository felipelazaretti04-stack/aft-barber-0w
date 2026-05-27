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

/** Cria ou recupera um plano de assinatura no MP */
export async function getOrCreateMpPlan(
  slug: string,
  name: string,
  amountCents: number,
): Promise<MpPlan> {
  // Tenta buscar por external_reference = slug
  const search = await fetch(
    `${BASE}/preapproval_plan/search?external_reference=${slug}&limit=1`,
    { headers: headers() },
  )
  const searchData = await search.json()
  if (searchData.results?.length > 0) return searchData.results[0] as MpPlan

  // Cria novo plano
  const res = await fetch(`${BASE}/preapproval_plan`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      reason: name,
      external_reference: slug,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: amountCents / 100,
        currency_id: "BRL",
      },
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(`MP createPlan error: ${JSON.stringify(err)}`)
  }
  return res.json() as Promise<MpPlan>
}

/** Gera link de checkout para o cliente assinar */
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
 * Cria um Preapproval (trial + assinatura recorrente) no MP.
 * O cartão é cadastrado mas NÃO cobrado até start_date (trial de 7 dias).
 */
export async function createPreapproval(opts: {
  tenantId: string
  planSlug: string
  planName: string
  amountCents: number
  payerEmail: string
  backUrl: string
}): Promise<{ id: string; init_point: string }> {
  const res = await fetch(`${BASE}/preapproval`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      reason: `Assinatura ${opts.planName} - AFT Barber`,
      external_reference: opts.tenantId,
      payer_email: opts.payerEmail,
      back_url: opts.backUrl,
      status: "pending",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: opts.amountCents / 100,
        currency_id: "BRL",
        free_trial: {
          frequency: 7,
          frequency_type: "days",
        },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`MP createPreapproval error: ${JSON.stringify(err)}`)
  }

  const data = await res.json()
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
