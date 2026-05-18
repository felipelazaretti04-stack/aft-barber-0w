import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { send } from "@/lib/notifications"
import type { NotificationChannel } from "@/lib/notifications"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Protege o endpoint com o segredo do cron
function isAuthorized(req: Request): boolean {
  const auth = req.headers.get("authorization")
  const secret = process.env.CRON_SECRET
  if (!secret) return true // dev: sem segredo configurado
  return auth === `Bearer ${secret}`
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createClient()

  // Janela: agendamentos que começam entre 23h e 25h a partir de agora
  const from = new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString()
  const to   = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()

  // Busca agendamentos confirmados/pendentes nessa janela
  // que ainda não têm reminder_24h na notification_queue
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select(`
      id,
      tenant_id,
      client_name,
      client_phone,
      client_email,
      starts_at,
      ends_at,
      total_cents,
      manage_token,
      services:service_id ( name ),
      barbers:barber_id ( name ),
      tenants:tenant_id ( id, name, slug, address, settings:tenant_settings ( settings ) )
    `)
    .gte("starts_at", from)
    .lte("starts_at", to)
    .in("status", ["pending", "confirmed"])

  if (error) {
    console.log("[cron:reminders] query error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!appointments || appointments.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 })
  }

  // Filtra os que já têm entry na queue (evita duplicatas)
  const { data: queued } = await supabase
    .from("notification_queue")
    .select("booking_id")
    .in("booking_id", appointments.map((a) => a.id))
    .eq("template", "booking_reminder_24h")

  const alreadyQueued = new Set((queued ?? []).map((q) => q.booking_id as string))

  let sent = 0
  let skipped = 0

  for (const appt of appointments) {
    if (alreadyQueued.has(appt.id)) { skipped++; continue }

    const tenant = Array.isArray(appt.tenants) ? appt.tenants[0] : appt.tenants
    const service = Array.isArray(appt.services) ? appt.services[0] : appt.services
    const barber  = Array.isArray(appt.barbers)  ? appt.barbers[0]  : appt.barbers

    const channel: NotificationChannel = appt.client_phone ? "whatsapp" : "email"
    const recipient = appt.client_phone ?? appt.client_email
    if (!recipient) { skipped++; continue }

    const manageUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/app/${tenant?.slug}/gerenciar/${appt.manage_token}`

    // Registra na queue primeiro
    await supabase.from("notification_queue").insert({
      tenant_id:    appt.tenant_id,
      booking_id:   appt.id,
      template:     "booking_reminder_24h",
      channel,
      recipient,
      payload: {
        clientName:  appt.client_name,
        tenantName:  tenant?.name,
        serviceName: service?.name,
        barberName:  barber?.name,
        startsAt:    appt.starts_at,
        manageUrl,
      },
      scheduled_at: new Date().toISOString(),
    })

    // Dispara envio
    const result = await send(channel, recipient, "booking_reminder_24h", {
      clientName:  appt.client_name,
      tenantName:  tenant?.name,
      serviceName: service?.name,
      barberName:  barber?.name,
      startsAt:    appt.starts_at,
      manageUrl,
    })

    // Atualiza status na queue
    await supabase
      .from("notification_queue")
      .update({
        status:  result.ok ? "sent" : "failed",
        sent_at: result.ok ? new Date().toISOString() : null,
        error:   result.error ?? null,
        attempts: 1,
      })
      .eq("booking_id", appt.id)
      .eq("template", "booking_reminder_24h")

    if (result.ok) sent++
    else skipped++
  }

  console.log(`[cron:reminders] sent=${sent} skipped=${skipped}`)
  return NextResponse.json({ sent, skipped })
}
