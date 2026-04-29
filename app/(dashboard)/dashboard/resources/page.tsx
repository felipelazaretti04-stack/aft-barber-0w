"use client"

import { useState } from "react"
import {
  Armchair,
  Calendar,
  Check,
  DoorOpen,
  Edit2,
  MoreHorizontal,
  Plus,
  Settings2,
  Trash2,
  Wrench,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/dashboard/page-header"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { resources } from "@/lib/mock-data-extra"
import type { Resource } from "@/lib/types"

const resourceTypeIcons = {
  chair: Armchair,
  room: DoorOpen,
  equipment: Wrench,
}

const resourceTypeLabels = {
  chair: "Cadeira",
  room: "Sala",
  equipment: "Equipamento",
}

// Mock usage data
const resourceUsage = [
  { resource_id: "res_1", time: "09:00", barber: "Carlos", client: "João Silva" },
  { resource_id: "res_1", time: "10:00", barber: "Carlos", client: "Pedro Almeida" },
  { resource_id: "res_1", time: "11:00", barber: "Carlos", client: "Mateus Rocha" },
  { resource_id: "res_2", time: "09:30", barber: "Rafael", client: "Felipe Costa" },
  { resource_id: "res_2", time: "10:30", barber: "Rafael", client: "Bruno Martins" },
  { resource_id: "res_4", time: "14:00", barber: "André", client: "Ricardo Santos" },
]

export default function ResourcesPage() {
  const [resourcesList, setResourcesList] = useState<Resource[]>(resources)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Resource | null>(null)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)

  const activeCount = resourcesList.filter((r) => r.active).length

  const handleSave = () => {
    toast.success(editing ? "Recurso atualizado" : "Recurso criado")
    setDialogOpen(false)
    setEditing(null)
  }

  const handleDelete = (id: string) => {
    setResourcesList((prev) => prev.filter((r) => r.id !== id))
    toast.success("Recurso excluído")
  }

  const toggleActive = (id: string) => {
    setResourcesList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    )
    toast.success("Status atualizado")
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader title="Recursos" description="Gerencie cadeiras, salas e equipamentos">
        <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Recurso
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{resourcesList.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cadeiras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{resourcesList.filter((r) => r.type === "chair").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Salas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{resourcesList.filter((r) => r.type === "room").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Resources Grid */}
      {resourcesList.length === 0 ? (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Armchair className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Nenhum recurso cadastrado</EmptyTitle>
            <EmptyDescription>Cadastre cadeiras, salas ou equipamentos.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Recurso
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resourcesList.map((resource) => {
            const Icon = resourceTypeIcons[resource.type]
            const usage = resourceUsage.filter((u) => u.resource_id === resource.id)
            return (
              <Card
                key={resource.id}
                className={cn(
                  "relative overflow-hidden transition-all",
                  !resource.active && "opacity-60"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center",
                        resource.type === "chair" && "bg-primary/10 text-primary",
                        resource.type === "room" && "bg-chart-2/10 text-chart-2",
                        resource.type === "equipment" && "bg-chart-3/10 text-chart-3"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{resource.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {resourceTypeLabels[resource.type]}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(resource); setDialogOpen(true) }}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedResource(resource)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Ver uso
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(resource.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                  
                  {/* Today's usage preview */}
                  {usage.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-medium text-muted-foreground">Hoje</p>
                      <div className="flex flex-wrap gap-1">
                        {usage.slice(0, 4).map((u, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {u.time}
                          </Badge>
                        ))}
                        {usage.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{usage.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={resource.active}
                        onCheckedChange={() => toggleActive(resource.id)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {resource.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <Badge variant={resource.active ? "default" : "secondary"}>
                      {resource.active ? "Disponível" : "Indisponível"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Resource Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Recurso" : "Novo Recurso"}</DialogTitle>
            <DialogDescription>
              {editing ? "Atualize as informações do recurso" : "Cadastre um novo recurso reservável"}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Nome</FieldLabel>
              <Input defaultValue={editing?.name} placeholder="Ex: Cadeira 1" />
            </Field>
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <Select defaultValue={editing?.type || "chair"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chair">
                    <div className="flex items-center gap-2">
                      <Armchair className="h-4 w-4" />
                      Cadeira
                    </div>
                  </SelectItem>
                  <SelectItem value="room">
                    <div className="flex items-center gap-2">
                      <DoorOpen className="h-4 w-4" />
                      Sala
                    </div>
                  </SelectItem>
                  <SelectItem value="equipment">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Equipamento
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Descrição</FieldLabel>
              <Textarea defaultValue={editing?.description} placeholder="Descrição do recurso" rows={2} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Usage Dialog */}
      <Dialog open={!!selectedResource} onOpenChange={(o) => !o && setSelectedResource(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uso de {selectedResource?.name}</DialogTitle>
            <DialogDescription>Reservas de hoje</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedResource && (
              <div className="space-y-3">
                {resourceUsage
                  .filter((u) => u.resource_id === selectedResource.id)
                  .map((u, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{u.time}</p>
                        <p className="text-sm text-muted-foreground">{u.client}</p>
                      </div>
                      <Badge variant="outline">{u.barber}</Badge>
                    </div>
                  ))}
                {resourceUsage.filter((u) => u.resource_id === selectedResource.id).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Nenhuma reserva hoje</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedResource(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
