"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { addDays, format, isSameDay, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useBookingStore } from "@/lib/booking/store"
import { getAvailableSlots, type PublicTenant, type SlotRow } from "@/app/actions/booking-public"

function generateDays(from: Date, days: number) {
  return Array.from({ length: days }, (_, i) => addDays(from, i))
}

export function StepDateTime({ tenant }: { tenant: PublicTenant }) {
  const { service, barber, date, slot, setDate, setSlot, setStep } = useBookingStore()
  const [weekStart, setWeekStart] = useState<Date>(() => startOfDay(new Date()))
  const [slots, setSlots] = useState<SlotRow[]>([])
  const [loading, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const maxDate = useMemo(
    () => addDays(startOfDay(new Date()), tenant.max_advance_days),
    [tenant.max_advance_days],
  )
  const minDate = startOfDay(new Date())

  const days = useMemo(() => generateDays(weekStart, 7), [weekStart])

  const selectedDate = date ? new Date(date + "T00:00:00") : null

  // Default: seleciona hoje se nada foi selecionado
  useEffect(() => {
    if (!date && service && barber) {
      const today = format(new Date(), "yyyy-MM-dd")
      setDate(today)
    }
  }, [date, service, barber, setDate])

  // Carrega slots quando data muda
  useEffect(() => {
    if (!date || !service) return
    setError(null)
    startTransition(async () => {
      try {
        const data = await getAvailableSlots({
          tenantId: tenant.id,
          serviceId: service.id,
          barberId: barber?.id ?? null,
          date,
        })
        setSlots(data)
      } catch (e) {
        setError("Não foi possível carregar os horários. Tente novamente.")
        setSlots([])
      }
    })
  }, [date, service, barber, tenant.id])

  if (!service) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm">
        Selecione um serviço primeiro.
      </p>
    )
  }

  // Quando "sem preferência", agrupamos slots por horário (assumindo qualquer barbeiro)
  const groupedSlots = useMemo(() => {
    if (barber?.id) return slots
    const seen = new Map<string, SlotRow>()
    for (const s of slots) {
      if (!seen.has(s.slot_start)) seen.set(s.slot_start, s)
    }
    return Array.from(seen.values())
  }, [slots, barber?.id])

  const canPrev = weekStart > minDate
  const canNext = addDays(weekStart, 7) <= maxDate

  return (
    <section aria-labelledby="step-datetime-title">
      <h2 id="step-datetime-title" className="text-balance text-xl font-semibold">
        Quando você quer ir?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha um dia e um horário disponível.
      </p>

      {/* Strip de dias */}
      <div className="mt-5 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          disabled={!canPrev}
          aria-label="Semana anterior"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div className="grid flex-1 grid-cols-7 gap-1.5">
          {days.map((d) => {
            const disabled = d < minDate || d > maxDate
            const isSel = selectedDate && isSameDay(d, selectedDate)
            return (
              <button
                key={d.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => setDate(format(d, "yyyy-MM-dd"))}
                className={cn(
                  "flex flex-col items-center rounded-lg border px-1 py-2 text-xs transition-colors",
                  disabled
                    ? "cursor-not-allowed opacity-40"
                    : "hover:border-foreground/40",
                  isSel && "border-transparent text-white",
                )}
                style={
                  isSel
                    ? { background: "var(--tenant-primary)" }
                    : undefined
                }
                aria-pressed={!!isSel}
              >
                <span className="text-[10px] uppercase">
                  {format(d, "EEE", { locale: ptBR }).slice(0, 3)}
                </span>
                <span className="text-base font-semibold">{format(d, "d")}</span>
                <span className="text-[10px] capitalize">
                  {format(d, "MMM", { locale: ptBR })}
                </span>
              </button>
            )
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          disabled={!canNext}
          aria-label="Próxima semana"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Slots */}
      <div className="mt-6">
        <h3 className="text-sm font-medium">Horários disponíveis</h3>
        <div className="mt-3 min-h-32">
          {loading ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </p>
          ) : groupedSlots.length === 0 ? (
            <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed p-8 text-center">
              <Loader2 className="hidden h-4 w-4 animate-spin" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Nenhum horário disponível neste dia.
              </p>
              <p className="text-xs text-muted-foreground">Tente outra data.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {groupedSlots.map((s) => {
                const isSel = slot?.start === s.slot_start
                return (
                  <button
                    key={s.slot_start + s.barber_id}
                    type="button"
                    onClick={() =>
                      setSlot({
                        start: s.slot_start,
                        end: s.slot_end,
                        barberId: s.barber_id,
                      })
                    }
                    aria-pressed={isSel}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      isSel
                        ? "border-transparent text-white"
                        : "hover:border-foreground/40",
                    )}
                    style={isSel ? { background: "var(--tenant-primary)" } : undefined}
                  >
                    {format(new Date(s.slot_start), "HH:mm")}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep(2)}>
          Voltar
        </Button>
        <Button
          onClick={() => setStep(4)}
          disabled={!slot}
          style={{ background: "var(--tenant-primary)", color: "white" }}
        >
          Continuar
        </Button>
      </div>
    </section>
  )
}
