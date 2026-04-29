"use client"

import { useState } from "react"
import {
  AlertCircle,
  Calendar,
  CalendarOff,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  MoreHorizontal,
  Plus,
  Trash2,
  User,
  Users,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/dashboard/page-header"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { barbers, blocks as initialBlocks } from "@/lib/mock-data"
import { formatDateBR } from "@/lib/format"
import type { Block } from "@/lib/types"

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Block | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Form state
  const [blockType, setBlockType] = useState<"full_day" | "period">("full_day")
  const [applyToAll, setApplyToAll] = useState(true)
  const [selectedBarbers, setSelectedBarbers] = useState<string[]>([])

  // Get blocked dates for calendar
  const blockedDates = blocks.map((b) => new Date(b.start_at))

  const handleDelete = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    toast.success("Bloqueio removido")
  }

  const handleSave = () => {
    const newBlock: Block = {
      id: editing?.id || `blk_${Date.now()}`,
      tenant_id: "tenant_1",
      start_at: selectedDate?.toISOString() || new Date().toISOString(),
      end_at: selectedDate?.toISOString() || new Date().toISOString(),
      reason: "Novo bloqueio",
      barber_ids: applyToAll ? [] : selectedBarbers,
      full_day: blockType === "full_day",
    }
    
    if (editing) {
      setBlocks((prev) => prev.map((b) => (b.id === editing.id ? newBlock : b)))
      toast.success("Bloqueio atualizado")
    } else {
      setBlocks((prev) => [...prev, newBlock])
      toast.success("Bloqueio criado")
    }
    
    setDialogOpen(false)
    setEditing(null)
  }

  const toggleBarber = (barberId: string) => {
    setSelectedBarbers((prev) =>
      prev.includes(barberId) ? prev.filter((id) => id !== barberId) : [...prev, barberId]
    )
  }

  const upcomingBlocks = blocks
    .filter((b) => new Date(b.start_at) >= new Date())
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader title="Bloqueios e Folgas" description="Gerencie horários bloqueados na agenda">
        <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Bloqueio
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>Dias com bloqueios aparecem em vermelho</CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
              modifiers={{
                blocked: blockedDates,
              }}
              modifiersStyles={{
                blocked: {
                  backgroundColor: "var(--destructive)",
                  color: "var(--destructive-foreground)",
                  borderRadius: "var(--radius)",
                },
              }}
            />
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-destructive" />
                <span className="text-muted-foreground">Bloqueado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-primary" />
                <span className="text-muted-foreground">Selecionado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blocks List */}
        <Card>
          <CardHeader>
            <CardTitle>Bloqueios Ativos</CardTitle>
            <CardDescription>Lista de bloqueios futuros</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingBlocks.length === 0 ? (
              <Empty className="py-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CalendarOff className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>Nenhum bloqueio</EmptyTitle>
                  <EmptyDescription>Não há bloqueios futuros cadastrados.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar bloqueio
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <div className="space-y-4">
                {upcomingBlocks.map((block) => {
                  const blockBarbers = block.barber_ids.length > 0
                    ? barbers.filter((b) => block.barber_ids.includes(b.id))
                    : barbers
                  const isFullDay = block.full_day
                  const startDate = new Date(block.start_at)
                  const endDate = new Date(block.end_at)

                  return (
                    <div
                      key={block.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-destructive/5 border-destructive/20"
                    >
                      <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <CalendarOff className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{block.reason}</p>
                          <Badge variant={isFullDay ? "destructive" : "secondary"}>
                            {isFullDay ? "Dia inteiro" : "Período"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateBR(block.start_at)}
                            {!isFullDay && startDate.toDateString() !== endDate.toDateString() && (
                              <> - {formatDateBR(block.end_at)}</>
                            )}
                          </span>
                          {!isFullDay && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                              {" - "}
                              {endDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {block.barber_ids.length === 0 ? (
                            <Badge variant="outline">
                              <Users className="h-3 w-3 mr-1" />
                              Todos os barbeiros
                            </Badge>
                          ) : (
                            <div className="flex -space-x-2">
                              {blockBarbers.slice(0, 3).map((b) => (
                                <Avatar key={b.id} className="h-6 w-6 border-2 border-background">
                                  <AvatarImage src={b.avatar_url || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">{b.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ))}
                              {blockBarbers.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                                  +{blockBarbers.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditing(block); setDialogOpen(true) }}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(block.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Block Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Bloqueio" : "Novo Bloqueio"}</DialogTitle>
            <DialogDescription>
              Bloqueie horários na agenda para folgas, feriados ou manutenção
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Tipo de bloqueio</FieldLabel>
              <RadioGroup
                value={blockType}
                onValueChange={(v) => setBlockType(v as "full_day" | "period")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full_day" id="full_day" />
                  <Label htmlFor="full_day">Dia inteiro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="period" id="period" />
                  <Label htmlFor="period">Período específico</Label>
                </div>
              </RadioGroup>
            </Field>

            <Field>
              <FieldLabel>Data(s)</FieldLabel>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </Field>

            {blockType === "period" && (
              <FieldGroup>
                <Field>
                  <FieldLabel>Horário início</FieldLabel>
                  <Input type="time" defaultValue="09:00" />
                </Field>
                <Field>
                  <FieldLabel>Horário fim</FieldLabel>
                  <Input type="time" defaultValue="18:00" />
                </Field>
              </FieldGroup>
            )}

            <Field>
              <FieldLabel>Motivo</FieldLabel>
              <Input defaultValue={editing?.reason} placeholder="Ex: Feriado nacional" />
            </Field>

            <div className="space-y-3">
              <FieldLabel>Aplicar a</FieldLabel>
              <div className="flex items-center gap-2">
                <Switch checked={applyToAll} onCheckedChange={setApplyToAll} />
                <Label>Todos os barbeiros</Label>
              </div>

              {!applyToAll && (
                <div className="grid gap-2 sm:grid-cols-2 pt-2">
                  {barbers.filter((b) => b.active).map((barber) => (
                    <div
                      key={barber.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedBarbers.includes(barber.id) && "border-primary bg-primary/5"
                      )}
                      onClick={() => toggleBarber(barber.id)}
                    >
                      <Checkbox
                        checked={selectedBarbers.includes(barber.id)}
                        onCheckedChange={() => toggleBarber(barber.id)}
                      />
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={barber.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{barber.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{barber.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>
              {editing ? "Salvar" : "Criar bloqueio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
