import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { validateWebhookSignature, getMpSubscription } from "@/lib/mercadopago"
import { sendForBooking, DEFAULT_NOTIFICATION_SETTINGS } from "@/lib/notifications"

// Usa service_role para operações de billing (bypass RLS)
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const STATUS_MAP: Record<string, string> = {
  authorized: "active",
  paused: "suspended",
  cancelled: "canceled",
  pending: "trial",
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

  const type = event.type as string
  const action = event.action as string

  // Mercado Pago envia type = "subscription_preapproval"
  if (type !== "subscription_preapproval" && type !== "payment") {
    return NextResponse.json({ ok: true })
  }

  const supabase = adminClient()

  // ---- Subscription events ----
  if (type === "subscription_preapproval") {
    const subscriptionId = (event.data as { id: string })?.id
    if (!subscriptionId) return NextResponse.json({ ok: true })

    const sub = await getMpSubscription(subscriptionId)
    const tenantId = sub.external_reference ?? null

    if (!tenantId) {
      console.error("[mp-webhook] subscription sem external_reference:", subscriptionId)
      return NextResponse.json({ ok: true })
    }

    // Busca plano pelo mp_plan_id
    const { data: planRow } = await supabase
      .from("plans")
      .select("id, slug")
      .eq("mp_plan_id", sub.plan_id)
      .maybeSingle()

    const tenantStatus = STATUS_MAP[sub.status] ?? sub.status
    const periodEnd = sub.end_date
      ? new Date(sub.end_date)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await supabase.rpc("upsert_billing_info", {
      p_tenant_id: tenantId,
      p_mp_subscription_id: subscriptionId,
      p_mp_customer_id: String(sub.payer_id),
      p_plan_slug: planRow?.slug ?? "free",
      p_status: tenantStatus,
      p_period_start: sub.start_date,
      p_period_end: periodEnd.toISOString(),
    })
  }

  // ---- Payment events ----
  if (type === "payment") {
    const paymentId = (event.data as { id: string })?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      },
    )
    if (!res.ok) return NextResponse.json({ ok: true })
    const payment = await res.json()

    const subscriptionId = payment.preapproval_id as string | null
    if (!subscriptionId) return NextResponse.json({ ok: true })

    // Acha o tenant pelo subscription_id
    const { data: tenantRow } = await supabase
      .from("tenants")
      .select("id")
      .eq("mp_subscription_id", subscriptionId)
      .maybeSingle()

    if (!tenantRow) return NextResponse.json({ ok: true })

    const paymentStatus =
      payment.status === "approved" ? "paid" : payment.status === "pending" ? "pending" : "failed"

    // Upsert invoice
    await supabase.from("invoices").upsert(
      {
        tenant_id: tenantRow.id,
        mp_payment_id: String(paymentId),
        mp_subscription_id: subscriptionId,
        amount_cents: Math.round(payment.transaction_amount * 100),
        status: paymentStatus,
        paid_at: payment.status === "approved" ? new Date().toISOString() : null,
      },
      { onConflict: "mp_payment_id" },
    )
  }

  return NextResponse.json({ ok: true })
}
