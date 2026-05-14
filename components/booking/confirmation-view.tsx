"use client"

import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import {
  CalendarCheck2,
  CalendarPlus,
  Copy,
  MessageCircle,
  MapPin,
  Settings2,
  Scissors,
  User2,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrencyBR } from "@/lib/format"
import { buildICS, googleCalendarUrl } from "@/lib/booking/ics"
import type { BookingByToken } from "@/app/actions/booking-public"

export function ConfirmationView({
  booking,
  token,
}: {
  booking: BookingByToken
  token: string
}) {
  const start = new Date(booking.starts_at)
  const end = new Date(booking.ends_at)

  const manageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/b/${booking.tenant_slug}/gerenciar/${token}`
      : ""

  const title = `${booking.service_name ?? "Agendamento"} - ${booking.tenant_name}`
  const details = `Profissional: ${booking.barber_name}${booking.notes ? `\nObservações: ${booking.notes}` : ""}`

  function copyManageLink() {
    navigator.clipboard.writeText(manageUrl).then(
      () => toast.success("Link copiado!"),
      () => toast.error("Não foi possível copiar"),
    )
  }

  function downloadICS() {
    const ics = buildICS({
      uid: booking.id,
      title,
      description: details,
      location: booking.tenant_address ?? undefined,
      startISO: booking.starts_at,
      endISO: booking.ends_at,
    })
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `agendamento-${booking.id}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  const gcalHref = googleCalendarUrl({
    title,
    details,
    location: booking.tenant_address ?? undefined,
    startISO: booking.starts_at,
    endISO: booking.ends_at,
  })

  const whatsappHref = booking.tenant_phone
    ? `https://wa.me/${booking.tenant_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Olá! Acabei de agendar ${booking.service_name ?? ""} em ${format(start, "dd/MM 'às' HH:mm")}.`,
      )}`
    : null

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <div className="text-center">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white"
          style={{ background: "var(--tenant-primary)" }}
          aria-hidden="true"
        >
          <CalendarCheck2 className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-balance text-2xl font-bold">Tudo certo!</h1>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          Seu agendamento foi reservado. Salve este link para gerenciar.
        </p>
      </div>

      <Card className="mt-6">
        <CardContent className="grid gap-4 p-5">
          <Row icon={<Scissors className="h-4 w-4" />} label="Serviço">
            <span className="font-medium">{booking.service_name ?? "—"}</span>
          </Row>
          <Row icon={<User2 className="h-4 w-4" />} label="Profissional">
            <span className="font-medium">{booking.barber_name}</span>
          </Row>
          <Row icon={<CalendarCheck2 className="h-4 w-4" />} label="Data e hora">
            <span className="font-medium capitalize">
              {format(start, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </span>
            <span className="text-muted-foreground">
              {" "}
              · {format(start, "HH:mm")} – {format(end, "HH:mm")}
            </span>
          </Row>
          {booking.tenant_address ? (
            <Row icon={<MapPin className="h-4 w-4" />} label="Local">
              <span>{booking.tenant_address}</span>
            </Row>
          ) : null}
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Valor</span>
            <span className="text-lg font-bold">{formatCurrencyBR(booking.total_cents)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Button asChild variant="outline">
          <a href={gcalHref} target="_blank" rel="noreferrer">
            <CalendarPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            Google Calendar
          </a>
        </Button>
        <Button variant="outline" onClick={downloadICS}>
          <CalendarPlus className="mr-2 h-4 w-4" aria-hidden="true" />
          Baixar .ics
        </Button>
        {whatsappHref ? (
          <Button asChild variant="outline">
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
          </Button>
        ) : null}
        <Button variant="outline" onClick={copyManageLink}>
          <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
          Copiar link
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button
          asChild
          className="flex-1"
          style={{ background: "var(--tenant-primary)", color: "white" }}
        >
          <Link href={`/b/${booking.tenant_slug}/gerenciar/${token}`}>
            <Settings2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Gerenciar agendamento
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href={`/b/${booking.tenant_slug}`}>
            <Home className="mr-2 h-4 w-4" aria-hidden="true" />
            Voltar
          </Link>
        </Button>
      </div>
    </main>
  )
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5">{children}</p>
      </div>
    </div>
  )
}
