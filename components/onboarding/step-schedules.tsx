"use client"

import { useOnboardingStore } from "@/lib/onboarding/store"
import { WEEKDAYS, type ScheduleItem } from "@/lib/onboarding/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  userName: string
}

export function StepSchedules({ userName }: Props) {
  const { schedules, setSchedules, barberName, setBarberName, setStep } =
    useOnboardingStore()

  const updateSchedule = (weekday: number, updates: Partial<ScheduleItem>) => {
    setSchedules(
      schedules.map((s) =>
        s.weekday === weekday ? { ...s, ...updates } : s
      )
    )
  }

  const hasAnyEnabled = schedules.some((s) => s.enabled)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Horários de Funcionamento</h2>
        <p className="text-sm text-muted-foreground">
          Configure os dias e horários que você atende.
        </p>
      </div>

      {/* Nome do profissional */}
      <div>
        <Label htmlFor="barber-name">Seu Nome (como profissional)</Label>
        <Input
          id="barber-name"
          placeholder="Ex: João Silva"
          value={barberName}
          onChange={(e) => setBarberName(e.target.value)}
          className="mt-1 max-w-sm"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Este nome aparecerá para seus clientes ao agendar
        </p>
      </div>

      {/* Grid de horários */}
      <div className="space-y-3">
        {WEEKDAYS.map((day) => {
          const schedule = schedules.find((s) => s.weekday === day.value)!
          return (
            <Card
              key={day.value}
              className={cn(
                "p-4 transition-colors",
                !schedule.enabled && "bg-muted/50"
              )}
            >
              <div className="flex flex-wrap items-center gap-4">
                {/* Toggle + Nome do dia */}
                <div className="flex items-center gap-3 min-w-[140px]">
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={(enabled) =>
                      updateSchedule(day.value, { enabled })
                    }
                  />
                  <span
                    className={cn(
                      "font-medium",
                      !schedule.enabled && "text-muted-foreground"
                    )}
                  >
                    {day.label}
                  </span>
                </div>

                {/* Horários */}
                {schedule.enabled && (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Input
                        type="time"
                        value={schedule.starts_at}
                        onChange={(e) =>
                          updateSchedule(day.value, { starts_at: e.target.value })
                        }
                        className="w-28 h-9"
                      />
                      <span className="text-muted-foreground">às</span>
                      <Input
                        type="time"
                        value={schedule.ends_at}
                        onChange={(e) =>
                          updateSchedule(day.value, { ends_at: e.target.value })
                        }
                        className="w-28 h-9"
                      />
                    </div>

                    {/* Intervalo */}
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-xs text-muted-foreground">Intervalo:</span>
                      <Input
                        type="time"
                        value={schedule.break_starts_at || ""}
                        onChange={(e) =>
                          updateSchedule(day.value, {
                            break_starts_at: e.target.value,
                          })
                        }
                        className="w-24 h-9"
                        placeholder="--:--"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={schedule.break_ends_at || ""}
                        onChange={(e) =>
                          updateSchedule(day.value, {
                            break_ends_at: e.target.value,
                          })
                        }
                        className="w-24 h-9"
                        placeholder="--:--"
                      />
                    </div>
                  </div>
                )}

                {!schedule.enabled && (
                  <span className="text-sm text-muted-foreground">Fechado</span>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Navegação */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep("services")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button
          type="button"
          disabled={!hasAnyEnabled || !barberName}
          onClick={() => setStep("review")}
          className="gap-2"
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
