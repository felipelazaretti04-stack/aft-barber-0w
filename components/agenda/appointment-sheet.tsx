"use client"

import { CheckCircle2, Clock, MessageCircle, PencilLine, Phone, Play, X, XCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppointmentStatusBadge } from "@/components/dashboard/status-badge"
import { appointments as allAppts, getBarber, getClient, getService } from "@/lib/mock-data"
import type { Appointment, AppointmentStatus } from "@/lib/types"
import { formatBRL, formatDateBR, formatTimeBR } from "@/lib/format"
import { toast } from "sonner"

interface Props {
  appointment: Appointment | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onUpdate: (a: Appointment) => void
}

const statusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: "pending", label: "Pendente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "in_progress", label: "Em andamento" },
  { value: "completed", label: "Concluído" },
  { value: "no_show", label: "Não compareceu" },
  { value: "cancelled", label: "Cancelado" },
]

export function AppointmentSheet({ appointment, open, onOpenChange, onUpdate }: Props) {
  if (!appointment) return null
  const client = getClient(appointment.client_id)
  const barber = getBarber(appointment.barber_id)
  const service = getService(appointment.service_id)
  if (!client || !barber || !service) return null

  const history = allAppts
    .filter((a) => a.client_id === client.id && a.id !== appointment.id && a.status === "completed")
    .slice(0, 3)

  const updateStatus = (status: AppointmentStatus) => {
    onUpdate({ ...appointment, status })
    toast.success("Status atualizado")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalhes do agendamento</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-2 px-4 pb-6">
          {/* Cliente header */}
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={client.avatar_url || "/placeholder.svg"} alt={client.name} />
              <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{client.name}</p>
              <p className="text-sm text-muted-foreground">{client.phone}</p>
            </div>
            <Button size="icon" variant="outline" aria-label="WhatsApp">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" aria-label="Ligar">
              <Phone className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* Detalhes */}
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Serviço</dt>
              <dd className="font-medium">{service.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Barbeiro</dt>
              <dd className="font-medium">{barber.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Data</dt>
              <dd className="font-medium">{formatDateBR(appointment.start_at)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Horário</dt>
              <dd className="font-medium">
                {formatTimeBR(appointment.start_at)} - {formatTimeBR(appointment.end_at)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Duração</dt>
              <dd className="font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {service.duration_min} min
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Valor</dt>
              <dd className="font-semibold text-base">{formatBRL(appointment.price)}</dd>
            </div>
          </dl>

          <Separator />

          {/* Status */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Status</p>
              <AppointmentStatusBadge status={appointment.status} />
            </div>
            <Select value={appointment.status} onValueChange={(v) => updateStatus(v as AppointmentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notas */}
          {appointment.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Notas</p>
                <p className="text-sm text-muted-foreground rounded-md border p-2">{appointment.notes}</p>
              </div>
            </>
          )}

          {/* Histórico */}
          <Separator />
          <div>
            <p className="text-sm font-medium mb-2">Histórico do cliente</p>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem visitas anteriores</p>
            ) : (
              <ul className="space-y-2">
                {history.map((h) => {
                  const s = getService(h.service_id)
                  return (
                    <li key={h.id} className="flex items-center justify-between text-sm rounded-md border p-2">
                      <div>
                        <p className="font-medium">{s?.name}</p>
                        <p className="text-xs text-muted-foreground">{formatDateBR(h.start_at)}</p>
                      </div>
                      <p className="font-medium tabular-nums">{formatBRL(h.price)}</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <Separator />

          {/* Ações */}
          <div className="grid grid-cols-2 gap-2">
            {appointment.status === "pending" && (
              <Button variant="outline" onClick={() => updateStatus("confirmed")}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmar
              </Button>
            )}
            {appointment.status === "confirmed" && (
              <Button variant="outline" onClick={() => updateStatus("in_progress")}>
                <Play className="mr-2 h-4 w-4" />
                Iniciar
              </Button>
            )}
            {appointment.status === "in_progress" && (
              <Button onClick={() => updateStatus("completed")}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Concluir
              </Button>
            )}
            <Button variant="outline">
              <PencilLine className="mr-2 h-4 w-4" />
              Reagendar
            </Button>
            <Button variant="outline" onClick={() => updateStatus("no_show")}>
              <X className="mr-2 h-4 w-4" />
              No-show
            </Button>
            <Button variant="outline" className="text-destructive" onClick={() => updateStatus("cancelled")}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
