"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { ArrowLeft, CalendarX, Loader2, Scissors, User2, CalendarClock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cancelBookingByToken, type BookingByToken } from "@/app/actions/booking-public"
import { formatCurrencyBR } from "@/lib/format"

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Aguardando confirmação", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  in_progress: { label: "Em atendimento", variant: "default" },
  completed: { label: "Concluído", variant: "outline" },
  no_show: { label: "Não compareceu", variant: "destructive" },
  canceled: { label: "Cancelado", variant: "destructive" },
}

export function ManageBookingView({
  booking,
  token,
}: {
  booking: BookingByToken
  token: string
}) {
  const router = useRouter()
  const [canceling, setCanceling] = useState(false)

  const start = new Date(booking.starts_at)
  const end = new Date(booking.ends_at)
  const status = STATUS_LABEL[booking.status] ?? { label: booking.status, variant: "secondary" as const }
  const isCanceled = booking.status === "canceled"
  const isPast = new Date(booking.ends_at) < new Date()

  async function handleCancel() {
    setCanceling(true)
    const res = await cancelBookingByToken(token)
    setCanceling(false)
    if (!res.ok) {
      toast.error(res.error ?? "Não foi possível cancelar")
      return
    }
    toast.success("Agendamento cancelado")
    router.refresh()
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-4">
      <div className="flex items-center justify-between py-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/app/${booking.tenant_slug}`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {booking.tenant_name}
          </Link>
        </Button>
      </div>

      <div className="mt-2">
        <h1 className="text-balance text-2xl font-bold">Gerenciar agendamento</h1>
        <div className="mt-2">
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </div>

      <Card className="mt-5">
        <CardContent className="grid gap-4 p-5">
          <Row icon={<Scissors className="h-4 w-4" />} label="Serviço">
            <span className="font-medium">{booking.service_name ?? "—"}</span>
          </Row>
          <Row icon={<User2 className="h-4 w-4" />} label="Profissional">
            <span className="font-medium">{booking.barber_name}</span>
          </Row>
          <Row icon={<CalendarClock className="h-4 w-4" />} label="Data e hora">
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

          <div className="grid gap-1 text-sm">
            <p className="text-muted-foreground">Cliente</p>
            <p className="font-medium">{booking.client_name}</p>
            {booking.client_phone ? (
              <p className="text-muted-foreground">{booking.client_phone}</p>
            ) : null}
            {booking.notes ? (
              <p className="mt-1 rounded-md bg-muted p-2 text-xs">{booking.notes}</p>
            ) : null}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Valor</span>
            <span className="text-lg font-bold">{formatCurrencyBR(booking.total_cents)}</span>
          </div>
        </CardContent>
      </Card>

      {!isCanceled && !isPast ? (
        <div className="mt-6 grid gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={canceling}>
                {canceling ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CalendarX className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                Cancelar agendamento
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar este agendamento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Você precisará agendar novamente caso mude de
                  ideia.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Voltar</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>Cancelar agendamento</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button asChild variant="outline">
            <Link href={`/app/${booking.tenant_slug}/agendar`}>
              Reagendar (criar novo)
            </Link>
          </Button>
        </div>
      ) : isCanceled ? (
        <p className="mt-6 rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Este agendamento foi cancelado.
        </p>
      ) : (
        <p className="mt-6 rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Este agendamento já passou.
        </p>
      )}
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
