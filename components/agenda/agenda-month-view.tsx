"use client"

import { addDays, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Appointment } from "@/lib/types"

interface Props {
  date: Date
  appointments: Appointment[]
  onDayClick: (d: Date) => void
}

export function AgendaMonthView({ date, appointments, onDayClick }: Props) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="grid grid-cols-7 border-b bg-background">
        {weekdays.map((w) => (
          <div key={w} className="px-3 py-2 text-xs font-medium text-muted-foreground text-center">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1">
        {days.map((d) => {
          const inMonth = isSameMonth(d, date)
          const isToday = isSameDay(d, new Date())
          const dayAppts = appointments.filter((a) => isSameDay(new Date(a.start_at), d))
          return (
            <button
              key={d.toISOString()}
              onClick={() => onDayClick(d)}
              className={cn(
                "border-b border-r p-2 text-left flex flex-col gap-1 hover:bg-accent/40 transition-colors min-h-[100px]",
                !inMonth && "bg-muted/30 text-muted-foreground",
                isToday && "bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  isToday &&
                    "h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center",
                )}
              >
                {format(d, "dd")}
              </span>
              <div className="flex-1 space-y-0.5 overflow-hidden">
                {dayAppts.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="text-[10px] truncate rounded bg-primary/10 text-primary px-1 py-0.5"
                  >
                    {format(new Date(a.start_at), "HH:mm")}
                  </div>
                ))}
                {dayAppts.length > 3 && (
                  <p className="text-[10px] text-muted-foreground">+{dayAppts.length - 3} mais</p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
