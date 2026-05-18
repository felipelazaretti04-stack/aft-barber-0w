import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { NotificationChannel, NotificationTemplate, TemplateData, NotificationMessage } from "./types"

function fmtDate(iso: string) {
  try {
    return format(new Date(iso), "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR })
  } catch {
    return iso
  }
}

// ----------------------------------------------------------------
// Cada template retorna subject (email) + body (WhatsApp/texto simples)
// ----------------------------------------------------------------
const TEMPLATES: Record<
  NotificationTemplate,
  (data: TemplateData) => { subject: string; body: string }
> = {
  booking_confirmed: (d) => ({
    subject: `Agendamento confirmado — ${d.tenantName}`,
    body: [
      `Ola, *${d.clientName}*! Seu agendamento na *${d.tenantName}* foi confirmado.`,
      "",
      `Servico: ${d.serviceName}`,
      `Profissional: ${d.barberName}`,
      `Data/hora: ${d.startsAt ? fmtDate(d.startsAt) : "—"}`,
      d.tenantAddress ? `Local: ${d.tenantAddress}` : "",
      d.totalFormatted ? `Valor: ${d.totalFormatted}` : "",
      "",
      d.manageUrl ? `Gerencie seu agendamento: ${d.manageUrl}` : "",
    ]
      .filter((l) => l !== undefined)
      .join("\n")
      .trim(),
  }),

  booking_reminder_24h: (d) => ({
    subject: `Lembrete: seu horario e amanha — ${d.tenantName}`,
    body: [
      `Oi, *${d.clientName}*! Lembrando do seu agendamento amanha.`,
      "",
      `Servico: ${d.serviceName}`,
      `Profissional: ${d.barberName}`,
      `Data/hora: ${d.startsAt ? fmtDate(d.startsAt) : "—"}`,
      d.tenantAddress ? `Local: ${d.tenantAddress}` : "",
      "",
      d.manageUrl ? `Precisa cancelar? Acesse: ${d.manageUrl}` : "",
    ]
      .filter((l) => l !== undefined)
      .join("\n")
      .trim(),
  }),

  booking_cancelled: (d) => ({
    subject: `Agendamento cancelado — ${d.tenantName}`,
    body: [
      `Ola, *${d.clientName}*. Seu agendamento na *${d.tenantName}* foi cancelado.`,
      "",
      `Servico: ${d.serviceName}`,
      `Data/hora: ${d.startsAt ? fmtDate(d.startsAt) : "—"}`,
      "",
      `Para agendar novamente acesse o link da barbearia.`,
    ].join("\n"),
  }),

  otp_code: (d) => ({
    subject: `Seu codigo de verificacao — ${d.tenantName}`,
    body: [
      `Seu codigo de verificacao e: *${d.otpCode}*`,
      "",
      `Valido por ${d.otpExpiresMinutes ?? 10} minutos. Nao compartilhe com ninguem.`,
    ].join("\n"),
  }),
}

export function renderTemplate(
  template: NotificationTemplate,
  channel: NotificationChannel,
  to: string,
  data: TemplateData,
): NotificationMessage {
  const rendered = TEMPLATES[template](data)
  return {
    channel,
    to,
    subject: channel === "email" ? rendered.subject : undefined,
    body: rendered.body,
  }
}
