"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useBookingStore } from "@/lib/booking/store"
import { formatCurrencyBR } from "@/lib/format"
import type { PublicService } from "@/app/actions/booking-public"

export function StepService({ services }: { services: PublicService[] }) {
  const { service, setService, setStep } = useBookingStore()

  if (services.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Este negócio ainda não cadastrou serviços.
      </p>
    )
  }

  return (
    <section aria-labelledby="step-service-title">
      <h2 id="step-service-title" className="text-balance text-xl font-semibold">
        Qual serviço você deseja?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha um serviço para continuar.
      </p>

      <div className="mt-5 grid gap-3">
        {services.map((s) => {
          const selected = service?.id === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setService({
                  id: s.id,
                  name: s.name,
                  duration_min: s.duration_min,
                  price_cents: s.price_cents,
                })
                setStep(2)
              }}
              className="text-left"
              aria-pressed={selected}
            >
              <Card
                className={cn(
                  "transition-all",
                  selected
                    ? "ring-2 ring-offset-2"
                    : "hover:border-foreground/30",
                )}
                style={selected ? { ["--tw-ring-color" as string]: "var(--tenant-primary)" } : undefined}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-medium">{s.name}</h3>
                      {s.category ? (
                        <Badge variant="secondary" className="text-xs">
                          {s.category}
                        </Badge>
                      ) : null}
                    </div>
                    {s.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {s.description}
                      </p>
                    ) : null}
                    <div className="mt-2 flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{s.duration_min} min</span>
                      <span className="font-semibold">{formatCurrencyBR(s.price_cents)}</span>
                    </div>
                  </div>
                  {selected ? (
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ background: "var(--tenant-primary)" }}
                      aria-hidden="true"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : null}
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>
    </section>
  )
}
