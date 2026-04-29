"use client"

import { useState } from "react"
import { Check, Pencil, Plus, Save, Star, Trash2, X } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { plans as initialPlans } from "@/lib/mock-data"
import type { Plan } from "@/lib/types"
import { formatBRL } from "@/lib/format"
import { toast } from "sonner"

const allFeatures = [
  "Agenda online",
  "Cadastro de clientes",
  "Relatórios básicos",
  "Relatórios avançados",
  "Página pública de agendamento",
  "PDV integrado",
  "Comissões automáticas",
  "Galeria de fotos",
  "Programa de fidelidade",
  "Multi-unidades",
  "API dedicada",
  "Integração WhatsApp Business",
  "Suporte prioritário 24/7",
  "Gerente de sucesso",
  "Marketing por e-mail",
  "Marketing por SMS",
  "Automações de marketing",
  "Pacotes de serviços",
  "Assinaturas recorrentes",
]

interface PlanWithStats extends Plan {
  active: boolean
  highlighted: boolean
  subscribers: number
}

const planStats: Record<string, { active: boolean; highlighted: boolean; subscribers: number }> = {
  starter: { active: true, highlighted: false, subscribers: 42 },
  pro: { active: true, highlighted: true, subscribers: 58 },
  premium: { active: true, highlighted: false, subscribers: 8 },
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanWithStats[]>(
    initialPlans.map((p) => ({ ...p, ...planStats[p.id] })),
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<PlanWithStats | null>(null)

  const startEdit = (plan: PlanWithStats) => {
    setEditingId(plan.id)
    setDraft({ ...plan, features: [...plan.features] })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft(null)
  }

  const saveEdit = () => {
    if (!draft) return
    setPlans((prev) => prev.map((p) => (p.id === draft.id ? draft : p)))
    setEditingId(null)
    setDraft(null)
    toast.success("Plano atualizado com sucesso")
  }

  const toggleFeature = (feat: string) => {
    if (!draft) return
    setDraft({
      ...draft,
      features: draft.features.includes(feat)
        ? draft.features.filter((f) => f !== feat)
        : [...draft.features, feat],
    })
  }

  const togglePlanActive = (id: string) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)))
    toast.success("Status do plano atualizado")
  }

  const totalSubscribers = plans.reduce((sum, p) => sum + p.subscribers, 0)
  const totalMRR = plans.reduce((sum, p) => sum + p.subscribers * p.price, 0)

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <PageHeader title="Planos" description="Gerencie os planos disponíveis na plataforma">
        <Button size="sm" className="gap-2" onClick={() => toast.info("Em breve: novo plano customizado")}>
          <Plus className="h-4 w-4" />
          Novo plano
        </Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Planos ativos</CardDescription>
            <CardTitle className="text-2xl">
              {plans.filter((p) => p.active).length} / {plans.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de assinantes</CardDescription>
            <CardTitle className="text-2xl">{totalSubscribers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>MRR consolidado</CardDescription>
            <CardTitle className="text-2xl">{formatBRL(totalMRR)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Plans cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const isEditing = editingId === plan.id
          const cur = isEditing && draft ? draft : plan

          return (
            <Card
              key={plan.id}
              className={
                cur.highlighted
                  ? "border-primary shadow-lg relative"
                  : "relative"
              }
            >
              {cur.highlighted && (
                <Badge className="absolute -top-2.5 right-4 gap-1">
                  <Star className="h-3 w-3" />
                  Mais popular
                </Badge>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <Input
                      value={cur.name}
                      onChange={(e) => setDraft({ ...cur, name: e.target.value })}
                      className="text-lg font-semibold h-9"
                    />
                  ) : (
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  )}
                  <Switch
                    checked={cur.active}
                    onCheckedChange={() => (isEditing ? setDraft({ ...cur, active: !cur.active }) : togglePlanActive(plan.id))}
                    aria-label="Ativar plano"
                  />
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-sm text-muted-foreground">R$</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={cur.price}
                      onChange={(e) => setDraft({ ...cur, price: Number(e.target.value) })}
                      className="text-3xl font-bold h-12 w-28"
                    />
                  ) : (
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  )}
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {plan.subscribers} {plan.subscribers === 1 ? "assinante" : "assinantes"} ·{" "}
                  {formatBRL(plan.subscribers * plan.price)} MRR
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Limits */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Limites
                  </p>
                  {isEditing ? (
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Máx. barbeiros (999 = ilimitado)</FieldLabel>
                        <Input
                          type="number"
                          value={cur.max_barbers}
                          onChange={(e) => setDraft({ ...cur, max_barbers: Number(e.target.value) })}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Máx. agendamentos/mês (99999 = ilimitado)</FieldLabel>
                        <Input
                          type="number"
                          value={cur.max_appointments}
                          onChange={(e) => setDraft({ ...cur, max_appointments: Number(e.target.value) })}
                        />
                      </Field>
                      <Field>
                        <FieldLabel className="flex items-center justify-between">
                          <span>Destacar como mais popular</span>
                          <Switch
                            checked={cur.highlighted}
                            onCheckedChange={(v) => setDraft({ ...cur, highlighted: v })}
                          />
                        </FieldLabel>
                      </Field>
                    </FieldGroup>
                  ) : (
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                          {plan.max_barbers === 999
                            ? "Barbeiros ilimitados"
                            : `Até ${plan.max_barbers} barbeiros`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                          {plan.max_appointments === 99999
                            ? "Agendamentos ilimitados"
                            : `Até ${plan.max_appointments.toLocaleString("pt-BR")} agendamentos/mês`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Features */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Funcionalidades
                  </p>
                  {isEditing ? (
                    <div className="grid gap-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                      {allFeatures.map((feat) => {
                        const enabled = cur.features.includes(feat)
                        return (
                          <label
                            key={feat}
                            className="flex items-center justify-between gap-2 text-sm py-1 cursor-pointer"
                          >
                            <span className={enabled ? "" : "text-muted-foreground"}>{feat}</span>
                            <Switch checked={enabled} onCheckedChange={() => toggleFeature(feat)} />
                          </label>
                        )
                      })}
                    </div>
                  ) : (
                    <ul className="space-y-1.5 text-sm">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Separator />

                {/* Actions */}
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button size="sm" className="flex-1 gap-2" onClick={saveEdit}>
                      <Save className="h-4 w-4" />
                      Salvar
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => startEdit(plan)}>
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => toast.error("Não é possível excluir planos com assinantes ativos")}
                      aria-label="Excluir plano"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
