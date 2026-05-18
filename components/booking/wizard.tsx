"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useBookingStore, type WizardStep } from "@/lib/booking/store"
import type {
  PublicTenant,
  PublicService,
  PublicBarber,
} from "@/app/actions/booking-public"
import { StepService } from "./step-service"
import { StepBarber } from "./step-barber"
import { StepDateTime } from "./step-datetime"
import { StepCustomer } from "./step-customer"
import { StepConfirm } from "./step-confirm"

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 1, label: "Serviço" },
  { id: 2, label: "Profissional" },
  { id: 3, label: "Data" },
  { id: 4, label: "Dados" },
  { id: 5, label: "Confirmar" },
]

interface Props {
  tenant: PublicTenant
  services: PublicService[]
  barbers: PublicBarber[]
  initialServiceId?: string
  initialBarberId?: string
  initialSlot?: string
}

export function BookingWizard({
  tenant,
  services,
  barbers,
  initialServiceId,
  initialBarberId,
  initialSlot,
}: Props) {
  const {
    step,
    setStep,
    setTenantSlug,
    service,
    setService,
    setBarber,
    setSlot,
    tenantSlug,
    reset,
  } = useBookingStore()

  // Sincroniza tenant e pré-seleção via querystring
  useEffect(() => {
    if (tenantSlug !== tenant.slug) {
      reset()
      setTenantSlug(tenant.slug)
    }
  }, [tenant.slug, tenantSlug, setTenantSlug, reset])

  useEffect(() => {
    let targetStep: 1 | 2 | 3 = 1
    let resolvedService: typeof service = null
    let resolvedBarber: { id: string | null; name: string; avatar_url?: string | null } | null = null

    if (initialServiceId) {
      const s = services.find((x) => x.id === initialServiceId)
      if (s) {
        resolvedService = {
          id: s.id,
          name: s.name,
          duration_min: s.duration_min,
          price_cents: s.price_cents,
        }
        setService(resolvedService)
        targetStep = 2
      }
    }

    if (initialBarberId) {
      const b = barbers.find((x) => x.id === initialBarberId)
      if (b) {
        resolvedBarber = { id: b.id, name: b.name, avatar_url: b.avatar_url }
        setBarber(resolvedBarber)
        // Se serviço também foi pré-selecionado, pula direto para data/hora
        if (resolvedService) targetStep = 3
      }
    }

    // Pré-seleciona slot se vier da página do profissional
    if (initialSlot && resolvedBarber?.id) {
      const slotStart = initialSlot
      const durationMin = resolvedService?.duration_min ?? 30
      const slotEnd = new Date(
        new Date(slotStart).getTime() + durationMin * 60_000,
      ).toISOString()
      setSlot({ start: slotStart, end: slotEnd, barberId: resolvedBarber.id })
      if (resolvedService) targetStep = 3
    }

    if (targetStep > 1) setStep(targetStep)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialServiceId, initialBarberId, initialSlot])

  const progress = (step / STEPS.length) * 100

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 py-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/app/${tenant.slug}`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {tenant.name}
          </Link>
        </Button>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          Etapa {step} de {STEPS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "var(--tenant-primary)" }}
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-label={`Etapa ${step} de ${STEPS.length}`}
          />
        </div>
        <ol className="mt-3 grid grid-cols-5 gap-1 text-[10px] font-medium uppercase tracking-wide sm:text-xs">
          {STEPS.map((s) => {
            const done = step > s.id
            const current = step === s.id
            return (
              <li
                key={s.id}
                className={cn(
                  "flex items-center justify-center gap-1 truncate",
                  current ? "text-foreground" : done ? "text-foreground/80" : "text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
                ) : (
                  <span
                    className={cn(
                      "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
                      current ? "bg-foreground" : "bg-muted-foreground/40",
                    )}
                    aria-hidden="true"
                  />
                )}
                <span className="truncate">{s.label}</span>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Step content */}
      <div className="mt-6">
        {step === 1 && <StepService services={services} />}
        {step === 2 && <StepBarber barbers={barbers} />}
        {step === 3 && <StepDateTime tenant={tenant} />}
        {step === 4 && <StepCustomer />}
        {step === 5 && <StepConfirm tenant={tenant} />}
      </div>
    </main>
  )
}
