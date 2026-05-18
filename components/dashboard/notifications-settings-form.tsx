"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2, Mail, MessageSquare, Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { saveNotificationSettings } from "@/app/actions/notification-settings"
import type { TenantNotificationSettings, NotificationTemplate, NotificationChannel } from "@/lib/notifications"

const TEMPLATE_META: Record<
  NotificationTemplate,
  { label: string; description: string; icon: React.ReactNode }
> = {
  booking_confirmed: {
    label: "Agendamento confirmado",
    description: "Enviado ao cliente logo após criar um agendamento.",
    icon: <Bell className="h-4 w-4" aria-hidden="true" />,
  },
  booking_reminder_24h: {
    label: "Lembrete 24h antes",
    description: "Enviado automaticamente 24 horas antes do horário.",
    icon: <Bell className="h-4 w-4" aria-hidden="true" />,
  },
  booking_cancelled: {
    label: "Agendamento cancelado",
    description: "Enviado quando o agendamento é cancelado pelo cliente.",
    icon: <BellOff className="h-4 w-4" aria-hidden="true" />,
  },
  otp_code: {
    label: "Código de verificação (OTP)",
    description: "Código para o cliente acessar o gerenciamento do agendamento.",
    icon: <MessageSquare className="h-4 w-4" aria-hidden="true" />,
  },
}

const CHANNEL_OPTIONS: { value: NotificationChannel; label: string; icon: React.ReactNode }[] = [
  { value: "whatsapp", label: "WhatsApp", icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { value: "email",    label: "E-mail",   icon: <Mail className="h-3.5 w-3.5" /> },
]

interface Props {
  tenantId: string
  initialSettings: TenantNotificationSettings
}

export function NotificationsSettingsForm({ tenantId, initialSettings }: Props) {
  const [settings, setSettings] = useState<TenantNotificationSettings>(initialSettings)
  const [isPending, startTransition] = useTransition()

  function setDefaultChannel(channel: NotificationChannel) {
    setSettings((s) => ({ ...s, defaultChannel: channel }))
  }

  function setTemplateEnabled(template: NotificationTemplate, enabled: boolean) {
    setSettings((s) => ({
      ...s,
      templates: {
        ...s.templates,
        [template]: { ...s.templates[template], enabled },
      },
    }))
  }

  function setTemplateChannel(template: NotificationTemplate, channel: NotificationChannel) {
    setSettings((s) => ({
      ...s,
      templates: {
        ...s.templates,
        [template]: { ...s.templates[template], channel },
      },
    }))
  }

  function handleSave() {
    startTransition(async () => {
      const res = await saveNotificationSettings(tenantId, settings)
      if (!res.ok) {
        toast.error(res.error ?? "Erro ao salvar configurações")
        return
      }
      toast.success("Configurações salvas")
    })
  }

  return (
    <div className="space-y-6">
      {/* Canal padrão */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Canal padrão</CardTitle>
          <CardDescription>
            Canal utilizado quando o template não tem canal específico configurado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {CHANNEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDefaultChannel(opt.value)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  settings.defaultChannel === opt.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                {opt.icon}
                {opt.label}
                {settings.defaultChannel === opt.value && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    Padrão
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Templates de mensagem</CardTitle>
          <CardDescription>
            Ative ou desative cada tipo de notificação e escolha o canal de envio.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {(Object.keys(TEMPLATE_META) as NotificationTemplate[]).map((key) => {
            const meta = TEMPLATE_META[key]
            const cfg = settings.templates[key]
            const effectiveChannel = cfg?.channel ?? settings.defaultChannel

            return (
              <div key={key} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    {meta.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-none">{meta.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pl-11 sm:pl-0">
                  {/* Selector de canal (só visível se habilitado) */}
                  {cfg?.enabled !== false && (
                    <Select
                      value={effectiveChannel}
                      onValueChange={(v) => setTemplateChannel(key, v as NotificationChannel)}
                    >
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHANNEL_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            <span className="flex items-center gap-1.5">
                              {opt.icon}
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <div className="flex items-center gap-2">
                    <Switch
                      id={`toggle-${key}`}
                      checked={cfg?.enabled !== false}
                      onCheckedChange={(v) => setTemplateEnabled(key, v)}
                    />
                    <Label htmlFor={`toggle-${key}`} className="sr-only">
                      {meta.label}
                    </Label>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          Salvar configurações
        </Button>
      </div>
    </div>
  )
}
