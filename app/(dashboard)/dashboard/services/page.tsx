"use client"

import { useState } from "react"
import Image from "next/image"
import { Clock, MoreHorizontal, Plus, Scissors, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/dashboard/page-header"
import { ServiceDialog } from "@/components/services/service-dialog"
import { services as initialServices } from "@/lib/mock-data"
import { formatBRL } from "@/lib/format"
import type { Service, ServiceCategory } from "@/lib/types"
import { toast } from "sonner"

const categoryLabel: Record<ServiceCategory, string> = {
  cabelo: "Cabelo",
  barba: "Barba",
  combo: "Combo",
  tratamento: "Tratamento",
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [status, setStatus] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)

  const filtered = services.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    if (category !== "all" && s.category !== category) return false
    if (status === "active" && !s.active) return false
    if (status === "inactive" && s.active) return false
    return true
  })

  const toggleActive = (id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)))
    toast.success("Serviço atualizado")
  }

  const handleDelete = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id))
    toast.success("Serviço excluído")
  }

  const handleDuplicate = (s: Service) => {
    const newSvc: Service = { ...s, id: `svc_${Date.now()}`, name: `${s.name} (cópia)` }
    setServices((prev) => [...prev, newSvc])
    toast.success("Serviço duplicado")
  }

  const handleSave = (svc: Service) => {
    setServices((prev) => {
      const exists = prev.some((s) => s.id === svc.id)
      return exists ? prev.map((s) => (s.id === svc.id ? svc : s)) : [...prev, svc]
    })
    toast.success(editing ? "Serviço atualizado" : "Serviço criado")
    setDialogOpen(false)
    setEditing(null)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <PageHeader title="Serviços" description="Gerencie os serviços oferecidos">
        <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3">
        <InputGroup className="sm:max-w-sm">
          <InputGroupAddon>
            <Search className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Buscar serviço..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </InputGroup>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            <SelectItem value="cabelo">Cabelo</SelectItem>
            <SelectItem value="barba">Barba</SelectItem>
            <SelectItem value="combo">Combo</SelectItem>
            <SelectItem value="tratamento">Tratamento</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Scissors className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Nenhum serviço encontrado</EmptyTitle>
            <EmptyDescription>Crie seu primeiro serviço ou ajuste os filtros.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Novo Serviço
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Card key={s.id} className="overflow-hidden flex flex-col">
              <div className="relative aspect-video bg-muted">
                <Image
                  src={s.photo_url || "/placeholder.svg"}
                  alt={s.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <Badge variant="secondary" className="absolute top-2 left-2">
                  {categoryLabel[s.category]}
                </Badge>
              </div>
              <CardContent className="flex-1 pt-4">
                <h3 className="font-semibold leading-tight">{s.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {s.duration_min} min
                  </span>
                  <span className="text-lg font-bold">{formatBRL(s.price)}</span>
                </div>
              </CardContent>
              <CardFooter className="border-t justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Switch checked={s.active} onCheckedChange={() => toggleActive(s.id)} aria-label="Ativo" />
                  <span className="text-xs text-muted-foreground">{s.active ? "Ativo" : "Inativo"}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Ações">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditing(s); setDialogOpen(true) }}>Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(s)}>Duplicar</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(s.id)}>Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null) }}
        service={editing}
        onSave={handleSave}
      />
    </div>
  )
}
