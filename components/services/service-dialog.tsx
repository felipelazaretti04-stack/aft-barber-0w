"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Upload } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { barbers } from "@/lib/mock-data"
import type { Service, ServiceCategory } from "@/lib/types"

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  service: Service | null
  onSave: (s: Service) => void
}

export function ServiceDialog({ open, onOpenChange, service, onSave }: Props) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ServiceCategory>("cabelo")
  const [duration, setDuration] = useState(30)
  const [price, setPrice] = useState(45)
  const [active, setActive] = useState(true)
  const [barberIds, setBarberIds] = useState<string[]>([])
  const [addOns, setAddOns] = useState<{ id: string; name: string; price: number }[]>([])
  const [photo, setPhoto] = useState("")

  useEffect(() => {
    if (open) {
      if (service) {
        setName(service.name)
        setDescription(service.description)
        setCategory(service.category)
        setDuration(service.duration_min)
        setPrice(service.price)
        setActive(service.active)
        setBarberIds(service.barber_ids)
        setAddOns(service.add_ons)
        setPhoto(service.photo_url)
      } else {
        setName(""); setDescription(""); setCategory("cabelo"); setDuration(30); setPrice(45)
        setActive(true); setBarberIds([]); setAddOns([]); setPhoto("")
      }
    }
  }, [open, service])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const svc: Service = {
      id: service?.id ?? `svc_${Date.now()}`,
      tenant_id: "tenant_1",
      name,
      description,
      category,
      duration_min: duration,
      price,
      photo_url: photo || "/placeholder.svg",
      active,
      add_ons: addOns,
      barber_ids: barberIds,
    }
    onSave(svc)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? "Editar serviço" : "Novo serviço"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border-2 border-dashed p-6 flex flex-col items-center text-center hover:bg-accent/30 cursor-pointer">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Arraste a foto aqui ou clique para enviar</p>
            <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="svc-name">Nome</Label>
              <Input id="svc-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-cat">Categoria</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ServiceCategory)}>
                <SelectTrigger id="svc-cat"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cabelo">Cabelo</SelectItem>
                  <SelectItem value="barba">Barba</SelectItem>
                  <SelectItem value="combo">Combo</SelectItem>
                  <SelectItem value="tratamento">Tratamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="svc-desc">Descrição</Label>
            <Textarea id="svc-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Duração</Label>
                <span className="text-sm font-medium tabular-nums">{duration} min</span>
              </div>
              <Slider value={[duration]} min={10} max={180} step={5} onValueChange={([v]) => setDuration(v)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-price">Preço (R$)</Label>
              <Input
                id="svc-price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Add-ons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Complementos (add-ons)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAddOns((p) => [...p, { id: `add_${Date.now()}`, name: "", price: 0 }])}
              >
                <Plus className="mr-1 h-3 w-3" /> Adicionar
              </Button>
            </div>
            {addOns.map((a, i) => (
              <div key={a.id} className="flex gap-2">
                <Input
                  placeholder="Nome (ex: Lavagem)"
                  value={a.name}
                  onChange={(e) =>
                    setAddOns((p) => p.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))
                  }
                />
                <Input
                  placeholder="R$"
                  type="number"
                  className="w-24"
                  value={a.price}
                  onChange={(e) =>
                    setAddOns((p) => p.map((x, idx) => (idx === i ? { ...x, price: parseFloat(e.target.value) || 0 } : x)))
                  }
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => setAddOns((p) => p.filter((_, idx) => idx !== i))} aria-label="Remover">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Barbeiros */}
          <div className="space-y-2">
            <Label>Barbeiros que executam</Label>
            <div className="grid sm:grid-cols-2 gap-2">
              {barbers.map((b) => {
                const checked = barberIds.includes(b.id)
                return (
                  <label
                    key={b.id}
                    className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-accent/40"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => {
                        if (c) setBarberIds((p) => [...p, b.id])
                        else setBarberIds((p) => p.filter((id) => id !== b.id))
                      }}
                    />
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={b.avatar_url || "/placeholder.svg"} alt={b.name} />
                      <AvatarFallback>{b.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm flex-1 truncate">{b.name}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Serviço ativo</p>
              <p className="text-xs text-muted-foreground">Visível para agendamento</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar serviço</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
