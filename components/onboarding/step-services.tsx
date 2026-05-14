"use client"

import { useState } from "react"
import { useOnboardingStore } from "@/lib/onboarding/store"
import type { ServiceItem } from "@/lib/onboarding/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Plus, Trash2, GripVertical } from "lucide-react"
import { formatBRL } from "@/lib/format"
import { cn } from "@/lib/utils"

export function StepServices() {
  const { services, setServices, setStep } = useOnboardingStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<ServiceItem>>({})

  const addService = () => {
    const id = crypto.randomUUID()
    setDraft({ id, name: "", duration_min: 30, price_cents: 0 })
    setEditingId(id)
  }

  const saveService = () => {
    if (!draft.name || !draft.id) return
    const existing = services.find((s) => s.id === draft.id)
    if (existing) {
      setServices(
        services.map((s) =>
          s.id === draft.id ? { ...s, ...draft } as ServiceItem : s
        )
      )
    } else {
      setServices([...services, draft as ServiceItem])
    }
    setEditingId(null)
    setDraft({})
  }

  const editService = (service: ServiceItem) => {
    setDraft({ ...service })
    setEditingId(service.id)
  }

  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setDraft({})
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft({})
  }

  const canContinue = services.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Serviços Oferecidos</h2>
        <p className="text-sm text-muted-foreground">
          Adicione os serviços que você oferece. Você pode editar depois.
        </p>
      </div>

      {/* Lista de serviços */}
      <div className="space-y-3">
        {services.map((service) =>
          editingId === service.id ? (
            <Card key={service.id} className="p-4 border-primary">
              <ServiceForm
                draft={draft}
                setDraft={setDraft}
                onSave={saveService}
                onCancel={cancelEdit}
              />
            </Card>
          ) : (
            <Card
              key={service.id}
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => editService(service)}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{service.name}</p>
                <p className="text-sm text-muted-foreground">
                  {service.duration_min} min
                </p>
              </div>
              <p className="font-semibold text-primary">
                {formatBRL(service.price_cents / 100)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  removeService(service.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          )
        )}

        {/* Novo serviço em edição */}
        {editingId && !services.find((s) => s.id === editingId) && (
          <Card className="p-4 border-primary">
            <ServiceForm
              draft={draft}
              setDraft={setDraft}
              onSave={saveService}
              onCancel={cancelEdit}
            />
          </Card>
        )}

        {/* Botão adicionar */}
        {!editingId && (
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-dashed"
            onClick={addService}
          >
            <Plus className="h-4 w-4" />
            Adicionar Serviço
          </Button>
        )}
      </div>

      {/* Navegação */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep("business")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button
          type="button"
          disabled={!canContinue}
          onClick={() => setStep("schedules")}
          className="gap-2"
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function ServiceForm({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: Partial<ServiceItem>
  setDraft: (d: Partial<ServiceItem>) => void
  onSave: () => void
  onCancel: () => void
}) {
  const isValid = draft.name && draft.name.length > 0 && (draft.duration_min ?? 0) > 0

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Label htmlFor="service-name">Nome do Serviço</Label>
          <Input
            id="service-name"
            placeholder="Ex: Corte Degradê"
            value={draft.name || ""}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="mt-1"
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="service-duration">Duração (min)</Label>
          <Input
            id="service-duration"
            type="number"
            min={5}
            max={480}
            value={draft.duration_min || ""}
            onChange={(e) =>
              setDraft({ ...draft, duration_min: Number(e.target.value) })
            }
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="service-price">Preço (R$)</Label>
          <Input
            id="service-price"
            type="number"
            min={0}
            step={0.01}
            value={draft.price_cents ? (draft.price_cents / 100).toFixed(2) : ""}
            onChange={(e) =>
              setDraft({
                ...draft,
                price_cents: Math.round(Number(e.target.value) * 100),
              })
            }
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="service-desc">Descrição (opcional)</Label>
          <Input
            id="service-desc"
            placeholder="Breve descrição..."
            value={draft.description || ""}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" size="sm" disabled={!isValid} onClick={onSave}>
          Salvar
        </Button>
      </div>
    </div>
  )
}
