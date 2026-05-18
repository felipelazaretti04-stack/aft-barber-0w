import type {
  NotificationChannel,
  NotificationTemplate,
  TemplateData,
  SendResult,
  TenantNotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "./types"
export type {
  NotificationChannel,
  NotificationTemplate,
  TemplateData,
  SendResult,
  TenantNotificationSettings,
} from "./types"
export { DEFAULT_NOTIFICATION_SETTINGS } from "./types"

import { renderTemplate } from "./templates"
import { ConsoleProvider } from "./providers/console"
import { ResendProvider } from "./providers/resend"
import { ZApiProvider } from "./providers/zapi"
import type { NotificationProvider } from "./types"

// ----------------------------------------------------------------
// Registro de providers por canal
// Troque ConsoleProvider pelos reais quando tiver as credenciais
// ----------------------------------------------------------------
const EMAIL_PROVIDER: NotificationProvider = process.env.RESEND_API_KEY
  ? ResendProvider
  : ConsoleProvider

const WHATSAPP_PROVIDER: NotificationProvider = process.env.ZAPI_INSTANCE_ID
  ? ZApiProvider
  : ConsoleProvider

const PROVIDERS: Record<NotificationChannel, NotificationProvider> = {
  email: EMAIL_PROVIDER,
  whatsapp: WHATSAPP_PROVIDER,
}

// ----------------------------------------------------------------
// Função principal: send
// ----------------------------------------------------------------
export async function send(
  channel: NotificationChannel,
  to: string,
  template: NotificationTemplate,
  data: TemplateData,
): Promise<SendResult> {
  const provider = PROVIDERS[channel]
  const message = renderTemplate(template, channel, to, data)

  try {
    const result = await provider.send(message)
    return { ok: result.ok, channel, provider: provider.name, error: result.error }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error(`[notifications] send failed channel=${channel} template=${template}`, error)
    return { ok: false, channel, provider: provider.name, error }
  }
}

// ----------------------------------------------------------------
// sendForBooking: helper que lê as configurações do tenant e envia
// se o template estiver habilitado para aquele tenant
// ----------------------------------------------------------------
export async function sendForBooking(
  template: NotificationTemplate,
  settings: TenantNotificationSettings | null | undefined,
  recipient: { email?: string | null; phone?: string | null },
  data: TemplateData,
): Promise<SendResult | null> {
  const cfg = settings?.templates?.[template]

  // Template desabilitado para este tenant
  if (cfg && cfg.enabled === false) return null

  const defaultChannel = settings?.defaultChannel ?? "whatsapp"
  const channel: NotificationChannel = cfg?.channel ?? defaultChannel

  const to =
    channel === "email"
      ? recipient.email ?? recipient.phone
      : recipient.phone ?? recipient.email

  if (!to) return null

  return send(channel, to, template, data)
}

// ----------------------------------------------------------------
// queueReminders: enfileira reminder_24h na notification_queue
// Chamado pelo cron job em /api/cron/reminders
// ----------------------------------------------------------------
export async function queueReminders(supabase: {
  from: (table: string) => unknown
}): Promise<number> {
  // Busca agendamentos que começam entre 23h e 25h a partir de agora
  // e que ainda não receberam reminder (sem entrada na queue)
  const db = supabase as {
    from: (table: string) => {
      select: (cols: string) => {
        gte: (col: string, val: string) => {
          lte: (col: string, val: string) => {
            in: (col: string, vals: string[]) => { data: unknown; error: unknown }
          }
        }
      }
      insert: (rows: unknown[]) => { error: unknown }
    }
  }

  const from = new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString()
  const to = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()

  const { data: appointments, error } = await (db
    .from("appointments")
    .select(
      "id, tenant_id, client_name, client_phone, client_email, starts_at, ends_at, total_cents, services(name), barbers(name), tenants(name,address,slug)",
    ) as {
    gte: (col: string, val: string) => {
      lte: (col: string, val: string) => {
        in: (col: string, vals: string[]) => { data: unknown; error: unknown }
      }
    }
  })
    .gte("starts_at", from)
    .lte("starts_at", to)
    .in("status", ["pending", "confirmed"])

  if (error || !appointments) return 0

  const rows = (appointments as { id: string; tenant_id: string; client_phone?: string; client_email?: string }[])

  if (rows.length === 0) return 0

  const queueRows = rows.map((a) => ({
    tenant_id:    a.tenant_id,
    booking_id:   a.id,
    template:     "booking_reminder_24h",
    channel:      a.client_phone ? "whatsapp" : "email",
    recipient:    a.client_phone ?? a.client_email ?? "",
    payload:      a,
    scheduled_at: new Date().toISOString(),
  }))

  await db.from("notification_queue").insert(queueRows)
  return queueRows.length
}
