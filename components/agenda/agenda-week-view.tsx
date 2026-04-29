"use client"

import { addDays, format, isSameDay, startOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { getClient, getService } from "@/lib/mock-data"
import type { Appointment, Barber } from "@/lib/types"
import { statusColorMap } from "@/components/dashboard/status-badge"

const START_HOUR = 8
const END_HOUR = 20
const HOUR_HEIGHT = 48

interface Props {
  date: Date
  barbers: Barber[]
  appointments: Appointment[]
  onAppointmentClick: (a: Appointment) => void
}

export function AgendaWeekView({ date, barbers, appointments, onAppointmentClick }: Props) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const barberIds = new Set(barbers.map((b) => b.id))
  const filteredAppts = appointments.filter((a) => barberIds.has(a.barber_id))
  const totalHours = END_HOUR - START_HOUR

  function getApptPosition(a: Appointment) {
    const s = new Date(a.start_at)
    const e = new Date(a.end_at)
    const top = ((s.getHours() - START_HOUR) * 60 + s.getMinutes()) / 60 * HOUR_HEIGHT
    const height = (e.getTime() - s.getTime()) / 3600000 * HOUR_HEIGHT
    return { top, height }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex border-b bg-background">
        <div className="w-16 shrink-0 border-r" />
        {days.map((d) => (
          <div
            key={d.toISOString()}
            className={cn(
              "flex-1 px-3 py-2 border-r text-center",
              isSameDay(d, new Date()) && "bg-primary/5",
            )}
          >
            <p className="text-xs text-muted-foreground capitalize">
              {format(d, "EEE", { locale: ptBR })}
            </p>
            <p className={cn("text-lg font-semibold", isSameDay(d, new Date()) && "text-primary")}>
              {format(d, "dd")}
            </p>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin">
        <div className="flex relative" style={{ height: totalHours * HOUR_HEIGHT }}>
          <div className="w-16 shrink-0 border-r bg-muted/20">
            {Array.from({ length: totalHours }, (_, i) => (
              <div
                key={i}
                className="text-[10px] text-muted-foreground pr-2 text-right border-t tabular-nums"
                style={{ height: HOUR_HEIGHT }}
              >
                {String(START_HOUR + i).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {days.map((d) => {
            const dayAppts = filteredAppts.filter((a) => isSameDay(new Date(a.start_at), d))
            return (
              <div key={d.toISOString()} className="flex-1 border-r relative">
                {Array.from({ length: totalHours }, (_, i) => (
                  <div
                    key={i}
                    className="border-t border-border/40"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}
                {dayAppts.map((a) => {
                  const pos = getApptPosition(a)
                  const client = getClient(a.client_id)
                  const service = getService(a.service_id)
                  return (
                    <button
                      key={a.id}
                      onClick={() => onAppointmentClick(a)}
                      className={cn(
                        "absolute left-1 right-1 rounded-md border-l-4 px-2 py-1 text-left text-xs shadow-sm hover:shadow-md transition-all overflow-hidden",
                        statusColorMap[a.status],
                      )}
                      style={{ top: pos.top + 1, height: pos.height - 2 }}
                    >
                      <p className="font-semibold truncate">{client?.name}</p>
                      <p className="text-muted-foreground truncate">{service?.name}</p>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
