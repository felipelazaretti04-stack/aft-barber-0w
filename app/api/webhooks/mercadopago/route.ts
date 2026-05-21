import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { validateWebhookSignature } from "@/lib/mercadopago"

// Service role: bypass RLS para operações de billing
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function logWebhookEvent(
  supabase: ReturnType<typeof adminClient>,
  opts: {
    type: string
    action: string
    resource_id: string
    payload: unknown
    error?: string
  },
) {
  await supabase.from("webhook_audit_log").insert({
    source:      "mercadopago",
    event_type:  opts.type,
    event_action: opts.action,
    resource_id: opts.resource_id,
    payload:     opts.payload,
    error:       opts.error ?? null,
    processed_at: new Date().toISOString(),
  })
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get("x-signature")

  if (!validateWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const type   = (event.type   as string) ?? ""
  const action = (event.action as string) ?? ""
  const dataId = (event.data as { id?: string })?.id ?? ""

  const supabase = adminClient()

  // ─── PREAPPROVAL (subscription) ─────────────────────────────────────────
  if (type === "subscription_preapproval") {
    try {
      const res = await fetch(`https://api.mercadopago.com/preapproval/${dataId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      })
      if (!res.ok) throw new Error(`MP preapproval fetch error: ${res.status}`)
      const sub = await res.json()

      const tenantIdByRef: string | null = sub.external_reference ?? null
      const preapprovalId: string = sub.id

      // Tenta encontrar tenant pelo external_reference ou pelo mp_preapproval_id
      const { data: tenantRow } = tenantIdByRef
        ? await supabase.from("tenants").select("id").eq("id", tenantIdByRef).maybeSingle()
        : await supabase.from("tenants").select("id").eq("mp_preapproval_id", preapprovalId).maybeSingle()

      const tenantId: string | null = tenantRow?.id ?? tenantIdByRef

      if (!tenantId) {
        await logWebhookEvent(supabase, { type, action, resource_id: dataId, payload: sub, error: "tenant_not_found" })
        return NextResponse.json({ ok: true })
      }

      // Salva preapproval_id caso ainda não esteja
      await supabase
        .from("tenants")
        .update({ mp_preapproval_id: preapprovalId })
        .eq("id", tenantId)
        .is("mp_preapproval_id", null)

      if (sub.status === "authorized") {
        // Cartão validado → muda para trialing (7 dias grátis ativos)
        const { error } = await supabase.rpc("authorize_tenant_card", {
          p_mp_preapproval_id: preapprovalId,
        })
        if (error) throw error

        await logWebhookEvent(supabase, { type, action: "authorized", resource_id: dataId, payload: sub })

      } else if (sub.status === "cancelled") {
        // Assinatura cancelada → bloquear tenant
        await supabase
          .from("tenants")
          .update({ status: "blocked" })
          .eq("id", tenantId)

        await logWebhookEvent(supabase, { type, action: "cancelled", resource_id: dataId, payload: sub })
      } else {
        await logWebhookEvent(supabase, { type, action: sub.status, resource_id: dataId, payload: sub })
      }

    } catch (err) {
      console.error("[mp-webhook] preapproval error:", err)
      await logWebhookEvent(supabase, { type, action, resource_id: dataId, payload: event, error: String(err) })
    }

    return NextResponse.json({ ok: true })
  }

  // ─── PAYMENT ────────────────────────────────────────────────────────────
  if (type === "payment") {
    try {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      })
      if (!res.ok) throw new Error(`MP payment fetch error: ${res.status}`)
      const payment = await res.json()

      const preapprovalId: string | null = payment.preapproval_id ?? null
      if (!preapprovalId) {
        return NextResponse.json({ ok: true })
      }

      // Acha tenant pelo preapproval_id
      const { data: tenantRow } = await supabase
        .from("tenants")
        .select("id")
        .eq("mp_preapproval_id", preapprovalId)
        .maybeSingle()

      const tenantId: string | null = tenantRow?.id ?? null
      if (!tenantId) {
        await logWebhookEvent(supabase, { type, action, resource_id: dataId, payload: payment, error: "tenant_not_found" })
        return NextResponse.json({ ok: true })
      }

      if (payment.status === "approved") {
        // Pagamento aprovado → ativa tenant
        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        const { error } = await supabase.rpc("activate_tenant", {
          p_mp_subscription_id: preapprovalId,
          p_period_end: periodEnd.toISOString(),
        })
        if (error) throw error

        // Upsert invoice — idempotente via mp_payment_id
        await supabase.from("invoices").upsert(
          {
            tenant_id:          tenantId,
            mp_payment_id:      String(dataId),
            mp_subscription_id: preapprovalId,
            amount_cents:       Math.round(payment.transaction_amount * 100),
            status:             "paid",
            paid_at:            new Date().toISOString(),
          },
          { onConflict: "mp_payment_id" },
        )

        await logWebhookEvent(supabase, { type, action: "payment.approved", resource_id: dataId, payload: payment })

      } else if (payment.status === "rejected") {
        // Pagamento rejeitado → período de graça de 3 dias
        const { error } = await supabase.rpc("apply_grace_period", {
          p_tenant_id: tenantId,
        })
        if (error) throw error

        await supabase.from("invoices").upsert(
          {
            tenant_id:          tenantId,
            mp_payment_id:      String(dataId),
            mp_subscription_id: preapprovalId,
            amount_cents:       Math.round(payment.transaction_amount * 100),
            status:             "failed",
            paid_at:            null,
          },
          { onConflict: "mp_payment_id" },
        )

        await logWebhookEvent(supabase, { type, action: "payment.rejected", resource_id: dataId, payload: payment })

      } else {
        await logWebhookEvent(supabase, { type, action: `payment.${payment.status}`, resource_id: dataId, payload: payment })
      }

    } catch (err) {
      console.error("[mp-webhook] payment error:", err)
      await logWebhookEvent(supabase, { type, action, resource_id: dataId, payload: event, error: String(err) })
    }

    return NextResponse.json({ ok: true })
  }

  // Evento desconhecido — apenas loga e retorna 200 (evita retry infinito do MP)
  await logWebhookEvent(supabase, { type, action, resource_id: dataId, payload: event })
  return NextResponse.json({ ok: true })
}
