"use client"

import Image from "next/image"
import { Sparkles, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useBookingStore } from "@/lib/booking/store"
import type { PublicBarber } from "@/app/actions/booking-public"

export function StepBarber({ barbers }: { barbers: PublicBarber[] }) {
  const { barber, setBarber, setStep } = useBookingStore()

  return (
    <section aria-labelledby="step-barber-title">
      <h2 id="step-barber-title" className="text-balance text-xl font-semibold">
        Com qual profissional?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Você pode escolher um profissional específico ou deixar a equipe encaixar você no melhor horário.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {/* Sem preferência */}
        <button
          type="button"
          onClick={() => {
            setBarber({ id: null, name: "Sem preferência" })
            setStep(3)
          }}
          aria-pressed={barber?.id === null}
          className="text-left"
        >
          <Card
            className={cn(
              "h-full transition-all",
              barber?.id === null ? "ring-2 ring-offset-2" : "hover:border-foreground/30",
            )}
            style={
              barber?.id === null
                ? { ["--tw-ring-color" as string]: "var(--tenant-primary)" }
                : undefined
            }
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: "var(--tenant-primary)" }}
                aria-hidden="true"
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">Sem preferência</p>
                <p className="truncate text-xs text-muted-foreground">
                  Mais horários disponíveis
                </p>
              </div>
              {barber?.id === null ? <SelectedDot /> : null}
            </CardContent>
          </Card>
        </button>

        {barbers.map((b) => {
          const selected = barber?.id === b.id
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setBarber({ id: b.id, name: b.name, avatar_url: b.avatar_url })
                setStep(3)
              }}
              aria-pressed={selected}
              className="text-left"
            >
              <Card
                className={cn(
                  "h-full transition-all",
                  selected ? "ring-2 ring-offset-2" : "hover:border-foreground/30",
                )}
                style={selected ? { ["--tw-ring-color" as string]: "var(--tenant-primary)" } : undefined}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                    {b.avatar_url ? (
                      <Image
                        src={b.avatar_url || "/placeholder.svg"}
                        alt={b.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                        {b.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{b.name}</p>
                    {b.specialties?.[0] ? (
                      <p className="truncate text-xs text-muted-foreground">{b.specialties[0]}</p>
                    ) : null}
                  </div>
                  {selected ? <SelectedDot /> : null}
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={() => setStep(1)}>
          Voltar
        </Button>
      </div>
    </section>
  )
}

function SelectedDot() {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
      style={{ background: "var(--tenant-primary)" }}
      aria-hidden="true"
    >
      <Check className="h-3.5 w-3.5" />
    </span>
  )
}
