// Canais de entrega
export type NotificationChannel = "email" | "whatsapp"

// Templates disponíveis
export type NotificationTemplate =
  | "booking_confirmed"
  | "booking_reminder_24h"
  | "booking_cancelled"
  | "otp_code"

// Dados contextuais passados ao template
export interface TemplateData {
  // Dados comuns
  clientName?: string
  tenantName?: string
  tenantAddress?: string
  tenantPhone?: string
  // Agendamento
  serviceName?: string
  barberName?: string
  startsAt?: string   // ISO string
  endsAt?: string
  totalFormatted?: string
  manageUrl?: string
  // OTP
  otpCode?: string
  otpExpiresMinutes?: number
  // Extras livres
  [key: string]: unknown
}

// Mensagem já renderizada para envio
export interface NotificationMessage {
  channel: NotificationChannel
  to: string          // phone ou email
  subject?: string    // só email
  body: string        // texto plano ou HTML
  bodyText?: string   // fallback texto para email HTML
}

// Interface do provider de envio
export interface NotificationProvider {
  name: string
  send(msg: NotificationMessage): Promise<{ ok: boolean; error?: string }>
}

// Resultado do envio
export interface SendResult {
  ok: boolean
  channel: NotificationChannel
  provider: string
  error?: string
}

// Configuração de notificações salva em tenant_settings.notifications
export interface TenantNotificationSettings {
  defaultChannel: NotificationChannel
  templates: Record<
    NotificationTemplate,
    {
      enabled: boolean
      channel?: NotificationChannel // sobrescreve defaultChannel
    }
  >
}

export const DEFAULT_NOTIFICATION_SETTINGS: TenantNotificationSettings = {
  defaultChannel: "whatsapp",
  templates: {
    booking_confirmed:    { enabled: true },
    booking_reminder_24h: { enabled: true },
    booking_cancelled:    { enabled: true },
    otp_code:             { enabled: true },
  },
}
