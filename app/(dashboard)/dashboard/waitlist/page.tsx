"use client"

import { useState } from "react"
import {
  AlertCircle,
  Bell,
  Calendar,
  Check,
  Clock,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/dashboard/page-header"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { barbers, clients, services } from "@/lib/mock-data"
import { waitlistEntries } from "@/lib/mock-data-extra"
import { formatRelativeBR } from "@/lib/format"
import type { WaitlistEntry } from "@/lib/types"

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>(waitlistEntries)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState("")
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<typeof clients[0] | null>(null)

  // Simula cancelamentos recentes
  const [showAlert, setShowAlert] = useState(true)
  const recentCancellation = {
    time: "14:30",
    date: "Hoje",
    barber: "Carlos Mendes",
    service: "Combo Corte + Barba",
  }

  const waitingCount = entries.filter((e) => e.status === "waiting").length
  const notifiedCount = entries.filter((e) => e.status === "notified").length

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch)
  )

  const handleNotify = (entry: WaitlistEntry) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, status: "notified" as const } : e))
    )
    toast.success(`Notificação enviada para ${entry.client_name}`)
  }

  const handleSchedule = (entry: WaitlistEntry) => {
    toast.success(`Abrindo agenda para agendar ${entry.client_name}`)
  }

  const handleRemove = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    toast.success("Removido da lista de espera")
  }

  const handleAddToWaitlist = () => {
    if (!selectedClient) {
      toast.error("Selecione um cliente")
      return
    }
    const newEntry: WaitlistEntry = {
      id: `wl_${Date.now()}`,
      tenant_id: "tenant_1",
      client_id: selectedClient.id,
      client_name: selectedClient.name,
      client_phone: selectedClient.phone,
      service_id: "svc_1",
      service_name: "Corte Masculino Clássico",
      preferred_period: "Tarde",
      preferred_dates: "Qualquer dia",
      notes: "",
      created_at: new Date().toISOString(),
      status: "waiting",
    }
    setEntries((prev) => [...prev, newEntry])
    toast.success(`${selectedClient.name} adicionado à lista de espera`)
    setDialogOpen(false)
    setSelectedClient(null)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader title="Lista de Espera" description="Clientes aguardando vaga na agenda">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar à Lista
        </Button>
      </PageHeader>

      {/* Alert de cancelamento */}
      {showAlert && (
        <Alert variant="default" className="border-warning bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">Horário disponível!</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span>
              Cancelamento às {recentCancellation.time} ({recentCancellation.date}) com {recentCancellation.barber} -{" "}
              {recentCancellation.service}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowAlert(false)}>
                Dispensar
              </Button>
              <Button size="sm" onClick={() => { toast.success("Notificações enviadas"); setShowAlert(false) }}>
                <Bell className="mr-1 h-3 w-3" />
                Notificar lista
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{waitingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Notificados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{notifiedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total na Lista</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{entries.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes na Lista</CardTitle>
          <CardDescription>Gerencie clientes aguardando vaga</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Clock className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>Lista de espera vazia</EmptyTitle>
                <EmptyDescription>Nenhum cliente aguardando vaga no momento.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar cliente
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Barbeiro</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={clients.find((c) => c.id === entry.client_id)?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{entry.client_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{entry.client_name}</p>
                          <p className="text-xs text-muted-foreground">{entry.client_phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{entry.service_name}</TableCell>
                    <TableCell>
                      {entry.barber_name ? (
                        <span>{entry.barber_name}</span>
                      ) : (
                        <span className="text-muted-foreground">Qualquer</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{entry.preferred_period}</p>
                        <p className="text-xs text-muted-foreground">{entry.preferred_dates}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatRelativeBR(entry.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={entry.status === "waiting" ? "secondary" : entry.status === "notified" ? "default" : "outline"}
                      >
                        {entry.status === "waiting" ? "Aguardando" : entry.status === "notified" ? "Notificado" : "Agendado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleNotify(entry)}>
                            <Bell className="mr-2 h-4 w-4" />
                            Notificar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSchedule(entry)}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Agendar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Ligar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleRemove(entry.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar à Lista de Espera</DialogTitle>
            <DialogDescription>Cadastre um cliente que está aguardando vaga</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Cliente</FieldLabel>
              <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    {selectedClient ? (
                      <>
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={selectedClient.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {selectedClient.name}
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Selecionar cliente</span>
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." value={clientSearch} onValueChange={setClientSearch} />
                    <CommandList>
                      <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                      <CommandGroup>
                        {filteredClients.map((client) => (
                          <CommandItem
                            key={client.id}
                            onSelect={() => {
                              setSelectedClient(client)
                              setClientPopoverOpen(false)
                              setClientSearch("")
                            }}
                          >
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={client.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm">{client.name}</p>
                              <p className="text-xs text-muted-foreground">{client.phone}</p>
                            </div>
                            {selectedClient?.id === client.id && <Check className="h-4 w-4" />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>
            <Field>
              <FieldLabel>Serviço desejado</FieldLabel>
              <Select defaultValue="svc_1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {services.filter((s) => s.active).map((service) => (
                    <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Barbeiro preferido</FieldLabel>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Qualquer barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer barbeiro</SelectItem>
                  {barbers.filter((b) => b.active).map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>{barber.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Período preferido</FieldLabel>
              <Select defaultValue="any">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer horário</SelectItem>
                  <SelectItem value="morning">Manhã</SelectItem>
                  <SelectItem value="afternoon">Tarde</SelectItem>
                  <SelectItem value="evening">Noite</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Datas preferidas</FieldLabel>
              <Input placeholder="Ex: Seg a Qua, ou 02/05 a 05/05" />
            </Field>
            <Field>
              <FieldLabel>Observações</FieldLabel>
              <Textarea placeholder="Informações adicionais" rows={2} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddToWaitlist}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
