"use client"

import { useState } from "react"
import { Cake, UserPlus, Clock, UserX, Mail, MessageSquare, MessageCircle, Zap } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { automations as initial } from "@/lib/mock-data-extra"
import type { Automation, AutomationTrigger, CampaignChannel } from "@/lib/types"

const triggerMeta: Record<AutomationTrigger, { label: string; icon: typeof Cake; description: string; color: string }> = {
  birthday: { label: "Aniversário", icon: Cake, description: "Enviar mensagem no dia do aniversário", color: "bg-pink-500/10 text-pink-500" },
  first_visit: { label: "Primeira visita", icon: UserPlus, description: "Boas-vindas após a primeira visita", color: "bg-blue-500/10 text-blue-500" },
  comeback: { label: "Volte logo", icon: Clock, description: "Lembrete de retorno após X dias", color: "bg-amber-500/10 text-amber-500" },
  missed_client: { label: "Cliente sumido", icon: UserX, description: "Reativar clientes inativos", color: "bg-red-500/10 text-red-500" },
}

const channelIcon = { email: Mail, sms: MessageSquare, whatsapp: MessageCircle }

export default function AutomationsPage() {
  const [items, setItems] = useState(initial)
  const [editing, setEditing] = useState<Automation | null>(null)

  const toggle = (id: string) => setItems((cur) => cur.map((a) => (a.id === id ? { ...a, active: !a.active } : a)))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Marketing Automatizado"
        description="Crie fluxos que enviam mensagens automaticamente em momentos-chave."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((a) => {
          const trigger = triggerMeta[a.trigger]
          const TriggerIcon = trigger.icon
          const ChIcon = channelIcon[a.channel]
          return (
            <Card key={a.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-md ${trigger.color}`}>
                  <TriggerIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base">{a.name}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">{trigger.description}</CardDescription>
                </div>
                <Switch checked={a.active} onCheckedChange={() => toggle(a.id)} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md bg-muted/40 p-3 text-sm border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                    <ChIcon className="h-3.5 w-3.5" />
                    <span className="capitalize">{a.channel}</span>
                    {a.delay_days > 0 && <span>· {a.delay_days} dias depois</span>}
                  </div>
                  <p className="line-clamp-2">{a.message}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold">{a.triggered_count}</span>
                    <span className="text-muted-foreground text-xs">disparos</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setEditing(a)}>Configurar</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          {editing && (
            <>
              <SheetHeader>
                <SheetTitle>Editar automação</SheetTitle>
                <SheetDescription>{triggerMeta[editing.trigger].description}</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Nome</FieldLabel>
                    <Input defaultValue={editing.name} />
                  </Field>
                  <Field>
                    <FieldLabel>Canal</FieldLabel>
                    <Select defaultValue={editing.channel}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  {editing.trigger !== "birthday" && (
                    <Field>
                      <FieldLabel>Disparar após (dias)</FieldLabel>
                      <Input type="number" defaultValue={editing.delay_days} />
                      <FieldDescription>0 = imediatamente</FieldDescription>
                    </Field>
                  )}
                  <Field>
                    <FieldLabel>Mensagem</FieldLabel>
                    <Textarea rows={6} defaultValue={editing.message} />
                    <FieldDescription>Variáveis: {"{nome}"}, {"{barbeiro}"}, {"{link}"}</FieldDescription>
                  </Field>
                </FieldGroup>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                <Button onClick={() => setEditing(null)}>Salvar</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
