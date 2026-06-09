"use client"

import { useEffect, useState } from "react"
import { Check, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { barbers, clients, getBarber, getClient, getService, services } from "@/lib/mock-data"
import { formatBRL, formatDateBR, formatTimeBR } from "@/lib/format"
import { useTenantId } from "@/lib/features/context"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import type { Appointment } from "@/lib/types"

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  initialBarberId?: string
  initialStart?: string
  onCreate: (a: Appointment) => void
}

const steps = ["Cliente", "Serviço", "Barbeiro", "Data e horário", "Confirmação"]

const slotsByHour: string[] = []
for (let h = 9; h < 20; h++) {
  for (let m = 0; m < 60; m += 30) {
    slotsByHour.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
  }
}

export function NewAppointmentDialog({ open, onOpenChange, initialBarberId, initialStart, onCreate }: Props) {
  const tenantId = useTenantId()
  const [step, setStep] = useState(0)
  const [clientId, setClientId] = useState<string>("")
  const [serviceId, setServiceId] = useState<string>("")
  const [barberId, setBarberId] = useState<string>(initialBarberId ?? "")
  const [date, setDate] = useState<Date>(initialStart ? new Date(initialStart) : new Date())
  const [time, setTime] = useState<string>(initialStart ? formatTimeBR(initialStart) : "")
  const [notes, setNotes] = useState("")
  const [clientPickerOpen, setClientPickerOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setStep(0)
      setClientId("")
      setServiceId("")
      setBarberId(initialBarberId ?? "")
      setDate(initialStart ? new Date(initialStart) : new Date())
      setTime(initialStart ? formatTimeBR(initialStart) : "")
      setNotes("")
    }
  }, [open, initialBarberId, initialStart])

  const service = serviceId ? getService(serviceId) : null
  const barber = barberId ? getBarber(barberId) : null
  const client = clientId ? getClient(clientId) : null
  const availableBarbers = service ? barbers.filter((b) => service.barber_ids.includes(b.id)) : barbers

  const canNext = () => {
    if (step === 0) return !!clientId
    if (step === 1) return !!serviceId
    if (step === 2) return !!barberId
    if (step === 3) return !!date && !!time
    return true
  }

  const handleConfirm = () => {
    if (!service || !barber || !client) return
    const [h, m] = time.split(":").map(Number)
    const start = new Date(date)
    start.setHours(h, m, 0, 0)
    const end = new Date(start.getTime() + service.duration_min * 60000)
    const apt: Appointment = {
      id: `apt_${Date.now()}`,
      tenant_id: tenantId,
      client_id: client.id,
      barber_id: barber.id,
      service_id: service.id,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      status: "confirmed",
      price: service.price,
      notes,
    }
    onCreate(apt)
    toast.success("Agendamento criado com sucesso")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <ol className="flex items-center gap-2 text-xs">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0",
                  i < step && "bg-primary text-primary-foreground",
                  i === step && "bg-primary text-primary-foreground ring-2 ring-primary/20",
                  i > step && "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={cn("truncate", i === step ? "font-medium" : "text-muted-foreground")}>{s}</span>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-border" />}
            </li>
          ))}
        </ol>

        <div className="min-h-[280px] py-2">
          {step === 0 && (
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Popover open={clientPickerOpen} onOpenChange={setClientPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    {client ? client.name : "Buscar cliente..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar por nome, telefone..." />
                    <CommandList>
                      <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                      <CommandGroup>
                        {clients.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={c.name + c.phone}
                            onSelect={() => {
                              setClientId(c.id)
                              setClientPickerOpen(false)
                            }}
                          >
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={c.avatar_url || "/placeholder.svg"} alt={c.name} />
                              <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="flex-1">{c.name}</span>
                            <span className="text-xs text-muted-foreground">{c.phone}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Não encontrou? Você pode cadastrar um novo cliente em Clientes &gt; Novo.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {services.filter((s) => s.active).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServiceId(s.id)}
                  className={cn(
                    "rounded-lg border p-3 text-left hover:border-primary transition-colors",
                    serviceId === s.id && "border-primary ring-1 ring-primary",
                  )}
                >
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{s.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {s.duration_min}min
                    </span>
                    <span className="font-semibold text-sm">{formatBRL(s.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableBarbers.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBarberId(b.id)}
                  className={cn(
                    "rounded-lg border p-3 flex flex-col items-center gap-2 hover:border-primary transition-colors",
                    barberId === b.id && "border-primary ring-1 ring-primary",
                  )}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={b.avatar_url || "/placeholder.svg"} alt={b.name} />
                    <AvatarFallback>{b.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">{b.name}</p>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Data</Label>
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} locale={ptBR} className="rounded-md border" />
              </div>
              <div>
                <Label className="mb-2 block">Horário</Label>
                <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                  {slotsByHour.map((s) => (
                    <button
                      key={s}
                      onClick={() => setTime(s)}
                      className={cn(
                        "rounded-md border py-2 text-sm hover:border-primary",
                        time === s && "bg-primary text-primary-foreground border-primary",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && service && barber && client && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{client.name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Serviço</p>
                  <p className="font-medium">{service.name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Barbeiro</p>
                  <p className="font-medium">{barber.name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Data e horário</p>
                  <p className="font-medium">
                    {formatDateBR(date)} · {time}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <p className="text-sm">Total</p>
                  <p className="font-bold text-lg">{formatBRL(service.price)}</p>
                </div>
              </div>
              <div>
                <Label htmlFor="notes" className="mb-2 block">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alguma observação sobre o atendimento..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
              Próximo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleConfirm}>
              <Check className="mr-2 h-4 w-4" />
              Confirmar agendamento
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
