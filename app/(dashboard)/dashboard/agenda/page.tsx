"use client"

import { useState } from "react"
import { addDays, format, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComp } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/dashboard/page-header"
import { AgendaDayView } from "@/components/agenda/agenda-day-view"
import { AgendaWeekView } from "@/components/agenda/agenda-week-view"
import { AgendaMonthView } from "@/components/agenda/agenda-month-view"
import { AppointmentSheet } from "@/components/agenda/appointment-sheet"
import { NewAppointmentDialog } from "@/components/agenda/new-appointment-dialog"
import { BarberFilter } from "@/components/agenda/barber-filter"
import { appointments as initialAppointments, barbers } from "@/lib/mock-data"
import type { Appointment } from "@/lib/types"

type ViewMode = "day" | "week" | "month"

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [view, setView] = useState<ViewMode>("day")
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [selectedBarberIds, setSelectedBarberIds] = useState<string[]>(barbers.map((b) => b.id))
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const [newApptOpen, setNewApptOpen] = useState(false)
  const [newApptInitial, setNewApptInitial] = useState<{ barberId?: string; start?: string }>({})

  const handleNavigate = (delta: number) => {
    setCurrentDate((d) => (delta > 0 ? addDays(d, delta) : subDays(d, -delta)))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) setCurrentDate(date)
  }

  const handleApptUpdate = (updated: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    setSelectedAppt(updated)
  }

  const handleApptCreate = (apt: Appointment) => {
    setAppointments((prev) => [...prev, apt])
  }

  const visibleBarbers = barbers.filter((b) => selectedBarberIds.includes(b.id))

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="p-4 md:p-6 space-y-4 border-b bg-background">
        <PageHeader title="Agenda" description="Gerencie agendamentos da equipe">
          <Button onClick={() => { setNewApptInitial({}); setNewApptOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </PageHeader>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => handleNavigate(-1)} aria-label="Anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleNavigate(1)} aria-label="Próximo">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="capitalize">
                    {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComp mode="single" selected={currentDate} onSelect={handleDateChange} locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <BarberFilter selected={selectedBarberIds} onChange={setSelectedBarberIds} />
            <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="day">Dia</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mês</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === "day" && (
          <AgendaDayView
            date={currentDate}
            barbers={visibleBarbers}
            appointments={appointments}
            onAppointmentClick={setSelectedAppt}
            onSlotClick={(barberId, start) => {
              setNewApptInitial({ barberId, start })
              setNewApptOpen(true)
            }}
            onAppointmentMove={(id, newStart, newBarberId) => {
              setAppointments((prev) =>
                prev.map((a) => {
                  if (a.id !== id) return a
                  const dur = new Date(a.end_at).getTime() - new Date(a.start_at).getTime()
                  const newEnd = new Date(new Date(newStart).getTime() + dur).toISOString()
                  return { ...a, start_at: newStart, end_at: newEnd, barber_id: newBarberId }
                }),
              )
            }}
          />
        )}
        {view === "week" && (
          <AgendaWeekView
            date={currentDate}
            barbers={visibleBarbers}
            appointments={appointments}
            onAppointmentClick={setSelectedAppt}
          />
        )}
        {view === "month" && (
          <AgendaMonthView date={currentDate} appointments={appointments} onDayClick={setCurrentDate} />
        )}
      </div>

      <AppointmentSheet
        appointment={selectedAppt}
        open={!!selectedAppt}
        onOpenChange={(o) => !o && setSelectedAppt(null)}
        onUpdate={handleApptUpdate}
      />

      <NewAppointmentDialog
        open={newApptOpen}
        onOpenChange={setNewApptOpen}
        initialBarberId={newApptInitial.barberId}
        initialStart={newApptInitial.start}
        onCreate={handleApptCreate}
      />
    </div>
  )
}
