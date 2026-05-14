"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { CalendarClock, Loader2, Scissors, User2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useBookingStore } from "@/lib/booking/store"
import { formatCurrencyBR } from "@/lib/format"
import { createPublicBooking, type PublicTenant } from "@/app/actions/booking-public"

export function StepConfirm({ tenant }: { tenant: PublicTenant }) {
  const router = useRouter()
  const { service, barber, slot, customer, setStep, reset } = useBookingStore()
  const [submitting, setSubmitting] = useState(false)

  if (!service || !slot || !barber) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm">
        Volte e complete as etapas anteriores.
      </p>
    )
  }

  const start = new Date(slot.start)

  async function handleConfirm() {
    setSubmitting(true)
    const res = await createPublicBooking({
      tenantSlug: tenant.slug,
      serviceId: service!.id,
      barberId: slot!.barberId, // sempre um barbeiro concreto (mesmo se "sem preferência")
      startsAt: slot!.start,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        notes: customer.notes,
      },
    })
    setSubmitting(false)

    if (!res.ok || !res.bookingId) {
      toast.error(res.error ?? "Não foi possível criar o agendamento.")
      return
    }
    toast.success("Agendamento criado!")
    reset()
    router.push(`/b/${tenant.slug}/confirmacao/${res.bookingId}?token=${res.manageToken}`)
  }

  return (
    <section aria-labelledby="step-confirm-title">
      <h2 id="step-confirm-title" className="text-balance text-xl font-semibold">
        Confirme os detalhes
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Revise antes de confirmar seu agendamento.
      </p>

      <Card className="mt-5">
        <CardContent className="grid gap-4 p-5">
          <Row icon={<Scissors className="h-4 w-4" />} label="Serviço">
            <span className="font-medium">{service.name}</span>
            <span className="text-muted-foreground"> · {service.duration_min} min</span>
          </Row>
          <Row icon={<User2 className="h-4 w-4" />} label="Profissional">
            <span className="font-medium">{barber.name}</span>
          </Row>
          <Row icon={<CalendarClock className="h-4 w-4" />} label="Data e hora">
            <span className="font-medium capitalize">
              {format(start, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </span>
            <span className="text-muted-foreground"> · {format(start, "HH:mm")}</span>
          </Row>
          {tenant.address ? (
            <Row icon={<MapPin className="h-4 w-4" />} label="Local">
              <span>{tenant.address}</span>
            </Row>
          ) : null}

          <Separator />

          <div className="grid gap-1 text-sm">
            <p className="text-muted-foreground">Cliente</p>
            <p className="font-medium">{customer.name}</p>
            <p className="text-muted-foreground">{customer.phone}</p>
            {customer.email ? (
              <p className="text-muted-foreground">{customer.email}</p>
            ) : null}
            {customer.notes ? (
              <p className="mt-1 rounded-md bg-muted p-2 text-xs">{customer.notes}</p>
            ) : null}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold">{formatCurrencyBR(service.price_cents)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => setStep(4)} disabled={submitting}>
          Voltar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={submitting}
          size="lg"
          className="min-w-44"
          style={{ background: "var(--tenant-primary)", color: "white" }}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Confirmando...
            </>
          ) : (
            "Confirmar agendamento"
          )}
        </Button>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Ao confirmar, você concorda com a política de cancelamento do estabelecimento.
      </p>
    </section>
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
