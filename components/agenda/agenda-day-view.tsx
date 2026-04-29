"use client"

import { useEffect, useRef, useState } from "react"
import { isSameDay } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getClient, getService } from "@/lib/mock-data"
import type { Appointment, Barber } from "@/lib/types"
import { statusColorMap } from "@/components/dashboard/status-badge"

const SLOT_MIN = 15
const START_HOUR = 8
const END_HOUR = 20
const SLOT_HEIGHT = 16 // px per 15min

const slots: { hour: number; minute: number }[] = []
for (let h = START_HOUR; h < END_HOUR; h++) {
  for (let m = 0; m < 60; m += SLOT_MIN) {
    slots.push({ hour: h, minute: m })
  }
}

function formatHM(h: number, m: number) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

interface Props {
  date: Date
  barbers: Barber[]
  appointments: Appointment[]
  onAppointmentClick: (a: Appointment) => void
  onSlotClick: (barberId: string, startIso: string) => void
  onAppointmentMove: (id: string, newStartIso: string, newBarberId: string) => void
}

export function AgendaDayView({ date, barbers, appointments, onAppointmentClick, onSlotClick, onAppointmentMove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [now, setNow] = useState(new Date())
  const [draggedId, setDraggedId] = useState<string | null>(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const dayAppts = appointments.filter((a) => isSameDay(new Date(a.start_at), date))

  const isToday = isSameDay(date, now)
  const minutesFromStart = (now.getHours() - START_HOUR) * 60 + now.getMinutes()
  const nowOffset = (minutesFromStart / SLOT_MIN) * SLOT_HEIGHT
  const showNowLine = isToday && now.getHours() >= START_HOUR && now.getHours() < END_HOUR

  function getApptPosition(a: Appointment) {
    const start = new Date(a.start_at)
    const end = new Date(a.end_at)
    const startMin = (start.getHours() - START_HOUR) * 60 + start.getMinutes()
    const dur = (end.getTime() - start.getTime()) / 60000
    return {
      top: (startMin / SLOT_MIN) * SLOT_HEIGHT,
      height: (dur / SLOT_MIN) * SLOT_HEIGHT,
    }
  }

  function handleSlotClick(barberId: string, slotIdx: number) {
    const slot = slots[slotIdx]
    const d = new Date(date)
    d.setHours(slot.hour, slot.minute, 0, 0)
    onSlotClick(barberId, d.toISOString())
  }

  function handleDrop(barberId: string, slotIdx: number, e: React.DragEvent) {
    e.preventDefault()
    const id = e.dataTransfer.getData("text/plain")
    if (!id) return
    const slot = slots[slotIdx]
    const d = new Date(date)
    d.setHours(slot.hour, slot.minute, 0, 0)
    onAppointmentMove(id, d.toISOString(), barberId)
    setDraggedId(null)
  }

  if (barbers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Selecione ao menos um barbeiro</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with barber columns */}
      <div className="flex border-b bg-background sticky top-0 z-10">
        <div className="w-16 shrink-0 border-r" />
        {barbers.map((b) => (
          <div key={b.id} className="flex-1 min-w-[180px] flex items-center gap-2 px-3 py-2 border-r">
            <Avatar className="h-7 w-7">
              <AvatarImage src={b.avatar_url || "/placeholder.svg"} alt={b.name} />
              <AvatarFallback>{b.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{b.name}</p>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: b.color }} />
                <p className="text-xs text-muted-foreground">{dayAppts.filter((a) => a.barber_id === b.id).length} agendamentos</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div ref={containerRef} className="flex-1 overflow-auto scrollbar-thin">
        <div className="flex relative" style={{ height: slots.length * SLOT_HEIGHT }}>
          {/* Time column */}
          <div className="w-16 shrink-0 border-r bg-muted/20 sticky left-0 z-[1]">
            {slots.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "text-[10px] text-muted-foreground pr-2 text-right tabular-nums",
                  s.minute === 0 && "border-t",
                )}
                style={{ height: SLOT_HEIGHT }}
              >
                {s.minute === 0 ? formatHM(s.hour, s.minute) : ""}
              </div>
            ))}
          </div>

          {/* Barber columns */}
          {barbers.map((b) => {
            const apts = dayAppts.filter((a) => a.barber_id === b.id)
            return (
              <div key={b.id} className="flex-1 min-w-[180px] border-r relative">
                {slots.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => handleSlotClick(b.id, i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(b.id, i, e)}
                    className={cn(
                      "cursor-pointer hover:bg-accent/40 transition-colors",
                      s.minute === 0 ? "border-t border-border" : "border-t border-border/30",
                    )}
                    style={{ height: SLOT_HEIGHT }}
                    aria-label={`Slot ${formatHM(s.hour, s.minute)} - ${b.name}`}
                  />
                ))}
                {apts.map((a) => {
                  const pos = getApptPosition(a)
                  const client = getClient(a.client_id)
                  const service = getService(a.service_id)
                  return (
                    <button
                      key={a.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedId(a.id)
                        e.dataTransfer.setData("text/plain", a.id)
                      }}
                      onDragEnd={() => setDraggedId(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        onAppointmentClick(a)
                      }}
                      className={cn(
                        "absolute left-1 right-1 rounded-md border-l-4 px-2 py-1 text-left text-xs shadow-sm hover:shadow-md transition-all overflow-hidden",
                        statusColorMap[a.status],
                        draggedId === a.id && "opacity-50",
                      )}
                      style={{ top: pos.top + 1, height: pos.height - 2 }}
                    >
                      <p className="font-semibold truncate text-foreground">{client?.name}</p>
                      <p className="text-muted-foreground truncate">{service?.name}</p>
                    </button>
                  )
                })}
              </div>
            )
          })}

          {/* Now line */}
          {showNowLine && (
            <div
              className="absolute left-16 right-0 z-[2] pointer-events-none"
              style={{ top: nowOffset }}
              aria-hidden
            >
              <div className="relative">
                <div className="absolute left-0 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500" />
                <div className="h-px bg-red-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
